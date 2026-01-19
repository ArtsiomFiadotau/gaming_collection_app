import { fetchGameDetails } from '@/services/api';
import useFetch from '@/services/useFetch';
import { useLocalSearchParams } from 'expo-router';
import React from 'react';
import { Image, ScrollView, View } from 'react-native';

const GameDetails = () => {
  const { id } = useLocalSearchParams();
  const { data: game, loading } = useFetch(() => 
  fetchGameDetails(id as string));
  return (
    <View className="bg-primary flex-1">
      <ScrollView contentContainerStyle={{
        paddingBottom: 80}}>
        <View>
            <Image source={{ uri: game?.cover_url ? `https:${game?.cover_url}` : undefined }} className="w-full h-[550px]" resizeMode="stretch"/>
        </View>
      </ScrollView>
    </View>
  )
}

export default GameDetails