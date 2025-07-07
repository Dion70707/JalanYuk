import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { getAllWisata, getGaleriById } from '../API';
import Tab from '../components/Tab';
import Notifikasi from '../components/Notifikasi';

// Ganti sesuai IP server lokal kamu
const IMAGE_BASE_URL = 'http://192.168.43.81:8080';

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
  
      let data = Array.isArray(response) ? response : [];
  
      const mappedData = await Promise.all(
        data.map(async (item) => {
          let imageUrl = '';
  
          try {
            const galeriList = await getGaleriByWisataId(item.id);
            if (Array.isArray(galeriList) && galeriList.length > 0) {
              const firstFoto = galeriList[0].url_foto;
              imageUrl = firstFoto.startsWith('http')
                ? firstFoto
                : `${BASE_URL}${firstFoto}`;
            } else {
              console.log(`⚠️ Tidak ada gambar untuk ${item.nama_wisata}`);
            }
          } catch (err) {
            console.warn(`❌ Gagal ambil galeri untuk ${item.nama_wisata}`, err);
          }
  
          return {
            id: item.id,
            name: item.nama_wisata,
            location: item.alamat,
            rating: item.rating_rata,
            reviewCount: item.jumlah_review,
            category: item.kategori,
            description: item.deskripsi,
            image: imageUrl || 'https://via.placeholder.com/400x200.png?text=No+Image',
            latitude: parseFloat(item.koordinat_lat),
            longitude: parseFloat(item.koordinat_lng),
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
            keyExtractor={(item) => item.id?.toString() ?? Math.random().toString()}
            contentContainerStyle={{ paddingBottom: 80 }}
            renderItem={({ item }) => (
              <View style={styles.card}>
                <Image source={{ uri: item.image }} style={styles.image} />
                <View style={styles.cardContent}>
                  <View style={styles.info}>
                    <Text style={styles.title}>{item.name}</Text>
                    <Text style={styles.subtitle}>
                      {item.location} • ⭐ {item.rating} ({item.reviewCount} reviews)
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
