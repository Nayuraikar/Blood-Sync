import React, { useEffect, useState } from 'react';
import { View, StyleSheet, FlatList, ScrollView } from 'react-native';
import { Button, Card, Text, Surface } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors, spacing, typography, shadows } from '../utils/theme';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

export default function Dashboard({ navigation }) {
  const [bloodBags, setBloodBags] = useState([]);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', loadBloodBags);
    return unsubscribe;
  }, [navigation]);

  const loadBloodBags = async () => {
    try {
      const stored = await AsyncStorage.getItem('bloodBags');
      if (stored) setBloodBags(JSON.parse(stored));
      else setBloodBags([]);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <ScrollView style={styles.scrollView}>
      <Surface style={styles.header}>
        <Icon name="hospital-box" size={40} color={colors.primary} style={styles.headerIcon} />
        <Text style={styles.headerTitle}>Blood Sync</Text>
        <Text style={styles.headerSubtitle}>Intelligent Access and Inventory Control for Blood Banks</Text>
      </Surface>

      <View style={styles.container}>
        <View style={styles.buttonContainer}>
          <Button 
            mode="contained" 
            onPress={() => navigation.navigate('AddBloodBag')} 
            style={styles.button}
            icon="plus-circle"
            labelStyle={styles.buttonLabel}
          >
            Add Blood Bag
          </Button>
          <Button 
            mode="contained" 
            onPress={() => navigation.navigate('TakeBloodBag')} 
            style={styles.button}
            icon="minus-circle"
            labelStyle={styles.buttonLabel}
          >
            Take Blood Bag
          </Button>
        </View>

        <Text style={styles.sectionTitle}>Current Inventory</Text>

        {bloodBags.length === 0 ? (
          <Surface style={styles.emptyState}>
            <Icon name="blood-bag" size={48} color={colors.placeholder} />
            <Text style={styles.emptyStateText}>No blood bags recorded</Text>
          </Surface>
        ) : (
          <FlatList
            data={bloodBags}
            keyExtractor={(item) => item.rfid}
            renderItem={({ item }) => (
              <Card style={styles.card}>
                <Card.Title 
                  title={`RFID: ${item.rfid}`}
                  titleStyle={styles.cardTitle}
                  left={(props) => (
                    <Icon {...props} name="tag" size={24} color={colors.primary} />
                  )}
                />
                <Card.Content>
                  <View style={styles.cardRow}>
                    <Icon name="blood-type" size={20} color={colors.secondary} />
                    <Text style={styles.cardText}>Blood Type: {item.bloodType}</Text>
                  </View>
                  <View style={styles.cardRow}>
                    <Icon name="calendar-plus" size={20} color={colors.secondary} />
                    <Text style={styles.cardText}>Collection Date: {item.collectionDate}</Text>
                  </View>
                  <View style={styles.cardRow}>
                    <Icon name="calendar-clock" size={20} color={colors.secondary} />
                    <Text style={styles.cardText}>Expiry Date: {item.expiryDate}</Text>
                  </View>
                </Card.Content>
              </Card>
            )}
          />
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    padding: spacing.xl,
    backgroundColor: colors.surface,
    alignItems: 'center',
    ...shadows.medium,
  },
  headerIcon: {
    marginBottom: spacing.sm,
  },
  headerTitle: {
    fontSize: typography.fontSizes.xxl,
    fontWeight: typography.fontWeights.bold,
    color: colors.primary,
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: typography.fontSizes.lg,
    color: colors.text,
    textAlign: 'center',
    marginTop: spacing.xs,
  },
  container: {
    flex: 1,
    padding: spacing.lg,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.xl,
  },
  button: {
    flex: 1,
    marginHorizontal: spacing.xs,
    paddingVertical: spacing.sm,
    backgroundColor: colors.primary,
  },
  buttonLabel: {
    fontSize: typography.fontSizes.md,
    fontWeight: typography.fontWeights.medium,
  },
  sectionTitle: {
    fontSize: typography.fontSizes.xl,
    fontWeight: typography.fontWeights.bold,
    color: colors.text,
    marginBottom: spacing.md,
  },
  emptyState: {
    padding: spacing.xl,
    alignItems: 'center',
    borderRadius: 12,
    backgroundColor: colors.surface,
    ...shadows.small,
  },
  emptyStateText: {
    marginTop: spacing.md,
    fontSize: typography.fontSizes.md,
    color: colors.placeholder,
  },
  card: {
    marginBottom: spacing.md,
    ...shadows.small,
  },
  cardTitle: {
    fontSize: typography.fontSizes.md,
    fontWeight: typography.fontWeights.semibold,
    color: colors.text,
  },
  cardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  cardText: {
    marginLeft: spacing.sm,
    fontSize: typography.fontSizes.md,
    color: colors.text,
  },
});
