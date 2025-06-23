import React, { useEffect, useState, useMemo } from 'react';
import { View, StyleSheet, FlatList, ScrollView, Platform, TouchableOpacity } from 'react-native';
import { Button, Card, Text, Surface, Title, Paragraph, Portal, Dialog, List, IconButton, Divider } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors, spacing, typography, shadows } from '../utils/theme';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import axios from 'axios';

export default function Dashboard({ navigation }) {
  const [bloodBags, setBloodBags] = useState([]);
  const [alertVisible, setAlertVisible] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalType, setModalType] = useState(''); // 'total', 'expiring', 'expired'
  const [modalData, setModalData] = useState([]);

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
      expiringSoonList: expiringSoon,
      expiredList: expired,
    };
  }, [bloodBags]);

  const handleSummaryPress = (type) => {
    let data = [];
    if (type === 'total') data = bloodBags;
    else if (type === 'expiring') data = summaryData.expiringSoonList;
    else if (type === 'expired') data = summaryData.expiredList;
    setModalType(type);
    setModalData(data);
    setModalVisible(true);
  };

  const SummaryCard = ({ title, count, icon, color, onPress }) => (
    <Card style={styles.summaryCard} onPress={onPress}>
      <Card.Content style={styles.summaryCardContent}>
        <Icon name={icon} size={32} color={color} />
        <Title style={styles.summaryCount}>{count}</Title>
        <Paragraph style={styles.summaryTitle}>{title}</Paragraph>
      </Card.Content>
    </Card>
  );

  const modalDialog = (
    <Portal>
      <Dialog
        visible={modalVisible}
        onDismiss={() => setModalVisible(false)}
        style={{ borderRadius: 16, maxWidth: 420, alignSelf: 'center', backgroundColor: colors.surface }}
      >
        <Dialog.Title style={{ fontWeight: 'bold', color: colors.primary, fontSize: 22, textAlign: 'center' }}>
          {modalType === 'total' && 'All Blood Bags'}
          {modalType === 'expiring' && 'Expiring Soon'}
          {modalType === 'expired' && 'Expired Blood Bags'}
        </Dialog.Title>
        <Dialog.Content style={{ paddingTop: 0, paddingBottom: spacing.md, backgroundColor: colors.surface, minWidth: 300 }}>
          {modalData.length === 0 ? (
            <Paragraph style={styles.emptyModalText}>No blood bags found.</Paragraph>
          ) : (
            <ScrollView style={{ maxHeight: 400 }}>
              {modalData.map((item, idx) => (
                <View key={item.rfid} style={{ marginBottom: 14, padding: 8, borderRadius: 10, backgroundColor: '#fafafa', elevation: 1 }}>
                  <Text style={{ fontWeight: 'bold', fontSize: 17, marginBottom: 2, color: colors.primary }}>
                    RFID UID: <Text style={{ color: colors.primary, fontWeight: 'bold' }}>{item.rfid}</Text>
                  </Text>
                  <Text style={{ fontSize: 15, color: colors.text, marginBottom: 1 }}>Blood Type: {item.bloodType}</Text>
                  <Text style={{ fontSize: 15, color: colors.text, marginBottom: 1 }}>Collection Date: {item.collectionDate}</Text>
                  <Text style={{ fontSize: 15, color: colors.text, marginBottom: 1 }}>Expiry Date: {item.expiryDate}</Text>
                  {idx < modalData.length - 1 && <Divider style={{ marginVertical: 8 }} />}
                </View>
              ))}
            </ScrollView>
          )}
        </Dialog.Content>
        <Dialog.Actions>
          <Button onPress={() => setModalVisible(false)} style={{ borderRadius: 20, marginTop: 8, minWidth: 80, alignSelf: 'center' }}>Close</Button>
        </Dialog.Actions>
      </Dialog>
    </Portal>
  );

  const securityAlertDialog = (
    <Portal>
      <Dialog visible={alertVisible} onDismiss={hideDialog} style={styles.alertDialg}>
        <Dialog.Title style={styles.alertTitle}>
          <Icon name="alert-octagon" size={30} color={colors.error} />
          {' '}Security Alert!
        </Dialog.Title>
        <Dialog.Content>
          <Paragraph style={styles.alertText}>
            Unauthorized access attempt has been detected!
          </Paragraph>
        </Dialog.Content>
        <Dialog.Actions>
          <Button onPress={hideDialog} color={colors.primary}>Acknowledge</Button>
        </Dialog.Actions>
      </Dialog>
    </Portal>
  );

  // --- MOBILE LAYOUT ---
  if (Platform.OS !== 'web') {
    return (
      <ScrollView style={{ flex: 1, backgroundColor: colors.background }} contentContainerStyle={{ alignItems: 'center', paddingBottom: 32 }}>
        <View style={{ alignItems: 'center', paddingTop: spacing.xl, paddingBottom: spacing.md }}>
          <Icon name="hospital-box" size={48} color={colors.primary} style={{ marginBottom: spacing.sm }} />
          <Text style={{ fontSize: 30, fontWeight: 'bold', color: colors.primary, marginBottom: 4 }}>Blood Sync</Text>
          <Text style={{ fontSize: 16, color: colors.text, textAlign: 'center', fontWeight: '500', marginBottom: 12 }}>
            Intelligent Access and Inventory Control for Blood Banks
          </Text>
        </View>
        <View style={{ flexDirection: 'row', justifyContent: 'center', width: '92%', marginBottom: spacing.md }}>
          <Button
            mode="contained"
            onPress={() => navigation.navigate('AddBloodBag')}
            style={{
              borderRadius: 16,
              backgroundColor: colors.primary,
              paddingVertical: 12,
              width: '48%',
              marginRight: 8,
              elevation: 2,
              minHeight: 48,
            }}
            icon="plus-circle"
            labelStyle={{ fontSize: 16, fontWeight: 'bold' }}
          >
            Add
          </Button>
          <Button
            mode="contained"
            onPress={() => navigation.navigate('TakeBloodBag')}
            style={{
              borderRadius: 16,
              backgroundColor: colors.primary,
              paddingVertical: 12,
              width: '48%',
              marginLeft: 8,
              elevation: 2,
              minHeight: 48,
            }}
            icon="minus-circle"
            labelStyle={{ fontSize: 16, fontWeight: 'bold' }}
          >
            Take
          </Button>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: spacing.md, width: '100%', paddingLeft: spacing.lg }} contentContainerStyle={{ alignItems: 'center' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <TouchableOpacity onPress={() => handleSummaryPress('total')} activeOpacity={0.8} style={styles.pillCardWrapper}>
              <View style={[styles.pillCard, { borderColor: colors.primary, minWidth: 120, paddingHorizontal: 20, paddingVertical: 16 }]}> 
                <Icon name="briefcase-variant" size={28} color={colors.primary} style={{ marginRight: 10 }} />
                <View style={{ alignItems: 'center' }}>
                  <Text style={[styles.pillCardNumber, { fontSize: 22, fontWeight: 'bold' }]}>{summaryData.total}</Text>
                  <Text style={[styles.pillCardLabel, { fontSize: 15, fontWeight: '600' }]}>Total</Text>
                </View>
              </View>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => handleSummaryPress('expiring')} activeOpacity={0.8} style={styles.pillCardWrapper}>
              <View style={[styles.pillCard, { borderColor: colors.warning, minWidth: 120, paddingHorizontal: 20, paddingVertical: 16 }]}> 
                <Icon name="clock-alert-outline" size={28} color={colors.warning} style={{ marginRight: 10 }} />
                <View style={{ alignItems: 'center' }}>
                  <Text style={[styles.pillCardNumber, { fontSize: 22, fontWeight: 'bold' }]}>{summaryData.expiringSoon}</Text>
                  <Text style={[styles.pillCardLabel, { fontSize: 15, fontWeight: '600' }]}>Expiring</Text>
                </View>
              </View>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => handleSummaryPress('expired')} activeOpacity={0.8} style={styles.pillCardWrapper}>
              <View style={[styles.pillCard, { borderColor: colors.error, minWidth: 120, paddingHorizontal: 20, paddingVertical: 16 }]}> 
                <Icon name="close-circle-outline" size={28} color={colors.error} style={{ marginRight: 10 }} />
                <View style={{ alignItems: 'center' }}>
                  <Text style={[styles.pillCardNumber, { fontSize: 22, fontWeight: 'bold' }]}>{summaryData.expired}</Text>
                  <Text style={[styles.pillCardLabel, { fontSize: 15, fontWeight: '600' }]}>Expired</Text>
                </View>
              </View>
            </TouchableOpacity>
          </View>
        </ScrollView>
        <View style={{ width: '92%', marginTop: spacing.md }}>
          <Text style={{ fontSize: 20, fontWeight: 'bold', color: colors.text, marginBottom: spacing.sm }}>
            Current Inventory
          </Text>
          {bloodBags.length === 0 ? (
            <Surface style={[styles.emptyState, { marginTop: spacing.md, padding: spacing.md }] }>
              <Icon name="blood-bag" size={40} color={colors.placeholder} />
              <Text style={[styles.emptyStateText, { fontSize: 16 }]}>No blood bags recorded</Text>
            </Surface>
          ) : (
            bloodBags.map((item) => (
              <Card style={[styles.card, { marginBottom: spacing.md, borderRadius: 12, elevation: 2, padding: 0 }]} key={item.rfid}>
                <Card.Title
                  title={`${item.rfid}`}
                  titleStyle={[styles.cardTitle, { fontSize: 18, fontWeight: 'bold' }]}
                  left={(props) => (
                    <Icon {...props} name="tag" size={22} color={colors.primary} />
                  )}
                />
                <Card.Content style={{ paddingVertical: 8 }}>
                  <View style={styles.cardRow}>
                    <Icon name="water" size={20} color={colors.secondary} />
                    <Text style={[styles.cardText, { fontSize: 16 }]}>Blood Type: {item.bloodType}</Text>
                  </View>
                  <View style={styles.cardRow}>
                    <Icon name="calendar-plus" size={20} color={colors.secondary} />
                    <Text style={[styles.cardText, { fontSize: 16 }]}>Collection Date: {item.collectionDate}</Text>
                  </View>
                  <View style={styles.cardRow}>
                    <Icon name="calendar-clock" size={20} color={colors.secondary} />
                    <Text style={[styles.cardText, { fontSize: 16 }]}>Expiry Date: {item.expiryDate}</Text>
                  </View>
                </Card.Content>
              </Card>
            ))
          )}
        </View>
        {modalDialog}
        {securityAlertDialog}
      </ScrollView>
    );
  }

  // --- WEB LAYOUT (unchanged) ---
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

        <View style={styles.mainContent}>
          <View style={styles.inventorySection}>
            <Text style={styles.sectionTitle}>Current Inventory</Text>
            <ScrollView style={{flex: 1}} contentContainerStyle={{paddingBottom: 20}}>
              {bloodBags.length === 0 ? (
                <Surface style={styles.emptyState}>
                  <Icon name="blood-bag" size={48} color={colors.placeholder} />
                  <Text style={styles.emptyStateText}>No blood bags recorded</Text>
                </Surface>
              ) : (
                <>
                  {bloodBags.map((item) => (
                    <Card style={styles.card} key={item.rfid}>
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
                  ))}
                </>
              )}
            </ScrollView>
          </View>
          <View style={styles.summarySection}>
             <SummaryCard 
              title="Total Bags" 
              count={summaryData.total} 
              icon="briefcase-variant"
              color={colors.primary}
              onPress={() => handleSummaryPress('total')}
            />
            <SummaryCard 
              title="Expiring Soon" 
              count={summaryData.expiringSoon} 
              icon="clock-alert-outline"
              color={colors.warning}
              onPress={() => handleSummaryPress('expiring')}
            />
            <SummaryCard 
              title="Expired" 
              count={summaryData.expired} 
              icon="close-circle-outline"
              color={colors.error}
              onPress={() => handleSummaryPress('expired')}
            />
          </View>
        </View>
      </View>
      {modalDialog}
      {securityAlertDialog}
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
    padding: spacing.lg,
  },
  mainContent: {
    flexDirection: 'row',
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
  webModal: {
    borderRadius: 8,
    maxWidth: 420,
    alignSelf: 'center',
    backgroundColor: colors.surface,
  },
  webModalTitle: {
    fontWeight: 'bold',
    color: colors.primary,
    fontSize: 22,
    marginBottom: 0,
    paddingBottom: 0,
  },
  webModalContent: {
    paddingTop: 0,
    paddingBottom: spacing.md,
    backgroundColor: colors.surface,
    minWidth: 300,
  },
  webModalEntry: {
    marginBottom: 10,
  },
  webModalEntryTitle: {
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 2,
  },
  webModalEntryText: {
    fontSize: 14,
    color: colors.text,
    marginBottom: 1,
  },
  webModalDivider: {
    marginVertical: 8,
  },
  webModalCloseButton: {
    borderRadius: 20,
    marginTop: 8,
  },
  mobileModal: {
    borderRadius: 18,
    marginHorizontal: 10,
    backgroundColor: colors.surface,
    minWidth: 0,
    maxWidth: '90%',
    alignSelf: 'center',
  },
  mobileModalTitle: {
    fontWeight: 'bold',
    color: colors.primary,
    fontSize: 24,
    marginBottom: 0,
    paddingBottom: 0,
    textAlign: 'center',
  },
  mobileModalContent: {
    paddingTop: 0,
    paddingBottom: spacing.md,
    backgroundColor: colors.surface,
    minWidth: 0,
  },
  mobileModalEntry: {
    marginBottom: 14,
    padding: 8,
    borderRadius: 10,
    backgroundColor: '#fafafa',
    elevation: 1,
  },
  mobileModalEntryTitle: {
    fontWeight: 'bold',
    fontSize: 18,
    marginBottom: 2,
    color: colors.primary,
  },
  mobileModalEntryText: {
    fontSize: 16,
    color: colors.text,
    marginBottom: 1,
  },
  mobileModalDivider: {
    marginVertical: 8,
  },
  mobileModalCloseButton: {
    borderRadius: 20,
    marginTop: 8,
    minWidth: 80,
    alignSelf: 'center',
  },
});
