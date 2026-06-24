import type { FetchLogger } from '../../utils/FetchLogger.js';
import type { StepWarning } from '../../types/healthChecker.js';

/**
 * Scans fetch-log entries added since `logWatermark` and emits a partial
 * {@link StepWarning} if any of them failed.
 *
 * @remarks
 * The watermark pattern avoids re-scanning entries from earlier steps: each
 * processor captures `logger.getEntries().length` **before** its network calls
 * and passes that index here.  Only entries at or after that index are checked,
 * so a failure in step N does not re-surface as a warning in step N+1.
 *
 * @param logWatermark - The fetch-log entry index captured before this step's
 *   network calls began.
 */
export function checkForPartialFailures(
  stepName: string,
  logWatermark: number,
  logger: FetchLogger,
  stepWarnings: StepWarning[]
): void {
  const newFailures = logger.getEntries()
    .slice(logWatermark)
    .filter(e => e.status === 'failed');
  if (newFailures.length > 0) {
    stepWarnings.push({
      step: stepName,
      message: `${newFailures.length} API request(s) failed — results may be incomplete. See Fetch Log for details.`,
      partial: true,
      failedCount: newFailures.length,
    });
  }
}
