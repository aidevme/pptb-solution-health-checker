import {
  Text,
  Dropdown,
  Option,
  OptionGroup,
  Tag,
  Field,
} from '@fluentui/react-components';
import type { Solution } from '../../core';
import { useSolutionScopePanelStyles } from '../../styles';

export interface SolutionScopePanelProps {
  solutions: Solution[];
  selectedSolutionIds: string[];
  onSolutionIdsChange: (ids: string[]) => void;
  isDefaultSolution: (sol: Solution) => boolean;
  disabled: boolean;
}

export function SolutionScopePanel({
  solutions,
  selectedSolutionIds,
  onSolutionIdsChange,
  isDefaultSolution,
  disabled,
}: SolutionScopePanelProps): JSX.Element {
  const styles = useSolutionScopePanelStyles();

  return (
    <div className={styles.radioContent}>
      <Field hint={`Select one or more solutions. ${selectedSolutionIds.length} selected.`}>
        <Dropdown
          className={styles.dropdown}
          placeholder="Select solutions..."
          multiselect
          selectedOptions={selectedSolutionIds}
          onOptionSelect={(_, data) => {
            onSolutionIdsChange(
              (data.selectedOptions ?? []).filter((id) => {
                const sol = solutions.find((s) => s.solutionid === id);
                return !sol || !isDefaultSolution(sol);
              })
            );
          }}
          disabled={disabled}
        >
          {solutions
            .filter((s) => !isDefaultSolution(s))
            .map((solution) => (
              <Option
                key={solution.solutionid}
                value={solution.solutionid}
                text={solution.friendlyname}
              >
                <div className={styles.solutionInfo}>
                  <Text>{solution.friendlyname}</Text>
                  <Text className={styles.secondaryText}>
                    v{solution.version} | {solution.publisherid.friendlyname}
                  </Text>
                </div>
              </Option>
            ))}
          {solutions.some((s) => isDefaultSolution(s)) && (
            <OptionGroup label="Not Recommended">
              {solutions
                .filter((s) => isDefaultSolution(s))
                .map((solution) => (
                  <Option
                    key={solution.solutionid}
                    value={solution.solutionid}
                    text={solution.friendlyname}
                    disabled
                  >
                    <div className={styles.solutionInfo}>
                      <Text>{solution.friendlyname}</Text>
                      <Text className={styles.disabledOptionText}>
                        Default Solution — contains all direct environment customisations.
                      </Text>
                    </div>
                  </Option>
                ))}
            </OptionGroup>
          )}
        </Dropdown>
      </Field>

      {selectedSolutionIds.length > 0 && (
        <div className={styles.selectedItems}>
          {selectedSolutionIds.map((solId) => {
            const solution = solutions.find((s) => s.solutionid === solId);
            return solution ? (
              <Tag
                key={solId}
                dismissible
                dismissIcon={{
                  onClick: () =>
                    onSolutionIdsChange(selectedSolutionIds.filter((id) => id !== solId)),
                }}
                secondaryText={`v${solution.version}`}
              >
                {solution.friendlyname}
              </Tag>
            ) : null;
          })}
        </div>
      )}
    </div>
  );
}
