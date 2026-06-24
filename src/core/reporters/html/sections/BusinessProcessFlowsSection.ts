import type { HealthCheckerResult } from '../../../types/healthChecker.js';
import type { IHtmlTemplateSection } from '../IHtmlTemplateSection.js';
import { HtmlTemplates } from '../HtmlTemplates.js';

export class BusinessProcessFlowsSection implements IHtmlTemplateSection {
  readonly key = 'businessProcessFlows';
  private readonly templates = new HtmlTemplates();
  hasContent(result: HealthCheckerResult): boolean { return result.businessProcessFlows.length > 0; }
  render(result: HealthCheckerResult): string { return this.templates.htmlBusinessProcessFlowsTable(result.businessProcessFlows); }
}
