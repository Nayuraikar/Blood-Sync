import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Animated } from 'react-native';
import { colors, spacing, typography, shadows } from '../utils/theme';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const AccessLogTimeline = ({ logs, onFilterChange }) => {
  const [selectedFilter, setSelectedFilter] = useState('all');
  const fadeAnim = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, []);

  const filters = [
    { id: 'all', label: 'All', icon: 'clock-outline' },
    { id: 'granted', label: 'Granted', icon: 'check-circle-outline' },
    { id: 'denied', label: 'Denied', icon: 'close-circle-outline' },
    { id: 'pending', label: 'Pending', icon: 'clock-alert-outline' },
  ];

  const renderFilter = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.filterButton,
        selectedFilter === item.id && styles.filterButtonActive,
      ]}
      onPress={() => {
        setSelectedFilter(item.id);
        onFilterChange(item.id);
      }}
    >
      <Icon
        name={item.icon}
        size={20}
        color={selectedFilter === item.id ? colors.background : colors.text}
      />
      <Text
        style={[
          styles.filterText,
          selectedFilter === item.id && styles.filterTextActive,
        ]}
      >
        {item.label}
      </Text>
    </TouchableOpacity>
  );

  const renderLogItem = ({ item }) => (
    <Animated.View
      style={[
        styles.logItem,
        { opacity: fadeAnim }
      ]}
    >
      <View style={styles.logHeader}>
        <Icon
          name={item.status === 'granted' ? 'check-circle' : 'close-circle'}
          size={28}
          color={item.status === 'granted' ? colors.success : colors.error}
        />
        <View style={styles.logContent}>
          <Text style={styles.logTitle}>{item.title}</Text>
          <Text style={styles.logTime}>{item.time}</Text>
        </View>
      </View>
      
      <Text style={styles.logDetails}>{item.details}</Text>
      
      {item.notes && (
        <Text style={styles.logNotes}>{item.notes}</Text>
      )}
    </Animated.View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.filterContainer}>
        <FlatList
          horizontal
          data={filters}
          renderItem={renderFilter}
          keyExtractor={(item) => item.id}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterList}
        />
      </View>
      
      <FlatList
        data={logs}
        renderItem={renderLogItem}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.logList}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  filterContainer: {
    backgroundColor: colors.surface,
    paddingVertical: spacing.md,
    ...shadows.small,
  },
  filterList: {
    paddingHorizontal: spacing.md,
    alignItems: 'center',
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    marginRight: spacing.md,
    borderRadius: 25,
    backgroundColor: colors.surface,
    ...shadows.small,
    minWidth: 120,
    justifyContent: 'center',
  },
  filterButtonActive: {
    backgroundColor: colors.primary,
  },
  filterText: {
    marginLeft: spacing.sm,
    fontSize: typography.fontSizes.md,
    color: colors.text,
    fontWeight: typography.fontWeights.medium,
  },
  filterTextActive: {
    color: colors.background,
  },
  logList: {
    padding: spacing.md,
  },
  logItem: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing.lg,
    marginBottom: spacing.md,
    ...shadows.small,
  },
  logHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  logContent: {
    flex: 1,
    marginLeft: spacing.md,
  },
  logTitle: {
    fontSize: typography.fontSizes.lg,
    fontWeight: typography.fontWeights.semibold,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  logTime: {
    fontSize: typography.fontSizes.sm,
    color: colors.placeholder,
  },
  logDetails: {
    fontSize: typography.fontSizes.md,
    color: colors.text,
    marginBottom: spacing.sm,
    lineHeight: 22,
  },
  logNotes: {
    fontSize: typography.fontSizes.sm,
    color: colors.placeholder,
    fontStyle: 'italic',
    lineHeight: 20,
  },
});

export default AccessLogTimeline; 