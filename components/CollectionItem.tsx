import { Link } from 'expo-router';
import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity } from 'react-native';

const CollectionItem = ({ userId, gameId, title, coverImage }: { userId: string; gameId: string; title: string; coverImage: string }) => {
  return (
    <Link href={`/collectionitems/${userId}/${gameId}`} asChild>
      <TouchableOpacity style={styles.container}>
        <Image 
          source={{ uri: coverImage
            ? `https://images.igdb.com/igdb/image/upload/t_thumb/${coverImage.split('/').pop()}`
            : undefined}} 
          style={styles.image} 
          resizeMode="cover" 
        />
        <Text numberOfLines={2} style={styles.title}>
          {title}
        </Text>
      </TouchableOpacity>
    </Link>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#1f2937',
    borderRadius: 8,
    marginBottom: 8,
  },
  image: {
    width: 60,
    height: 60,
    borderRadius: 6,
    backgroundColor: '#374151',
    marginRight: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    flex: 1,
  },
});

export default CollectionItem;