import type { HealthCheckerResult } from '../../../types/healthChecker.js';
import type { IHtmlTemplateSection } from '../IHtmlTemplateSection.js';
import { HtmlTemplates } from '../HtmlTemplates.js';

export class CrossEntitySection implements IHtmlTemplateSection {
  readonly key = 'crossEntity';
  private readonly templates = new HtmlTemplates();
  hasContent(result: HealthCheckerResult): boolean { return !!result.crossEntityAnalysis; }
  render(result: HealthCheckerResult): string { return this.templates.htmlCrossEntitySection(result.crossEntityAnalysis); }
}
