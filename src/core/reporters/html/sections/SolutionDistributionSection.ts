import type { HealthCheckerResult } from '../../../types/healthChecker.js';
import type { IHtmlTemplateSection } from '../IHtmlTemplateSection.js';
import { HtmlTemplates } from '../HtmlTemplates.js';

export class SolutionDistributionSection implements IHtmlTemplateSection {
  readonly key = 'solutionDistribution';
  private readonly templates = new HtmlTemplates();
  hasContent(result: HealthCheckerResult): boolean { return !!result.solutionDistribution; }
  render(result: HealthCheckerResult): string { return this.templates.htmlSolutionDistribution(result.solutionDistribution); }
}
