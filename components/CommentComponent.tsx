import React from 'react';
import { Text, View, TouchableOpacity } from 'react-native';
import useAuthStore from '@/store/auth.store';

interface CommentComponentProps {
  commentId: number;
  commentText: string;
  userName: string;
  userId: number;
  createdAt?: string;
  updatedAt?: string;
}

const CommentComponent = ({ commentText, userName, userId }: CommentComponentProps) => {
  const user = useAuthStore(state => state.user);
  
  const canEdit = user?.userId === userId || user?.isModerator === true;
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

        {/* Кнопки Edit и Delete для авторизованных пользователей */}
        {canEdit && (
          <View className="flex-row justify-end mt-3 gap-2">
            <TouchableOpacity 
              className="bg-blue-600 px-3 py-1 rounded"
              onPress={() => {}}
            >
              <Text className="text-white text-xs font-semibold">Edit</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              className="bg-red-600 px-3 py-1 rounded"
              onPress={() => {}}
            >
              <Text className="text-white text-xs font-semibold">Delete</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );
};

export default CommentComponent;