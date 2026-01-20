import { CreateUserParams, SignInParams } from '@/types/type';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const API_BASE = 'https://gaming-collection-app-backend.onrender.com';
const STORAGE_USER_KEY = 'user';

export const createUser = async ({ email, password, userName }: CreateUserParams) => {
  try {
    const response = await fetch(`${API_BASE}/users/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, userName }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Registration failed');
    }

    const data = await response.json();
    // Ожидаем, что сервер вернёт { message, user: { userId, userName, email } }
    const user = data.user ?? null;
    if (user) {
      // Сохраняем пользователя в AsyncStorage (только userId и поля, которые нужны)
      await AsyncStorage.setItem(STORAGE_USER_KEY, JSON.stringify(user));
    }
    return user;
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : 'Unknown error');
  }
};

export const signIn = async ({ email, password }: SignInParams) => {
  try {
    const response = await fetch(`${API_BASE}/users/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Authorisation failed');
    }

    const data = await response.json();
    const user = data.user ?? null;

    if (user) {
      await AsyncStorage.setItem(STORAGE_USER_KEY, JSON.stringify(user));
      return user;
    }

    return null;
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : 'Unknown error');
  }
};

export const getCurrentUser = async () => {
  try {
    const json = await AsyncStorage.getItem(STORAGE_USER_KEY);
    if (!json) return null;
    return JSON.parse(json);
  } catch (error) {
    console.error('getCurrentUser error', error);
    return null;
  }
};

export const signOut = async () => {
  try {
    await AsyncStorage.removeItem(STORAGE_USER_KEY);
  } catch (err) {
    console.error('signOut error', err);
  }
};

