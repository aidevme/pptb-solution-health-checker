import type { HealthCheckerResult } from '../../../types/healthChecker.js';
import type { IHtmlTemplateSection } from '../IHtmlTemplateSection.js';
import { HtmlTemplates } from '../HtmlTemplates.js';

export class WebResourcesSection implements IHtmlTemplateSection {
  readonly key = 'webResources';
  private readonly templates = new HtmlTemplates();
  hasContent(result: HealthCheckerResult): boolean { return result.webResources.length > 0; }
  render(result: HealthCheckerResult): string { return this.templates.htmlWebResourcesTable(result.webResources); }
}
