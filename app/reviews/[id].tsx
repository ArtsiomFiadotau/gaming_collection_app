import { icons } from "@/constants/icons";
import { images } from "@/constants/images";
import { API_BASE } from "@/lib/appwrite";
import useFetch from '@/services/useFetch';
import useAuthStore from '@/store/auth.store';
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from 'react';
import { Alert, Image, ScrollView, Text, TextInput, TouchableOpacity, View, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface ReviewData {
  reviewId: number;
  reviewTitle: string;
  reviewText: string;
  userName: string;
  title: string;
  gameId: number;
  userId: number;
}

const ReviewDetailPage = () => {
  const user = useAuthStore(state => state.user);
  const { id: reviewId, gameId } = useLocalSearchParams();
  
  const [commentText, setCommentText] = useState('');
  const [showCommentField, setShowCommentField] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Получаем данные отзыва
  const { data: reviewData, loading: reviewLoading } = useFetch(
    () => {
      const reviewIdNum = Number(reviewId);
      console.log('Fetching review with ID:', reviewId, 'as number:', reviewIdNum);
return fetch(`${API_BASE}/reviews/${reviewIdNum}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    }).then(res => {
      console.log('Review fetch response status:', res.status);
      if (!res.ok) {
        console.log('Response text:', res.statusText);
        throw new Error(`Failed to fetch review: ${res.status}`);
      }
      return res.json();
    }).then(data => {
      console.log('Review fetch data:', data);
      console.log('Data type:', typeof data);
      console.log('Data keys:', data ? Object.keys(data) : 'null/undefined');
      return data;
    });
    },
    !!reviewId
  );

  const handleSendComment = async () => {
    // Проверка длины комментария
    if (commentText.length > 1000) {
      Alert.alert('Warning', 'Comment must be 1000 characters or less');
      return;
    }

    if (!user?.userId || !reviewId) {
      Alert.alert('Error', 'Missing required information');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        commentText,
        userId: Number(user.userId),
        reviewId: Number(reviewId),
      };

      const resp = await fetch(`${API_BASE}/comments/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (resp.ok) {
        Alert.alert('Success', 'Comment sent successfully');
        setCommentText('');
        setShowCommentField(false);
      } else {
        const errText = await resp.text();
        Alert.alert('Error', `Failed to send comment: ${resp.status} ${errText}`);
      }
    } catch (err) {
      Alert.alert('Error', 'Network error while sending comment');
      console.warn(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    setCommentText('');
    setShowCommentField(false);
  };

  const handleGoBack = () => {
    router.push(`/games/${gameId}`);
  };

  if (reviewLoading) {
    return (
      <SafeAreaView className='bg-primary flex-1 justify-center items-center'>
        <ActivityIndicator size="large" color="#fff" />
        <Text className="text-white mt-4">Loading review...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className='bg-primary flex-1'>
      <Image source={images.bg} className="flex-1 absolute w-full z-0" resizeMode="cover" />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
        <View className="px-5 pt-8">
          {reviewData ? (
            <>
              <Text className="text-white mb-4">Debug: reviewData loaded</Text>
              {/* Поле Author */}
              <View className="mb-6">
                <Text className="text-light-200 text-sm font-semibold mb-2">Author</Text>
                <Text className="text-white text-base bg-dark-100 px-4 py-3 rounded-lg">
                  {reviewData.userName || 'Unknown'}
                </Text>
              </View>

              {/* Поле Title */}
              <View className="mb-6">
                <Text className="text-light-200 text-sm font-semibold mb-2">Title</Text>
                <Text className="text-white text-base bg-dark-100 px-4 py-3 rounded-lg">
                  {reviewData.reviewTitle || 'No title'}
                </Text>
              </View>

              {/* Поле Review Text */}
              <View className="mb-6">
                <Text className="text-light-200 text-sm font-semibold mb-2">Review Text</Text>
                <Text className="text-white text-base bg-dark-100 px-4 py-3 rounded-lg">
                  {reviewData.reviewText || 'No text'}
                </Text>
              </View>
            </>
          ) : (
            <Text className="text-white text-center mt-10">Review not found</Text>
          )}

          {/* Кнопка Comment */}
          <TouchableOpacity
            onPress={() => setShowCommentField(true)}
            className="bg-accent rounded-lg py-3 flex-row items-center justify-center mb-4"
          >
            <Text className="text-white font-semibold">Comment</Text>
          </TouchableOpacity>

          {/* Поле для ввода комментария */}
          {showCommentField && (
            <View className="mb-6">
              <Text className="text-light-200 text-sm font-semibold mb-2">Your Comment</Text>
              <TextInput
                value={commentText}
                onChangeText={setCommentText}
                placeholder="Write your comment..."
                placeholderTextColor="#6b7280"
                className="bg-dark-100 text-white px-4 py-3 rounded-lg text-base"
                maxLength={1000}
                multiline={true}
                numberOfLines={4}
                textAlignVertical="top"
                style={{ minHeight: 100 }}
              />
              
              {/* Кнопки Send и Cancel */}
              <View className="flex-row gap-3 mt-3">
                <TouchableOpacity
                  onPress={handleSendComment}
                  disabled={isSubmitting}
                  className="flex-1 bg-accent rounded-lg py-3 flex-row items-center justify-center"
                >
                  {isSubmitting ? (
                    <Text className="text-white font-semibold">Sending...</Text>
                  ) : (
                    <Text className="text-white font-semibold">Send</Text>
                  )}
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={handleCancel}
                  className="flex-1 bg-dark-100 rounded-lg py-3 flex-row items-center justify-center"
                >
                  <Text className="text-white font-semibold">Cancel</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Кнопка Go back внизу экрана */}
      <View className="absolute bottom-8 left-5 right-5">
        <TouchableOpacity
          onPress={handleGoBack}
          className="bg-dark-100 rounded-lg py-3.5 flex-row items-center justify-center"
        >
          <Image source={icons.arrow} className="size-5 mr-2 rotate-180" tintColor="#fff" />
          <Text className="text-white font-semibold text-base">Go back</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default ReviewDetailPage;