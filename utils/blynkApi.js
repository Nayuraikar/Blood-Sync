import axios from 'axios';

const BLYNK_TOKEN = 'd5GPxcfxGojAvfzCb6QH0qW3DRycxBfA';
const BASE_URL = `https://blynk.cloud/external/api`;

export const getPinValue = async (pin) => {
  try {
    const response = await axios.get(`${BASE_URL}/get?token=${BLYNK_TOKEN}&pin=${pin}`);
    return response.data;
  } catch (error) {
    console.error('Blynk API Error:', error);
    throw error;
  }
};
