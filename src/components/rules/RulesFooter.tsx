import { Text, Button, Tooltip } from '@fluentui/react-components';
import { makeStyles, tokens } from '@fluentui/react-components';
import { ChevronLeft20Regular, ChevronRight20Regular } from '@fluentui/react-icons';

const useRulesFooterStyles = makeStyles({
  root: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: tokens.spacingVerticalXS,
  },
  label: {
    fontSize: tokens.fontSizeBase200,
    color: tokens.colorNeutralForeground3,
  },
  pagination: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalXS,
  },
  pageButton: {
    minWidth: '28px',
    padding: `0 ${tokens.spacingHorizontalXS}`,
  },
});

export interface RulesFooterProps {
  selectedCount: number;
  totalCount: number;
  activeView?: 'card' | 'table';
  currentPage?: number;
  totalPages?: number;
  onPageChange?: (page: number) => void;
}

export function RulesFooter({
  selectedCount,
  totalCount,
  activeView,
  currentPage = 1,
  totalPages = 1,
  onPageChange,
}: RulesFooterProps): JSX.Element {
  const styles = useRulesFooterStyles();
  const showPaging = activeView === 'table' && totalPages > 1;

  return (
    <div className={styles.root}>
      <Text className={styles.label}>Selected Rules: {selectedCount} / {totalCount}</Text>

      {showPaging && (
        <div className={styles.pagination}>
          <Tooltip content="Previous page" relationship="label" withArrow>
            <Button
              size="small"
              appearance="subtle"
              icon={<ChevronLeft20Regular />}
              disabled={currentPage <= 1}
              onClick={() => onPageChange?.(currentPage - 1)}
              aria-label="Previous page"
            />
          </Tooltip>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <Tooltip key={page} content={`Go to page ${page}`} relationship="label" withArrow>
              <Button
                size="small"
                appearance={page === currentPage ? 'primary' : 'subtle'}
                className={styles.pageButton}
                onClick={() => onPageChange?.(page)}
                aria-label={`Page ${page}`}
                aria-current={page === currentPage ? 'page' : undefined}
              >
                {page}
              </Button>
            </Tooltip>
          ))}
          <Tooltip content="Next page" relationship="label" withArrow>
            <Button
              size="small"
              appearance="subtle"
              icon={<ChevronRight20Regular />}
              disabled={currentPage >= totalPages}
              onClick={() => onPageChange?.(currentPage + 1)}
              aria-label="Next page"
            />
          </Tooltip>
        </div>
      )}
    </div>
  );
}
