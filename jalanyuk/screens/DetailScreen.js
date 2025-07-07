// DetailScreen.js
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
import { Ionicons, FontAwesome } from '@expo/vector-icons';

export default function DetailScreen({ route, navigation }) {
  const { wisata } = route.params;
  const [comments, setComments] = useState([
    { id: '1', name: 'Ali', text: 'Tempat yang sangat indah!' },
    { id: '2', name: 'Budi', text: 'Sangat direkomendasikan untuk liburan.' },
  ]);
  const [userLocation, setUserLocation] = useState(null);
  const [locationError, setLocationError] = useState(null);
  const [selectedRating, setSelectedRating] = useState(0);
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

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView ref={scrollRef} style={{ backgroundColor: '#fff' }} contentContainerStyle={{ paddingBottom: 40 }}>
          <Image source={wisata.image} style={styles.image} />

          <View style={styles.tabContainer}>
            <TouchableOpacity style={styles.activeTab}>
              <Text style={styles.tabText}>Ringkasan</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => navigation.navigate('Ulasan')} style={styles.tab}>
              <Text style={styles.tabText}>Ulasan</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.tab}>
              <Text style={styles.tabText}>Foto</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.title}>{wisata.name}</Text>
          <Text style={styles.locationText}>
            {wisata.location} • ⭐ {wisata.rating}
          </Text>

          <Text style={styles.sectionTitle}>Lokasi Wisata</Text>
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
                <Marker coordinate={wisata} title={wisata.name} description={wisata.location} pinColor="tomato" />
                <Marker coordinate={userLocation} title="Lokasi Saya" pinColor="blue" />
              </MapView>
            ) : (
              <View style={styles.loading}>
                <ActivityIndicator size="large" color="#007bff" />
                <Text>Memuat peta...</Text>
              </View>
            )}
          </View>

          <View style={styles.box}>
            <Text style={styles.statusOpen}>Buka</Text>
            <Text> . Tutup Pukul 16.00</Text>
          </View>

          <View style={styles.box}>
            <FontAwesome name="star" size={18} color="#f4c542" />
            <Text style={styles.infoText}>4.5 ★  20.125 Ulasan</Text>
          </View>

          <View style={styles.box}>
            <Ionicons name="call" size={18} color="#007bff" />
            <Text style={styles.infoText}>087846112608</Text>
          </View>

          <View style={styles.box}>
            <Text style={styles.description}>
              Kawasan konservasi seluas 150 hektare & kebun raya dengan jalur untuk berjalan kaki, gua, & air terjun.
            </Text>
          </View>

          <Text style={styles.sectionTitle}>Ringkasan Ulasan</Text>
          <View style={styles.ratingSummaryContainer}>
            <View style={{ flex: 1 }}>
              {[5, 4, 3, 2, 1].map(star => (
                <View key={star} style={styles.reviewRow}>
                  <Text>{star}</Text>
                  <View style={styles.barBackground}>
                    <View style={[styles.barFill, { width: `${Math.random() * 80 + 20}%` }]} />
                  </View>
                </View>
              ))}
            </View>
            <View style={styles.avgRatingBox}>
              <Text style={styles.avgRating}>4.5</Text>
              <Text style={{ color: '#999' }}>(1234)</Text>
            </View>
          </View>

          <Text style={styles.sectionTitle}>Komentar Pengunjung</Text>
          {comments.map(c => (
            <View key={c.id} style={styles.commentItem}>
              <View style={styles.avatar}>
                <Text style={{ color: '#fff' }}>{c.name[0]}</Text>
              </View>
              <View>
                <Text style={styles.commentName}>{c.name}</Text>
                <Text>{c.text}</Text>
              </View>
            </View>
          ))}

          <TouchableOpacity onPress={() => navigation.navigate('Ulasan')} style={styles.moreReviewsButton}>
            <Text style={styles.moreReviewsText}>Ulasan Lainnya &gt;</Text>
          </TouchableOpacity>

          <View style={styles.box}>
            <View style={styles.reviewInputContainer}>
              <Image source={{ uri: 'https://i.pravatar.cc/50' }} style={styles.profileImage} />
              <View style={{ flex: 1 }}>
                <Text style={{ marginBottom: 6 }}>Beri Rating:</Text>
                <View style={{ flexDirection: 'row' }}>
                  {[1, 2, 3, 4, 5].map(i => (
                    <TouchableOpacity
                      key={i}
                      onPress={() => {
                        setSelectedRating(i);
                        navigation.navigate('ReviewTransaksi');
                      }}
                    >
                      <FontAwesome
                        name="star"
                        size={45}
                        color={i <= selectedRating ? '#f4c542' : '#ccc'}
                        style={{ marginRight: 5 }}
                      />
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </View>
          </View>

          <TouchableOpacity style={styles.bookButton}>
            <Text style={styles.bookButtonText}>Pesan Tiket</Text>
          </TouchableOpacity>
        </ScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  image: { width: '100%', height: 220 },
  tabContainer: { flexDirection: 'row', justifyContent: 'space-around', marginVertical: 10 },
  tab: { paddingVertical: 6, paddingHorizontal: 16, backgroundColor: '#e0e0e0', borderRadius: 20 },
  activeTab: { paddingVertical: 6, paddingHorizontal: 16, backgroundColor: '#007bff', borderRadius: 20 },
  tabText: { color: '#fff', fontWeight: 'bold' },
  title: { fontSize: 22, fontWeight: 'bold', marginHorizontal: 12 },
  locationText: { fontSize: 14, color: '#666', marginHorizontal: 12, marginBottom: 10 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', marginHorizontal: 12, marginTop: 20 },
  mapContainer: { height: 180, margin: 12, borderRadius: 12, overflow: 'hidden' },
  map: { flex: 1 },
  loading: { alignItems: 'center', justifyContent: 'center', height: 180 },
  box: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#eee',
    padding: 10,
    marginHorizontal: 12,
    borderRadius: 10,
    marginTop: 8,
  },
  statusOpen: { color: 'green', fontWeight: 'bold', marginRight: 4 },
  infoText: { marginLeft: 6, fontSize: 14, color: '#333' },
  description: { marginHorizontal: 12, marginTop: 8, fontSize: 14, color: '#555' },
  ratingSummaryContainer: {
    flexDirection: 'row',
    marginHorizontal: 12,
    marginTop: 10,
    alignItems: 'center',
  },
  reviewRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
  barBackground: {
    flex: 1,
    backgroundColor: '#ddd',
    height: 8,
    marginLeft: 8,
    borderRadius: 4,
  },
  barFill: {
    height: 8,
    backgroundColor: '#007bff',
    borderRadius: 4,
  },
  avgRatingBox: { alignItems: 'center', marginLeft: 12 },
  avgRating: { fontSize: 28, fontWeight: 'bold', color: '#333' },
  commentItem: {
    flexDirection: 'row',
    padding: 12,
    margin: 12,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
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
  commentName: { fontWeight: 'bold', color: '#007bff', marginBottom: 4 },
  moreReviewsButton: { alignItems: 'flex-end', marginHorizontal: 12 },
  moreReviewsText: { color: '#007bff', fontWeight: 'bold' },
  reviewInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    marginBottom: 16,
  },
  profileImage: { width: 40, height: 40, borderRadius: 20, marginRight: 10 },
  bookButton: {
    backgroundColor: '#0056b3',
    padding: 15,
    alignItems: 'center',
    marginHorizontal: 12,
    borderRadius: 10,
    marginTop: 10,
    marginBottom: 30,
  },
  bookButtonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
});
