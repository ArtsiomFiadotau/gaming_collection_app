import { API_BASE } from "@/lib/appwrite";
import { fetchListsByUser, fetchGameDetails } from '@/services/api';
import useFetch from '@/services/useFetch';
import useAuthStore from '@/store/auth.store';
import React from 'react';
import { ActivityIndicator, Alert, Image, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams } from 'expo-router';

const ListCreation = () => {
  const { gameId } = useLocalSearchParams();
  const user = useAuthStore(state => state.user);
  const [gameDescription, setGameDescription] = React.useState('');
  const [descriptionError, setDescriptionError] = React.useState('');
  
  const { data: userLists, loading: listsLoading, refetch: refetchLists } = useFetch(
    () => fetchListsByUser({ query: '', userId: user?.userId?.toString() || '' }),
    !!user?.userId
  );

  const { data: gameData } = useFetch(
    () => fetchGameDetails(gameId as string),
    !!gameId
  );

  const handleDescriptionChange = (text: string) => {
    setGameDescription(text);
    if (text.length > 200) {
      setDescriptionError('Description must be 200 characters or less');
    } else {
      setDescriptionError('');
}
  };

  const handleAddToList = (listId: number) => {
    if (!gameData?.title) {
      Alert.alert('Error', 'Game data not loaded');
      return;
    }

    Alert.alert(
      'Add to List',
      `Add ${gameData.title} to this list?`,
      [
        {
          text: 'No',
          style: 'cancel'
        },
        {
          text: 'Yes',
          onPress: async () => {
            try {
              const response = await fetch(`${API_BASE}/listitems/`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  gameId: Number(gameId),
                  listId: listId
                })
              });

              if (response.ok) {
                Alert.alert('Success', 'Game added to list successfully');
              } else {
                throw new Error('Failed to add game to list');
              }
            } catch (error) {
              Alert.alert('Error', 'Failed to add game to list');
            }
          }
        }
      ]
    );
  };

  const handleCreateNewList = () => {
    if (gameDescription.trim().length === 0) {
      Alert.alert('Error', 'Please enter a list title');
      return;
    }

    Alert.alert(
      'Create List',
      `Create a list ${gameDescription} ?`,
      [
        {
          text: 'No',
          style: 'cancel'
        },
        {
          text: 'Yes',
          onPress: async () => {
            try {
              const response = await fetch(`${API_BASE}/gamelists/`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  listTitle: gameDescription.trim(),
                  userId: user?.userId
                })
              });

              if (response.ok) {
                Alert.alert('Success', 'List created successfully');
                setGameDescription('');
                setDescriptionError('');
                refetchLists();
              } else {
                throw new Error('Failed to create list');
              }
            } catch (error) {
              Alert.alert('Error', 'Failed to create list');
            }
          }
        }
      ]
    );
  };

  return (
    <SafeAreaView className='bg-primary flex-1'>
      <Image 
        source={require('@/assets/images/bg.png')} 
        className="flex-1 absolute w-full z-0" 
        resizeMode="cover" 
      />

      <ScrollView 
        showsVerticalScrollIndicator={false} 
        contentContainerStyle={{ paddingBottom: 100 }}
        className="flex-1"
      >
        <View className="px-5 pt-8">
          {/* Заголовок "Adding a game" */}
          <Text className="text-white font-bold text-3xl text-center mb-8">
            Adding a game
          </Text>

          {/* Поле для текстового ввода */}
          <View className="mb-6">
            <TextInput
              className="bg-dark-100 text-white rounded-lg p-4 min-h-[100px] text-base"
              placeholder="Enter game description..."
              placeholderTextColor="#9ca3af"
              multiline
              maxLength={250}
              value={gameDescription}
              onChangeText={handleDescriptionChange}
            />
            <View className="flex-row justify-between mt-2">
              <Text className="text-xs text-gray-400">
                {gameDescription.length}/200 characters
              </Text>
              {descriptionError ? (
                <Text className="text-xs text-red-500">{descriptionError}</Text>
              ) : null}
            </View>
          </View>

          {/* Кнопка "Create New List" */}
          <TouchableOpacity 
            className="bg-accent rounded-lg py-3 px-6 mb-6"
            style={{ alignSelf: 'flex-start' }}
            onPress={handleCreateNewList}
          >
            <Text className="text-white font-semibold text-base">Create New List</Text>
          </TouchableOpacity>

          {/* Список списков пользователя */}
          <View className="mb-6">
            <Text className="text-white font-semibold text-lg mb-4">Your Lists</Text>
            
            {listsLoading ? (
              <View className="flex-1 justify-center items-center py-8">
                <ActivityIndicator size="small" color="#fff" />
                <Text className="text-white mt-2">Loading lists...</Text>
              </View>
            ) : userLists && userLists.length > 0 ? (
              <ScrollView 
                showsVerticalScrollIndicator={false}
                nestedScrollEnabled={true}
                style={{ maxHeight: 300 }}
              >
                {userLists.map((list: any, index: number) => (
                  <TouchableOpacity 
                    key={list.listId || index} 
                    className="bg-dark-100 rounded-lg p-4 mb-3"
                    onPress={() => handleAddToList(list.listId)}
                  >
                    <Text className="text-white font-semibold text-base">{list.listTitle}</Text>
                    <Text className="text-gray-400 text-sm mt-1">by {list.userName}</Text>
                    {list.games && list.games.length > 0 && (
                      <Text className="text-gray-400 text-xs mt-2">
                        {list.games.length} games
                      </Text>
                    )}
                  </TouchableOpacity>
                ))}
              </ScrollView>
            ) : (
              <View className="flex-1 justify-center items-center py-8">
                <Text className="text-gray-400 text-center">No lists found</Text>
              </View>
            )}
          </View>

          {/* Кнопка "Go back" */}
          <TouchableOpacity 
            className="bg-gray-700 rounded-lg py-3 px-6"
            style={{ alignSelf: 'flex-start' }}
          >
            <Text className="text-white font-semibold text-base">Go back</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default ListCreation;