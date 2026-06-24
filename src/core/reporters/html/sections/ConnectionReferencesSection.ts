import type { HealthCheckerResult } from '../../../types/healthChecker.js';
import type { IHtmlTemplateSection } from '../IHtmlTemplateSection.js';
import { HtmlTemplates } from '../HtmlTemplates.js';

export class ConnectionReferencesSection implements IHtmlTemplateSection {
  readonly key = 'connectionReferences';
  private readonly templates = new HtmlTemplates();
  hasContent(result: HealthCheckerResult): boolean { return result.connectionReferences.length > 0; }
  render(result: HealthCheckerResult): string { return this.templates.htmlConnectionReferencesTable(result.connectionReferences); }
}
