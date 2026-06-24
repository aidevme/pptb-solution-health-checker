import type { HealthCheckerResult } from '../../../types/healthChecker.js';
import type { IHtmlTemplateSection } from '../IHtmlTemplateSection.js';
import { HtmlTemplates } from '../HtmlTemplates.js';

export class BusinessRulesSection implements IHtmlTemplateSection {
  readonly key = 'businessRules';
  private readonly templates = new HtmlTemplates();
  hasContent(result: HealthCheckerResult): boolean { return result.businessRules.length > 0; }
  render(result: HealthCheckerResult): string { return this.templates.htmlBusinessRulesTable(result.businessRules); }
}
