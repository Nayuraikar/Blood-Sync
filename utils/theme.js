import { DefaultTheme } from 'react-native-paper';

export const colors = {
  primary: '#E53E3E', // Medical Red
  secondary: '#3182CE', // Medical Blue
  accent: '#38B2AC', // Medical Teal
  background: '#FFFFFF',
  surface: '#F7FAFC',
  text: '#2D3748',
  error: '#E53E3E',
  success: '#48BB78',
  warning: '#ECC94B',
  info: '#3182CE',
  disabled: '#A0AEC0',
  placeholder: '#718096',
  backdrop: 'rgba(0, 0, 0, 0.5)',
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const typography = {
  fontSizes: {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 18,
    xl: 20,
    xxl: 24,
    xxxl: 32,
  },
  fontWeights: {
    regular: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  },
};

export const shadows = {
  small: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  medium: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
  },
  large: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
  },
};

export const theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    ...colors,
  },
  spacing,
  typography,
  shadows,
  roundness: 8,
  animation: {
    scale: 1.0,
  },
};

export const cardStyles = {
  container: {
    backgroundColor: colors.surface,
    borderRadius: theme.roundness,
    padding: spacing.md,
    marginVertical: spacing.sm,
    ...shadows.small,
  },
  title: {
    fontSize: typography.fontSizes.lg,
    fontWeight: typography.fontWeights.semibold,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  content: {
    fontSize: typography.fontSizes.md,
    color: colors.text,
  },
};

export const statusStyles = {
  success: {
    backgroundColor: colors.success,
    color: colors.background,
  },
  error: {
    backgroundColor: colors.error,
    color: colors.background,
  },
  warning: {
    backgroundColor: colors.warning,
    color: colors.text,
  },
  info: {
    backgroundColor: colors.info,
    color: colors.background,
  },
}; 