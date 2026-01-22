import CollectionItem from '@/components/CollectionItem';
import { fetchCollectionItems } from '@/services/api';
import useFetch from "@/services/useFetch";
import useAuthStore from '@/store/auth.store';
import React, { useEffect } from 'react';
import { ActivityIndicator, FlatList, Text, View } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function Collection() {
  
  const user = useAuthStore(state => state.user);
  const { 
    data: collectionitems, 
    loading: gamesLoading, 
    error: gamesError,
    refetch
  } = useFetch (() => fetchCollectionItems({
    query: '',
    userId: user?.userId?.toString() || ''
  }), !!user?.userId);

  // Обновляем данные при первом фокусе на экране
  useFocusEffect(
    React.useCallback(() => {
      if (user?.userId) {
        refetch();
      }
    }, [user?.userId])
  );

return (
<SafeAreaView className='bg-primary flex-1'>
      <View className="flex-1 px-4 pt-4">
            {gamesLoading ? (
              <ActivityIndicator
                size="large"
                color="#3b82f6"
                className="mt-10 self-center"
                />
            ) : gamesError ? (
              <Text className="text-white text-center mt-10">Error: {gamesError?.message}</Text>
            ) : !collectionitems || collectionitems.length === 0 ? (
              <Text className="text-gray-400 text-center mt-10">No items in collection</Text>
            ) : (           
              <FlatList 
                data={collectionitems}
                renderItem={({ item }) => (
                  <CollectionItem
                    userId={item.userId}
                    gameId={item.gameId}
                    title={item.title}
                    coverImage={item.coverImage}
                  />
                )}
                keyExtractor={(item) => item.gameId?.toString()}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{
                  paddingBottom: 20,
                }}
                ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
              />
            )}     
      </View>
</SafeAreaView>
  );
};
