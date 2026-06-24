import type { HealthCheckerResult } from '../../../types/healthChecker.js';
import type { IHtmlTemplateSection } from '../IHtmlTemplateSection.js';
import { HtmlTemplates } from '../HtmlTemplates.js';

export class ClassicWorkflowsSection implements IHtmlTemplateSection {
  readonly key = 'classicWorkflows';
  private readonly templates = new HtmlTemplates();
  hasContent(result: HealthCheckerResult): boolean { return result.classicWorkflows.length > 0; }
  render(result: HealthCheckerResult): string { return this.templates.htmlClassicWorkflowsTable(result.classicWorkflows); }
}
