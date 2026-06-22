import JSZip from 'jszip';
import type { MarkdownExport } from '../types/blueprint.js';

/**
 * Builds a ZIP archive from one or more blueprint export formats using JSZip.
 *
 * @remarks
 * The archive is generated asynchronously with DEFLATE level 6 compression.
 * Markdown files are placed under a `markdown/` sub-folder to preserve the
 * multi-file directory structure produced by {@link MarkdownReporter}.
 * A human-readable `metadata.txt` summary is always included regardless of
 * which formats are selected.
 *
 * ZIP structure when all formats are included:
 * ```
 * ├── markdown/   (mirrors MarkdownExport.files map)
 * ├── blueprint.json
 * ├── blueprint.html
 * └── metadata.txt
 * ```
 */
export class ZipPackager {
  /**
   * @param markdown - Optional. When provided, all entries from
   *   {@link MarkdownExport.files} are placed inside a `markdown/` folder.
   * @param json - Optional pretty-printed JSON string from {@link JsonReporter}.
   * @param html - Optional self-contained HTML string from {@link HtmlReporter}.
   */
  async packageBlueprint(
    markdown?: MarkdownExport,
    json?: string,
    html?: string
  ): Promise<Blob> {
    const zip = new JSZip();
    const timestamp = new Date();

    // Add markdown files if provided
    if (markdown) {
      const markdownFolder = zip.folder('markdown');
      if (markdownFolder) {
        for (const [filepath, content] of markdown.files.entries()) {
          markdownFolder.file(filepath, content);
        }
      }
    }

    // Add JSON if provided
    if (json) {
      zip.file('blueprint.json', json);
    }

    // Add HTML if provided
    if (html) {
      zip.file('blueprint.html', html);
    }

    // Add metadata file
    const metadata = this.generateMetadata(timestamp, markdown, json, html);
    zip.file('metadata.txt', metadata);

    // Generate ZIP blob with compression
    const blob = await zip.generateAsync({
      type: 'blob',
      compression: 'DEFLATE',
      compressionOptions: {
        level: 6, // Moderate compression (1-9, where 9 is maximum)
      },
    });

    return blob;
  }

  private generateMetadata(
    timestamp: Date,
    markdown?: MarkdownExport,
    json?: string,
    html?: string
  ): string {
    const lines: string[] = [];

    lines.push('Power Platform Solution Blueprint - Export Metadata');
    lines.push('='.repeat(60));
    lines.push('');
    lines.push(`Generated: ${timestamp.toISOString()}`);
    lines.push(`Tool Version: 1.0.0`);
    lines.push('');
    lines.push('Exported Formats:');
    lines.push('-'.repeat(60));

    if (markdown) {
      lines.push(`✓ Markdown (${markdown.totalFiles} files, ${this.formatBytes(markdown.totalSize)})`);
    }

    if (json) {
      const jsonSize = new TextEncoder().encode(json).length;
      lines.push(`✓ JSON (${this.formatBytes(jsonSize)})`);
    }

    if (html) {
      const htmlSize = new TextEncoder().encode(html).length;
      lines.push(`✓ HTML (${this.formatBytes(htmlSize)})`);
    }

    lines.push('');
    lines.push('File Structure:');
    lines.push('-'.repeat(60));

    if (markdown) {
      lines.push('markdown/');
      lines.push('  ├── README.md');
      lines.push('  ├── summary/');
      lines.push('  ├── entities/');
      lines.push('  └── analysis/');
    }

    if (json) {
      lines.push('blueprint.json');
    }

    if (html) {
      lines.push('blueprint.html');
    }

    lines.push('metadata.txt');
    lines.push('');
    lines.push('Usage:');
    lines.push('-'.repeat(60));
    lines.push('- Extract ZIP to view all files');
    lines.push('- Markdown: Upload to Azure DevOps Wiki or GitHub');
    lines.push('- JSON: Use for baselines, automation, or programmatic analysis');
    lines.push('- HTML: Open blueprint.html in any modern web browser');
    lines.push('');
    lines.push('For more information, visit:');
    lines.push('https://github.com/anthropics/power-platform-solution-blueprint');

    return lines.join('\n');
  }

  private formatBytes(bytes: number): string {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  }
}
