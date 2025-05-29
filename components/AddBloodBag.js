import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Alert, KeyboardAvoidingView } from 'react-native';
import { TextInput, Button, Text } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

export default function AddBloodBag({ navigation }) {
  const [passwordValue, setPasswordValue] = useState('');
  const [authenticated, setAuthenticated] = useState(false);

  const [rfid, setRfid] = useState('');
  const [bloodType, setBloodType] = useState('');
  const [collectionDate, setCollectionDate] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [waitingForRFID, setWaitingForRFID] = useState(true);

  // Poll Blynk V0 for password every 3 seconds
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const response = await axios.get(
          'https://blynk.cloud/external/api/get?token=d5GPxcfxGojAvfzCb6QH0qW3DRycxBfA&v0'
        );
        const val = response.data.trim();
        setPasswordValue(val);

        if (val.includes('Access Granted')) {
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

  const onSave = async () => {
    if (!rfid || !bloodType || !collectionDate || !expiryDate) {
      Alert.alert('Error', 'Please fill all fields');
      return;
    }

    try {
      const stored = await AsyncStorage.getItem('bloodBags');
      let bloodBags = stored ? JSON.parse(stored) : [];

      // Remove existing blood bag with same RFID (overwrite)
      bloodBags = bloodBags.filter(bag => bag.rfid !== rfid);

      bloodBags.push({ rfid, bloodType, collectionDate, expiryDate });

      await AsyncStorage.setItem('bloodBags', JSON.stringify(bloodBags));
      Alert.alert('Success', 'Blood bag saved');
      navigation.goBack();
    } catch (e) {
      Alert.alert('Error', 'Failed to save blood bag');
      console.error(e);
    }
  };

  return (
    <KeyboardAvoidingView behavior="padding" style={styles.container}>
      <Text style={styles.label}>Current Password Value (Blynk V0): {passwordValue}</Text>

      {!authenticated && (
        <Text style={{ marginTop: 20, fontWeight: 'bold' }}>Waiting for correct password...</Text>
      )}

      {authenticated && (
        <>
          <Text style={{ marginTop: 20, fontWeight: 'bold' }}>Access Granted! Please scan RFID tag.</Text>

          {waitingForRFID ? (
            <Text style={{ marginVertical: 20, fontWeight: 'bold' }}>Waiting for RFID scan...</Text>
          ) : (
            <>
              <Text style={styles.label}>Scanned Blood Bag RFID UID:</Text>
              <TextInput
                value={rfid}
                editable={false}
                placeholder="RFID UID will auto-populate"
                style={styles.input}
              />

              <Text style={styles.label}>Blood Type (e.g. A+, O-):</Text>
              <TextInput
                value={bloodType}
                onChangeText={setBloodType}
                placeholder="Blood Type"
                style={styles.input}
              />

              <Text style={styles.label}>Collection Date (YYYY-MM-DD):</Text>
              <TextInput
                value={collectionDate}
                onChangeText={setCollectionDate}
                placeholder="Collection Date"
                style={styles.input}
              />

              <Text style={styles.label}>Expiry Date (YYYY-MM-DD):</Text>
              <TextInput
                value={expiryDate}
                onChangeText={setExpiryDate}
                placeholder="Expiry Date"
                style={styles.input}
              />

              <Button mode="contained" onPress={onSave} style={styles.button}>
                Save Blood Bag
              </Button>
            </>
          )}
        </>
      )}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, justifyContent: 'center' },
  label: { marginTop: 10, fontWeight: 'bold' },
  input: { backgroundColor: 'white', marginBottom: 10 },
  button: { marginTop: 20 },
});