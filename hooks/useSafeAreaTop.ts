import { useSafeAreaInsets } from 'react-native-safe-area-context';

const EXTRA_TOP = 12;

/**
 * Returns paddingTop to use for screen content so it clears the notch/status bar.
 * Use on the root container of each screen: style={{ paddingTop: useSafeAreaTop() }}
 */
export function useSafeAreaTop(extra: number = EXTRA_TOP): number {
  const insets = useSafeAreaInsets();
  return insets.top + extra;
}
