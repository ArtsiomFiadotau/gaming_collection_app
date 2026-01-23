import React from 'react';
import { Text, View, TouchableOpacity } from 'react-native';

interface CommentComponentProps {
  commentId: number;
  commentText: string;
  userName: string;
  createdAt?: string;
  updatedAt?: string;
}

const CommentComponent = ({ commentText, userName }: CommentComponentProps) => {
  return (
    <View className="bg-dark-100 rounded-lg p-4 mb-3">
      <View className="flex-col">
        {/* Первая строка: Author */}
        <View className="mb-2">
          <Text className="text-light-200 text-sm font-semibold">Author</Text>
          <Text className="text-white text-sm">{userName}</Text>
        </View>

        {/* Текст комментария на всю ширину */}
        <View className="flex-col">
          <Text className="text-light-100 text-sm" style={{ lineHeight: 20 }}>
            {commentText}
          </Text>
        </View>
      </View>
    </View>
  );
};

export default CommentComponent;