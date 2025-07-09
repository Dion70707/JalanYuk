import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getAllPemesanan, getAllWisata } from '../API';

export default function MyOrder() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchMyOrders = async () => {
    try {
      const userId = await AsyncStorage.getItem('userId');
      if (!userId) return;

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
            nama_wisata: matchedWisata?.nama_wisata || matchedWisata?.name || 'Wisata tidak ditemukan',
          };
        });

      setOrders(filtered);
    } catch (err) {
      console.error('Gagal mengambil data pesanan:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchMyOrders();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchMyOrders();
  };

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <Text style={styles.title}>Riwayat Pemesanan</Text>

      {loading ? (
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
          </View>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  card: {
    backgroundColor: '#f9f9f9',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 5,
    elevation: 3,
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
    fontSize: 16,
  },
});
