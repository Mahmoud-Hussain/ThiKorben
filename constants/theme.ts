/**
 * ThiKorben Design Tokens & Theme Colors
 * Extracted from code.html Material 3 Theme Specification
 */

import { Platform } from 'react-native';

export const Colors = {
  // Brand & Core Colors
  primary: '#15157d',
  primaryContainer: '#2e3192',
  onPrimaryContainer: '#9da1ff',
  primaryFixed: '#e1e0ff',
  onPrimaryFixed: '#04006d',

  secondary: '#8c4f00',
  secondaryContainer: '#fd9923',
  onSecondaryContainer: '#663800',
  accentOrange: '#F7941D',
  accentOrangeHover: '#d87c14',

  tertiary: '#491a00',
  tertiaryContainer: '#6c2a00',
  onTertiaryContainer: '#f19160',

  // Surfaces & Backgrounds
  background: '#fcf8ff',
  onBackground: '#1b1b21',

  surface: '#fcf8ff',
  surfaceContainerLowest: '#ffffff',
  surfaceContainerLow: '#f5f2fb',
  surfaceContainer: '#f0ecf5',
  surfaceContainerHigh: '#eae7f0',
  surfaceContainerHighest: '#e4e1ea',
  surfaceVariant: '#e4e1ea',
  onSurface: '#1b1b21',
  onSurfaceVariant: '#464652',

  // Outlines & Borders
  outline: '#777683',
  outlineVariant: '#c7c5d4',

  // Status & Alerts
  error: '#ba1a1a',
  errorContainer: '#ffdad6',
  onError: '#ffffff',
  onErrorContainer: '#93000a',

  // React Navigation legacy object shape compatibility
  light: {
    text: '#1b1b21',
    background: '#fcf8ff',
    tint: '#15157d',
    icon: '#464652',
    tabIconDefault: '#777683',
    tabIconSelected: '#15157d',
  },
  dark: {
    text: '#fcf8ff',
    background: '#1b1b21',
    tint: '#9da1ff',
    icon: '#c7c5d4',
    tabIconDefault: '#777683',
    tabIconSelected: '#9da1ff',
  },
};

export const Fonts = Platform.select({
  ios: {
    sans: 'system-ui',
    serif: 'ui-serif',
    rounded: 'ui-rounded',
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "Inter, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "Inter, 'SF Pro Rounded', 'Hiragino Maru Gothic ProN', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, monospace",
  },
});
