import type { HealthCheckerResult } from '../core';

/**
 * Pre-generation export size estimators shown in the `ExportDialog` before the
 * user triggers a download.
 *
 * @remarks
 * All three estimators trade accuracy for speed — they use flat per-item byte
 * constants rather than serialising the full result. The constants were calibrated
 * against real health checker outputs and are intentionally conservative (they tend to
 * over-estimate slightly). The one exception is ERD: both `estimateMarkdownSize`
 * and `estimateJsonSize` measure the actual Mermaid diagram string lengths because
 * ERD size varies too widely for a flat constant to be useful.
 *
 * @packageDocumentation
 */

/**
 * Estimates the total size of a markdown ZIP export in bytes.
 *
 * @remarks
 * ERD size is measured from the actual Mermaid diagram strings rather than
 * approximated, because diagram length varies widely with entity count.
 *
 * @param result - Completed health checker result
 * @returns Estimated size in bytes
 */
export function estimateMarkdownSize(result: HealthCheckerResult): number {
  // Base overhead for file structure
  let size = 50000; // ~50KB for README, directory structure, etc.

  // Summary files (~5KB each × 12 files)
  size += 60000;

  // Entity files
  const entityCount = result.entities.length;
  // Each entity: overview (~2KB) + schema (~5KB) + automation (~3KB) + pipeline (~2KB)
  size += entityCount * 12000;

  // Attribute details (estimated 100 bytes per attribute)
  const totalAttributes = result.summary.totalAttributes;
  size += totalAttributes * 100;

  // Plugin documentation (estimated 500 bytes per plugin)
  size += result.summary.totalPlugins * 500;

  // Flow documentation (estimated 400 bytes per flow)
  size += result.summary.totalFlows * 400;

  // Business rule documentation (estimated 300 bytes per BR)
  size += result.summary.totalBusinessRules * 300;

  // Web resource documentation (estimated 200 bytes per WR)
  size += result.summary.totalWebResources * 200;

  // Analysis files
  size += 30000; // ~30KB for complexity, performance, migration analysis

  // ERD diagram (Mermaid diagram size)
  if (result.erd) {
    size += result.erd.diagrams.reduce((sum, d) => sum + d.mermaidDiagram.length, 0);
  }

  return size;
}

/**
 * Estimates the total size of a JSON export in bytes.
 *
 * @remarks
 * ERD size is measured via `JSON.stringify(result.erd).length` (actual data).
 * Cross-entity analysis uses `Map.size` counts rather than serialising Maps,
 * since `JSON.stringify` silently drops `Map` entries.
 *
 * @param result - Completed health checker result
 * @returns Estimated size in bytes
 */
export function estimateJsonSize(result: HealthCheckerResult): number {
  // Quick estimation: stringify a sample and extrapolate
  // For better accuracy, we could stringify the whole thing, but that's expensive

  // Base JSON wrapper overhead
  let size = 500;

  // Metadata
  size += 1000;

  // Summary
  size += 500;

  // Entities (average ~5KB per entity in JSON)
  size += result.entities.length * 5000;

  // Plugins (average ~800 bytes per plugin)
  size += result.summary.totalPlugins * 800;

  // Flows (average ~1KB per flow)
  size += result.summary.totalFlows * 1000;

  // Business rules (average ~600 bytes)
  size += result.summary.totalBusinessRules * 600;

  // Classic workflows (average ~800 bytes)
  size += result.summary.totalClassicWorkflows * 800;

  // Web resources (average ~500 bytes, but can be larger if content included)
  size += result.summary.totalWebResources * 500;

  // Custom APIs (average ~400 bytes)
  size += result.summary.totalCustomAPIs * 400;

  // Environment variables (average ~300 bytes)
  size += result.summary.totalEnvironmentVariables * 300;

  // Connection references (average ~300 bytes)
  size += result.summary.totalConnectionReferences * 300;

  // ERD
  if (result.erd) {
    size += JSON.stringify(result.erd).length;
  }

  // Cross-entity analysis
  if (result.crossEntityAnalysis) {
    size += result.crossEntityAnalysis.chainLinks.length * 200;
    size += result.crossEntityAnalysis.entityViews.size * 800;   // traces + activations per entity
    size += result.crossEntityAnalysis.allEntityPipelines.size * 500; // pipeline steps per entity
    size += result.crossEntityAnalysis.risks.length * 100;
  }

  // External endpoints
  if (result.externalEndpoints) {
    size += result.externalEndpoints.length * 400;
  }

  return size;
}

/**
 * Estimates the total size of a single-file HTML export in bytes.
 *
 * @remarks
 * The `100 000`-byte base accounts for the embedded CSS, inline JavaScript,
 * and the Mermaid CDN `<script>` tag. ERD size is estimated from the Mermaid
 * diagram strings (same approach as `estimateMarkdownSize`).
 *
 * @param result - Completed health checker result
 * @returns Estimated size in bytes
 */
export function estimateHtmlSize(result: HealthCheckerResult): number {
  // HTML has overhead for CSS, JavaScript, and structure
  let size = 100000; // ~100KB base (HTML structure, CSS, embedded JS, Mermaid CDN link)

  // Summary cards and tables
  size += 20000;

  // Entity sections (estimated ~3KB per entity in HTML)
  size += result.entities.length * 3000;

  // Plugin tables (estimated ~400 bytes per plugin row)
  size += result.summary.totalPlugins * 400;

  // Flow tables (estimated ~350 bytes per flow row)
  size += result.summary.totalFlows * 350;

  // Business rule tables
  size += result.summary.totalBusinessRules * 300;

  // Web resource tables
  size += result.summary.totalWebResources * 250;

  // ERD diagram (embedded Mermaid)
  if (result.erd) {
    size += result.erd.diagrams.reduce((sum, d) => sum + d.mermaidDiagram.length, 0);
  }

  return size;
}

/**
 * Converts a byte count to a human-readable string with one decimal place
 * (e.g. `1 048 576` → `"1.0 MB"`).
 */
export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const decimals = 1;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];

  const i = Math.floor(Math.log(bytes) / Math.log(k));
  const value = bytes / Math.pow(k, i);

  return `${value.toFixed(decimals)} ${sizes[i]}`;
}
