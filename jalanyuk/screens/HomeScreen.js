import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  StyleSheet,
  SafeAreaView,
  Platform,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import { getAllWisata, getImageUrlById } from '../API';

const TABS = [
  { key: 'Beranda', label: 'Beranda', icon: 'home' },
  { key: 'Favorit', label: 'Favorit', icon: 'heart' },
  { key: 'MyOrder', label: 'My Order', icon: 'ticket' },
  { key: 'Profile', label: 'Profile', icon: 'user' },
];

export default function HomeScreen({ navigation }) {
  const [search, setSearch] = useState('');
  const [selectedTab, setSelectedTab] = useState('Beranda');
  const [wisataList, setWisataList] = useState([]);
  const [loading, setLoading] = useState(true);

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
      console.error('Gagal memuat data wisata:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWisataData();
  }, []);

  const filteredData = wisataList.filter((item) =>
    item.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleTabPress = (tabKey) => {
    setSelectedTab(tabKey);
    if (tabKey === 'Favorit') navigation.navigate('Favorit');
    else if (tabKey === 'Profile') navigation.navigate('Profile');
    else if (tabKey === 'MyOrder') navigation.navigate('MyOrder');
  };

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <Image source={{ uri: item.imageUrl }} style={styles.image} />
      <View style={styles.cardContent}>
        <View style={styles.info}>
          <Text style={styles.title}>{item.name}</Text>
          <Text style={styles.subtitle}>
            {item.location} • ⭐ {item.rating ?? 0} ({item.reviewCount ?? 0} reviews)
          </Text>
          <Text style={styles.category}>{item.kategori}</Text>
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
          <ActivityIndicator size="large" color="#007bff" />
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
      <View style={styles.tabBar}>
        {TABS.map((tab) => (
          <TouchableOpacity
            key={tab.key}
            style={styles.tabItem}
            onPress={() => handleTabPress(tab.key)}
          >
            <Icon name={tab.icon} size={20} color="#fff" style={styles.tabIcon} />
            <Text style={styles.tabLabel}>{tab.label}</Text>
            {selectedTab === tab.key && <View style={styles.tabIndicator} />}
          </TouchableOpacity>
        ))}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#f2f2f2' },
  container: { flex: 1, paddingHorizontal: 12, backgroundColor: '#f2f2f2' },
  header: { fontSize: 28, fontWeight: 'bold', color: '#333', marginBottom: 12, textAlign: 'center' },
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
  info: { flex: 1, paddingRight: 10 },
  title: { fontSize: 20, fontWeight: 'bold', color: '#333' },
  subtitle: { color: '#666', marginTop: 4 },
  category: { marginTop: 6, fontStyle: 'italic', color: '#007bff' },
  detailButton: {
    backgroundColor: '#007bff',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 10,
  },
  detailButtonText: { color: '#fff', fontWeight: 'bold' },
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
});
