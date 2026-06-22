import { makeStyles, tokens } from '@fluentui/react-components';

export const useComponentBrowserStyles = makeStyles({
  tabList: {
    flexWrap: 'wrap',
    gap: tokens.spacingHorizontalS,
  },
  tabContent: {
    marginTop: tokens.spacingVerticalL,
  },
});
