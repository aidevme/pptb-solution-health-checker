import type { HealthCheckerResult } from '../../../types/healthChecker.js';
import type { IHtmlTemplateSection } from '../IHtmlTemplateSection.js';
import { HtmlTemplates } from '../HtmlTemplates.js';

export class EntitiesSection implements IHtmlTemplateSection {
  readonly key = 'entities';
  private readonly templates = new HtmlTemplates();
  hasContent(result: HealthCheckerResult): boolean { return result.entities.length > 0; }
  render(result: HealthCheckerResult): string { return this.templates.htmlEntitiesAccordion(result.entities); }
}
