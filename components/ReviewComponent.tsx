import { patchReview } from '@/services/api';
import useAuthStore from '@/store/auth.store';
import { router } from 'expo-router';
import React from 'react';
import { Alert, Text, TextInput, TouchableOpacity, View } from 'react-native';

interface ReviewComponentProps {
  reviewTitle: string;
  userName: string;
  title: string;
  reviewText: string;
  reviewId: number;
  gameId?: string;
  userId: number;
  onUpdateSuccess?: () => void;
}

const ReviewComponent = ({ reviewTitle, userName, title, reviewText, reviewId, gameId, userId, onUpdateSuccess }: ReviewComponentProps) => {
  const user = useAuthStore(state => state.user);
  const [isEditing, setIsEditing] = React.useState(false);
  const [editedTitle, setEditedTitle] = React.useState(reviewTitle);
  const [editedText, setEditedText] = React.useState(reviewText);
  
  const canEdit = user?.userId === userId || user?.isModerator === true;

  const handlePress = () => {
    if (!isEditing) {
      router.push(`/reviews/${reviewId}`);
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSave = () => {
    // Валидация на стороне клиента
    if (editedTitle.trim().length === 0) {
      Alert.alert('Error', 'Review title cannot be empty');
      return;
    }
    
    if (editedTitle.length > 50) {
      Alert.alert('Error', 'Review title must be 50 characters or less');
      return;
    }
    
    if (editedText.trim().length === 0) {
      Alert.alert('Error', 'Review text cannot be empty');
      return;
    }
    
    if (editedText.length > 2000) {
      Alert.alert('Error', 'Review text must be 2000 characters or less');
      return;
    }

    Alert.alert(
      'Save changes?',
      'Are you sure you want to save these changes?',
      [
        {
          text: 'No',
          style: 'cancel'
        },
        {
          text: 'Yes',
          onPress: async () => {
            try {
              await patchReview({
                reviewId: reviewId,
                reviewTitle: editedTitle.trim(),
                reviewText: editedText.trim()
              });
              Alert.alert('Success', 'Review updated successfully');
              setIsEditing(false);
              // Вызываем callback для обновления родительского компонента
              if (onUpdateSuccess) {
                onUpdateSuccess();
              }
            } catch (error) {
              console.error('Review update error:', error);
              Alert.alert('Error', 'Failed to update review');
            }
          }
        }
      ]
    );
  };

  // Shorten review text to 3 lines
  const shortText = reviewText.length > 150 ? reviewText.substring(0, 150) + '...' : reviewText;

  const handleTitlePress = () => {
    if (gameId) {
      router.push(`/reviews/${reviewId}?gameId=${gameId}`);
    } else {
      router.push(`/reviews/${reviewId}`);
    }
  };

  return (
    <View className="w-full bg-dark-100 rounded-lg p-4 mb-4">
      <View className="flex-col">
        {/* Первый View: Title по центру (жирный, увеличенный), reviewTitle по центру (обычный, меньше) */}
        <View className="items-center mb-3">
          <Text className="text-white font-bold text-lg text-center">Title</Text>
          {isEditing ? (
            <TextInput
              value={editedTitle}
              onChangeText={setEditedTitle}
              style={{
                backgroundColor: '#1f2937',
                color: '#fff',
                padding: 8,
                borderRadius: 6,
                marginTop: 4,
                width: '100%',
                textAlign: 'center'
              }}
              multiline
            />
          ) : (
            <TouchableOpacity onPress={handleTitlePress} disabled={isEditing}>
              <Text className="text-blue-400 text-base text-center mt-1 underline">{reviewTitle}</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Второй View: Author у левого края, userName у правого края */}
        <View className="flex-row justify-between items-center mb-3">
          <Text className="text-light-200 text-sm">Author</Text>
          <Text className="text-light-100 text-sm">{userName}</Text>
        </View>

        {/* Третий View: reviewText по левому краю (шрифт как у reviewTitle) */}
        <View className="flex-col">
          {isEditing ? (
            <TextInput
              value={editedText}
              onChangeText={setEditedText}
              style={{
                backgroundColor: '#1f2937',
                color: '#fff',
                padding: 8,
                borderRadius: 6,
                minHeight: 80,
                textAlignVertical: 'top'
              }}
              multiline
            />
          ) : (
            <Text className="text-light-100 text-base" numberOfLines={3}>
              {shortText}
            </Text>
          )}
        </View>

        {/* Кнопки редактирования */}
        {canEdit && (
          <View className="flex-row justify-end mt-3 gap-2">
            {isEditing ? (
              <>
                <TouchableOpacity 
                  className="bg-gray-600 px-3 py-1 rounded"
                  onPress={() => {
                    setIsEditing(false);
                    setEditedTitle(reviewTitle);
                    setEditedText(reviewText);
                  }}
                >
                  <Text className="text-white text-xs font-semibold">Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  className="bg-blue-600 px-3 py-1 rounded"
                  onPress={handleSave}
                >
                  <Text className="text-white text-xs font-semibold">Save changes</Text>
                </TouchableOpacity>
              </>
            ) : (
              <TouchableOpacity 
                className="bg-blue-600 px-3 py-1 rounded"
                onPress={handleEdit}
              >
                <Text className="text-white text-xs font-semibold">Edit</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>
    </View>
  );
};

export default ReviewComponent;