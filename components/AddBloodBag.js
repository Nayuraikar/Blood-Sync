import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Alert, KeyboardAvoidingView, ScrollView, Platform } from 'react-native';
import { TextInput, Button, Text, Card, Title, Paragraph } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { LinearGradient } from 'expo-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

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

      // Reset the Blynk PIN to 0
      await axios.get('https://blynk.cloud/external/api/update?token=d5GPxcfxGojAvfzCb6QH0qW3DRycxBfA&v0=0');

      Alert.alert('Success', 'Blood bag saved');
      navigation.goBack();
    } catch (e) {
      Alert.alert('Error', 'Failed to save blood bag');
      console.error(e);
    }
  };

  return (
    <LinearGradient colors={['#E53E3E', '#E53E3E']} style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"} 
        style={styles.container}
      >
        <ScrollView contentContainerStyle={styles.scrollView}>
          <Card style={styles.card}>
            <Card.Content>
              <Title style={styles.title}>Add New Blood Bag</Title>
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
                        onChangeText={setBloodType}
                        style={styles.input}
                        left={<TextInput.Icon name="water-outline" />}
                      />

                      <TextInput
                        label="Collection Date (YYYY-MM-DD)"
                        value={collectionDate}
                        onChangeText={setCollectionDate}
                        style={styles.input}
                        left={<TextInput.Icon name="calendar" />}
                      />

                      <TextInput
                        label="Expiry Date (YYYY-MM-DD)"
                        value={expiryDate}
                        onChangeText={setExpiryDate}
                        style={styles.input}
                        left={<TextInput.Icon name="calendar-clock" />}
                      />

                      <Button mode="contained" onPress={onSave} style={styles.button} icon="content-save">
                        Save Blood Bag
                      </Button>
                    </>
                  )}
                </>
              )}
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