import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { getAllWisata } from '../API';
import Tab from '../components/Tab';
import Notifikasi from '../components/Notifikasi';
import { Image } from 'react-native';

const IMAGE_BASE_URL = 'http://172.20.10.3:8080';
const FALLBACK_IMAGE = 'https://via.placeholder.com/400x200.png?text=No+Image';

// Komponen gambar fallback
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

export default function HomeScreen() {
  const navigation = useNavigation();
  const [search, setSearch] = useState('');
  const [selectedTab, setSelectedTab] = useState('Dashboard');
  const [wisataData, setWisataData] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await getAllWisata();
      const data = Array.isArray(response) ? response : [];

      const mappedData = await Promise.all(
        data.map((item) => {
          const imageUrl = item.id_galeri
            ? `${IMAGE_BASE_URL}/galeri/${item.id_galeri}/image`
            
            : FALLBACK_IMAGE;
            console.log('ID Galeri:', item.id_galeri);


          return {
            id: item.id,
            name: item.nama_wisata || 'Tanpa Nama',
            location: item.alamat || 'Alamat tidak tersedia',
            rating: item.rating_rata ?? 0,
            reviewCount: item.jumlah_review ?? 0,
            category: item.kategori || 'Kategori tidak tersedia',
            description: item.deskripsi || '',
            image: imageUrl,
            latitude: parseFloat(item.koordinat_lat) || 0,
            longitude: parseFloat(item.koordinat_lng) || 0,
          };
        })
      );

      setWisataData(mappedData);
    } catch (error) {
      console.error('Gagal fetch data wisata:', error);
      Notifikasi('Gagal memuat data wisata.');
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [])
  );

  const filteredData = wisataData.filter((item) =>
    item.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.header}>Wisata Indonesia</Text>

        <TextInput
          placeholder="Cari tempat wisata..."
          value={search}
          onChangeText={setSearch}
          style={styles.search}
          placeholderTextColor="#999"
        />

        {loading ? (
          <ActivityIndicator size="large" color="#007bff" style={{ marginTop: 20 }} />
        ) : (
          <FlatList
            data={filteredData}
            keyExtractor={(item) => item.id?.toString()}
            contentContainerStyle={{ paddingBottom: 80 }}
            renderItem={({ item }) => (
              <View style={styles.card}>
                <ImageWithFallback uri={item.image} style={styles.image} />
                <View style={styles.cardContent}>
                  <View style={styles.info}>
                    <Text style={styles.title}>{item.name}</Text>
                    <Text style={styles.subtitle}>
                      {item.location} • ⭐ {item.rating} ({item.reviewCount} ulasan)
                    </Text>
                    <Text style={styles.category}>{item.category}</Text>
                  </View>
                  <TouchableOpacity
                    onPress={() => navigation.navigate('Detail', { id: item.id })}

                    style={styles.detailButton}
                  >
                    <Text style={styles.detailButtonText}>Detail</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          />
        )}
      </View>

      <Tab selectedTab={selectedTab} setSelectedTab={setSelectedTab} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f2f2f2',
  },
  container: {
    flex: 1,
    paddingHorizontal: 12,
    backgroundColor: '#f2f2f2',
  },
  header: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
    textAlign: 'center',
  },
  search: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    backgroundColor: '#fff',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    marginBottom: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  image: {
    width: '100%',
    height: 180,
    backgroundColor: '#ddd',
  },
  cardContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
  },
  info: {
    flex: 1,
    paddingRight: 10,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  subtitle: {
    color: '#666',
    marginTop: 4,
  },
  category: {
    marginTop: 6,
    fontStyle: 'italic',
    color: '#007bff',
  },
  detailButton: {
    backgroundColor: '#007bff',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 10,
  },
  detailButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});
