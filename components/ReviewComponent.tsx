import { router } from 'expo-router';
import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

interface ReviewComponentProps {
  reviewTitle: string;
  userName: string;
  title: string;
  reviewText: string;
  reviewId: number;
  gameId?: string;
}

const ReviewComponent = ({ reviewTitle, userName, title, reviewText, reviewId, gameId }: ReviewComponentProps) => {
  const handlePress = () => {
    router.push(`/reviews/${reviewId}?gameId=${gameId}`);
  };

  // Shorten review text to 3 lines
  const shortText = reviewText.length > 150 ? reviewText.substring(0, 150) + '...' : reviewText;

  return (
    <TouchableOpacity
      onPress={handlePress}
      className="w-full bg-dark-100 rounded-lg p-4 mb-3"
      style={{ width: '100%' }}
    >
      <View className="flex-col">
        {/* Первый View: Title по центру (жирный, увеличенный), reviewTitle по центру (обычный, меньше) */}
        <View className="items-center mb-3">
          <Text className="text-white font-bold text-lg text-center">Title</Text>
          <Text className="text-light-100 text-base text-center mt-1">{reviewTitle}</Text>
        </View>

        {/* Второй View: Author у левого края, userName у правого края */}
        <View className="flex-row justify-between items-center mb-3">
          <Text className="text-light-200 text-sm">Author</Text>
          <Text className="text-light-100 text-sm">{userName}</Text>
        </View>

        {/* Третий View: reviewText по левому краю (шрифт как у reviewTitle) */}
        <View className="flex-col">
          <Text className="text-light-100 text-base" numberOfLines={3}>
            {shortText}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default ReviewComponent;