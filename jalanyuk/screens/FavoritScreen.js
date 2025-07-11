import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/FontAwesome';
import { getAllWisata } from '../API';
import ImageWithFallback from '../components/ImageWithFallback';

const IMAGE_BASE_URL = 'http://172.20.10.9:8080';
const FALLBACK_IMAGE = 'https://via.placeholder.com/400x200.png?text=No+Image';

const TABS = [
  { key: 'Beranda', label: 'Beranda', icon: 'home' },
  { key: 'MyOrder', label: 'My Order', icon: 'ticket' },
  { key: 'Favorit', label: 'Favorit', icon: 'heart' },
  { key: 'Profile', label: 'Profile', icon: 'user' },
];

export default function FavoritScreen({ navigation }) {
  const [favoriteIds, setFavoriteIds] = useState([]);
  const [wisataList, setWisataList] = useState([]);
  const [loading, setLoading] = useState(true);

 useEffect(() => {
  const unsubscribe = navigation.addListener('focus', () => {
    loadFavorites();
    fetchWisataData();
  });
  return unsubscribe;
}, [navigation]);


  const handleTabPress = (tabKey) => {
    if (tabKey === 'Favorit') return;
    navigation.navigate(tabKey); // Ensure screens 'Beranda', 'MyOrder', and 'Profile' are registered
  };

  const loadFavorites = async () => {
  try {
    const userId = await AsyncStorage.getItem('userId');
    if (!userId) return;

    const res = await fetch(`http://172.20.10.9:8080/TrsFavorit/aktif/${userId}`);
    const data = await res.json();

    const ids = data.map(item => item.idWisata); // ambil hanya ID wisata
    setFavoriteIds(ids);
  } catch (err) {
    console.error('Gagal mengambil favorit:', err);
  }
};
const fetchWisataData = async () => {
  try {
    const response = await getAllWisata();
    const data = Array.isArray(response) ? response : [];

    const mappedData = data.map((item) => ({
      id: item.id,
      name: item.nama_wisata || 'Tanpa Nama',
      location: item.alamat || 'Alamat tidak tersedia',
      rating: item.rating_rata ?? 0,
      reviewCount: item.jumlah_review ?? 0,
      category: item.kategori || 'Kategori tidak tersedia',
      image: item.id_galeri
        ? `${IMAGE_BASE_URL}/galeri/${item.id_galeri}/image`
        : FALLBACK_IMAGE,
      ticketPrice: item.harga_tiket || 0,
    }));

    setWisataList(mappedData);
  } catch (err) {
    console.error('Gagal memuat wisata:', err);
  } finally {
    setLoading(false);
  }
};

 const toggleFavorite = async (idWisata) => {
  try {
    const userId = await AsyncStorage.getItem('userId');
    if (!userId) return;

    // Cek apakah wisata ini sudah difavoritkan
    const res = await fetch(`http://172.20.10.9:8080/TrsFavorit/aktif/${userId}`);
    const data = await res.json();
    const existing = data.find(item => item.idWisata === idWisata);

    if (existing) {
      const updatedStatus = existing.favorit === 1 ? 0 : 1;
      await fetch('http://172.20.10.9:8080/TrsFavorit', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          idPengguna: parseInt(userId),
          idWisata: idWisata,
          favorit: updatedStatus,
        }),
      });
    } else {
      await fetch('http://172.20.10.9:8080/TrsFavorit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          idPengguna: parseInt(userId),
          idWisata: idWisata,
          favorit: 1,
        }),
      });
    }

    await loadFavorites(); // refresh list favorit
  } catch (err) {
    console.error('Gagal toggle favorit:', err);
  }
};


  const favoriteWisata = wisataList.filter((item) =>
    favoriteIds.includes(item.id)
  );

  return (
      <View style={styles.container}>
        <Text style={styles.header}>Wisata Favorit</Text>

        {loading ? (
          <ActivityIndicator size="large" color="#007bff" />
        ) : favoriteWisata.length === 0 ? (
          <Text style={styles.empty}>Belum ada wisata favorit.</Text>
        ) : (
          <FlatList
            data={favoriteWisata}
            keyExtractor={(item) => item.id.toString()}
            contentContainerStyle={{ paddingBottom: 100 }}
            renderItem={({ item }) => (
              <View style={styles.card}>
                

                <ImageWithFallback uri={item.image} style={styles.image} />
                <View style={styles.cardContent}>
                  <View style={styles.info}>
                    <Text style={styles.title}>{item.name}</Text>
                    <Text style={styles.subtitle}>
                      {item.location} • ★ {item.rating} ({item.reviewCount} ulasan)
                    </Text>
                    <Text style={styles.category}>{item.category}</Text>
                  </View>

                 {/* Love icon + Tombol Detail dalam satu baris */}
                  <View style={styles.actionRow}>
                    <TouchableOpacity
                      onPress={() => toggleFavorite(item.id)}
                      style={styles.favoriteIconInline}
                    >
                      <Icon
                        name={favoriteIds.includes(item.id) ? 'heart' : 'heart-o'}
                        size={20}
                        color="red"
                      />
                    </TouchableOpacity>


                  <TouchableOpacity
                    onPress={() => navigation.navigate('Detail', { wisata: item })}
                    style={styles.detailButton}
                  >
                    <Text style={styles.detailButtonText}>Detail</Text>
                  </TouchableOpacity>
                </View>
              </View>
              </View>
          )}
        />
      )}

      {/* Tab Bar */}
      <View style={styles.tabBar}>
        {TABS.map((tab) => (
          <TouchableOpacity
            key={tab.key}
            style={styles.tabItem}
            onPress={() => handleTabPress(tab.key)}
          >
            <Icon name={tab.icon} size={20} color="#fff" />
            <Text style={styles.tabLabel}>{tab.label}</Text>
            {tab.key === 'Favorit' && <View style={styles.tabIndicator} />}
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 12, backgroundColor: '#f2f2f2' },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  empty: { textAlign: 'center', color: '#888', marginTop: 40 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    marginBottom: 16,
    padding: 16,
    elevation: 4,
  },
  image: { width: '100%', height: 180, backgroundColor: '#ddd' },
  cardContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
  },
  info: { flex: 1, paddingRight: 10 },
  title: { fontSize: 18, fontWeight: 'bold' },
  subtitle: { color: '#666', marginTop: 4 },
  category: { marginTop: 6, fontStyle: 'italic', color: '#007bff' },
  detailButton: {
    backgroundColor: '#007bff',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 10,
  },
  detailButtonText: { color: '#fff', fontWeight: 'bold' },
  favoriteIcon: {
    position: 'absolute',
    top: 12,
    right: 12,
    zIndex: 10,
  },

  // Tab Bar Styles
  tabBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    backgroundColor: '#007bff',
    paddingTop: 10,
    paddingBottom: Platform.OS === 'ios' ? 20 : 12,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  tabItem: { alignItems: 'center', flex: 1 },
  tabIcon: { marginBottom: 2 },
  tabLabel: { color: '#fff', fontSize: 12, marginTop: 2 },
  tabIndicator: {
    height: 4,
    backgroundColor: '#fff',
    borderRadius: 2,
    marginTop: 6,
    width: '50%',
    alignSelf: 'center',
  },
  actionRow: {
  flexDirection: 'row',
  justifyContent: 'flex-end',
  alignItems: 'center',
  marginTop: 10,
},

favoriteIconInline: {
  marginRight: 10,
},

});
