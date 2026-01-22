import { API_BASE } from '@/lib/appwrite';
import useAuthStore from '@/store/auth.store';
import DateTimePicker from '@react-native-community/datetimepicker';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, Image, Platform, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';

type CollectionItemResponse = {
  title: string | null;
  coverImage: string | null;
  rating: number | string | null;
  status: string | null;
  isOwned: boolean | null;
  dateStarted?: string | null;
  dateCompleted?: string | null;
};

const FieldRow = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <View className="flex-row justify-between items-center py-3 border-b border-dark-200">
    <Text className="text-light-200">{label}</Text>
    <View style={{ flex: 1, alignItems: 'flex-end' }}>{children}</View>
  </View>
);

const CollectionItemPage = () => {
  const { id } = useLocalSearchParams(); // here id = gameId passed in route
  const user = useAuthStore(state => state.user);
  const userId = Number(user?.userId ?? (global as any).CURRENT_USER_ID ?? 1);
  const gameId = Number(id);

  const [loading, setLoading] = useState<boolean>(true);
  const [data, setData] = useState<CollectionItemResponse | null>(null);

  // editable fields
  const [isOwned, setIsOwned] = useState<boolean>(false);
  const [rating, setRating] = useState<string>('0');
  const [status, setStatus] = useState<string>('not specified');
  const [dateStarted, setDateStarted] = useState<Date | null>(null);
  const [dateCompleted, setDateCompleted] = useState<Date | null>(null);

  const [showPicker, setShowPicker] = useState<{ which: 'started' | 'completed' | null }>({ which: null });

  useEffect(() => {
    const fetchItem = async () => {
      setLoading(true);
      try {
        const resp = await fetch(`${API_BASE}/collectionItems/${userId}/${gameId}`);
        if (!resp.ok) {
          const txt = await resp.text();
          throw new Error(txt || `HTTP ${resp.status}`);
        }
        const json: CollectionItemResponse = await resp.json();
        setData(json);

        // initialize editable states from response
        setIsOwned(Boolean(json.isOwned));
        setRating((json.rating && typeof json.rating === 'number') ? String(json.rating) : (json.rating === "not specified" ? '0' : String(json.rating ?? '0')));
        setStatus(json.status ?? 'not specified');

        // try parse dates if present
        if ((json as any).dateStarted) {
          const ds = new Date((json as any).dateStarted);
          if (!isNaN(ds.getTime())) setDateStarted(ds);
        }
        if ((json as any).dateCompleted) {
          const dc = new Date((json as any).dateCompleted);
          if (!isNaN(dc.getTime())) setDateCompleted(dc);
        }
      } catch (err) {
        console.warn(err);
        Alert.alert('Error', 'Failed to load collection item');
      } finally {
        setLoading(false);
      }
    };

    fetchItem();
  }, [userId, gameId]);

  const onChangeDate = (_: any, selectedDate?: Date) => {
    setShowPicker({ which: null });
    if (!selectedDate) return;
    if (showPicker.which === 'started') {
      setDateStarted(selectedDate);
    } else if (showPicker.which === 'completed') {
      setDateCompleted(selectedDate);
    }
  };

  const validateAndSave = async () => {
    // validate rating numeric 1-100 or 0 (unspecified)
    let numericRating: number | null = null;
    if (rating !== '' && rating !== '0' && rating !== 'not specified') {
      const n = Number(rating);
      if (isNaN(n) || n < 1 || n > 100) {
        Alert.alert('Validation', 'Rating must be a number between 1 and 100.');
        return;
      }
      numericRating = n;
    } else {
      numericRating = null;
    }

    const payload = {
      userId,
      gameId,
      rating: numericRating,
      status,
      isOwned,
      dateStarted: dateStarted ? dateStarted.toISOString() : null,
      dateCompleted: dateCompleted ? dateCompleted.toISOString() : null,
    };

    try {
      const resp = await fetch(`${API_BASE}/collectionItems/${userId}/${gameId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!resp.ok) {
        const txt = await resp.text();
        throw new Error(txt || `HTTP ${resp.status}`);
      }

      Alert.alert('Success', 'Changes saved');
      // optionally refresh
      router.replace(router.pathname); // or just refetch; here simple navigation refresh
    } catch (err) {
      console.warn(err);
      Alert.alert('Error', 'Failed to save changes');
    }
  };

  return (
    <View className="bg-primary flex-1">
      <ScrollView contentContainerStyle={{ paddingBottom: 120 }}>
        {/* cover image */}
        <View>
          <Image
            source={{
              uri: data?.coverImage
                ? `https:${data?.coverImage}`
                : undefined,
            }}
            className="w-full h-[120px]"
            resizeMode="cover"
          />
        </View>

        <View className="px-5 mt-4">
          <Text className="text-white text-2xl font-bold mb-3">{data?.title ?? 'Game'}</Text>

          {/* Fields list */}
          <FieldRow label="Is Owned">
            <TouchableOpacity
              onPress={() => setIsOwned(!isOwned)}
              className="px-3 py-2 rounded-md"
              style={{ backgroundColor: 'transparent' }}
            >
              <Text style={{ color: isOwned ? '#34D399' : '#9CA3AF', fontWeight: '600' }}>{isOwned ? '✓' : '○'}</Text>
            </TouchableOpacity>
          </FieldRow>

          <FieldRow label="Rating">
            <TextInput
              value={rating}
              keyboardType="numeric"
              onChangeText={(t) => setRating(t.replace(/[^0-9]/g, ''))}
              placeholder="0"
              style={{
                color: '#fff',
                textAlign: 'right',
                minWidth: 80,
                padding: 6,
                borderRadius: 6,
                borderWidth: 1,
                borderColor: '#2b2b2b',
              }}
            />
          </FieldRow>

          <FieldRow label="Status">
            <View className="flex-row items-center">
              <TouchableOpacity
                onPress={() => setStatus('playing')}
                className={`px-3 py-2 rounded-md mr-2`}
                style={{ backgroundColor: status === 'playing' ? '#2563EB' : 'transparent' }}
              >
                <Text style={{ color: status === 'playing' ? '#fff' : '#9CA3AF' }}>playing</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setStatus('dropped')}
                className={`px-3 py-2 rounded-md`}
                style={{ backgroundColor: status === 'dropped' ? '#2563EB' : 'transparent' }}
              >
                <Text style={{ color: status === 'dropped' ? '#fff' : '#9CA3AF' }}>dropped</Text>
              </TouchableOpacity>
            </View>
          </FieldRow>

          <FieldRow label="Date Started">
            <TouchableOpacity
              onPress={() => setShowPicker({ which: 'started' })}
              className="px-3 py-2 rounded-md"
              style={{ borderWidth: 1, borderColor: '#2b2b2b', paddingHorizontal: 10 }}
            >
              <Text style={{ color: '#fff' }}>{dateStarted ? dateStarted.toDateString() : 'Not set'}</Text>
            </TouchableOpacity>
          </FieldRow>

          <FieldRow label="Date Completed">
            <TouchableOpacity
              onPress={() => setShowPicker({ which: 'completed' })}
              className="px-3 py-2 rounded-md"
              style={{ borderWidth: 1, borderColor: '#2b2b2b', paddingHorizontal: 10 }}
            >
              <Text style={{ color: '#fff' }}>{dateCompleted ? dateCompleted.toDateString() : 'Not set'}</Text>
            </TouchableOpacity>
          </FieldRow>
        </View>
      </ScrollView>

      {/* Date picker (modal-like) */}
      {showPicker.which && (
        <DateTimePicker
          value={showPicker.which === 'started' ? (dateStarted ?? new Date()) : (dateCompleted ?? new Date())}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={onChangeDate}
        />
      )}

      {/* Save button */}
      <TouchableOpacity
        onPress={validateAndSave}
        className="absolute bottom-8 left-5 right-5 bg-accent rounded-lg py-3.5 flex items-center justify-center"
      >
        <Text className="text-white font-semibold text-base">Save changes</Text>
      </TouchableOpacity>
    </View>
  );
};

export default CollectionItemPage;