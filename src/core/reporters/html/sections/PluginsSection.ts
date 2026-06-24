import type { HealthCheckerResult } from '../../../types/healthChecker.js';
import type { IHtmlTemplateSection } from '../IHtmlTemplateSection.js';
import { HtmlTemplates } from '../HtmlTemplates.js';

export class PluginsSection implements IHtmlTemplateSection {
  readonly key = 'plugins';
  private readonly templates = new HtmlTemplates();
  hasContent(result: HealthCheckerResult): boolean { return result.plugins.length > 0; }
  render(result: HealthCheckerResult): string { return this.templates.htmlPluginsTable(result.plugins); }
}
