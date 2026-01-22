import { icons } from '@/constants/icons';
import { API_BASE } from '@/lib/appwrite';
import { fetchGameDetails } from '@/services/api';
import useFetch from '@/services/useFetch';
import useAuthStore from '@/store/auth.store';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useState } from 'react';
import { Alert, Image, ScrollView, Text, TouchableOpacity, View } from 'react-native';

interface GameInfoProps {
  label: string;
  value?: string | number | null;
}

const GameInfo = ({ label, value}: GameInfoProps) => (
  <View className='flex-col items-start justify-center mt-5'>
    <Text className='text-light-200 font-normal text-sm'>
      {label}
    </Text>
    <Text className='text-light-100 font-bold text-sm mt-2'>
      {value || 'N/A'}
    </Text>
  </View>
)

const GameDetails = () => {
  const setUser = useAuthStore((state) => state.setUser);
  const { id } = useLocalSearchParams();
  const { data: game, loading } = useFetch(() => 
    fetchGameDetails(id as string));
  const [adding, setAdding] = useState(false);

  // TODO: получить реальный userId из контекста/хранилища авторизации
  //const CURRENT_USER_ID = 1;
  const user = useAuthStore(state => state.user);

  const addToCollection = async () => {
    if (!game?.gameId) {
      Alert.alert('Error', 'Game data not loaded');
      return;
    }
    setAdding(true);
    try {
      const payload = {
        userId: Number(user?.userId),
        gameId: Number(game.gameId),
        // значения по умолчанию — можно изменить
        rating: null,
        status: 'Not specified',
        isOwned: false,
        dateStarted: null,
        dateCompleted: null,
      };

      const resp = await fetch(`${API_BASE}/collectionItems`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (resp.ok) {
        const data = await resp.json();
        Alert.alert('Success', 'Game added to collection');
      } else {
        const errText = await resp.text();
        Alert.alert('Error', `Failed to add: ${resp.status} ${errText}`);
      }
    } catch (err) {
      Alert.alert('Error', 'Network error while adding to collection');
      console.warn(err);
    } finally {
      setAdding(false);
    }
  };

  return (
    <View className="bg-primary flex-1">
      <ScrollView contentContainerStyle={{
        paddingBottom: 80}}>
        <View>
            <Image source={{ uri: game?.coverImage ? `https://images.igdb.com/igdb/image/upload/t_1080p/${game?.coverImage.split('/').pop()}` : undefined }} className="w-full h-[550px]" resizeMode="stretch"/>
        </View>

        {/* Buttons below image */}
        <View className="px-5 mt-4 flex-row items-center justify-start gap-x-3">
          <TouchableOpacity
            className={`px-4 py-2 rounded-md bg-accent ${adding ? 'opacity-60' : ''}`}
            onPress={addToCollection}
            disabled={adding}
          >
            <Text className="text-white font-semibold">Add to Collection</Text>
          </TouchableOpacity>

          <TouchableOpacity
            className="px-4 py-2 rounded-md bg-dark-100"
            onPress={() => {
              // Пока без функционала
              Alert.alert('Info', 'Add to List — not implemented yet');
            }}
          >
            <Text className="text-white font-semibold">Add to List</Text>
          </TouchableOpacity>
        </View>

        <View className='flex-col' items-start justify-center mt-5 px-5>
            <Text className="text-white font-bold text-xl">{game?.title}</Text>
            <View className='flex-row items-center gap-x-1 mt-2'>
                <Text className='text-light-200 text-sm'>{game?.releaseDate?.toString()?.split('-')?.[0] ?? game?.releaseDate ?? 'N/A'}</Text>
            </View>
            <View className='flex-row items-center bg-dark-100 px-2 py-1 rounded-md gap-x-1 mt-2'>
                <Image source={icons.star} className="size-6"/>
                <Text className='text-light-200 text-x5'>{Math.round(game?.averageRating ?? 0)}</Text>
            </View>
            <GameInfo label="Summary" value={game?.description} />
            <GameInfo label="Genres" value={game?.genre || 'N/A'} />
            <View className="flex flex-row justify-between w-1/2 py-6">
            <GameInfo label="Developers" value={game?.developer || 'N/A'} />
            </View>
        </View>
      </ScrollView>
      <TouchableOpacity className='absolute bottom-11 left-0 right-0 mx-5 bg-accent rounded-lg py-3.5 flex flex-row items-center justify-center z-50' onPress={router.back}>
          <Image source={icons.arrow} className='size-5 mr-1 mt-0.5 rotate-180' tintColor="#fff"/> 
          <Text className='text-white font-semibold text-base'>Go back</Text>
      </TouchableOpacity>
    </View>
  )
}

export default GameDetails