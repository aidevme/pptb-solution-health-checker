import type { HealthCheckerResult } from '../../../types/healthChecker.js';
import type { IHtmlTemplateSection } from '../IHtmlTemplateSection.js';
import { HtmlTemplates } from '../HtmlTemplates.js';

export class CustomConnectorsSection implements IHtmlTemplateSection {
  readonly key = 'customConnectors';
  private readonly templates = new HtmlTemplates();
  hasContent(result: HealthCheckerResult): boolean { return result.customConnectors.length > 0; }
  render(result: HealthCheckerResult): string { return this.templates.htmlCustomConnectorsTable(result.customConnectors); }
}
