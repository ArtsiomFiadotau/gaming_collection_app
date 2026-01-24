import GameList from '@/components/GameList';
import { fetchGamelists } from '@/services/api';
import useFetch from '@/services/useFetch';
import useAuthStore from '@/store/auth.store';
import { useFocusEffect } from 'expo-router';
import React from 'react';
import { ActivityIndicator, Image, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const Lists = () => {
  const user = useAuthStore(state => state.user);
  
  const { data: gamelistsData, loading: gamelistsLoading, refetch: refetchGamelists } = useFetch(
    () => fetchGamelists({ query: '', userId: user?.userId?.toString() || '' }),
    !!user?.userId
  );

  
// Обновляем данные при первом фокусе на экране
useFocusEffect(
    React.useCallback(() => {
      if (user?.userId) {
        refetchGamelists();
      }
    }, [user?.userId])
  );
  
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
      >
        <View className="px-5 pt-8">
          {/* Заголовок "Lists" крупным шрифтом */}
          <Text className="text-white font-bold text-3xl text-center mb-8">
            Lists
          </Text>

          {/* Прокручивающийся список компонентов GameList */}
          {gamelistsLoading ? (
            <View className="flex-1 justify-center items-center mt-20">
              <ActivityIndicator size="large" color="#fff" />
              <Text className="text-white mt-4">Loading lists...</Text>
            </View>
          ) : gamelistsData && gamelistsData.length > 0 ? (
            <ScrollView
              showsVerticalScrollIndicator={false}
              nestedScrollEnabled={true}
              style={{ width: '100%' }}
            >
              {gamelistsData.map((list: any, index: number) => (
                <GameList
                  key={list.listId || index}
                  listId={list.listId}
                  listTitle={list.listTitle}
                  userName={list.userName}
                  createdAt={list.createdAt}
                  updatedAt={list.updatedAt}
                  games={list.games}
                />
              ))}
            </ScrollView>
          ) : (
            <View className="flex-1 justify-center items-center mt-20">
              <Text className="text-white text-center">No lists found</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Lists;