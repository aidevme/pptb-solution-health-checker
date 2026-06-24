import type { HealthCheckerResult } from '../../../types/healthChecker.js';
import type { IHtmlTemplateSection } from '../IHtmlTemplateSection.js';
import { HtmlTemplates } from '../HtmlTemplates.js';

export class GlobalChoicesSection implements IHtmlTemplateSection {
  readonly key = 'globalChoices';
  private readonly templates = new HtmlTemplates();
  hasContent(result: HealthCheckerResult): boolean { return result.globalChoices.length > 0; }
  render(result: HealthCheckerResult): string { return this.templates.htmlGlobalChoicesTable(result.globalChoices); }
}
