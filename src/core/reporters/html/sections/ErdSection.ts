import type { HealthCheckerResult } from '../../../types/healthChecker.js';
import type { IHtmlTemplateSection } from '../IHtmlTemplateSection.js';
import { HtmlTemplates } from '../HtmlTemplates.js';

export class ErdSection implements IHtmlTemplateSection {
  readonly key = 'erd';
  private readonly templates = new HtmlTemplates();
  hasContent(result: HealthCheckerResult): boolean { return !!result.erd; }
  render(result: HealthCheckerResult): string { return this.templates.htmlErdSection(result.erd); }
}
