import type { IDataverseClient } from '../../dataverse/IDataverseClient.js';
import type { FetchLogger } from '../../utils/FetchLogger.js';
import type { ProgressInfo, StepWarning } from '../../types/healthChecker.js';
import { AppDiscovery } from '../../discovery/AppDiscovery.js';
import type { CanvasApp } from '../../types/canvasApp.js';
import type { CustomPage } from '../../types/customPage.js';
import type { ModelDrivenApp } from '../../types/modelDrivenApp.js';

/**
 * Fetches canvas apps (including custom pages) and model-driven apps in
 * parallel, splitting them into three typed collections.
 *
 * @remarks
 * Canvas apps and custom pages share the same Dataverse entity set
 * (`canvasapp`) and are distinguished by a `canvasapptype` field inside
 * {@link AppDiscovery.getAppsAndPagesByIds}.  Model-driven apps use the
 * separate `appmodule` entity set and are fetched concurrently via
 * `Promise.all` to minimise wall-clock time.
 *
 * Either fetch leg is skipped entirely when its ID list is empty, so no
 * unnecessary requests are made for solutions that contain only one app type.
 */
export async function processApps(
  client: IDataverseClient,
  canvasAppIds: string[],
  appModuleIds: string[],
  onProgress: (progress: ProgressInfo) => void,
  logger: FetchLogger,
  stepWarnings: StepWarning[]
): Promise<{
  canvasApps: CanvasApp[];
  customPages: CustomPage[];
  modelDrivenApps: ModelDrivenApp[];
}> {
  let canvasApps: CanvasApp[] = [];
  let customPages: CustomPage[] = [];
  let modelDrivenApps: ModelDrivenApp[] = [];
  try {
    const appDiscovery = new AppDiscovery(
      client,
      (current, total) => onProgress({ phase: 'apps', entityName: '', current, total, message: 'Fetching app records...' }),
      logger
    );
    const [appsResult, mdApps] = await Promise.all([
      canvasAppIds.length > 0
        ? appDiscovery.getAppsAndPagesByIds(canvasAppIds)
        : Promise.resolve({ canvasApps: [], customPages: [] }),
      appModuleIds.length > 0
        ? appDiscovery.getModelDrivenAppsByIds(appModuleIds)
        : Promise.resolve([]),
    ]);
    canvasApps = appsResult.canvasApps;
    customPages = appsResult.customPages;
    modelDrivenApps = mdApps;
  } catch (err) {
    stepWarnings.push({
      step: 'Apps',
      message: err instanceof Error ? err.message : 'Unknown error',
      partial: false,
    });
  }
  return { canvasApps, customPages, modelDrivenApps };
}
