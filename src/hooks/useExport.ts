import { useState } from 'react';
import type { BlueprintResult, ExportProgress } from '../core';
import { ExportFacade } from '../core/exporters/ExportFacade.js';

export interface UseExportResult {
  exportMarkdown: () => Promise<void>;
  exportJson: () => Promise<void>;
  exportHtml: () => Promise<void>;
  exportZip: (formats: string[]) => Promise<void>;
  exportAll: () => Promise<void>;
  isExporting: boolean;
  progress: ExportProgress | null;
  error: Error | null;
  /** Dismisses the export error banner without triggering another export. */
  clearError: () => void;
}

/**
 * Shared try/catch/setIsExporting/setError/setProgress wrapper for all export operations.
 *
 * @remarks
 * The `setTimeout(() => setProgress(null), 2000)` in `finally` is intentional —
 * it holds the "Complete" progress state visible for 2 s so the user sees the
 * completion message before the progress bar disappears.
 */
async function runExport(
  setIsExporting: (v: boolean) => void,
  setError: (e: Error | null) => void,
  setProgress: (p: ExportProgress | null) => void,
  fn: () => Promise<void>
): Promise<void> {
  setIsExporting(true);
  setError(null);
  try {
    await fn();
  } catch (err) {
    setError(err instanceof Error ? err : new Error('Export failed'));
  } finally {
    setIsExporting(false);
    // Clear progress after a short delay to allow the UI to show completion
    setTimeout(() => setProgress(null), 2000);
  }
}

function downloadFile(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Provides browser-download export operations for a completed blueprint result.
 *
 * @remarks
 * A new {@link ExportFacade} instance is created on every render. This is
 * intentional — `ExportFacade` is stateless and cheap to construct; memoizing
 * it would add complexity for no benefit.
 *
 * `exportAll` hardcodes `['markdown', 'json', 'html']`. If a new format is
 * added to {@link ExportFacade}, `exportAll` must be updated manually.
 */
export function useExport(result: BlueprintResult): UseExportResult {
  const [isExporting, setIsExporting] = useState(false);
  const [progress, setProgress] = useState<ExportProgress | null>(null);
  const [error, setError] = useState<Error | null>(null);

  const facade = new ExportFacade();

  const exportJson = async (): Promise<void> => {
    await runExport(setIsExporting, setError, setProgress, async () => {
      setProgress({
        phase: 'Generating JSON export',
        current: 0,
        total: 1,
        message: 'Serializing blueprint data...',
      });

      const json = facade.exportAsJson(result);
      const blob = new Blob([json], { type: 'application/json' });
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
      downloadFile(blob, `blueprint-${timestamp}.json`);

      setProgress({
        phase: 'Complete',
        current: 1,
        total: 1,
        message: 'JSON export downloaded',
      });
    });
  };

  const exportMarkdown = async (): Promise<void> => {
    await runExport(setIsExporting, setError, setProgress, async () => {
      setProgress({
        phase: 'Generating Markdown export',
        current: 0,
        total: 3,
        message: 'Generating documentation files...',
      });

      const zip = await facade.exportAsZip(result, ['markdown']);
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
      downloadFile(zip, `blueprint-markdown-${timestamp}.zip`);

      setProgress({
        phase: 'Complete',
        current: 3,
        total: 3,
        message: 'Markdown export downloaded',
      });
    });
  };

  const exportHtml = async (): Promise<void> => {
    await runExport(setIsExporting, setError, setProgress, async () => {
      setProgress({
        phase: 'Generating HTML export',
        current: 0,
        total: 1,
        message: 'Creating interactive document...',
      });

      const html = facade.exportAsHtml(result);
      const blob = new Blob([html], { type: 'text/html' });
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
      downloadFile(blob, `blueprint-${timestamp}.html`);

      setProgress({
        phase: 'Complete',
        current: 1,
        total: 1,
        message: 'HTML export downloaded',
      });
    });
  };

  /**
   * Exports selected formats, shortcutting to a single native file for `'html'`
   * or `'json'` when only one format is requested — a ZIP containing a single
   * HTML or JSON file is worse UX than downloading the file directly.
   * `'markdown'` always produces a ZIP because markdown export is always multi-file.
   */
  const exportZip = async (formats: string[]): Promise<void> => {
    if (formats.length === 1) {
      if (formats[0] === 'html') {
        await exportHtml();
        return;
      }
      if (formats[0] === 'json') {
        await exportJson();
        return;
      }
      // markdown (multi-file) always goes to ZIP
    }

    await runExport(setIsExporting, setError, setProgress, async () => {
      const total = formats.length + 1; // +1 for packaging step

      setProgress({
        phase: 'Generating exports',
        current: 0,
        total,
        message: `Generating ${formats.length} format(s)...`,
      });

      let current = 0;
      for (const format of formats) {
        current++;
        setProgress({
          phase: `Generating ${format}`,
          current,
          total,
          message: `Generating ${format} export...`,
        });
        await new Promise<void>(resolve => setTimeout(resolve, 100)); // Allow UI update
      }

      setProgress({
        phase: 'Packaging',
        current: formats.length,
        total,
        message: 'Creating ZIP archive...',
      });

      const zip = await facade.exportAsZip(result, formats);
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
      downloadFile(zip, `blueprint-${timestamp}.zip`);

      setProgress({
        phase: 'Complete',
        current: total,
        total,
        message: 'Export downloaded successfully',
      });
    });
  };

  const exportAll = async (): Promise<void> => {
    await exportZip(['markdown', 'json', 'html']);
  };

  const clearError = (): void => {
    setError(null);
  };

  return {
    exportMarkdown,
    exportJson,
    exportHtml,
    exportZip,
    exportAll,
    isExporting,
    progress,
    error,
    clearError,
  };
}
