import type { HealthCheckerResult } from '../../../types/healthChecker.js';
import type { IHtmlTemplateSection } from '../IHtmlTemplateSection.js';
import { HtmlTemplates } from '../HtmlTemplates.js';

export class ModelDrivenAppsSection implements IHtmlTemplateSection {
  readonly key = 'modelDrivenApps';
  private readonly templates = new HtmlTemplates();
  hasContent(result: HealthCheckerResult): boolean { return result.modelDrivenApps.length > 0; }
  render(result: HealthCheckerResult): string { return this.templates.htmlModelDrivenAppsTable(result.modelDrivenApps); }
}
