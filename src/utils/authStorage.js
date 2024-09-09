// src/utils/authStorage.js
import AsyncStorage from '@react-native-async-storage/async-storage';

export const storeToken = async (token) => {
  try {
    await AsyncStorage.setItem('@access_token', token);
  } catch (error) {
    console.error('Error storing the token:', error);
  }
};

export const getToken = async () => {
  try {
    const token = await AsyncStorage.getItem('@access_token');
    return token;
  } catch (error) {
    console.error('Error retrieving the token:', error);
    return null;
  }
};
