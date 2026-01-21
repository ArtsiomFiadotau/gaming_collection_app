import { icons } from "@/constants/icons";
import { signOut } from "@/lib/appwrite";
import useAuthStore from '@/store/auth.store'; // путь может быть '@/store/auth.store' или '@/stores/auth.store' в зависимости от структуры проекта
import { router } from "expo-router";
import React, { useState } from 'react';
import { Alert, Image, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const Profile = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const setUser = useAuthStore((state) => state.setUser);
  const setIsAuthenticated = useAuthStore((state) => state.setIsAuthenticated);

  const handleLogout = async () => {
    setIsSubmitting(true);
    try {
      await signOut();                // удаляем из AsyncStorage
      setUser(null);                  // очищаем user в global state
      setIsAuthenticated(false);      // помечаем как неаутентифицированный
      Alert.alert('Success', 'Signout successful!');
      router.replace('/sign-in');     // переходим на страницу входа
    } catch (error: any) {
      Alert.alert('Error', error?.message ?? 'Logout failed');
    } finally {
      setIsSubmitting(false);
    }
  }

  const user = useAuthStore(state => state.user);

  return (
    <SafeAreaView className='bg-primary flex-1 px-10'>
      <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerClassName="pb-32 px-7"
      >
        <View className='flex flex-row items-center justify-between mt-5'>
        <Text className='text-xl text-white font-quicksand-bold'>
        Profile
        </Text>
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
        <View className="flex flex-col mt-5 border-t pt-5 border-primary-200">
        <TouchableOpacity
          disabled={isSubmitting}
          className='absolute top-11 left-0 right-0 mx-5 bg-accent rounded-lg py-3.5 flex flex-row items-center justify-center z-50'
          onPress={handleLogout}
        >
          <Image source={icons.logout} className='size-5 mr-1 mt-0.5 rotate-180' tintColor="#fff"/> 
          <Text className='text-white font-semibold text-base'>Log out</Text>
      </TouchableOpacity>
        </View>
        </ScrollView>
    </SafeAreaView>
  )
}

export default Profile