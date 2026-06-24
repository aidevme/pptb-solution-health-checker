import { useState } from 'react';
import {
  makeStyles,
  tokens,
  Text,
  Badge,
  Card,
  CardHeader,
  CardPreview,
  CardFooter,
  Checkbox,
  Tooltip,
  Button,
} from '@fluentui/react-components';
import { MoreHorizontal20Regular } from '@fluentui/react-icons';
import type { RuleDefinition, RuleSeverity } from '../../core/rules/rulesData';
import { RuleDetailsDialog } from './RuleDetailsDialog';

const useRuleCardStyles = makeStyles({
  card: {
    height: '200px',
    cursor: 'default',
    transitionProperty: 'box-shadow, background-color',
    transitionDuration: tokens.durationNormal,
    transitionTimingFunction: tokens.curveEasyEase,
    ':hover': {
      backgroundColor: tokens.colorNeutralBackground2,
      boxShadow: tokens.shadow8,
    },
  },
  id: {
    fontFamily: tokens.fontFamilyMonospace,
    fontSize: tokens.fontSizeBase100,
    color: tokens.colorNeutralForeground3,
  },
  title: {
    fontSize: tokens.fontSizeBase200,
    fontWeight: tokens.fontWeightSemibold,
    lineHeight: tokens.lineHeightBase300,
  },
  preview: {
    flex: '1 1 auto',
    overflow: 'hidden',
  },
  previewInner: {
    padding: `${tokens.spacingVerticalXS} ${tokens.spacingHorizontalM}`,
    overflow: 'hidden',
  },
  previewText: {
    fontSize: tokens.fontSizeBase200,
    color: tokens.colorNeutralForeground2,
    overflow: 'hidden',
    display: '-webkit-box',
    WebkitLineClamp: 3,
    WebkitBoxOrient: 'vertical',
  },
  badges: {
    display: 'flex',
    gap: tokens.spacingHorizontalXS,
    flexWrap: 'wrap',
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

export interface RuleCardProps {
  rule: RuleDefinition;
  checked: boolean;
  onCheckedChange: (id: string, checked: boolean) => void;
}

export function RuleCard({ rule, checked, onCheckedChange }: RuleCardProps): JSX.Element {
  const styles = useRuleCardStyles();
  const [dialogOpen, setDialogOpen] = useState(false);
  return (
    <>
    <Card className={styles.card}>
      <CardHeader
        image={
          <Tooltip content={rule.description} relationship="description" withArrow>
            <Checkbox
              checked={checked}
              onChange={(_, data) => onCheckedChange(rule.id, data.checked === true)}
              aria-label={rule.title}
            />
          </Tooltip>
        }
        header={<Text className={styles.title}>{rule.id}</Text>}
        description={<Text className={styles.id}>{rule.title}</Text>}
        action={
          <Button
            appearance="transparent"
            icon={<MoreHorizontal20Regular />}
            aria-label="More options"
            onClick={() => setDialogOpen(true)}
          />
        }
      />

      <CardPreview className={styles.preview}>
        <div className={styles.previewInner}>
          <Tooltip content={rule.description} relationship="description" withArrow>
            <Text className={styles.previewText}>{rule.description}</Text>
          </Tooltip>
        </div>
      </CardPreview>

      <CardFooter>
        <div className={styles.badges}>
          <Badge appearance="tint" color={SEVERITY_COLOR[rule.severity]} shape="rounded" size="small">
            {SEVERITY_LABEL[rule.severity]}
          </Badge>
          <Badge appearance="outline" shape="rounded" size="small">
            {rule.effortToFix} effort
          </Badge>
          <Badge appearance="outline" shape="rounded" size="small">
            {SOURCE_LABEL[rule.source] ?? rule.source}
          </Badge>
        </div>
      </CardFooter>
    </Card>

    <RuleDetailsDialog
      rule={rule}
      open={dialogOpen}
      onDismiss={() => setDialogOpen(false)}
    />
    </>
  );
}
