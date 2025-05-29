import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Alert, KeyboardAvoidingView } from 'react-native';
import { TextInput, Button, Text } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

export default function TakeBloodBag({ navigation }) {
  const [passwordValue, setPasswordValue] = useState('');
  const [authenticated, setAuthenticated] = useState(false);
  const [rfid, setRfid] = useState('');
  const [status, setStatus] = useState('');
  const [waitingForRFID, setWaitingForRFID] = useState(true);

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
    <KeyboardAvoidingView behavior="padding" style={styles.container}>
      <Text style={styles.label}>Current Password Value (Blynk V0): {passwordValue}</Text>

      {!authenticated && (
        <Text style={{ marginTop: 20, fontWeight: 'bold' }}>Waiting for correct password...</Text>
      )}

      {authenticated && (
        <>
          <Text style={{ marginTop: 20, fontWeight: 'bold' }}>
            Access Granted! Please scan RFID tag.
          </Text>
          {waitingForRFID ? (
            <Text style={{ marginVertical: 20, fontWeight: 'bold' }}>Waiting for RFID scan...</Text>
          ) : (
            <>
              <Text style={styles.label}>Scanned RFID UID:</Text>
              <TextInput value={rfid} editable={false} style={styles.input} />
              <Button mode="contained" onPress={onTakeBloodBag} style={styles.button}>
                Take Blood Bag
              </Button>
            </>
          )}
        </>
      )}

      {status ? <Text style={{ marginTop: 10 }}>{status}</Text> : null}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, justifyContent: 'center' },
  label: { marginTop: 10, fontWeight: 'bold' },
  input: { backgroundColor: 'white', marginBottom: 10 },
  button: { marginTop: 20 },
});