import React, { useEffect, useState, useMemo } from 'react';
import { View, StyleSheet, FlatList, ScrollView } from 'react-native';
import { Button, Card, Text, Surface, Title, Paragraph, Portal, Dialog } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors, spacing, typography, shadows } from '../utils/theme';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import axios from 'axios';

export default function Dashboard({ navigation }) {
  const [bloodBags, setBloodBags] = useState([]);
  const [alertVisible, setAlertVisible] = useState(false);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', loadBloodBags);
    const securityInterval = setInterval(async () => {
      try {
        const response = await axios.get(
          'https://blynk.cloud/external/api/get?token=d5GPxcfxGojAvfzCb6QH0qW3DRycxBfA&v4'
        );
        if (response.data.trim() === 'SECURITY ALERT') {
          setAlertVisible(true);
        }
      } catch (e) {
        console.error('Error fetching security alert from Blynk:', e);
      }
    }, 5000); // Poll every 5 seconds

    return () => {
      unsubscribe();
      clearInterval(securityInterval);
    };
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

  const hideDialog = async () => {
    try {
      await axios.get('https://blynk.cloud/external/api/update?token=d5GPxcfxGojAvfzCb6QH0qW3DRycxBfA&v4=System%20Secure');
      setAlertVisible(false);
    } catch (e) {
      console.error('Failed to reset security alert on Blynk:', e);
      setAlertVisible(false); // Still hide dialog on error
    }
  };

  const summaryData = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const sevenDaysFromNow = new Date();
    sevenDaysFromNow.setDate(today.getDate() + 7);
    sevenDaysFromNow.setHours(0, 0, 0, 0);

    const expiringSoon = bloodBags.filter(bag => {
      const expiryDate = new Date(bag.expiryDate);
      return expiryDate >= today && expiryDate <= sevenDaysFromNow;
    });

    const expired = bloodBags.filter(bag => new Date(bag.expiryDate) < today);

    return {
      total: bloodBags.length,
      expiringSoon: expiringSoon.length,
      expired: expired.length,
    };
  }, [bloodBags]);

  const SummaryCard = ({ title, count, icon, color }) => (
    <Card style={styles.summaryCard}>
      <Card.Content style={styles.summaryCardContent}>
        <Icon name={icon} size={32} color={color} />
        <Title style={styles.summaryCount}>{count}</Title>
        <Paragraph style={styles.summaryTitle}>{title}</Paragraph>
      </Card.Content>
    </Card>
  );

  return (
    <>
    <Portal>
        <Dialog visible={alertVisible} onDismiss={hideDialog} style={styles.alertDialg}>
          <Dialog.Icon icon="shield-alert" size={64} color={colors.error} />
          <Dialog.Title style={styles.alertTitle}>Security Alert!</Dialog.Title>
          <Dialog.Content>
            <Paragraph style={styles.alertText}>
              Multiple incorrect password attempts detected with motion present near the device.
            </Paragraph>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={hideDialog} mode="contained" style={{backgroundColor: colors.primary}}>Acknowledge</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
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

        <View style={styles.mainContent}>
          <View style={styles.inventorySection}>
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
                      title={`${item.rfid}`}
                      titleStyle={styles.cardTitle}
                      left={(props) => (
                        <Icon {...props} name="tag" size={24} color={colors.primary} />
                      )}
                    />
                    <Card.Content>
                      <View style={styles.cardRow}>
                        <Icon name="water" size={20} color={colors.secondary} />
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
          <View style={styles.summarySection}>
             <SummaryCard 
              title="Total Bags" 
              count={summaryData.total} 
              icon="briefcase-variant"
              color={colors.primary}
            />
            <SummaryCard 
              title="Expiring Soon" 
              count={summaryData.expiringSoon} 
              icon="clock-alert-outline"
              color={colors.warning}
            />
            <SummaryCard 
              title="Expired" 
              count={summaryData.expired} 
              icon="close-circle-outline"
              color={colors.error}
            />
          </View>
        </View>
      </View>
    </ScrollView>
    </>
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
  mainContent: {
    flexDirection: 'row',
    flex: 1,
  },
  inventorySection: {
    flex: 3, // Takes up 75% of the space
    marginRight: spacing.lg,
  },
  summarySection: {
    flex: 1, // Takes up 25% of the space
    justifyContent: 'flex-start',
  },
  summaryCard: {
    marginBottom: spacing.md,
    ...shadows.medium,
    backgroundColor: colors.surface,
  },
  summaryCardContent: {
    alignItems: 'center',
    padding: spacing.md,
  },
  summaryCount: {
    fontSize: typography.fontSizes.xxxl,
    fontWeight: typography.fontWeights.bold,
    color: colors.text,
    marginVertical: spacing.xs,
  },
  summaryTitle: {
    fontSize: typography.fontSizes.md,
    color: colors.placeholder,
    textAlign: 'center',
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
  alertDialg: {
    marginBottom: spacing.md,
    ...shadows.medium,
    backgroundColor: colors.surface,
  },
  alertTitle: {
    textAlign: 'center',
  },
  alertText: {
    textAlign: 'center',
    fontSize: typography.fontSizes.md,
  },
});
