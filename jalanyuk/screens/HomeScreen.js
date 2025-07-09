// ...import dan useState tetap sama...
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
import { getAllWisata, getAllPemesanan, getAllRoles, getPenggunaById } from '../API';
import AsyncStorage from '@react-native-async-storage/async-storage';
import QRCode from 'react-native-qrcode-svg';
import { captureRef } from 'react-native-view-shot';
import { Feather } from '@expo/vector-icons';

import { FontAwesome } from '@expo/vector-icons';

import * as MediaLibrary from 'expo-media-library';

const IMAGE_BASE_URL = 'http://172.20.10.3:8080';
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
  const [pengguna, setPengguna] = useState(null);
  const [roleName, setRoleName] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedQRData, setSelectedQRData] = useState(null);
  const qrRef = useRef();

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

  const fetchData = async () => {
    try {
      const userId = await AsyncStorage.getItem('userId');
      if (!userId) return;

      const data = await getPenggunaById(parseInt(userId));
      setPengguna(data);

      const rolesData = await getAllRoles();
      const role = rolesData.find((r) => r.id === data.id_role);
      setRoleName(role?.nama_role || 'Tidak ditemukan');
    } catch (error) {
      console.log('Gagal memuat data:', error);
    } finally {
      setLoading(false);
    }
  };


  const fetchMyOrders = async () => {
    try {
      setOrderLoading(true);
      const userId = await AsyncStorage.getItem('userId');
      const nama = await AsyncStorage.getItem('userNamaLengkap');
      const status = await AsyncStorage.getItem('userStatus');
      console.log('USER ASYNC:', { userId, nama, status });

      if (!userId) return;

      setUser({ id: parseInt(userId), nama_lengkap: nama, status: status });

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
    fetchData();
  }, []);

  useEffect(() => {
    const loadUser = async () => {
      const id = await AsyncStorage.getItem('userId');
      const nama = await AsyncStorage.getItem('userNamaLengkap');
      setUser({ id: parseInt(id), nama_lengkap: nama });
    };
    if (selectedTab === 'Profile') loadUser();
  }, [selectedTab]);

  const filteredData = wisataList.filter((item) =>
    item.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleTabPress = (tabKey) => {
    setSelectedTab(tabKey);
    if (tabKey === 'Favorit') navigation.navigate('Favorit');
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

  const renderBeranda = () => (
    <>
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
                  <Text style={styles.price}>
                    Rp {Number(item.ticketPrice).toLocaleString('id-ID')}
                  </Text>
                  <Text style={styles.subtitle}>
                    {item.location} • ⭐ {item.rating} ({item.reviewCount} ulasan)
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
    </>
  );

  const renderMyOrder = () => (
    <ScrollView
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={fetchMyOrders} />}
    >
      {orderLoading ? (
        <ActivityIndicator size="large" color="#007bff" />
      ) : orders.length === 0 ? (
        <Text style={styles.empty}>Belum ada pemesanan.</Text>
      ) : (
        orders
          .slice()
          .sort((a, b) => {
            if (a.status === 'Pending' && b.status !== 'Pending') return -1;
            if (a.status !== 'Pending' && b.status === 'Pending') return 1;
            return new Date(b.tanggal_pemesanan) - new Date(a.tanggal_pemesanan);
          })
          .map((order, index) => (
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
                  onPress={() => navigation.navigate('PesanTiketScreen', { wisata: { id_pemesanan: order.id } })}
                >
                  <Text style={{ color: '#fff', fontWeight: 'bold' }}>Selesaikan Pemesanan</Text>
                </TouchableOpacity>
              )}

              {order.status === 'Selesai' && (
                <TouchableOpacity
                  style={[styles.qrButton, { backgroundColor: '#007bff', marginTop: 8 }]}
                  onPress={() => navigation.navigate('PesanTiketScreen', { wisata: { id_pemesanan: order.id } })}
                >
                  <Text style={{ color: '#fff', fontWeight: 'bold' }}>Bukti Pemesanan</Text>
                </TouchableOpacity>
              )}
            </View>
          ))

      )}
    </ScrollView>
  );

  const InfoRow = ({ label, value }) => (
    <View style={{ width: '100%', marginBottom: 16 }}>
      <Text style={{ fontWeight: '600', color: '#555' }}>{label}</Text>
      <Text style={{ color: '#222', fontSize: 16 }}>{value}</Text>
    </View>
  );


  const renderProfile = () => (
    <ScrollView contentContainerStyle={{ paddingVertical: 30, alignItems: 'center' }}>
      <View style={styles.profileCard}>
        <Icon name="user-circle" size={100} color="#007bff" style={{ marginBottom: 20 }} />
        {user ? (
          <>
            <InfoRow label="Nama Lengkap" value={user.nama_lengkap} />
            <InfoRow label="Sebagai" value={roleName} />

          </>
        ) : (
          <Text style={{ color: '#666' }}>Data pengguna tidak ditemukan.</Text>
        )}
      </View>
    </ScrollView>
  );


  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {selectedTab === 'Beranda' && renderBeranda()}
        {selectedTab === 'MyOrder' && renderMyOrder()}
        {selectedTab === 'Profile' && renderProfile()}
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

// ...styles tetap sama (tidak diubah)...


const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#f2f2f2' },
  container: { flex: 1, paddingHorizontal: 12 },
  header: { fontSize: 24, fontWeight: 'bold', marginVertical: 12, textAlign: 'center' },
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
  profileCard: {
    backgroundColor: '#fff',
    padding: 24,
    borderRadius: 16,
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 4,
    marginBottom: 20,
  },

  image: { width: '100%', height: 180, backgroundColor: '#ddd' },
  cardContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
  },
  info: { flex: 1, paddingRight: 10 },
  title: { fontSize: 20, fontWeight: 'bold' },
  subtitle: { color: '#666', marginTop: 4 },
  category: { marginTop: 6, fontStyle: 'italic', color: '#007bff' },
  detailButton: {
    backgroundColor: '#007bff',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 10,
  },
  detailButtonText: { color: '#fff', fontWeight: 'bold' },
  label: { fontWeight: 'bold', color: '#555' },
  value: { fontSize: 16, marginBottom: 5 },
  empty: { textAlign: 'center', color: '#888', marginTop: 40 },
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
  price: {
    marginTop: 4,
    color: 'green',
    fontWeight: 'bold',
  },

});
