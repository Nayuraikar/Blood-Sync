import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Alert, KeyboardAvoidingView, ScrollView, Platform } from 'react-native';
import { TextInput, Button, Text, Card, Title, Paragraph } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { LinearGradient } from 'expo-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

export default function TakeBloodBag({ navigation }) {
  const [passwordValue, setPasswordValue] = useState('');
  const [authenticated, setAuthenticated] = useState(false);
  const [rfid, setRfid] = useState('');
  const [status, setStatus] = useState('');
  const [waitingForRFID, setWaitingForRFID] = useState(true);
  const [bloodType, setBloodType] = useState('');
  const [collectionDate, setCollectionDate] = useState('');
  const [expiryDate, setExpiryDate] = useState('');

  // Poll Blynk V0 for password value every 3 seconds
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const response = await axios.get(
          'https://blynk.cloud/external/api/get?token=d5GPxcfxGojAvfzCb6QH0qW3DRycxBfA&v0'
        );
        const val = response.data.trim();
        setPasswordValue(val);

        if (val === 'Access Granted') {
          setAuthenticated(true);
        } else {
          setAuthenticated(false);
          setRfid('');
          setWaitingForRFID(true);
        }
      } catch (e) {
        console.error('Error fetching password from Blynk:', e);
      }
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  // Poll Blynk V3 for RFID only if authenticated
  useEffect(() => {
    if (!authenticated) {
      return;
    }

    const rfidInterval = setInterval(async () => {
      try {
        const response = await axios.get(
          'https://blynk.cloud/external/api/get?token=d5GPxcfxGojAvfzCb6QH0qW3DRycxBfA&v3'
        );
        const scannedRFID = response.data.trim();
        if (scannedRFID && scannedRFID !== rfid) {
          setRfid(scannedRFID);
          setWaitingForRFID(false);
        }
      } catch (e) {
        console.error('Error fetching RFID from Blynk:', e);
      }
    }, 2000);

    return () => clearInterval(rfidInterval);
  }, [authenticated, rfid]);

  // Fetch blood bag details when RFID is scanned
  useEffect(() => {
    const fetchDetails = async () => {
      if (rfid) {
        try {
          const stored = await AsyncStorage.getItem('bloodBags');
          let bloodBags = stored ? JSON.parse(stored) : [];
          const bag = bloodBags.find(b => b.rfid === rfid);
          if (bag) {
            setBloodType(bag.bloodType || 'N/A');
            setCollectionDate(bag.collectionDate || 'N/A');
            setExpiryDate(bag.expiryDate || 'N/A');
          } else {
            setBloodType('N/A');
            setCollectionDate('N/A');
            setExpiryDate('N/A');
          }
        } catch (e) {
          setBloodType('N/A');
          setCollectionDate('N/A');
          setExpiryDate('N/A');
        }
      } else {
        setBloodType('');
        setCollectionDate('');
        setExpiryDate('');
      }
    };
    fetchDetails();
  }, [rfid]);

  // When user presses button to take blood bag
  const onTakeBloodBag = async () => {
    if (!rfid) {
      Alert.alert('Error', 'No RFID scanned!');
      return;
    }

    setStatus('Removing blood bag...');
    try {
      const stored = await AsyncStorage.getItem('bloodBags');
      let bloodBags = stored ? JSON.parse(stored) : [];

      const exists = bloodBags.find(bag => bag.rfid === rfid);
      if (!exists) {
        Alert.alert('Error', 'Blood bag with this RFID not found');
        setStatus('');
        return;
      }

      bloodBags = bloodBags.filter(bag => bag.rfid !== rfid);
      await AsyncStorage.setItem('bloodBags', JSON.stringify(bloodBags));
      
      // Reset the Blynk PIN to 0
      await axios.get('https://blynk.cloud/external/api/update?token=d5GPxcfxGojAvfzCb6QH0qW3DRycxBfA&v0=0');

      Alert.alert('Success', 'Blood bag taken and removed!');
      setStatus('');
      setRfid('');
      setWaitingForRFID(true);
      navigation.goBack();
    } catch (e) {
      Alert.alert('Error', 'Failed to remove blood bag');
      setStatus('');
      console.error(e);
    }
  };

  return (
    <LinearGradient colors={['#E53E3E', '#E53E3E']} style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <ScrollView contentContainerStyle={styles.scrollView}>
          <Card style={styles.card}>
            <Card.Content>
              <Title style={styles.title}>Take Blood Bag</Title>
              <Paragraph style={styles.label}>Current Password Value (Blynk V0): {passwordValue}</Paragraph>

              {!authenticated && (
                <View style={styles.statusContainer}>
                  <Icon name="lock-clock" size={50} color="#ff6347" />
                  <Text style={styles.statusText}>Waiting for correct password...</Text>
                </View>
              )}

              {authenticated && (
                <>
                  <View style={styles.statusContainer}>
                    <Icon name="lock-open-variant" size={50} color="#4caf50" />
                    <Text style={styles.statusText}>Access Granted! Please scan RFID tag.</Text>
                  </View>

                  {waitingForRFID ? (
                    <View style={styles.statusContainer}>
                      <Icon name="barcode-scan" size={50} color="#ffc107" />
                      <Text style={styles.statusText}>Waiting for RFID scan...</Text>
                    </View>
                  ) : (
                    <>
                      <TextInput
                        label="Scanned Blood Bag RFID UID"
                        value={rfid}
                        editable={false}
                        style={styles.input}
                        left={<TextInput.Icon name="barcode" />}
                      />
                      <TextInput
                        label="Blood Type (e.g. A+, O-)"
                        value={bloodType}
                        editable={false}
                        style={styles.input}
                        left={<TextInput.Icon name="water-outline" />}
                      />
                      <TextInput
                        label="Collection Date (YYYY-MM-DD)"
                        value={collectionDate}
                        editable={false}
                        style={styles.input}
                        left={<TextInput.Icon name="calendar" />}
                      />
                      <TextInput
                        label="Expiry Date (YYYY-MM-DD)"
                        value={expiryDate}
                        editable={false}
                        style={styles.input}
                        left={<TextInput.Icon name="calendar-clock" />}
                      />
                      <Button
                        mode="contained"
                        onPress={onTakeBloodBag}
                        style={styles.button}
                        icon="minus-circle"
                      >
                        Take Blood Bag
                      </Button>
                    </>
                  )}
                </>
              )}
              {status ? <Text style={styles.statusText}>{status}</Text> : null}
            </Card.Content>
          </Card>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  card: {
    borderRadius: 15,
    padding: 10,
    elevation: 4,
  },
  title: {
    textAlign: 'center',
    marginBottom: 20,
    color: '#333',
    fontWeight: 'bold',
  },
  label: {
    marginTop: 10,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
  },
  statusContainer: {
    alignItems: 'center',
    marginVertical: 20,
  },
  statusText: {
    marginTop: 10,
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  input: {
    marginBottom: 15,
    backgroundColor: 'white',
  },
  button: {
    marginTop: 20,
    paddingVertical: 8,
    borderRadius: 20,
  },
});