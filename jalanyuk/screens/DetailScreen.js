import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  ActivityIndicator,
} from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';

export default function DetailScreen({ route }) {
  const { wisata } = route.params;
  const [comments, setComments] = useState([
    { id: '1', name: 'Ali', text: 'Tempat yang sangat indah!' },
    { id: '2', name: 'Budi', text: 'Sangat direkomendasikan untuk liburan.' },
  ]);
  const [newComment, setNewComment] = useState('');
  const [userLocation, setUserLocation] = useState(null);
  const [locationError, setLocationError] = useState(null);
  const scrollRef = useRef();

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setLocationError('Izin lokasi ditolak.');
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      setUserLocation({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });
    })();
  }, []);

  const handleAddComment = () => {
    if (newComment.trim() !== '') {
      const newId = (comments.length + 1).toString();
      setComments([...comments, { id: newId, name: 'Pengunjung', text: newComment }]);
      setNewComment('');

      setTimeout(() => {
        scrollRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 20}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView
          ref={scrollRef}
          contentContainerStyle={{ paddingBottom: 40, backgroundColor: '#f2f2f2' }}
          keyboardShouldPersistTaps="handled"
        >
          <Image source={wisata.image} style={styles.image} />
          <Text style={styles.title}>{wisata.name}</Text>
          <Text style={styles.description}>{wisata.description}</Text>
          <Text style={styles.location}>
            {wisata.location} • ⭐ {wisata.rating}
          </Text>

          <Text style={styles.mapTitle}>Lokasi di Peta</Text>
          <View style={styles.mapContainer}>
            {userLocation ? (
              <MapView
                style={styles.map}
                initialRegion={{
                  latitude: wisata.latitude,
                  longitude: wisata.longitude,
                  latitudeDelta: 0.05,
                  longitudeDelta: 0.05,
                }}
              >
                <Marker
                  coordinate={{
                    latitude: wisata.latitude,
                    longitude: wisata.longitude,
                  }}
                  title={wisata.name}
                  description={wisata.location}
                  pinColor="tomato"
                />
                <Marker
                  coordinate={{
                    latitude: userLocation.latitude,
                    longitude: userLocation.longitude,
                  }}
                  title="Lokasi Saya"
                  pinColor="blue"
                />
              </MapView>
            ) : (
              <View style={styles.loading}>
                <ActivityIndicator size="large" color="#0000ff" />
                <Text>Memuat peta...</Text>
                {locationError && <Text style={{ color: 'red' }}>{locationError}</Text>}
              </View>
            )}
          </View>

          <Text style={styles.commentTitle}>Komentar Pengunjung</Text>
          <View style={styles.commentList}>
            {comments.map((item) => (
              <View key={item.id} style={styles.commentItem}>
                <View style={styles.avatar}>
                  <Text style={{ color: '#fff', fontWeight: 'bold' }}>
                    {item.name.charAt(0).toUpperCase()}
                  </Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.commentName}>{item.name}</Text>
                  <Text>{item.text}</Text>
                </View>
              </View>
            ))}
          </View>

          <View style={styles.inputContainer}>
            <TextInput
              value={newComment}
              onChangeText={setNewComment}
              placeholder="Tulis komentar Anda..."
              style={styles.input}
              multiline
            />
            <TouchableOpacity
              onPress={handleAddComment}
              style={[
                styles.sendButton,
                { backgroundColor: newComment.trim() === '' ? '#aaa' : '#007bff' },
              ]}
              disabled={newComment.trim() === ''}
            >
              <Text style={styles.sendButtonText}>Kirim</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  image: { width: '100%', height: 220 },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    marginTop: 14,
    paddingHorizontal: 12,
    color: '#333',
  },
  description: { fontSize: 16, marginTop: 6, paddingHorizontal: 12, color: '#555' },
  location: { fontSize: 14, color: '#777', marginTop: 5, paddingHorizontal: 12 },
  mapTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 20,
    paddingHorizontal: 12,
    color: '#333',
  },
  mapContainer: {
    height: 200,
    marginTop: 10,
    marginHorizontal: 12,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  map: { flex: 1 },
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  commentTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 20,
    paddingHorizontal: 12,
    color: '#333',
  },
  commentList: { paddingHorizontal: 12, marginTop: 12 },
  commentItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 14,
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 10,
    borderLeftWidth: 4,
    borderLeftColor: '#007bff',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#007bff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  commentName: { fontWeight: 'bold', marginBottom: 3, color: '#007bff' },
  inputContainer: {
    marginTop: 20,
    paddingHorizontal: 12,
    marginBottom: 40,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    padding: 12,
    minHeight: 60,
    textAlignVertical: 'top',
    backgroundColor: '#fff',
  },
  sendButton: {
    marginTop: 10,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  sendButtonText: { color: '#fff', fontWeight: 'bold' },
});
