import { Link } from 'expo-router';
import { deleteCollectionItem } from '@/services/api';
import useAuthStore from '@/store/auth.store';
import React from 'react';
import { Alert, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface CollectionItemProps {
  userId: string;
  gameId: string; 
  title: string;
  coverImage: string;
  onDeleteSuccess?: () => void;
}

const CollectionItem = ({ userId, gameId, title, coverImage, onDeleteSuccess }: CollectionItemProps) => {
  const user = useAuthStore(state => state.user);
  
  const canEdit = user?.userId === Number(userId) || user?.isModerator === true;

  const handleDelete = () => {
    Alert.alert(
      'Delete Item',
      `Delete ${title} from your collection?`,
      [
        {
          text: 'No',
          style: 'cancel'
        },
        {
          text: 'Yes',
          onPress: async () => {
            try {
              await deleteCollectionItem({ userId, gameId });
              Alert.alert('Success', 'Item deleted successfully');
              // Вызываем callback для обновления родительского компонента
              if (onDeleteSuccess) {
                onDeleteSuccess();
              }
            } catch (error) {
              Alert.alert('Error', 'Failed to delete item');
            }
          }
        }
      ]
    );
  };

  return (
    <View style={styles.container}>
      <Link href={`/collectionitems/${userId}/${gameId}`} asChild>
        <TouchableOpacity style={styles.contentContainer}>
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
      
      {canEdit && (
        <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
          <Text style={styles.deleteIcon}>×</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    backgroundColor: '#1f2937',
    borderRadius: 8,
    marginBottom: 8,
    overflow: 'hidden',
  },
  contentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
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
  deleteButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#dc2626',
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  deleteIcon: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    lineHeight: 20,
  },
});

export default CollectionItem;