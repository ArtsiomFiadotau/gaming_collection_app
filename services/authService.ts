import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

const TOKEN_KEY = 'IGDB_ACCESS_TOKEN';
const TOKEN_EXPIRY_KEY = 'IGDB_TOKEN_EXPIRY';
const CLIENT_ID = 'h47uvldjvq5w0sdw00qh6md6i2a4c0';
const CLIENT_SECRET = 'bkuxsc25mkncrvzkmu016uatt74s08';

// Получение текущего токена или обновление его при необходимости
export async function getValidToken(): Promise<string | null> {
  const [token, expiryStr] = await Promise.all([
    AsyncStorage.getItem(TOKEN_KEY),
    AsyncStorage.getItem(TOKEN_EXPIRY_KEY),
  ]);
  if (!token || !expiryStr) return null;

  const expiryTime = parseInt(expiryStr, 10);
  const now = Date.now();
  const threshold = 2 * 24 * 60 * 60 * 1000; // 2 дня
  if (expiryTime - now < threshold) {
    // токен скоро истекает, обновляем
    return await refreshToken();
  }
  return token;
}

// Обновление токена
export async function refreshToken(): Promise<string | null> {
  try {
    const newTokenData = await fetchNewTokenFromServer(); // реализуйте запрос к вашему серверу
    if (newTokenData?.access_token && newTokenData?.expires_in) {
      const expiryTime = Date.now() + newTokenData.expires_in * 1000;
      await AsyncStorage.setItem(TOKEN_KEY, newTokenData.access_token);
      await AsyncStorage.setItem(TOKEN_EXPIRY_KEY, expiryTime.toString());
      return newTokenData.access_token;
    }
    return null;
  } catch {
    return null;
  }
}

// пример функции вызова вашего сервера для получения нового токена
// async function fetchNewTokenFromServer() {
//   const response = await fetch('http://localhost:3001/get-igdb-token');
//   if (response.ok) {
//     return await response.json(); // { access_token, expires_in }
//   }
//   throw new Error('Failed to fetch new token');
// }

async function fetchNewTokenFromServer() {
    try {
      const response = await axios.post(
        'https://id.twitch.tv/oauth2/token',
        null,
        {
          params: {
            client_id: CLIENT_ID,
            client_secret: CLIENT_SECRET,
            grant_type: 'client_credentials'
          }
        }
      );
  
      // Response содержит access_token и expires_in
      const { access_token, expires_in } = response.data;
      return { access_token, expires_in };
    } catch (error) {
      console.error('Ошибка при получении токена:', error);
      throw new Error('Failed to fetch token');
    }
  }