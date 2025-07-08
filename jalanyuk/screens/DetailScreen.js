import React, { useEffect, useRef, useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView, KeyboardAvoidingView,
  Platform, TouchableWithoutFeedback, Keyboard, ActivityIndicator, Modal,
  TextInput, Alert, Image,
} from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import { Ionicons, FontAwesome } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getImageUrlById, getAllWisata } from '../API';

const IMAGE_BASE_URL = 'http://192.168.43.81:8080';
const FALLBACK_IMAGE = 'https://via.placeholder.com/400x200.png?text=No+Image';

const ImageWithFallback = ({ uri, style }) => {
  const [error, setError] = useState(false);
  return (
    <Image
      source={{ uri: error ? FALLBACK_IMAGE : uri }}
      style={style}
      resizeMode="cover"
      onError={() => setError(true)}
    />
  );
};

export default function DetailScreen({ route, navigation }) {
  const { wisata } = route.params ?? {};
  const [userLocation, setUserLocation] = useState(null);
  const [selectedRating, setSelectedRating] = useState(0);
  const [modalVisible, setModalVisible] = useState(false);
  const [reviewText, setReviewText] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);
  const [userId, setUserId] = useState(null);
  const [detailWisata, setDetailWisata] = useState(null);
  const scrollRef = useRef();

  const latitude = parseFloat(detailWisata?.koordinat_lat || 0);
  const longitude = parseFloat(detailWisata?.koordinat_lng || 0);
  const imageUrl = getImageUrlById(detailWisata?.id_galeri);

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

    // Dummy user, ganti dengan auth user yang sesuai bila diperlukan
    setUser({ id: 2, foto: 'https://i.pravatar.cc/50' });
    const loadUserId = async () => {
      try {
        const storedId = await AsyncStorage.getItem('userId');
        if (storedId) {
          setUserId(parseInt(storedId, 10));
        } else {
          console.warn('User ID belum login atau tidak ditemukan');
        }
      } catch (error) {
        console.error('Gagal ambil userId:', error);
      }
    };

    const fetchWisata = async () => {
      try {
        const all = await getAllWisata();
        const found = all.find(item => item.id === wisata.id);
        setDetailWisata(found || wisata);
      } catch (err) {
        console.error('Gagal mengambil data wisata:', err);
      }
    };

    loadUserId();
    fetchWisata();
  }, []);

  const pickImageFromGallery = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Izin Ditolak', 'Aplikasi butuh akses ke galeri.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.7,
    });

    if (!result.canceled && result.assets?.length > 0) {
      setSelectedImage(result.assets[0].uri);
    }
  };

  const submitReview = async () => {
    if (!userId) {
      Alert.alert('Login Diperlukan', 'Silakan login terlebih dahulu.');
      return;
    }

    if (!reviewText.trim() || selectedRating === 0 || !selectedImage) {
      Alert.alert('Lengkapi Ulasan', 'Komentar, rating, dan foto wajib diisi.');
      return;
    }

    try {
      const formData = new FormData();
      const fileName = selectedImage.split('/').pop();
      const fileType = fileName.split('.').pop();
      const mimeType = `image/${fileType}`;

      formData.append('file', {
        uri: selectedImage,
        name: fileName,
        type: mimeType,
      });
      formData.append('id', 0);
      formData.append('id_wisata', detailWisata?.id);
      formData.append('id_pengguna', userId);
      formData.append('komentar', reviewText.trim());
      formData.append('rating', selectedRating);

      await axios.post(`${IMAGE_BASE_URL}/saveRiview`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      Alert.alert('Sukses', 'Ulasan berhasil dikirim.');
      setModalVisible(false);
      setReviewText('');
      setSelectedImage(null);
      setSelectedRating(0);
    } catch (error) {
      console.error('Gagal kirim ulasan:', error);
      Alert.alert('Gagal', 'Gagal mengirim ulasan. Coba lagi nanti.');
    }
  };

  if (!detailWisata) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator />
        <Text>Memuat data wisata...</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView ref={scrollRef} style={{ backgroundColor: '#fff' }} contentContainerStyle={{ paddingBottom: 40 }}>
          <ImageWithFallback uri={imageUrl} style={styles.image} />

          <View style={styles.tabContainer}>
            <TouchableOpacity style={styles.activeTab}><Text style={styles.tabText}>Ringkasan</Text></TouchableOpacity>
            <TouchableOpacity onPress={() => navigation.navigate('UlasanScreen')} style={styles.tab}>
              <Text style={styles.tabText}>Ulasan</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.tab}><Text style={styles.tabText}>Foto</Text></TouchableOpacity>
          </View>

          <Text style={styles.title}>{detailWisata.nama_wisata}</Text>
          <Text style={styles.locationText}>
            {detailWisata.alamat} • ⭐ {detailWisata.rating_rata} ({detailWisata.jumlah_review} ulasan)
          </Text>

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
                <Marker coordinate={{ latitude, longitude }} title={detailWisata.nama_wisata} />
                <Marker coordinate={userLocation} title="Lokasi Saya" pinColor="blue" />
              </MapView>
            ) : (
              <View style={styles.loading}>
                <ActivityIndicator size="large" color="#007bff" />
                <Text>Memuat peta...</Text>
              </View>
            )}
          </View>

          <View style={styles.box}><Text style={styles.statusOpen}>Buka</Text></View>
          <View style={styles.box}><FontAwesome name="star" size={18} color="#f4c542" /><Text style={styles.infoText}>{detailWisata.rating} ★</Text></View>
          <View style={styles.box}><Ionicons name="call" size={18} color="#007bff" /><Text style={styles.infoText}>{detailWisata.phone}</Text></View>
          <View style={styles.box}><Text style={styles.description}>{detailWisata.description}</Text></View>

          <Text style={styles.sectionTitle}>Beri Rating</Text>
          <View style={styles.reviewInputContainer}>
            <Image source={{ uri: 'https://i.pravatar.cc/50' }} style={styles.profileImage} />
            <View style={styles.reviewRight}>
              <Text style={styles.instructionText}>Klik bintang untuk memberi ulasan:</Text>
              <View style={styles.starContainer}>
                {[1, 2, 3, 4, 5].map(i => (
                  <TouchableOpacity key={i} onPress={() => { setSelectedRating(i); setModalVisible(true); }}>
                    <FontAwesome name="star" size={40} color={i <= selectedRating ? '#f4c542' : '#ccc'} style={styles.star} />
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>

          <TouchableOpacity
            style={[styles.bookButton, !detailWisata?.id && { backgroundColor: '#999' }]}
            onPress={() => navigation.navigate('PesanTiketScreen', { wisata: detailWisata })}
            disabled={!detailWisata?.id}
          >
            <Text style={styles.bookButtonText}>Pesan Tiket</Text>
          </TouchableOpacity>

          {/* Modal Review */}
          <Modal visible={modalVisible} animationType="slide" transparent onRequestClose={() => setModalVisible(false)}>
            <View style={styles.modalOverlay}>
              <View style={styles.modalContainer}>
                <Text style={styles.modalTitle}>Tulis Komentar</Text>
                <Text style={{ marginBottom: 8 }}>Rating: {selectedRating} ⭐</Text>

                <TouchableOpacity onPress={pickImageFromGallery} style={{ marginBottom: 12 }}>
                  <Text style={{ color: '#007bff' }}>{selectedImage ? 'Ganti Foto dari Galeri' : 'Pilih Foto dari Galeri'}</Text>
                </TouchableOpacity>

                {selectedImage && <Image source={{ uri: selectedImage }} style={styles.selectedImage} />}

                <TextInput
                  multiline
                  numberOfLines={4}
                  value={reviewText}
                  onChangeText={setReviewText}
                  placeholder="Masukkan komentar..."
                  style={styles.textInput}
                />

                <View style={styles.modalButtons}>
                  <TouchableOpacity onPress={() => setModalVisible(false)} style={{ marginRight: 15 }}>
                    <Text style={{ color: '#888' }}>Batal</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={submitReview}>
                    <Text style={{ color: '#007bff', fontWeight: 'bold' }}>Kirim</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </Modal>
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
  sectionTitle: { fontSize: 16, fontWeight: 'bold', marginHorizontal: 12, marginTop: 20, marginBottom: 8 },
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
  infoText: { marginLeft: 6 },
  description: { fontSize: 14, color: '#333' },
  reviewInputContainer: { flexDirection: 'row', alignItems: 'center', marginHorizontal: 12, marginBottom: 20 },
  profileImage: { width: 50, height: 50, borderRadius: 25, marginRight: 12 },
  reviewRight: { flex: 1 },
  instructionText: { marginBottom: 6, fontSize: 14, color: '#333' },
  starContainer: { flexDirection: 'row' },
  star: { marginRight: 5 },
  bookButton: {
    backgroundColor: '#28a745',
    paddingVertical: 12,
    marginHorizontal: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 20,
  },
  bookButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContainer: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    width: '90%',
  },
  modalTitle: { fontWeight: 'bold', fontSize: 16, marginBottom: 10 },
  selectedImage: {
    width: 100,
    height: 100,
    marginBottom: 12,
    borderRadius: 6,
  },
  textInput: {
    borderColor: '#ccc',
    borderWidth: 1,
    padding: 10,
    borderRadius: 6,
    textAlignVertical: 'top',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 12,
  },
});
