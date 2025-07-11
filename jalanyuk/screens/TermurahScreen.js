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
import { getAllWisata } from '../API';

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

const priceFilters = [
  { label: 'Semua', min: 0, max: Infinity },
  { label: '< 10rb', min: 0, max: 10000 },
  { label: '10rb - 50rb', min: 10000, max: 50000 },
  { label: '> 50rb', min: 50000, max: Infinity },
];

const TermurahScreen = ({ navigation }) => {
  const [wisataList, setWisataList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState(priceFilters[0]);

  const fetchWisataData = async () => {
    try {
      setLoading(true);
      const response = await getAllWisata();
      const data = Array.isArray(response) ? response : [];
  
      const mappedData = await Promise.all(
        data.map((item) => {
          const imageUrl = item.id_galeri
            ? `${IMAGE_BASE_URL}/galeri/${item.id_galeri}/image`
            : FALLBACK_IMAGE;
  
          // Ekstrak kota dari alamat (misalnya setelah koma terakhir)
          const kota = item.alamat?.split(',').pop()?.trim() || 'Tidak Diketahui';
  
          return {
            id: item.id,
            name: item.nama_wisata || 'Tanpa Nama',
            location: kota, // Ganti alamat dengan nama kota
            rating: item.rating_rata ?? 0,
            reviewCount: item.jumlah_review ?? 0,
            category: item.kategori || 'Kategori tidak tersedia',
            description: item.deskripsi || '',
            image: imageUrl,
            latitude: parseFloat(item.koordinat_lat) || 0,
            longitude: parseFloat(item.koordinat_lng) || 0,
            ticketPrice: item.harga_tiket || 0,
            kota: kota,
          };
        })
      );
  
      setWisataList(mappedData);
    } catch (error) {
      console.error('Gagal memuat data wisata:', error);
    } finally {
      setLoading(false);
    }
  };
  

  useEffect(() => {
    fetchWisataData();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchWisataData().finally(() => setRefreshing(false));
  };

  const filteredData = wisataList.filter(
    (item) =>
      item.ticketPrice >= selectedFilter.min &&
      item.ticketPrice <= selectedFilter.max
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
          <Text style={styles.category}>Kategori: {item.category}</Text>
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
      {/* Filter Harga */}
      <View style={styles.filterContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {priceFilters.map((filter) => (
            <TouchableOpacity
              key={filter.label}
              style={[
                styles.filterButton,
                selectedFilter.label === filter.label && styles.filterButtonActive,
              ]}
              onPress={() => setSelectedFilter(filter)}
            >
              <Text
                style={[
                  styles.filterText,
                  selectedFilter.label === filter.label && styles.filterTextActive,
                ]}
              >
                {filter.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#00aa13" />
      ) : (
        <FlatList
          data={filteredData}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
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
  filterContainer: {
    paddingVertical: 10,
    paddingHorizontal: 10,
    backgroundColor: '#f0f0f0',
  },
  filterButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: '#ddd',
    borderRadius: 20,
    marginRight: 10,
  },
  filterButtonActive: {
    backgroundColor: '#00aa13',
  },
  filterText: {
    color: '#333',
    fontSize: 14,
  },
  filterTextActive: {
    color: '#fff',
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

export default TermurahScreen;
