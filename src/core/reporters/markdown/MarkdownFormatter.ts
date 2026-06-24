/** Static helpers for producing CommonMark-compatible Markdown content. */
import type { FileNode } from '../../types/healthChecker.js';

export class MarkdownFormatter {
  /**
   * Pipe characters (`|`) inside cell content are escaped to `\|` to prevent them
   * from being interpreted as column separators.
   *
   * @param alignment - Per-column alignment; defaults to `'left'` for all columns.
   */
  static formatTable(
    headers: string[],
    rows: string[][],
    alignment?: ('left' | 'center' | 'right')[]
  ): string {
    if (headers.length === 0) {
      return '';
    }

    const alignments = alignment || headers.map(() => 'left');

    // Escape pipe characters in content
    const escapePipes = (text: string): string => {
      return (text || '').replace(/\|/g, '\\|');
    };

    // Build header row
    const headerRow = '| ' + headers.map(escapePipes).join(' | ') + ' |';

    // Build separator row with alignment
    const separatorRow = '| ' + headers.map((_, i) => {
      const align = alignments[i] || 'left';
      switch (align) {
        case 'center':
          return ':--------:';
        case 'right':
          return '---------:';
        default:
          return '----------';
      }
    }).join(' | ') + ' |';

    // Build data rows
    const dataRows = rows.map(row => {
      const cells = headers.map((_, i) => escapePipes(row[i] || ''));
      return '| ' + cells.join(' | ') + ' |';
    });

    return [headerRow, separatorRow, ...dataRows].join('\n');
  }

  static formatBadge(text: string, type: 'success' | 'warning' | 'error' | 'info'): string {
    const icons = {
      success: '✅',
      warning: '⚠️',
      error: '❌',
      info: 'ℹ️'
    };

    return `${icons[type]} ${text}`;
  }

  static formatLink(text: string, url: string): string {
    return `[${text}](${url})`;
  }

  static formatCodeBlock(code: string, language: string): string {
    return `\`\`\`${language}\n${code}\n\`\`\``;
  }

  static formatList(items: string[], ordered: boolean = false): string {
    if (items.length === 0) {
      return '';
    }

    if (ordered) {
      return items.map((item, index) => `${index + 1}. ${item}`).join('\n');
    } else {
      return items.map(item => `- ${item}`).join('\n');
    }
  }

  /** @param level - Clamped to the range [1, 6]. */
  static formatHeading(text: string, level: number): string {
    const clampedLevel = Math.max(1, Math.min(6, level));
    const hashes = '#'.repeat(clampedLevel);
    return `${hashes} ${text}`;
  }

  static formatHorizontalRule(): string {
    return '---';
  }

  /**
   * Escapes CommonMark special characters so that user-supplied strings render as
   * literal text rather than markup.
   *
   * @remarks
   * Backtick (`` ` ``) is intentionally **not** escaped — it is safe as a cell value
   * in GFM tables and the callers in this codebase use it for inline code formatting.
   * If you need to escape backticks for other contexts, do so at the call site.
   */
  static escapeMarkdown(text: string): string {
    if (!text) {
      return '';
    }

    // Escape markdown special characters
    const specialChars = /([*_\[\]()#+\-.!|\\])/g;
    return text.replace(specialChars, '\\$1');
  }

  static formatFileTree(node: FileNode): string {
    return this.formatFileTreeRecursive(node, '', true, true);
  }

  private static formatFileTreeRecursive(
    node: FileNode,
    prefix: string,
    isLast: boolean,
    isRoot: boolean
  ): string {
    const lines: string[] = [];

    // Format current node
    const nodeName = node.name + (node.type === 'directory' ? '/' : '');

    if (isRoot) {
      lines.push(nodeName);
    } else {
      const connector = isLast ? '└── ' : '├── ';
      lines.push(prefix + connector + nodeName);
    }

    // Process children
    if (node.children && node.children.length > 0) {
      node.children.forEach((child, index) => {
        const isLastChild = index === node.children!.length - 1;

        // Calculate new prefix for children
        let newPrefix: string;
        if (isRoot) {
          newPrefix = '';
        } else {
          newPrefix = prefix + (isLast ? '    ' : '│   ');
        }

        const childLines = this.formatFileTreeRecursive(child, newPrefix, isLastChild, false);
        lines.push(childLines);
      });
    }

    return lines.join('\n');
  }
}
