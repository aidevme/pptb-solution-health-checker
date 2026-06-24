import type { HealthCheckerResult } from '../../../types/healthChecker.js';
import type { IHtmlTemplateSection } from '../IHtmlTemplateSection.js';
import { HtmlTemplates } from '../HtmlTemplates.js';

export class EnvironmentVariablesSection implements IHtmlTemplateSection {
  readonly key = 'environmentVariables';
  private readonly templates = new HtmlTemplates();
  hasContent(result: HealthCheckerResult): boolean { return result.environmentVariables.length > 0; }
  render(result: HealthCheckerResult): string { return this.templates.htmlEnvironmentVariablesTable(result.environmentVariables); }
}
