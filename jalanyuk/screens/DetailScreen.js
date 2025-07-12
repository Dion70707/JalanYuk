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
import { getImageUrlById, getAllWisata, getAllReviews, getAllPenggunas } from '../API';

const IMAGE_BASE_URL = 'http://10.1.49.74:8080';
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
  const [selectedImages, setSelectedImages] = useState([]);
  const [userId, setUserId] = useState(null);
  const [detailWisata, setDetailWisata] = useState(null);
  const [expandedReviewId, setExpandedReviewId] = useState(null);
  const [activeTab, setActiveTab] = useState('Ringkasan');
  const [expandedComments, setExpandedComments] = useState({});
  const [reviews, setReviews] = useState([]);
  const [penggunaMap, setPenggunaMap] = useState({});
  const scrollRef = useRef();

  const latitude = parseFloat(detailWisata?.koordinat_lat || 0);
  const longitude = parseFloat(detailWisata?.koordinat_lng || 0);
  const imageUrl = detailWisata?.id_galeri
    ? `${IMAGE_BASE_URL}/galeri/${detailWisata.id_galeri}/image`
    : FALLBACK_IMAGE;

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        const location = await Location.getCurrentPositionAsync({});
        setUserLocation({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        });
      }
    })();

    const loadUserId = async () => {
      try {
        const storedId = await AsyncStorage.getItem('userId');
        if (storedId) setUserId(parseInt(storedId, 10));
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

    const fetchUlasan = async () => {
      try {
        const [reviewData, penggunaData] = await Promise.all([
          getAllReviews(),
          getAllPenggunas()
        ]);
        const map = {};
        penggunaData.forEach(p => {
          map[p.id] = p;
        });
        setPenggunaMap(map);
        const filtered = reviewData.filter(r => r.id_wisata === wisata.id);
        setReviews(filtered);
      } catch (err) {
        console.error('Gagal ambil ulasan:', err);
      }
    };

    loadUserId();
    fetchWisata();
    fetchUlasan();
  }, []);

  const pickImageFromGallery = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Izin Ditolak', 'Aplikasi membutuhkan akses galeri.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: 'images',
        quality: 0.5,
        allowsMultipleSelection: true,
        selectionLimit: 5,
      });

      if (!result.canceled && result.assets?.length > 0) {
        const uris = result.assets.map(asset => asset.uri);
        setSelectedImages(prev => [...prev, ...uris]);
      }
    } catch (error) {
      console.error('Gagal memilih gambar:', error);
      Alert.alert('Error', 'Gagal membuka galeri.');
    }
  };







  const submitReview = async () => {
    if (!userId || !reviewText.trim() || selectedRating === 0 || selectedImages.length === 0) {
      Alert.alert('Lengkapi Ulasan', 'Komentar, rating, dan minimal 1 foto wajib diisi.');
      return;
    }

    try {
      const formData = new FormData();

      selectedImages.forEach((uri, index) => {
        const fileName = uri.split('/').pop();
        const fileType = fileName.split('.').pop();
        const mimeType = `image/${fileType}`;

        formData.append('file', {
          uri,
          name: `photo_${index}.${fileType}`,
          type: mimeType,
        });
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
      setSelectedImages([]);
      setSelectedRating(0);
    } catch (error) {
      console.error('Gagal kirim ulasan:', error);
      Alert.alert('Gagal', 'Gagal mengirim ulasan. Coba lagi nanti.');
    }
  };

  const isStillOpen = () => {
    if (!detailWisata?.jam_buka || !detailWisata?.jam_tutup) return false;

    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();


    const jamBukaStr = detailWisata.jam_buka.replace('.', ':');
    const jamTutupStr = detailWisata.jam_tutup.replace('.', ':');


    const [bukaJam, bukaMenit] = jamBukaStr.split(':').map(Number);
    const [tutupJam, tutupMenit] = jamTutupStr.split(':').map(Number);

    const bukaInMinutes = bukaJam * 60 + bukaMenit;
    const tutupInMinutes = tutupJam * 60 + tutupMenit;

    if (tutupInMinutes > bukaInMinutes) {
      return currentMinutes >= bukaInMinutes && currentMinutes <= tutupInMinutes;
    }

    return currentMinutes >= bukaInMinutes || currentMinutes <= tutupInMinutes;
  };



  const renderTabContent = () => {
    if (activeTab === 'Ringkasan') {
      return (
        <>
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
          <View style={styles.box}>

            <Text style={styles.jamInfo}>
              Jam Operasional | {detailWisata.jam_buka} - {detailWisata.jam_tutup}
            </Text>
            <Text style={[styles.statusOpen, { color: isStillOpen() ? 'green' : 'red' }]}>
              {isStillOpen() ? 'Buka' : 'Tutup'}
            </Text>
          </View>



          <View style={styles.box}><FontAwesome name="star" size={18} color="#f4c542" /><Text style={styles.infoText}>{detailWisata.rating_rata} ★</Text></View>
          <View style={styles.box}><Ionicons name="call" size={18} color="#007bff" /><Text style={styles.infoText}>{detailWisata.no_telp}</Text></View>
          <View style={styles.box}><Text style={styles.description}>{detailWisata.description}</Text></View>

          <View style={{ marginTop: 20 }}>
            <Text style={styles.sectionTitle}>Ulasan Terbaru</Text>
            {[...reviews]
              .sort((a, b) => b.id - a.id)
              .slice(0, 5)
              .map((review) => {
                const pengguna = penggunaMap[review.id_pengguna];
                const nama = pengguna?.nama_lengkap || `User ${review.id_pengguna}`;
                const profileUrl = pengguna?.foto
                  ? `${IMAGE_BASE_URL}${pengguna.foto}`
                  : `https://i.pravatar.cc/150?u=${review.id_pengguna}`;

                const isExpanded = expandedComments[review.id];
                const komentar =
                  isExpanded || review.komentar.length <= 100
                    ? review.komentar
                    : review.komentar.substring(0, 100) + '...';

                return (
                  <View
                    key={`review-${review.id}`}
                    style={[styles.box, { flexDirection: 'row', alignItems: 'flex-start' }]}
                  >
                    <Image
                      source={{ uri: profileUrl }}
                      style={{ width: 40, height: 40, borderRadius: 20, marginRight: 10 }}
                    />
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontWeight: 'bold' }}>{nama}</Text>
                      <Text style={{ marginVertical: 4 }}>{komentar}</Text>
                      {review.komentar.length > 100 && (
                        <TouchableOpacity
                          onPress={() =>
                            setExpandedComments((prev) => ({
                              ...prev,
                              [review.id]: !prev[review.id],
                            }))
                          }
                        >
                          <Text style={{ color: '#007bff' }}>
                            {isExpanded ? 'Tampilkan lebih sedikit' : 'Lihat selengkapnya'}
                          </Text>
                        </TouchableOpacity>
                      )}
                      <View style={{ flexDirection: 'row', marginTop: 4 }}>
                        {[1, 2, 3, 4, 5].map((i) => (
                          <FontAwesome
                            key={`star-${review.id}-${i}`}
                            name="star"
                            size={14}
                            color={i <= review.rating ? '#f4c542' : '#ccc'}
                          />
                        ))}
                      </View>
                    </View>
                  </View>
                );
              })}


            {/* Tombol ke Tab Ulasan */}
            {reviews.length > 5 && (
              <TouchableOpacity
                onPress={() => {
                  scrollRef.current?.scrollTo({ y: 0, animated: true });
                  setActiveTab('Ulasan');
                }}
                style={{
                  alignSelf: 'center',
                  backgroundColor: '#007bff',
                  paddingHorizontal: 20,
                  paddingVertical: 10,
                  borderRadius: 8,
                  marginTop: 10,
                }}
              >
                <Text style={{ color: '#fff', fontWeight: 'bold' }}>Lihat Ulasan Lainnya</Text>
              </TouchableOpacity>
            )}
          </View>

        </>
      );
    } else if (activeTab === 'Ulasan') {
      return (
        <View style={{ marginHorizontal: 12 }}>
          <Text style={styles.sectionTitle}>Ulasan Pengguna</Text>
          {reviews.map((review) => {
            const pengguna = penggunaMap[review.id_pengguna];
            const nama = pengguna?.nama_lengkap || `User ${review.id_pengguna}`;
            const foto = pengguna?.foto || `https://i.pravatar.cc/50?u=${review.id_pengguna}`;


            const imagePaths = review.foto ? review.foto.split(',') : [];

            return (
              <View key={review.id} style={[styles.box, { flexDirection: 'column', alignItems: 'flex-start' }]}>
                <View style={{ flexDirection: 'row', alignItems: 'flex-start', flexWrap: 'wrap' }}>
                  <Image source={{ uri: foto }} style={styles.profileImage} />
                  <View style={{ marginLeft: 10, flex: 1 }}>
                    <Text style={{ fontWeight: 'bold' }}>{nama}</Text>

                    {/* Komentar dengan tombol Selengkapnya */}
                    <Text
                      style={{ marginVertical: 2, lineHeight: 20 }}
                      numberOfLines={expandedReviewId === review.id ? undefined : 3}
                    >
                      {review.komentar}
                    </Text>

                    {review.komentar.length > 100 && (
                      <TouchableOpacity
                        onPress={() =>
                          setExpandedReviewId(expandedReviewId === review.id ? null : review.id)
                        }
                      >
                        <Text style={{ color: '#007bff', fontSize: 13 }}>
                          {expandedReviewId === review.id ? 'Tampilkan lebih sedikit' : 'Selengkapnya'}
                        </Text>
                      </TouchableOpacity>
                    )}

                    <View style={{ flexDirection: 'row', marginTop: 4 }}>
                      {[1, 2, 3, 4, 5].map(i => (
                        <FontAwesome key={i} name="star" size={16} color={i <= review.rating ? '#f4c542' : '#ccc'} />
                      ))}
                    </View>
                  </View>
                </View>

                {imagePaths.length > 0 && (
                  <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginTop: 10 }}>
                    {imagePaths.map((path, i) => (
                      <Image
                        key={i}
                        source={{ uri: `${IMAGE_BASE_URL}${path.trim()}` }}
                        style={{ width: 100, height: 100, marginRight: 8, marginBottom: 8, borderRadius: 8 }}
                        resizeMode="cover"
                      />
                    ))}
                  </View>
                )}
              </View>
            );
          })}
        </View>

      );
    } else if (activeTab === 'Foto') {
      const fotoReviews = reviews.filter(r => r.foto);

      return (
        <View style={{ marginHorizontal: 12 }}>
          <Text style={styles.sectionTitle}>Galeri dari Review Pengguna</Text>
          {fotoReviews.length > 0 ? (
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' }}>
              {fotoReviews.map((r, index) => {
                const imagePaths = r.foto.split(','); // Pisah path-path
                return imagePaths.map((path, i) => (
                  <Image
                    key={`${index}-${i}`}
                    source={{ uri: `${IMAGE_BASE_URL}${path.trim()}` }}
                    style={{ width: '48%', height: 160, marginBottom: 10, borderRadius: 8 }}
                    resizeMode="cover"
                    onError={() => console.log(`Gagal load gambar ${path} dari review ID ${r.id}`)}
                  />
                ));
              })}

            </View>
          ) : (
            <Text style={{ textAlign: 'center', color: '#777' }}>Belum ada foto dari review.</Text>
          )}
        </View>
      );
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
            {['Ringkasan', 'Ulasan', 'Foto'].map(tab => (
              <TouchableOpacity
                key={tab}
                onPress={() => setActiveTab(tab)}
                style={activeTab === tab ? styles.activeTab : styles.tab}
              >
                <Text style={styles.tabText}>{tab}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.title}>{detailWisata.nama_wisata}</Text>
          <Text style={styles.locationText}>
            {detailWisata.alamat} • ⭐ {detailWisata.rating_rata} ({detailWisata.jumlah_review} ulasan)
          </Text>

          {renderTabContent()}

          {(activeTab === 'Ringkasan' || activeTab === 'Ulasan') && (
            <>
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
            </>
          )}

          {activeTab === 'Ringkasan' && (
            <TouchableOpacity
              style={[styles.bookButton, !detailWisata?.id && { backgroundColor: '#999' }]}
              onPress={() => navigation.navigate('PesanTiketScreen', { wisata: detailWisata })}
              disabled={!detailWisata?.id}
            >
              <Text style={styles.bookButtonText}>Pesan Tiket</Text>
            </TouchableOpacity>
          )}


          {/* Modal untuk ulasan */}
          <Modal
            visible={modalVisible}
            animationType="slide"
            transparent
            onRequestClose={() => setModalVisible(false)}
          >
            <View style={styles.modalOverlay}>
              <View style={styles.modalContainer}>
                <Text style={styles.modalTitle}>Tulis Komentar</Text>
                <Text style={{ marginBottom: 8 }}>Rating: {selectedRating} ⭐</Text>

                {/* Tombol Pilih Gambar */}
                <TouchableOpacity onPress={() => pickImageFromGallery()} style={styles.galleryButton}>
                  <Ionicons name="images-outline" size={30} color="#007bff" />
                  <Text style={{ marginTop: 4, fontSize: 12, color: '#007bff' }}>Pilih Gambar</Text>
                </TouchableOpacity>

                {/* Preview Gambar Terpilih */}
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  style={{ marginVertical: 10 }}
                >
                  {selectedImages.map((uri, idx) => (
                    <Image
                      key={idx}
                      source={{ uri }}
                      style={styles.selectedImage}
                      onError={() => console.log(`Gagal load image ${uri}`)}
                    />
                  ))}
                </ScrollView>

                {/* Text Input Ulasan */}
                <TextInput
                  multiline
                  numberOfLines={4}
                  value={reviewText}
                  onChangeText={setReviewText}
                  placeholder="Masukkan komentar..."
                  style={styles.textInput}
                />

                {/* Tombol Kirim & Batal */}
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
  statusOpen: { color: 'green', fontWeight: 'bold', marginLeft: 100 },
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
  galleryButton: {
    alignItems: 'center',
    marginBottom: 12,
  },
  profileImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 8,
  },
  selectedImageMultiple: {
    width: 100,
    height: 100,
    borderRadius: 6,
    marginRight: 10,
  },
  jamInfo: {
    fontSize: 13,
    color: '#555',
    marginLeft: 5,
  },


});
