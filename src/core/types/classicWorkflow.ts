/**
 * Classic Workflow types (deprecated workflows requiring migration)
 */

/**
 * Classic workflow (legacy, requires migration to Power Automate)
 */
export interface ClassicWorkflow {
  id: string;
  name: string;
  description: string | null;
  /** Dataverse workflow type code: 1 = Definition, 2 = Activation, 3 = Template. */
  type: number;
  typeName: string;
  /** Dataverse workflow mode code: 0 = Background (async), 1 = RealTime (sync). */
  mode: number;
  modeName: string;
  triggerOnCreate: boolean;
  triggerOnUpdate: boolean;
  triggerOnDelete: boolean;
  /** Parsed from triggeronupdateattributelist; empty array = fires on all updates */
  triggerOnUpdateAttributes: string[];
  onDemand: boolean; // Manual trigger
  /** Dataverse workflow scope code: 1 = User, 2 = BusinessUnit, 4 = Parent:Child BU, 8 = Organization. */
  scope: number;
  scopeName: string;
  entity: string;
  entityDisplayName: string | null;
  state: 'Draft' | 'Active' | 'Suspended';
  isManaged: boolean;
  xaml: string;
  owner: string;
  modifiedBy: string;
  modifiedOn: string;
  createdOn: string;
  migrationRecommendation?: MigrationRecommendation;
}

/**
 * Migration recommendation for classic workflow
 */
export interface MigrationRecommendation {
  complexity: 'Low' | 'Medium' | 'High' | 'Critical';
  effort: string; // "1-2 hours", "1-2 days", "1+ weeks"
  approach: string; // Step-by-step migration guide
  challenges: string[]; // Known issues
  features: MigrationFeature[]; // Detected features
  documentationLink: string; // Microsoft docs
  advisory?: string; // Migration advisory based on workflow mode (async vs real-time)
}

/**
 * Detected workflow feature for migration analysis
 */
export interface MigrationFeature {
  feature: string;
  recommendation: string;
  migrationPath: string;
}
