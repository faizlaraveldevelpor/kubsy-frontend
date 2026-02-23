/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import { Platform } from 'react-native';

// Brand: Hot Pink #E2274E, Deep Rose #A11848, Dark Magenta #621648
// Supporting: Wine #98103B, Dark Plum #5F0B38, Near-Black #35072B
// Accent: Coral #F34F6A, Soft Pink #FA7287, Light Pink #FC93A1
// Neutral: Off-white #E7E6E4
const tintColorLight = '#E2274E';
const tintColorDark = '#E7E6E4';

export const Colors = {
  light: {
    text: '#35072B',
    background: '#E7E6E4',
    tint: tintColorLight,
    icon: '#621648',
    tabIconDefault: '#FA7287',
    tabIconSelected: tintColorLight,
  },
  dark: {
    text: '#E7E6E4',
    background: '#35072B',
    tint: tintColorDark,
    icon: '#FC93A1',
    tabIconDefault: '#FA7287',
    tabIconSelected: '#E2274E',
  },
};

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
