import type { HealthCheckerResult } from '../../../types/healthChecker.js';
import type { IHtmlTemplateSection } from '../IHtmlTemplateSection.js';
import { HtmlTemplates } from '../HtmlTemplates.js';

export class CustomAPIsSection implements IHtmlTemplateSection {
  readonly key = 'customAPIs';
  private readonly templates = new HtmlTemplates();
  hasContent(result: HealthCheckerResult): boolean { return result.customAPIs.length > 0; }
  render(result: HealthCheckerResult): string { return this.templates.htmlCustomAPIsTable(result.customAPIs); }
}
