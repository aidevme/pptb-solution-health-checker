import { useState, useEffect } from 'react';
import {
  makeStyles,
  tokens,
  Text,
  Badge,
  Button,
  Label,
  Textarea,
  Dialog,
  DialogSurface,
  DialogBody,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@fluentui/react-components';
import type { RuleDefinition, RuleSeverity } from '../../core/rules/rulesData';
import { RULE_GROUP_LABELS } from '../../core/rules/rulesData';

const useRuleDetailsDialogStyles = makeStyles({
  content: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalM,
  },
  id: {
    fontFamily: tokens.fontFamilyMonospace,
    fontSize: tokens.fontSizeBase200,
    color: tokens.colorNeutralForeground3,
  },
  fieldList: {
    display: 'grid',
    gridTemplateColumns: 'max-content 1fr',
    columnGap: tokens.spacingHorizontalL,
    rowGap: tokens.spacingVerticalS,
    alignItems: 'center',
  },
  fieldLabel: {
    color: tokens.colorNeutralForeground3,
    fontSize: tokens.fontSizeBase200,
  },
  notesTextarea: {
    width: '100%',
    marginTop: tokens.spacingVerticalXS,
  },
});

const SEVERITY_COLOR: Record<RuleSeverity, 'important' | 'warning' | 'informative'> = {
  fail: 'important',
  warn: 'warning',
  info: 'informative',
};

const SEVERITY_LABEL: Record<RuleSeverity, string> = {
  fail: 'Fail',
  warn: 'Warn',
  info: 'Info',
};

const SOURCE_LABEL: Record<string, string> = {
  'Code': 'Code',
  'Azure Hosted JSON file': 'Declarative',
  'Dataverse Entity': 'Entity',
};

export interface RuleDetailsDialogProps {
  rule: RuleDefinition;
  open: boolean;
  onDismiss: () => void;
}

export function RuleDetailsDialog({ rule, open, onDismiss }: RuleDetailsDialogProps): JSX.Element {
  const styles = useRuleDetailsDialogStyles();
  const [notes, setNotes] = useState(rule.description);

  useEffect(() => {
    setNotes(rule.description);
  }, [rule.id]);

  return (
    <Dialog
      modalType="alert"
      open={open}
      onOpenChange={(_, data) => { if (!data.open) onDismiss(); }}
    >
      <DialogSurface>
        <DialogBody>
          <DialogTitle>{rule.id}</DialogTitle>

          <DialogContent>
            <div className={styles.content}>
              <Text className={styles.id}>{rule.title}</Text>

              <div className={styles.fieldList}>
                <Text className={styles.fieldLabel}>Severity</Text>
                <Badge appearance="tint" color={SEVERITY_COLOR[rule.severity]} shape="rounded" size="small">
                  {SEVERITY_LABEL[rule.severity]}
                </Badge>

                <Text className={styles.fieldLabel}>Group</Text>
                <Text>{RULE_GROUP_LABELS[rule.group]}</Text>

                <Text className={styles.fieldLabel}>Source</Text>
                <Text>{SOURCE_LABEL[rule.source] ?? rule.source}</Text>

                <Text className={styles.fieldLabel}>Effort to Fix</Text>
                <Badge appearance="outline" shape="rounded" size="small">
                  {rule.effortToFix}
                </Badge>
              </div>

              <div>
                <Label htmlFor="rule-description" size="small">Description</Label>
                <Textarea
                  id="rule-description"
                  size="medium"
                  resize="vertical"
                  value={notes}
                  onChange={(_, data) => setNotes(data.value)}
                  className={styles.notesTextarea}
                  readOnly
                />
              </div>
            </div>
          </DialogContent>

          <DialogActions>
            <Button appearance="primary" onClick={onDismiss}>
              Close
            </Button>
          </DialogActions>
        </DialogBody>
      </DialogSurface>
    </Dialog>
  );
}
