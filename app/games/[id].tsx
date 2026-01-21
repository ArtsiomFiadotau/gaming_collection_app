import { icons } from '@/constants/icons';
import { fetchGameDetails } from '@/services/api';
import useFetch from '@/services/useFetch';
import { router, useLocalSearchParams } from 'expo-router';
import React from 'react';
import { Image, ScrollView, Text, TouchableOpacity, View } from 'react-native';

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
  const { id } = useLocalSearchParams();
  const { data: game, loading } = useFetch(() => 
  fetchGameDetails(id as string));
  return (
    <View className="bg-primary flex-1">
      <ScrollView contentContainerStyle={{
        paddingBottom: 80}}>
        <View>
            <Image source={{ uri: game?.coverImage ? `https://images.igdb.com/igdb/image/upload/t_1080p/${game?.coverImage.split('/').pop()}` : undefined }} className="w-full h-[550px]" resizeMode="stretch"/>
        </View>
        <View className='flex-col' items-start justify-center mt-5 px-5>
            <Text className="text-white font-bold text-xl">{game?.title}</Text>
            <View className='flex-row items-center gap-x-1 mt-2'>
                <Text className='text-light-200 text-sm'>{game?.releaseDate.split('-')[0]}</Text>
            </View>
            <View className='flex-row items-center bg-dark-100 px-2 py-1 rounded-md gap-x-1 mt-2'>
                <Image source={icons.star} className="size-6"/>
                <Text className='text-light-200 text-x5'>{Math.round(game?.averageRating ?? 0/10)}</Text>
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