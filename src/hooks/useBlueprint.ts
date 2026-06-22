import { useState, useCallback, useRef, useEffect } from 'react';
import {
  PptbDataverseClient,
  BlueprintGenerator,
  type BlueprintResult,
  type ProgressInfo,
  type BlueprintScope,
  type FetchLogEntry,
} from '../core';
import type { ScopeSelection } from '../types/scope';

interface UseBlueprintResult {
  generate: () => Promise<void>;
  result: BlueprintResult | null;
  progress: ProgressInfo | null;
  recentFetches: FetchLogEntry[];
  isGenerating: boolean;
  /**
   * True between calling `cancel()` and the abort resolving — lets the UI show
   * a "Cancelling…" spinner rather than jumping straight back to idle.
   */
  isCancelling: boolean;
  error: Error | null;
  cancel: () => void;
  reset: () => void;
  /**
   * The live {@link BlueprintGenerator} instance from the most recent successful
   * `generate()` call. Exposed so callers (e.g. `ExportDialog`) can invoke
   * export methods directly. `null` before the first successful generation.
   */
  blueprintGenerator: BlueprintGenerator | null;
}

/**
 * Both branches produce identical output today — publisher scope was collapsed
 * to the solution-scope path intentionally. The split is preserved so that
 * future publisher-specific handling can be added without touching call sites.
 */
function convertScope(scope: ScopeSelection): BlueprintScope {
  if (scope.type === 'publisher') {
    // Publisher scope now uses solution IDs - same path as solution scope
    return {
      type: 'solution',
      solutionIds: scope.solutionIds,
      includeSystem: scope.includeSystem,
      excludeSystemFields: scope.excludeSystemFields,
    };
  } else {
    return {
      type: 'solution',
      solutionIds: scope.solutionIds,
      includeSystem: scope.includeSystem,
      excludeSystemFields: scope.excludeSystemFields,
    };
  }
}

/**
 * Drives blueprint generation, cancellation, and progress reporting for a given scope.
 *
 * @remarks
 * Fetch-log entries are throttled to a state update at most every 400 ms
 * (`fetchBufRef` + `fetchTimerRef`) to avoid excessive re-renders during long fetches.
 *
 * Errors whose message contains `'cancelled'` are silently swallowed — a cancelled
 * run is not a failure and does not set `error` state.
 *
 * `reset()` aborts any in-flight generation, so it is safe to call at any time.
 *
 * The `useEffect` on `scope` clears all result/error/progress state whenever the
 * scope object reference changes (e.g. when the user clicks "Change Selection").
 */
export function useBlueprint(scope: ScopeSelection): UseBlueprintResult {
  const [result, setResult] = useState<BlueprintResult | null>(null);
  const [progress, setProgress] = useState<ProgressInfo | null>(null);
  const [recentFetches, setRecentFetches] = useState<FetchLogEntry[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const abortControllerRef = useRef<AbortController | null>(null);
  const generatorRef = useRef<BlueprintGenerator | null>(null);
  // Throttle fetch entry updates — only re-render at most every 400ms
  const fetchBufRef = useRef<FetchLogEntry[]>([]);
  const fetchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Reset state when scope changes (e.g., when user clicks "Change Selection")
  useEffect(() => {
    setResult(null);
    setError(null);
    setProgress(null);
    setRecentFetches([]);
  }, [scope]);

  const generate = useCallback(async () => {
    try {
      setIsGenerating(true);
      setIsCancelling(false);
      setError(null);
      setResult(null);
      setProgress(null);
      setRecentFetches([]);
      fetchBufRef.current = [];

      if (!window.toolboxAPI) {
        throw new Error('PPTB Desktop API not available.');
      }

      // Create abort controller for cancellation
      const abortController = new AbortController();
      abortControllerRef.current = abortController;

      // Get environment URL from tool context
      const toolContext = await window.toolboxAPI.getToolContext();
      const environmentUrl = toolContext?.connectionUrl || '';

      // Create client and generator
      const client = new PptbDataverseClient(window.dataverseAPI, environmentUrl);
      const blueprintScope = convertScope(scope);

      const generator = new BlueprintGenerator(client, blueprintScope, {
        includeSystemEntities: scope.includeSystem,
        onProgress: (progressInfo) => {
          setProgress(progressInfo);
        },
        onFetchEntry: (entry) => {
          fetchBufRef.current = [...fetchBufRef.current.slice(-19), entry];
          if (!fetchTimerRef.current) {
            fetchTimerRef.current = setTimeout(() => {
              setRecentFetches([...fetchBufRef.current]);
              fetchTimerRef.current = null;
            }, 400);
          }
        },
        signal: abortController.signal,
      });

      // Store generator for export functionality
      generatorRef.current = generator;

      // Generate blueprint
      const blueprintResult = await generator.generate();

      setResult(blueprintResult);
      setProgress(null);
    } catch (err) {
      if (err instanceof Error && err.message.includes('cancelled')) {
        // Cancellation is not an error
        setError(null);
      } else {
        const error = err instanceof Error ? err : new Error('Failed to generate blueprint');
        setError(error);
      }
    } finally {
      setIsGenerating(false);
      setIsCancelling(false);
      abortControllerRef.current = null;
      if (fetchTimerRef.current) {
        clearTimeout(fetchTimerRef.current);
        fetchTimerRef.current = null;
      }
    }
  }, [scope]);

  const cancel = useCallback(() => {
    if (abortControllerRef.current) {
      setIsCancelling(true);
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
  }, []);

  const reset = useCallback(() => {
    setResult(null);
    setError(null);
    setProgress(null);
    setIsGenerating(false);
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    generatorRef.current = null;
  }, []);

  return {
    generate,
    result,
    progress,
    recentFetches,
    isGenerating,
    isCancelling,
    error,
    cancel,
    reset,
    blueprintGenerator: generatorRef.current,
  };
}
