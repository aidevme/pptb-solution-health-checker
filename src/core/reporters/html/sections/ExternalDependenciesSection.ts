import type { HealthCheckerResult } from '../../../types/healthChecker.js';
import type { IHtmlTemplateSection } from '../IHtmlTemplateSection.js';
import { HtmlTemplates } from '../HtmlTemplates.js';

export class ExternalDependenciesSection implements IHtmlTemplateSection {
  readonly key = 'externalDependencies';
  private readonly templates = new HtmlTemplates();
  hasContent(result: HealthCheckerResult): boolean { return !!(result.externalEndpoints?.length); }
  render(result: HealthCheckerResult): string { return this.templates.htmlExternalDependenciesSection(result.externalEndpoints); }
}
