import type { HealthCheckerResult } from '../../../types/healthChecker.js';
import type { IHtmlTemplateSection } from '../IHtmlTemplateSection.js';
import { HtmlTemplates } from '../HtmlTemplates.js';

export class CustomPagesSection implements IHtmlTemplateSection {
  readonly key = 'customPages';
  private readonly templates = new HtmlTemplates();
  hasContent(result: HealthCheckerResult): boolean { return result.customPages.length > 0; }
  render(result: HealthCheckerResult): string { return this.templates.htmlCustomPagesTable(result.customPages); }
}
