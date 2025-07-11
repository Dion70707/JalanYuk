import React, { useState, useEffect, useRef } from 'react';
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
  Image,
  ScrollView,
  RefreshControl,
  Alert,
  Modal,
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import { getAllWisata, getAllPemesanan,getFavoritList, addFavorit, softDeleteFavorit } from '../API';
import AsyncStorage from '@react-native-async-storage/async-storage';
import QRCode from 'react-native-qrcode-svg';
import { captureRef } from 'react-native-view-shot';
import * as MediaLibrary from 'expo-media-library';


const IMAGE_BASE_URL = 'http://172.20.10.9:8080';
const FALLBACK_IMAGE = 'http://172.20.10.9:8080';


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

const TABS = [
  { key: 'Beranda', label: 'Beranda', icon: 'home' },
  { key: 'MyOrder', label: 'My Order', icon: 'ticket' },
  { key: 'Favorit', label: 'Favorit', icon: 'heart' },
  { key: 'Profile', label: 'Profile', icon: 'user' },
];

export default function HomeScreen({ navigation }) {
  const [search, setSearch] = useState('');
  const [selectedTab, setSelectedTab] = useState('Beranda');
  const [wisataList, setWisataList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState([]);
  const [orderLoading, setOrderLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [user, setUser] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedQRData, setSelectedQRData] = useState(null);
  const qrRef = useRef();
  const [activeFilter, setActiveFilter] = useState('Semua');
  const [favoritData, setFavoritData] = useState([]);


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
            location: item.alamat || 'Alamat tidak tersedia',
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

  const fetchMyOrders = async () => {
    try {
      setOrderLoading(true);
      const userId = await AsyncStorage.getItem('userId');
      const nama = await AsyncStorage.getItem('userNamaLengkap');
      if (!userId) return;

      setUser({ id: parseInt(userId), nama_lengkap: nama });

      const [allOrders, allWisata] = await Promise.all([
        getAllPemesanan(),
        getAllWisata(),
      ]);

      const filtered = allOrders
        .filter((order) => order.id_pengguna === parseInt(userId))
        .map((order) => {
          const matchedWisata = allWisata.find((w) => w.id === order.id_wisata);
          return {
            ...order,
            nama_wisata: matchedWisata?.nama_wisata || 'Wisata tidak ditemukan',
          };
        });

      setOrders(filtered);
    } catch (err) {
      console.error('Gagal mengambil data pesanan:', err);
    } finally {
      setOrderLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchWisataData();
    fetchMyOrders();
    loadFavorites();

  }, []);
  const loadFavorites = async () => {
  try {
    const res = await getFavoritList();
    const userId = await AsyncStorage.getItem('userId');
    if (!userId) return;
    console.log(res.data)

    const data = res.data || [];

    const userFavorit = data.filter(item => item.idPengguna === parseInt(userId));
    
    console.log("🔥 favoritData setelah load:", userFavorit);
setFavoritData(userFavorit);

  } catch (error) {
    console.error('Gagal mengambil data favorit:', error);
  }
};


const getFavoritByWisataId = (idWisata) => {
  if (!favoritData || !Array.isArray(favoritData)) {
    console.warn('❌ favoritData belum tersedia atau bukan array.');
    return null;
  }

  if (!user?.id) {
    console.warn('❌ ID user tidak ditemukan.');
    return null;
  }

  console.log(favoritData)
  

  const result = favoritData.find(
    (item) => item.idWisata === idWisata && item.idPengguna === user.id
  );


  console.log(`🔍 Cek favorit untuk wisata ${idWisata} oleh user ${user.id}:`, result);
  return result;
};


  const toggleFavorite = async (idWisata) => {
  const userId = user?.id;
  if (!userId) return;

  const existing = getFavoritByWisataId(idWisata);

   try {
    if (existing) {
      const updatedStatus = existing.favorit === 1 ? 0 : 1;

      await fetch('http://172.20.10.9:8080/TrsFavorit', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          idPengguna: userId,
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
          idPengguna: userId,
          idWisata: idWisata,
          favorit: 1,
        }),
      });
    }

    await loadFavorites(); // refresh ulang setelah update
  } catch (err) {
    console.error('Gagal mengubah status favorit:', err);
    Alert.alert('Error', 'Terjadi kesalahan saat mengubah favorit.');
  }
};



  const filteredData = wisataList
  .filter((item) =>
    item.name.toLowerCase().includes(search.toLowerCase())
  )
  .sort((a, b) => {
    const kotaA = a.kota.toLowerCase();
    const kotaB = b.kota.toLowerCase();

    if (kotaA < kotaB) return -1;
    if (kotaA > kotaB) return 1;

    // Jika kota sama, urutkan berdasarkan nama wisata
    return a.name.localeCompare(b.name);
  });



  const handleTabPress = (tabKey) => {
    setSelectedTab(tabKey);
    if (tabKey === 'Favorit') navigation.navigate('FavoritScreen');
    else if (tabKey === 'Profile') navigation.navigate('Profile');
  };
  

  const renderQRString = (order) => {
    return `Nama: ${user?.nama_lengkap}\nWisata: ${order.nama_wisata}\nJumlah: ${order.jumlah_tiket}\nTotal: Rp${order.total_harga}\nTanggal: ${order.tanggal_pemesanan}`;
  };

  const saveQRToGallery = async () => {
    try {
      const permission = await MediaLibrary.requestPermissionsAsync();
      if (!permission.granted) {
        Alert.alert('Izin Ditolak', 'Tidak dapat menyimpan gambar tanpa izin.');
        return;
      }

      const uri = await captureRef(qrRef, { format: 'png', quality: 1 });
      const asset = await MediaLibrary.createAssetAsync(uri);
      await MediaLibrary.createAlbumAsync('QR-Pemesanan', asset, false);

      Alert.alert('Sukses', 'QR Code berhasil disimpan ke galeri!');
    } catch (err) {
      console.error('Gagal menyimpan QR:', err);
      Alert.alert('Error', 'Gagal menyimpan QR.');
    }
  };
  const filteredList = wisataList.filter((item) =>
    item.name.toLowerCase().includes(search.toLowerCase())
  );
  
  const sortedSliderList = [...filteredList].sort((a, b) => {
    if (activeFilter === 'Rating') return b.rating - a.rating;
    if (activeFilter === 'Harga') return a.ticketPrice - b.ticketPrice;
    return 0; // 'Semua'
  });
  
  const renderBeranda = () => {
    const filteredData = wisataList
      .filter((item) =>
        item.name.toLowerCase().includes(search.toLowerCase())
      )
      .sort((a, b) => {
        const kotaA = (a.kota || '').toLowerCase();
        const kotaB = (b.kota || '').toLowerCase();
        if (kotaA < kotaB) return -1;
        if (kotaA > kotaB) return 1;
        return a.name.localeCompare(b.name);
      });
  
    const sortedSliderList = [...filteredData].sort((a, b) => {
      if (activeFilter === 'Rating') return b.rating - a.rating;
      if (activeFilter === 'Harga') return a.ticketPrice - b.ticketPrice;
      return 0;
    });
  
    return (
      <>
        <Text style={styles.header}>Wisata Indonesia</Text>
  
        {/* 🔍 Input Pencarian */}
        <TextInput
          placeholder="Cari tempat wisata..."
          value={search}
          onChangeText={setSearch}
          style={styles.search}
          placeholderTextColor="#999"
        />
  
        {/* 🎛️ Filter Slider */}
        <View style={styles.filterSlider}>
          {['Semua', 'Rating', 'Harga'].map((filter) => (
            <TouchableOpacity
              key={filter}
              onPress={() => setActiveFilter(filter)}
              style={[
                styles.filterButton,
                activeFilter === filter && styles.filterButtonActive,
              ]}
            >
              <Text
                style={[
                  styles.filterButtonText,
                  activeFilter === filter && styles.filterButtonTextActive,
                ]}
              >
                {filter}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
  
        {/* 🖼️ Filter Cepat Slider */}
        <ScrollView
  horizontal
  showsHorizontalScrollIndicator={false}
  style={{ marginBottom: 16 }}
  contentContainerStyle={{ paddingHorizontal: 4 }}
>
  {/* Rating */}
  <TouchableOpacity
    style={[styles.filterCard, { marginRight: 12 }]}
    onPress={() =>
      navigation.navigate('TopRatingScreen', {
        data: wisataList,
      })
    }
  >
    <ImageWithFallback
      uri={[...wisataList].sort((a, b) => b.rating - a.rating)[0]?.image || FALLBACK_IMAGE}
      style={styles.filterCardImage}
    />
    <Text style={styles.filterCardText}>Top Rating</Text>
  </TouchableOpacity>

  {/* Harga */}
  <TouchableOpacity
    style={[styles.filterCard, { marginRight: 12 }]}
    onPress={() =>
      navigation.navigate('TermurahScreen', {
        data: wisataList,
      })
    }
  >
    <ImageWithFallback
      uri={[...wisataList].sort((a, b) => a.ticketPrice - b.ticketPrice)[0]?.image || FALLBACK_IMAGE}
      style={styles.filterCardImage}
    />
    <Text style={styles.filterCardText}>Termurah</Text>
  </TouchableOpacity>

  {/* Kota */}
  <TouchableOpacity
    style={styles.filterCard}
    onPress={() =>
      navigation.navigate('KotaScreen', {
        data: wisataList,
      })
    }
  >
    <ImageWithFallback
      uri={[...wisataList].sort((a, b) => a.kota.localeCompare(b.kota))[0]?.image || FALLBACK_IMAGE}
      style={styles.filterCardImage}
    />
    <Text style={styles.filterCardText}>Kota</Text>
  </TouchableOpacity>
</ScrollView>

  
       
  
        {/* 📃 Daftar Wisata Berdasarkan Kota */}
        {loading ? (
          <ActivityIndicator size="large" color="#007bff" />
        ) : (
          <FlatList
            data={filteredData}
            keyExtractor={(item) => item.id?.toString()}
            contentContainerStyle={{ paddingBottom: 80 }}
            renderItem={({ item, index }) => {
              const isFirstItem = index === 0;
              const isNewCity =
                isFirstItem || item.kota !== filteredData[index - 1].kota;
  
              return (
                <View>
                  {isNewCity && (
                    <Text style={styles.cityHeader}>{item.kota}</Text>
                  )}
  
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

                      {/* Wrapper untuk tombol dan ikon love */}
                        <View style={styles.actionRow}>
                          {/* Favorite Icon di kiri */}
                          <TouchableOpacity
                            onPress={() => toggleFavorite(item.id)}
                            style={styles.favoriteIconInline}
                          >
                            <Icon
                              name={
                                getFavoritByWisataId(item.id)?.favorit === 1
                                  ? 'heart'
                                  : 'heart-o'
                              }
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
              );
            }}
          />
        )}
      </>
    );
  };
  
  

  const renderMyOrder = () => (
    <ScrollView
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={fetchMyOrders} />}
    >

      {orderLoading ? (
        <ActivityIndicator size="large" color="#007bff" />
      ) : orders.length === 0 ? (
        <Text style={styles.empty}>Belum ada pemesanan.</Text>
      ) : (
        orders.map((order, index) => (
          <View key={index} style={styles.card}>
            <Text style={styles.label}>Nama Wisata:</Text>
            <Text style={styles.value}>{order.nama_wisata}</Text>

            <Text style={styles.label}>Jumlah Tiket:</Text>
            <Text style={styles.value}>{order.jumlah_tiket}</Text>

            <Text style={styles.label}>Total Harga:</Text>
            <Text style={styles.value}>Rp {order.total_harga}</Text>

            <Text style={styles.label}>Tanggal Pemesanan:</Text>
            <Text style={styles.value}>{order.tanggal_pemesanan}</Text>

            <Text style={styles.label}>Status:</Text>
            <Text
              style={[
                styles.value,
                order.status === 'Pending'
                  ? { color: 'orange', fontWeight: 'bold' }
                  : order.status === 'Selesai'
                    ? { color: 'green', fontWeight: 'bold' }
                    : { color: '#555' },
              ]}
            >
              {order.status}
            </Text>

            <TouchableOpacity
              style={styles.qrButton}
              onPress={() => {
                setSelectedQRData(order);
                setModalVisible(true);
              }}
            >
              <Text style={{ color: '#fff', fontWeight: 'bold' }}>Lihat QR</Text>
            </TouchableOpacity>

            {order.status === 'Pending' && (
              <TouchableOpacity
                style={[styles.qrButton, { backgroundColor: 'orange', marginTop: 8 }]}
                onPress={() => navigation.navigate('PesanTiketScreen', { wisata: { id: order.id_wisata } })}
              >
                <Text style={{ color: '#fff', fontWeight: 'bold' }}> Selesaikan Pemesanan</Text>
              </TouchableOpacity>
            )}
          </View>
        ))

      )}
    </ScrollView>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {selectedTab === 'Beranda' && renderBeranda()}
        {selectedTab === 'MyOrder' && renderMyOrder()}
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

      {/* Modal QR */}
      <Modal visible={modalVisible} transparent animationType="fade">
        <View style={styles.modalBackground}>
          <View style={styles.modalContent}>
            <View ref={qrRef} collapsable={false} style={styles.qrContainer}>
              {selectedQRData && (
                <QRCode value={renderQRString(selectedQRData)} size={200} />
              )}
            </View>
            <TouchableOpacity style={styles.qrSave} onPress={saveQRToGallery}>
              <Text style={{ color: '#fff', fontWeight: 'bold' }}>Simpan QR</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.qrClose}>
              <Text style={{ color: '#007bff' }}>Tutup</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginVertical: 12,
    textAlign: 'center',
  },
  search: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 12,
    padding: 12,
    backgroundColor: '#fff',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    marginBottom: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
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
    marginTop: 12,
  },
  info: {
    flex: 1,
    paddingRight: 10,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
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
  price: {
    marginTop: 4,
    color: 'green',
    fontWeight: 'bold',
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
  label: {
    fontWeight: 'bold',
    color: '#555',
  },
  value: {
    fontSize: 16,
    marginBottom: 5,
  },
  empty: {
    textAlign: 'center',
    color: '#888',
    marginTop: 40,
  },

  // Tab Bar
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
  tabItem: {
    alignItems: 'center',
    flex: 1,
  },
  tabIcon: {
    marginBottom: 2,
  },
  tabLabel: {
    color: '#fff',
    fontSize: 12,
    marginTop: 2,
  },
  tabIndicator: {
    height: 4,
    backgroundColor: '#fff',
    borderRadius: 2,
    marginTop: 6,
    width: '50%',
    alignSelf: 'center',
  },

  // QR Code
  qrButton: {
    marginTop: 10,
    backgroundColor: 'green',
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  modalBackground: {
    flex: 1,
    backgroundColor: '#000000aa',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
  },
  qrContainer: {
    padding: 10,
    backgroundColor: '#fff',
  },
  qrSave: {
    backgroundColor: '#007bff',
    padding: 10,
    marginTop: 12,
    borderRadius: 8,
  },
  qrClose: {
    marginTop: 10,
  },

  // Filters
  filterSlider: {
    flexDirection: 'row',
    marginTop: 12,
    marginBottom: 10,
  },
  filterButton: {
    paddingVertical: 6,
    paddingHorizontal: 14,
    backgroundColor: '#ddd',
    borderRadius: 20,
    marginRight: 10,
  },
  filterButtonActive: {
    backgroundColor: '#007bff',
  },
  filterButtonText: {
    color: '#333',
  },
  filterButtonTextActive: {
    color: '#fff',
    fontWeight: 'bold',
  },

  // Slider & Cards
  sliderTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
    paddingHorizontal: 12,
  },
  sliderContainer: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  sliderCard: {
    width: 160,
    marginRight: 12,
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 3,
  },
  sliderImage: {
    width: '100%',
    height: 100,
    backgroundColor: '#ccc',
  },
  sliderName: {
    padding: 8,
    fontWeight: 'bold',
    fontSize: 14,
  },
  detail: {
    paddingHorizontal: 8,
    fontSize: 12,
    color: '#666',
    marginBottom: 8,
  },
  favoriteIcon: {
    position: 'absolute',
    top: 12,
    right: 12,
    zIndex: 10,
  },

  // Filter Card
  filterCard: {
    width: 140,
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 3,
  },
  filterCardImage: {
    width: '100%',
    height: 100,
    backgroundColor: '#ccc',
  },
  filterCardText: {
    padding: 8,
    fontWeight: 'bold',
    textAlign: 'center',
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
