import React from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { cardStyles, statusStyles, colors, spacing, typography } from '../utils/theme';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const StatusCard = ({ 
  title, 
  status, 
  icon, 
  value, 
  subtitle,
  onPress 
}) => {
  const scaleAnim = React.useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.95,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  };

  return (
    <Animated.View 
      style={[
        styles.container,
        { transform: [{ scale: scaleAnim }] }
      ]}
      onTouchStart={handlePressIn}
      onTouchEnd={handlePressOut}
    >
      <View style={styles.contentContainer}>
        <View style={styles.header}>
          <Icon 
            name={icon} 
            size={28} 
            color={colors.primary} 
            style={styles.icon}
          />
          <Text style={styles.title}>{title}</Text>
        </View>
        
        <View style={[styles.statusIndicator, statusStyles[status]]}>
          <Text style={styles.statusText}>{status.toUpperCase()}</Text>
        </View>

        <Text style={styles.value}>{value}</Text>
        
        {subtitle && (
          <Text style={styles.subtitle}>{subtitle}</Text>
        )}
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...cardStyles.container,
    marginHorizontal: spacing.md,
    minHeight: 160,
    justifyContent: 'center',
  },
  contentContainer: {
    alignItems: 'center',
    padding: spacing.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
    justifyContent: 'center',
  },
  icon: {
    marginRight: spacing.sm,
  },
  title: {
    ...cardStyles.title,
    textAlign: 'center',
    fontSize: typography.fontSizes.xl,
  },
  statusIndicator: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 20,
    marginBottom: spacing.md,
    minWidth: 100,
    alignItems: 'center',
  },
  statusText: {
    fontSize: typography.fontSizes.sm,
    fontWeight: typography.fontWeights.medium,
    textAlign: 'center',
  },
  value: {
    fontSize: typography.fontSizes.xxl,
    fontWeight: typography.fontWeights.bold,
    color: colors.text,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: typography.fontSizes.md,
    color: colors.placeholder,
    textAlign: 'center',
  },
});

export default StatusCard; 