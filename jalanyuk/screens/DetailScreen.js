import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
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
import { getImageUrlById } from '../API';

export default function DetailScreen({ route, navigation }) {
  const { wisata } = route.params;
  const [userLocation, setUserLocation] = useState(null);
  const [selectedRating, setSelectedRating] = useState(0);
  const scrollRef = useRef();

  const latitude = parseFloat(wisata.koordinat_lat);
  const longitude = parseFloat(wisata.koordinat_lng);
  const imageUrl = getImageUrlById(wisata.id_galeri);

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') return;
      const location = await Location.getCurrentPositionAsync({});
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
          <Image source={{ uri: imageUrl }} style={styles.image} />

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

          <Text style={styles.title}>{wisata.nama_wisata}</Text>
          <Text style={styles.locationText}>
            {wisata.alamat} • ⭐ {wisata.rating_rata} ({wisata.jumlah_review} ulasan)
          </Text>

          {/* Lokasi */}
          <Text style={styles.sectionTitle}>Lokasi Wisata</Text>
          <View style={styles.mapContainer}>
            {userLocation ? (
              <MapView
                style={styles.map}
                initialRegion={{
                  latitude,
                  longitude,
                  latitudeDelta: 0.05,
                  longitudeDelta: 0.05,
                }}
              >
                <Marker coordinate={{ latitude, longitude }} title={wisata.nama_wisata} description={wisata.alamat} pinColor="tomato" />
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
            <Text> . Tutup Pukul {wisata.jam_tutup}</Text>
          </View>

          <View style={styles.box}>
            <FontAwesome name="star" size={18} color="#f4c542" />
            <Text style={styles.infoText}>
              {wisata.rating_rata} ★ ({wisata.jumlah_review} ulasan)
            </Text>
          </View>

          <View style={styles.box}>
            <Ionicons name="call" size={18} color="#007bff" />
            <Text style={styles.infoText}>{wisata.no_telp}</Text>
          </View>

          <View style={styles.box}>
            <Text style={styles.description}>{wisata.deskripsi}</Text>
          </View>
           
          {/* Ringkasan Ulasan */}
          <Text style={styles.sectionTitle}>Ringkasan Ulasan</Text>
          <View style={styles.ratingSummaryContainer}>
            <View style={{ flex: 1 }}>
              {[5, 4, 3, 2, 1].map((star) => (
                <View key={star} style={styles.reviewRow}>
                  <Text>{star}</Text>
                  <View style={styles.barBackground}>
                    <View style={[styles.barFill, { width: `${Math.random() * 80 + 10}%` }]} />
                  </View>
                </View>
              ))}
            </View>
            <View style={styles.avgRatingBox}>
              <Text style={styles.avgRating}>{wisata.rating_rata}</Text>
              <Text style={{ color: '#999' }}>({wisata.jumlah_review})</Text>
            </View>
          </View>

          <View style={{ paddingHorizontal: 16, marginTop: 12 }}>
            <Text style={{ fontStyle: 'italic' }}>
              “Saya Pernah ke wisata ini, asik sekali dan menyenangkan apalagi sama pasangan tercinta”
            </Text>
            <Text style={{ fontStyle: 'italic', marginTop: 8 }}>
              “Saya Pernah ke wisata ini, HTS-an juga menyenangkan”
            </Text>
          </View>

          <TouchableOpacity
            style={{
              backgroundColor: '#007bff',
              marginHorizontal: 16,
              padding: 12,
              borderRadius: 10,
              marginTop: 12,
            }}
          >
            <Text style={{ color: '#fff', textAlign: 'center', fontWeight: 'bold' }}>Ulasan Lainnya</Text>
          </TouchableOpacity>

          {/* Form Rating */}
          <Text style={styles.sectionTitle}>Beri Rating dan Tulis Ulasan</Text>
          <View style={styles.reviewInputContainer}>
            <Image source={{ uri: 'https://i.pravatar.cc/50' }} style={styles.profileImage} />
            <View style={{ flex: 1 }}>
              <Text style={{ marginBottom: 6 }}>Beri Rating:</Text>
              <View style={{ flexDirection: 'row' }}>
                {[1, 2, 3, 4, 5].map((i) => (
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

          <TouchableOpacity style={styles.bookButton}>
            <Text style={styles.bookButtonText}>Pesan Tiket - Rp{wisata.harga_tiket?.toLocaleString()}</Text>
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
  ratingSummaryContainer: {
    flexDirection: 'row',
    marginHorizontal: 12,
    marginTop: 10,
    alignItems: 'center',
  },
  reviewRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
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
  avgRatingBox: {
    alignItems: 'center',
    marginLeft: 12,
  },
  avgRating: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
  },
  reviewInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    marginBottom: 16,
  },
  profileImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
});
