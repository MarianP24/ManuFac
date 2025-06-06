import { MD3LightTheme, MD3DarkTheme, adaptNavigationTheme } from 'react-native-paper';
import { DefaultTheme as NavigationDefaultTheme, DarkTheme as NavigationDarkTheme } from '@react-navigation/native';
import { Appearance, ColorSchemeName } from 'react-native';

// Define custom colors for the application
const customColors = {
  primary: '#0066CC', // Blue - Primary brand color
  secondary: '#4CAF50', // Green - Secondary color for success actions
  tertiary: '#FF5722', // Orange - For emergency/alert actions
  error: '#B00020', // Red - For errors
  background: '#F5F5F5', // Light gray - Background color
  surface: '#FFFFFF', // White - Surface color
  onPrimary: '#FFFFFF', // White - Text on primary color
  onSecondary: '#FFFFFF', // White - Text on secondary color
  onTertiary: '#FFFFFF', // White - Text on tertiary color
  onBackground: '#000000', // Black - Text on background
  onSurface: '#000000', // Black - Text on surface
};

// Define custom dark colors
const customDarkColors = {
  primary: '#4D94FF', // Lighter blue for dark theme
  secondary: '#81C784', // Lighter green for dark theme
  tertiary: '#FF8A65', // Lighter orange for dark theme
  error: '#CF6679', // Lighter red for dark theme
  background: '#121212', // Dark gray - Background color
  surface: '#1E1E1E', // Slightly lighter dark gray - Surface color
  onPrimary: '#FFFFFF', // White - Text on primary color
  onSecondary: '#000000', // Black - Text on secondary color
  onTertiary: '#000000', // Black - Text on tertiary color
  onBackground: '#FFFFFF', // White - Text on background
  onSurface: '#FFFFFF', // White - Text on surface
};

// Create custom light theme
const customLightTheme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    ...customColors,
  },
};

// Create custom dark theme
const customDarkTheme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    ...customDarkColors,
  },
};

// Adapt navigation theme to match paper theme
const { LightTheme, DarkTheme } = adaptNavigationTheme({
  reactNavigationLight: NavigationDefaultTheme,
  reactNavigationDark: NavigationDarkTheme,
});

// Combine paper theme with navigation theme
const CombinedLightTheme = {
  ...customLightTheme,
  ...LightTheme,
  colors: {
    ...customLightTheme.colors,
    ...LightTheme.colors,
  },
};

const CombinedDarkTheme = {
  ...customDarkTheme,
  ...DarkTheme,
  colors: {
    ...customDarkTheme.colors,
    ...DarkTheme.colors,
  },
};

// Function to get the current theme based on system preference
export const getTheme = (colorScheme: ColorSchemeName) => {
  return colorScheme === 'dark' ? CombinedDarkTheme : CombinedLightTheme;
};

// Get the current system color scheme
const colorScheme = Appearance.getColorScheme();

// Export the theme
export const theme = getTheme(colorScheme);

// Export theme types
export type AppTheme = typeof CombinedLightTheme;
export type ThemeType = 'light' | 'dark';