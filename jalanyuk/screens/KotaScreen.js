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
  TextInput,
} from 'react-native';
import { getAllWisata, getAllKota } from '../API';

const IMAGE_BASE_URL = 'http://10.156.34:8080';
const FALLBACK_IMAGE = 'http://10.156.34:8080';

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
  const [provinsiList, setProvinsiList] = useState([{ id: 0, provinsi: 'Semua' }]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedProvinsi, setSelectedProvinsi] = useState('Semua');
  const [searchQuery, setSearchQuery] = useState('');

  const fetchData = async () => {
    try {
      setLoading(true);
      const [wisataRes, kotaRes] = await Promise.all([
        getAllWisata(),
        getAllKota(),
      ]);

      // Buat map dari id_kota ke provinsi
      const provinsiMap = new Map();
      kotaRes.forEach((k) => {
        if (k.id && k.provinsi) {
          provinsiMap.set(k.id, k.provinsi.trim());
        }
      });

      // Ambil daftar provinsi unik (maks. 5)
      const uniqueProvinsi = Array.from(
        new Set(kotaRes.map((k) => k.provinsi?.trim()).filter(Boolean))
      );
      const limitedProvinsi = uniqueProvinsi.slice(0, 5);

      const provinsiListFinal = [
        { id: 0, provinsi: 'Semua' },
        ...limitedProvinsi.map((nama, i) => ({ id: i + 1, provinsi: nama })),
      ];
      setProvinsiList(provinsiListFinal);

      // Mapping data wisata
      const mappedWisata = wisataRes.map((item) => {
        const provinsi = provinsiMap.get(item.id_kota) || 'Tidak Diketahui';
        return {
          id: item.id,
          name: item.nama_wisata || 'Tanpa Nama',
          location: provinsi,
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
          provinsi: provinsi,
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

  const filteredData = wisataList.filter((item) => {
    const q = searchQuery.toLowerCase();

    const cocokTombol =
      selectedProvinsi === 'Semua'
        ? true
        : item.provinsi?.trim().toLowerCase() === selectedProvinsi.toLowerCase();

    const cocokSearch =
      item.name?.toLowerCase().includes(q) ||
      item.provinsi?.toLowerCase().includes(q) ||
      item.category?.toLowerCase().includes(q) ||
      item.description?.toLowerCase().includes(q) ||
      item.location?.toLowerCase().includes(q);

    return cocokTombol && cocokSearch;
  });

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
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Cari wisata, provinsi, kategori..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor="#aaa"
        />
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.kotaScroll}
      >
        {provinsiList.map((item, index) => (
          <TouchableOpacity
            key={`${item.provinsi}-${index}`}
            style={[
              styles.kotaButton,
              selectedProvinsi.toLowerCase() === item.provinsi?.toLowerCase() &&
                styles.kotaButtonActive,
            ]}
            onPress={() => setSelectedProvinsi(item.provinsi)}
          >
            <Text
              style={[
                styles.kotaText,
                selectedProvinsi.toLowerCase() === item.provinsi?.toLowerCase() &&
                  styles.kotaTextActive,
              ]}
            >
              {item.provinsi}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <Text style={{ padding: 10 }}>
        Menampilkan: {selectedProvinsi} ({filteredData.length} tempat wisata)
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
  searchContainer: {
    paddingHorizontal: 16,
    paddingTop: 10,
    backgroundColor: '#fff',
  },
  searchInput: {
    height: 40,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    paddingHorizontal: 12,
    fontSize: 14,
    backgroundColor: '#f9f9f9',
    color: '#000',
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
