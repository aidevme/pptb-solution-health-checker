import type { HealthCheckerResult } from '../../../types/healthChecker.js';
import type { IHtmlTemplateSection } from '../IHtmlTemplateSection.js';
import { HtmlTemplates } from '../HtmlTemplates.js';

export class SummarySection implements IHtmlTemplateSection {
  readonly key = 'summary';
  private readonly templates = new HtmlTemplates();
  hasContent(_result: HealthCheckerResult): boolean { return true; }
  render(result: HealthCheckerResult): string { return this.templates.htmlSummary(result.summary); }
}
