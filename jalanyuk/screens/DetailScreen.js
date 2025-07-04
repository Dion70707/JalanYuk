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
  Modal,
  TextInput,
  Alert
} from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import { Ionicons, FontAwesome } from '@expo/vector-icons';
import {
  getWisataById,
  getAllGaleri,
  // getLoggedInUser,
  postReview
} from '../API';

export default function DetailScreen({ route, navigation }) {
  const { id } = route.params;

  const [wisata, setWisata] = useState(null);
  const [galeri, setGaleri] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userLocation, setUserLocation] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [reviewText, setReviewText] = useState('');
  const [selectedRating, setSelectedRating] = useState(0);
  const [user, setUser] = useState(null);

  const scrollRef = useRef();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const wisataData = await getWisataById(id);
        const galeriData = await getAllGaleri();
        // const userData = await getLoggedInUser();
        

        setWisata(wisataData);
        setGaleri(galeriData.filter(item => item.wisata_id === id));
        // setUser(userData);
      } catch (error) {
        console.error('Gagal memuat data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') return;

      const location = await Location.getCurrentPositionAsync({});
      setUserLocation({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });
    })();
  }, [id]);

  const submitReview = async () => {
    if (!user) {
      Alert.alert('Login Diperlukan', 'Silakan login untuk memberikan ulasan.');
      return;
    }

    try {
      const reviewPayload = {
        id_wisata: id,
        id_pengguna: user.id,
        rating: selectedRating,
        foto: user.foto || '-',
        komentar: reviewText
      };

      await postReview(reviewPayload);
      Alert.alert('Sukses', 'Ulasan berhasil dikirim.');
      setModalVisible(false);
      setReviewText('');
    } catch (error) {
      Alert.alert('Gagal', 'Tidak dapat mengirim ulasan.');
    }
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#007bff" />
        <Text>Memuat detail wisata...</Text>
      </View>
    );
  }

  if (!wisata) {
    return (
      <View style={styles.centered}>
        <Text>Data wisata tidak ditemukan.</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView ref={scrollRef} style={{ backgroundColor: '#fff' }} contentContainerStyle={{ paddingBottom: 40 }}>
          <Image source={{ uri: wisata.image }} style={styles.image} />

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
          <Text style={styles.locationText}>{wisata.location} • ⭐ {wisata.rating}</Text>

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
                <Marker coordinate={{ latitude: wisata.latitude, longitude: wisata.longitude }} pinColor="tomato" />
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
            <Text style={styles.statusOpen}>Buka</Text><Text> . Tutup Pukul 16.00</Text>
          </View>

          <View style={styles.box}>
            <FontAwesome name="star" size={18} color="#f4c542" />
            <Text style={styles.infoText}>{wisata.rating} ★</Text>
          </View>

          <View style={styles.box}>
            <Ionicons name="call" size={18} color="#007bff" />
            <Text style={styles.infoText}>{wisata.phone}</Text>
          </View>

          <View style={styles.box}>
            <Text style={styles.description}>{wisata.description}</Text>
          </View>

          <Text style={styles.sectionTitle}>Beri Rating</Text>
          <View style={styles.reviewInputContainer}>
            <Image source={{ uri: user?.foto || 'https://i.pravatar.cc/50' }} style={styles.profileImage} />
            <View style={{ flex: 1 }}>
              <Text style={{ marginBottom: 6 }}>Klik bintang untuk memberi ulasan:</Text>
              <View style={{ flexDirection: 'row' }}>
                {[1, 2, 3, 4, 5].map(i => (
                  <TouchableOpacity
                    key={i}
                    onPress={() => {
                      setSelectedRating(i);
                      setModalVisible(true);
                    }}
                  >
                    <FontAwesome
                      name="star"
                      size={40}
                      color={i <= selectedRating ? '#f4c542' : '#ccc'}
                      style={{ marginRight: 5 }}
                    />
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>

          <Modal
            visible={modalVisible}
            animationType="slide"
            transparent={true}
            onRequestClose={() => setModalVisible(false)}
          >
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)' }}>
              <View style={{ backgroundColor: '#fff', padding: 20, borderRadius: 12, width: '90%' }}>
                <Text style={{ fontWeight: 'bold', fontSize: 16, marginBottom: 10 }}>Tulis Komentar</Text>
                <Text style={{ marginBottom: 8 }}>Rating: {selectedRating} ⭐</Text>
                <TextInput
                  multiline
                  numberOfLines={4}
                  value={reviewText}
                  onChangeText={setReviewText}
                  placeholder="Masukkan komentar..."
                  style={{
                    borderColor: '#ccc',
                    borderWidth: 1,
                    padding: 10,
                    borderRadius: 6,
                    textAlignVertical: 'top',
                  }}
                />
                <View style={{ flexDirection: 'row', justifyContent: 'flex-end', marginTop: 12 }}>
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
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
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
