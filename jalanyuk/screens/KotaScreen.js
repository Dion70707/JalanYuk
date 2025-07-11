import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  Image,
  TouchableOpacity,
  SafeAreaView,
  RefreshControl,
  ScrollView,
} from 'react-native';
import { getAllWisata, getAllKota } from '../API';

const IMAGE_BASE_URL = 'http://192.168.136.125:8080';
const FALLBACK_IMAGE = 'http://192.168.136.125:8080';

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

const KotaScreen = ({ navigation }) => {
  const [wisataList, setWisataList] = useState([]);
  const [kotaList, setKotaList] = useState([{ id: 0, nama_kota: 'Semua' }]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedKota, setSelectedKota] = useState('Semua');

  const fetchData = async () => {
    try {
      setLoading(true);
      const [wisataRes, kotaRes] = await Promise.all([
        getAllWisata(),
        getAllKota(),
      ]);

      // Buat peta id_kota -> nama_kota
      const kotaMap = new Map();
      kotaRes.forEach((k) => {
        if (k.id && k.nama_kota) {
          kotaMap.set(k.id, k.nama_kota.trim());
        }
      });

      // Buat daftar kota unik + 'Semua'
      const uniqueKota = Array.from(new Set(kotaRes.map((k) => k.nama_kota.trim())));
      setKotaList([{ id: 0, nama_kota: 'Semua' }, ...uniqueKota.map((nama, i) => ({ id: i + 1, nama_kota: nama }))]);

      // Mapping wisata, tambahkan nama_kota dari id_kota
      const mappedWisata = wisataRes.map((item) => {
        const kota = kotaMap.get(item.id_kota) || 'Tidak Diketahui';
        return {
          id: item.id,
          name: item.nama_wisata || 'Tanpa Nama',
          location: kota,
          rating: item.rating_rata ?? 0,
          reviewCount: item.jumlah_review ?? 0,
          category: item.kategori || 'Kategori tidak tersedia',
          description: item.deskripsi || '',
          image: item.id_galeri
            ? `${IMAGE_BASE_URL}/galeri/${item.id_galeri}/image`
            : FALLBACK_IMAGE,
          latitude: parseFloat(item.koordinat_lat) || 0,
          longitude: parseFloat(item.koordinat_lng) || 0,
          ticketPrice: item.harga_tiket || 0,
          kota: kota,
        };
      });

      setWisataList(mappedWisata);
    } catch (error) {
      console.error('Gagal memuat data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchData().finally(() => setRefreshing(false));
  };

  const filteredData =
    selectedKota === 'Semua'
      ? wisataList
      : wisataList.filter(
          (item) =>
            item.kota.trim().toLowerCase() === selectedKota.trim().toLowerCase()
        );

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <ImageWithFallback uri={item.image} style={styles.image} />
      <View style={styles.cardContent}>
        <View style={styles.info}>
          <Text style={styles.title}>{item.name}</Text>
          <Text style={styles.price}>
            Rp {Number(item.ticketPrice).toLocaleString('id-ID')}
          </Text>
          <Text style={styles.subtitle}>
            {item.location} • ★ {item.rating} ({item.reviewCount} ulasan)
          </Text>
          <Text style={styles.category}>{item.category}</Text>
        </View>
        <TouchableOpacity
          onPress={() => navigation.navigate('Detail', { wisata: item })}
          style={styles.detailButton}
        >
          <Text style={styles.detailButtonText}>Detail</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.kotaScroll}
      >
        {kotaList.map((kota, index) => (
          <TouchableOpacity
            key={`${kota.nama_kota}-${index}`}
            style={[
              styles.kotaButton,
              selectedKota.toLowerCase() === kota.nama_kota.toLowerCase() &&
                styles.kotaButtonActive,
            ]}
            onPress={() => setSelectedKota(kota.nama_kota)}
          >
            <Text
              style={[
                styles.kotaText,
                selectedKota.toLowerCase() === kota.nama_kota.toLowerCase() &&
                  styles.kotaTextActive,
              ]}
            >
              {kota.nama_kota}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <Text style={{ padding: 10 }}>
        Menampilkan: {selectedKota} ({filteredData.length} tempat wisata)
      </Text>

      {loading ? (
        <ActivityIndicator size="large" color="#00aa13" />
      ) : (
        <FlatList
          data={filteredData}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          contentContainerStyle={{ paddingBottom: 20 }}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  kotaScroll: {
    paddingVertical: 10,
    paddingHorizontal: 10,
    backgroundColor: '#f2f2f2',
  },
  kotaButton: {
    minWidth: 80,
    height: 36,
    paddingHorizontal: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 18,
    backgroundColor: '#ddd',
    marginRight: 10,
  },
  kotaButtonActive: {
    backgroundColor: '#00aa13',
  },
  kotaText: {
    color: '#333',
    fontSize: 14,
  },
  kotaTextActive: {
    color: '#fff',
    fontWeight: 'bold',
  },
  card: {
    marginHorizontal: 16,
    marginVertical: 8,
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 3,
  },
  image: {
    height: 180,
    width: '100%',
  },
  cardContent: {
    padding: 12,
  },
  info: {
    marginBottom: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  price: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#00aa13',
    marginBottom: 4,
  },
  subtitle: {
    color: '#666',
    marginBottom: 4,
  },
  category: {
    fontStyle: 'italic',
    color: '#888',
  },
  detailButton: {
    backgroundColor: '#00aa13',
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  detailButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default KotaScreen;
