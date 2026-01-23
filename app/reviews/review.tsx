import { images } from "@/constants/images";
import { API_BASE } from "@/lib/appwrite";
import useAuthStore from '@/store/auth.store';
import { router, useLocalSearchParams } from "expo-router";
import React, { useState } from 'react';
import { Alert, Image, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const NewReviewPage = () => {
  const user = useAuthStore(state => state.user);
  const { gameId } = useLocalSearchParams();
  
  const [reviewTitle, setReviewTitle] = useState('');
  const [reviewText, setReviewText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Получаем gameId для возврата на страницу игры
  const gameIdStr = Array.isArray(gameId) ? gameId[0] : (gameId?.toString() || '');

  const handleSendReview = async () => {
    // Проверка длины заголовка
    if (reviewTitle.length > 100) {
      Alert.alert('Warning', 'Title must be 100 characters or less');
      return;
    }

    // Проверка длины текста
    if (reviewText.length > 2000) {
      Alert.alert('Warning', 'Review text must be 2000 characters or less');
      return;
    }

    if (!user?.userId) {
      Alert.alert('Error', 'User not found');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        reviewTitle,
        reviewText,
        userId: Number(user.userId),
        gameId: Number(gameIdStr),
      };

      const resp = await fetch(`${API_BASE}/reviews/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (resp.ok) {
        Alert.alert('Success', 'Review sent successfully', [
          {
            text: 'OK',
            onPress: () => router.back()
          }
        ]);
      } else {
        const errText = await resp.text();
        Alert.alert('Error', `Failed to send review: ${resp.status} ${errText}`);
      }
    } catch (err) {
      Alert.alert('Error', 'Network error while sending review');
      console.warn(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    Alert.alert(
      'Are you sure?',
      'Review is not sent',
      [
        {
          text: 'No',
          style: 'cancel',
        },
        {
          text: 'Yes',
          onPress: () => {
            // Очистка полей и возврат на страницу игры
            setReviewTitle('');
            setReviewText('');
            router.back();
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView className='bg-primary flex-1'>
      <Image source={images.bg} className="flex-1 absolute w-full z-0" resizeMode="cover" />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
        <View className="px-5 pt-8">
          {/* Поле Author (автозаполнение) */}
          <View className="mb-6">
            <Text className="text-light-200 text-sm font-semibold mb-2">Author</Text>
            <Text className="text-white text-base bg-dark-100 px-4 py-3 rounded-lg">
              {user?.userName || 'Unknown'}
            </Text>
          </View>

          {/* Поле Title */}
          <View className="mb-6">
            <Text className="text-light-200 text-sm font-semibold mb-2">Title</Text>
            <TextInput
              value={reviewTitle}
              onChangeText={setReviewTitle}
              placeholder="Enter review title"
              placeholderTextColor="#6b7280"
              className="bg-dark-100 text-white px-4 py-3 rounded-lg text-base"
              maxLength={100}
              multiline={false}
            />
          </View>

          {/* Поле Review Text */}
          <View className="mb-8">
            <Text className="text-light-200 text-sm font-semibold mb-2">Review Text</Text>
            <TextInput
              value={reviewText}
              onChangeText={setReviewText}
              placeholder="Write your review..."
              placeholderTextColor="#6b7280"
              className="bg-dark-100 text-white px-4 py-3 rounded-lg text-base"
              maxLength={2000}
              multiline={true}
              numberOfLines={6}
              textAlignVertical="top"
              style={{ minHeight: 120 }}
            />
          </View>
        </View>
      </ScrollView>

      {/* Кнопки внизу экрана */}
      <View className="absolute bottom-8 left-5 right-5 flex-row gap-3">
        {/* Кнопка Send Review слева */}
        <TouchableOpacity
          onPress={handleSendReview}
          disabled={isSubmitting}
          className="flex-1 bg-accent rounded-lg py-3.5 flex-row items-center justify-center"
        >
          {isSubmitting ? (
            <Text className="text-white font-semibold text-base">Sending...</Text>
          ) : (
            <Text className="text-white font-semibold text-base">Send Review</Text>
          )}
        </TouchableOpacity>

        {/* Кнопка Cancel справа */}
        <TouchableOpacity
          onPress={handleCancel}
          className="flex-1 bg-dark-100 rounded-lg py-3.5 flex-row items-center justify-center"
        >
          <Text className="text-white font-semibold text-base">Cancel</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default NewReviewPage;