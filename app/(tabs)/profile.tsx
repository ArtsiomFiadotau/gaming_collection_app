import { icons } from "@/constants/icons";
import { images } from "@/constants/images";
import { API_BASE, signOut } from "@/lib/appwrite";
import useAuthStore from '@/store/auth.store';
import { router } from "expo-router";
import React, { useEffect, useState } from 'react';
import { Alert, Image, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const Profile = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const setUser = useAuthStore((state) => state.setUser);
  const setIsAuthenticated = useAuthStore((state) => state.setIsAuthenticated);

  // Editable form for user fields
  const [form, setForm] = useState({ userName: '', email: '', avatarUrl: '', gamesNumber: '' });

  // Local copy of user for display
  const user = useAuthStore(state => state.user);

  // Load initial user data into form
  useEffect(() => {
    if (user) {
      setForm({
        userName: user.userName ?? '',
        email: user.email ?? '',
        avatarUrl: user.avatarUrl ?? '',
        gamesNumber: String(user.gamesNumber ?? ''), // не редактируемое поле
      });
    }
  }, [user?.userName, user?.email, user?.avatarUrl, user?.gamesNumber]);

  const handleLogout = async () => {
    setIsSubmitting(true);
    try {
      await signOut();
      setUser(null);
      setIsAuthenticated(false);
      Alert.alert('Success', 'Signout successful!');
      router.replace('/sign-in');
    } catch (error: any) {
      Alert.alert('Error', error?.message ?? 'Logout failed');
    } finally {
      setIsSubmitting(false);
    }
  }

  // Save changes to backend
  const saveChanges = async () => {
    if (!user?.userId) {
      Alert.alert('Error', 'User not found');
      return;
    }
    setIsSubmitting(true);
    try {
      const payload: any = {
        userName: form.userName,
        email: form.email,
        avatarUrl: form.avatarUrl,
      };
      // gamesNumber не редактируемое
      // Можно добавить проверку на пустые значения, если нужно

      const resp = await fetch(`${API_BASE}/users/${user.userId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (resp.ok) {
        const updated = await resp.json();
        // обновляем локальный профиль в сторе
        setUser({ ...user, ...payload } as any);
        Alert.alert('Success', 'Profile updated');
      } else {
        const errText = await resp.text();
        Alert.alert('Error', `Failed to save: ${resp.status} ${errText}`);
      }
    } catch (err: any) {
      Alert.alert('Error', err?.message ?? 'Failed to save changes');
      console.warn(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView className='bg-primary flex-1 px-15'>
      <Image source={images.bg} className="flex-1 absolute w-full z-0" resizeMode="cover" />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 80 }}>
        <View className="flex flex-col mt-5 border-t pt-3 border-primary-200">
          <TouchableOpacity
            disabled={isSubmitting}
            className="bg-accent rounded-lg flex flex-row items-center justify-center"
            style={{ alignSelf: 'flex-end', paddingVertical: 12, paddingHorizontal: 20 }}
            onPress={handleLogout}
          >
            <Image source={icons.logout} className="size-5 mr-1 mt-0.5 rotate-180" tintColor="#fff"/>
            <Text className="text-white font-semibold text-base">Log out</Text>
          </TouchableOpacity>

          {/* Editable user fields laid out as label on left, value/input on right */}
          <View style={{ width: '100%', paddingHorizontal: 20, paddingTop: 20 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginVertical: 6 }}>
              <Text style={{ width: 140, color: '#e5e7eb' }}>Username</Text>
              <TextInput
                value={form.userName}
                onChangeText={(t) => setForm({ ...form, userName: t })}
                style={{
                  flex: 1,
                  backgroundColor: '#1f2937',
                  color: '#fff',
                  paddingVertical: 8,
                  paddingHorizontal: 10,
                  borderRadius: 6
                }}
              />
            </View>

            <View style={{ flexDirection: 'row', alignItems: 'center', marginVertical: 6 }}>
              <Text style={{ width: 140, color: '#e5e7eb' }}>Email</Text>
              <TextInput
                value={form.email}
                onChangeText={(t) => setForm({ ...form, email: t })}
                keyboardType="email-address"
                style={{
                  flex: 1,
                  backgroundColor: '#1f2937',
                  color: '#fff',
                  paddingVertical: 8,
                  paddingHorizontal: 10,
                  borderRadius: 6
                }}
              />
            </View>

            <View style={{ flexDirection: 'row', alignItems: 'center', marginVertical: 6 }}>
              <Text style={{ width: 140, color: '#e5e7eb' }}>Avatar URL</Text>
              <TextInput
                value={form.avatarUrl}
                onChangeText={(t) => setForm({ ...form, avatarUrl: t })}
                style={{
                  flex: 1,
                  backgroundColor: '#1f2937',
                  color: '#fff',
                  paddingVertical: 8,
                  paddingHorizontal: 10,
                  borderRadius: 6
                }}
              />
            </View>

            <View style={{ flexDirection: 'row', alignItems: 'center', marginVertical: 6 }}>
              <Text style={{ width: 140, color: '#e5e7eb' }}>Games</Text>
              <Text style={{ color: '#fff' }}>{form.gamesNumber ?? ''}</Text>
            </View>

            <TouchableOpacity
              onPress={saveChanges}
              className="bg-accent rounded-md mt-4"
              style={{ alignSelf: 'flex-end', paddingVertical: 12, paddingHorizontal: 20 }}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <Text className="text-white font-semibold">Saving...</Text>
              ) : (
                <Text className="text-white font-semibold">Save changes</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>

        <View className='flex-row justify-center flex mt-5'>
            <View className='flex flex-col items-center relative mt-5'>
              <Image source={{ uri: user?.avatarUrl}} className='size-60 relative rounded-full'/>
            <TouchableOpacity className="absolute bottom-11 right-6">
              <Image source={icons.edit} className="size-9" />
            </TouchableOpacity>
            <Text className="text-white text-2xl font-quicksand-bold mt-2">{user?.userName}</Text>
            </View>
        </View>

    </ScrollView>
    </SafeAreaView>
  )
}

export default Profile