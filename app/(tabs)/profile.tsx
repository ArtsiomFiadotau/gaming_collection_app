import GameList from '@/components/GameList';
import ReviewComponent from '@/components/ReviewComponent';
import { icons } from "@/constants/icons";
import { images } from "@/constants/images";
import { API_BASE, signOut } from "@/lib/appwrite";
import { fetchListsByUser, fetchReviewsByUser } from '@/services/api';
import useAuthStore from '@/store/auth.store';
import useFetch from '@/services/useFetch';
import { router } from "expo-router";
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, Image, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const Profile = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState<'info' | 'reviews' | 'lists'>('info');
  const setUser = useAuthStore((state) => state.setUser);
  const setIsAuthenticated = useAuthStore((state) => state.setIsAuthenticated);

  // Editable form for user fields
  const [form, setForm] = useState({ userName: '', email: '', avatarUrl: '', gamesNumber: '' });

  // Local copy of user for display
  const user = useAuthStore(state => state.user);

  // Get user's reviews
  const { data: reviewsData, loading: reviewsLoading, refetch: refetchReviews } = useFetch(
    () => fetchReviewsByUser({ userId: user?.userId?.toString() || '', query: '' }),
    !!user?.userId
  );

  // Get user's lists
  const { data: listsData, loading: listsLoading } = useFetch(
    () => fetchListsByUser({ userId: user?.userId?.toString() || '', query: '' }),
    !!user?.userId
  );

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
        method: 'PATCH',
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

      <ScrollView showsVerticalScrollIndicator={true} contentContainerStyle={{ paddingBottom: 140 }}>
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
          <View className='flex-row justify-center flex mt-5'>
            <View className='flex flex-col items-center relative mt-5'>
              <Image source={{ uri: user?.avatarUrl}} className='size-60 relative rounded-full'/>
             
              <Text className="text-white text-2xl font-quicksand-bold mt-2">{user?.userName}</Text>
            </View>
          </View>

          {/* Tabs */}
          <View style={{ flexDirection: 'row', marginTop: 20 }}>
            {['info', 'reviews', 'lists'].map((tab) => (
              <TouchableOpacity
                key={tab}
                style={{
                  flex: 1,
                  paddingVertical: 12,
                  borderBottomWidth: activeTab === tab ? 2 : 0,
                  borderBottomColor: '#3b82f6',
                  alignItems: 'center'
                }}
                onPress={() => setActiveTab(tab as 'info' | 'reviews' | 'lists')}
              >
                <Text style={{ 
                  color: activeTab === tab ? '#fff' : '#9ca3af',
                  fontWeight: activeTab === tab ? '600' : '400'
                }}>
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Tab Content */}
          <View style={{ paddingHorizontal: 20, paddingTop: 20 }}>
            {activeTab === 'info' && (
              <View style={{ width: '100%' }}>
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
            )}

            {activeTab === 'reviews' && (
              <View style={{ width: '100%' }}>
                {reviewsLoading ? (
                  <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: 40 }}>
                    <ActivityIndicator size="large" color="#fff" />
                    <Text style={{ color: '#fff', marginTop: 10 }}>Loading reviews...</Text>
                  </View>
                ) : reviewsData && reviewsData.length > 0 ? (
                  <View style={{ maxHeight: 650, paddingBottom: 40 }}>
                    {reviewsData.map((review: any, index: number) => (
                      <ReviewComponent
                        key={review.reviewId || index}
                        reviewTitle={review.reviewTitle || 'Review'}
                        userName={review.userName}
                        title={review.gameTitle || 'Game'}
                        reviewText={review.reviewText}
                        reviewId={review.reviewId}
                        gameId={review.gameId}
                        userId={review.userId}
                        onUpdateSuccess={refetchReviews}
                      />
                    ))}
                  </View>
                ) : (
                  <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: 40 }}>
                    <Text style={{ color: '#9ca3af', textAlign: 'center' }}>No reviews yet</Text>
                  </View>
                )}
              </View>
            )}

            {activeTab === 'lists' && (
              <View style={{ width: '100%' }}>
                {listsLoading ? (
                  <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: 40 }}>
                    <ActivityIndicator size="large" color="#fff" />
                    <Text style={{ color: '#fff', marginTop: 10 }}>Loading lists...</Text>
                  </View>
                ) : listsData && listsData.length > 0 ? (
                  <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: 400 }}>
                    {listsData.map((list: any, index: number) => {
                      console.log('Profile lists data for list:', list.listTitle, list.games);
                      return (
                        <GameList
                          key={list.listId || index}
                          listId={list.listId}
                          listTitle={list.listTitle}
                          userName={list.userName}
                          createdAt={list.createdAt}
                          updatedAt={list.updatedAt}
                          games={list.games}
                        />
                      );
                    })}
                  </ScrollView>
                ) : (
                  <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: 40 }}>
                    <Text style={{ color: '#9ca3af', textAlign: 'center' }}>No lists yet</Text>
                  </View>
                )}
              </View>
            )}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

export default Profile