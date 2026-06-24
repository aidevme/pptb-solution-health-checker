/**
 * Produces all export formats from a completed {@link HealthCheckerResult}.
 *
 * @remarks
 * Decoupled from `HealthCheckerGenerator`: it accepts a finished result and delegates
 * to the appropriate reporter or packager. All reporter instances are created eagerly
 * at construction time so startup cost is paid once per facade, not per export call.
 *
 * All imports are static (PATTERN-007: dynamic `import()` breaks the `pptb-webview://` scheme).
 */
import type { HealthCheckerResult, MarkdownExport } from '../types/healthChecker.js';
import { MarkdownReporter } from '../reporters/MarkdownReporter.js';
import { HtmlReporter } from '../reporters/HtmlReporter.js';
import { JsonReporter } from '../reporters/JsonReporter.js';
import { ZipPackager } from './ZipPackager.js';

export class ExportFacade {
  private readonly markdownReporter = new MarkdownReporter();
  private readonly htmlReporter = new HtmlReporter();
  private readonly jsonReporter = new JsonReporter();
  private readonly zipPackager = new ZipPackager();

  exportAsJson(result: HealthCheckerResult): string {
    return this.jsonReporter.generate(result);
  }

  exportAsMarkdown(result: HealthCheckerResult): MarkdownExport {
    return this.markdownReporter.generate(result);
  }

  exportAsHtml(result: HealthCheckerResult): string {
    return this.htmlReporter.generate(result);
  }

  /**
   * Packages the selected export formats into a ZIP {@link Blob}.
   *
   * @param formats - Subset of `['json', 'html', 'markdown']` to include. Unknown keys are silently ignored.
   */
  async exportAsZip(result: HealthCheckerResult, formats: string[]): Promise<Blob> {
    const json = formats.includes('json') ? this.exportAsJson(result) : undefined;
    const html = formats.includes('html') ? this.exportAsHtml(result) : undefined;
    const markdown = formats.includes('markdown') ? this.exportAsMarkdown(result) : undefined;
    return this.zipPackager.packageHealthChecker(markdown, json, html);
  }
}
