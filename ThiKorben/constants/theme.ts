/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import { Platform } from 'react-native';

const tintColorLight = '#0a7ea4';
const tintColorDark = '#fff';

export const ThiKorbenTheme = {
  primary: '#15157d',
  primaryContainer: '#2e3192',
  primaryFixed: '#e1e0ff',
  primaryFixedDim: '#c0c1ff',
  secondary: '#8c4f00',
  secondaryContainer: '#fd9923',
  secondaryFixed: '#ffdcbf',
  secondaryFixedDim: '#ffb874',
  tertiary: '#491a00',
  tertiaryContainer: '#6c2a00',
  tertiaryFixed: '#ffdbcb',
  tertiaryFixedDim: '#ffb692',
  background: '#fcf8ff',
  surface: '#fcf8ff',
  surfaceContainerLow: '#f5f2fb',
  surfaceContainer: '#f0ecf5',
  surfaceContainerHigh: '#eae7f0',
  surfaceContainerHighest: '#e4e1ea',
  surfaceContainerLowest: '#ffffff',
  surfaceDim: '#dbd9e1',
  onBackground: '#1b1b21',
  onSurface: '#1b1b21',
  onSurfaceVariant: '#464652',
  onSecondaryContainer: '#663800',
  outlineVariant: '#c7c5d4',
  verifiedGreen: '#27AE60',
};

export const Colors = {
  light: {
    text: ThiKorbenTheme.onBackground,
    background: ThiKorbenTheme.background,
    tint: ThiKorbenTheme.primary,
    icon: ThiKorbenTheme.onSurfaceVariant,
    tabIconDefault: ThiKorbenTheme.onSurfaceVariant,
    tabIconSelected: ThiKorbenTheme.primary,
  },
  dark: {
    text: '#ECEDEE',
    background: '#151718',
    tint: tintColorDark,
    icon: '#9BA1A6',
    tabIconDefault: '#9BA1A6',
    tabIconSelected: tintColorDark,
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
