import { useState, useEffect } from 'react';
import {
  PptbDataverseClient,
  PublisherDiscovery,
  SolutionDiscovery,
  type Publisher,
  type Solution,
} from '../core';
import type { IDataverseClient } from '../core';

export interface ScopeDataState {
  publishers: Publisher[];
  solutions: Solution[];
  isLoading: boolean;
  error: string | null;
  /** Triggers a re-fetch without unmounting the component. */
  retry: () => void;
}

/**
 * Fetches publishers and solutions from the Dataverse environment.
 *
 * @remarks
 * When `null` is passed the hook builds its own {@link PptbDataverseClient}
 * from `window.toolboxAPI` / `window.dataverseAPI`. Pass a mock
 * {@link IDataverseClient} in tests to avoid needing the Desktop globals.
 *
 * The `cancelled` closure variable inside `load()` guards against setting state
 * after the effect cleans up (component unmount or scope change) — the standard
 * React async-in-effect stale-closure pattern.
 *
 * `retryCount` is never shown in the UI; it exists solely as a `useEffect`
 * dependency so that calling `retry()` forces a re-fetch.
 *
 * @param client - Pre-built client, or `null` to use the PPTB Desktop globals.
 */
export function useScopeData(client: IDataverseClient | null = null): ScopeDataState {
  const [publishers, setPublishers] = useState<Publisher[]>([]);
  const [solutions, setSolutions] = useState<Solution[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    let cancelled = false;

    const load = async (): Promise<void> => {
      setIsLoading(true);
      setError(null);

      try {
        let resolvedClient: IDataverseClient;

        if (client !== null) {
          resolvedClient = client;
        } else {
          if (!window.toolboxAPI || !window.dataverseAPI) {
            throw new Error(
              'PPTB Desktop API not available. Please run this tool inside PPTB Desktop.'
            );
          }

          const toolContext = await window.toolboxAPI.getToolContext();
          const environmentUrl = toolContext?.connectionUrl ?? 'Current Environment';
          resolvedClient = new PptbDataverseClient(window.dataverseAPI, environmentUrl);
        }

        const publisherDiscovery = new PublisherDiscovery(resolvedClient);
        const solutionDiscovery = new SolutionDiscovery(resolvedClient);

        const [publishersData, solutionsData] = await Promise.all([
          publisherDiscovery.getPublishers(),
          solutionDiscovery.getSolutions(),
        ]);

        if (cancelled) return;

        setPublishers(publishersData);
        setSolutions(solutionsData);

        if (publishersData.length === 0 && solutionsData.length === 0) {
          setError('No custom publishers or solutions found in this environment.');
        }
      } catch (err) {
        if (cancelled) return;
        const message = err instanceof Error ? err.message : 'An unknown error occurred';
        setError(message);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    void load();

    return () => {
      cancelled = true;
    };
  }, [client, retryCount]);

  const retry = (): void => setRetryCount((n) => n + 1);

  return { publishers, solutions, isLoading, error, retry };
}
