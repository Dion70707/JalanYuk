import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { postPemesanan, getAllWisata, fetchTransaksiById, handleSelesaikanPemesanan } from '../API';
import AsyncStorage from '@react-native-async-storage/async-storage';
import QRCode from 'react-native-qrcode-svg';
import { captureRef } from 'react-native-view-shot';
import * as MediaLibrary from 'expo-media-library';
import { Feather } from '@expo/vector-icons';
import axios from 'axios';

export default function PemesananScreen({ route }) {
  const { wisata } = route.params;

  const [jumlahTiket, setJumlahTiket] = useState('');
  const [totalHarga, setTotalHarga] = useState(0);
  const [hargaTiket, setHargaTiket] = useState(0);
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);
  const [showQR, setShowQR] = useState(false);
  const strukRef = useRef();
  const [transaksiData, setTransaksiData] = useState(null);
  const qrRef = useRef();

  useEffect(() => {
    const loadTransaksiFromId = async () => {
      if (wisata && wisata.id_pemesanan) {
        try {
          setLoading(true);
          const res = await axios.get(`http://172.20.10.3:8080/trspemesanan?id=${wisata.id_pemesanan}`);
          const transaksi = res.data;

          // Ambil data wisata
          const allWisata = await getAllWisata();
          const matchedWisata = allWisata.find((w) => w.id === transaksi.id_wisata);

          const harga = matchedWisata ? parseInt(matchedWisata.harga_tiket || matchedWisata.harga || 0) : 0;

          setTransaksiData({
            ...transaksi,
            nama_pengguna: user?.nama_lengkap || '',
            nama_wisata: matchedWisata?.nama_wisata || '-',
            harga_tiket: harga,

          });

          setShowQR(true); // langsung tampilkan QR jika datang dari klik list
        } catch (err) {
          console.error('Gagal ambil data transaksi:', err);
          Alert.alert('Error', 'Gagal mengambil data transaksi.');
        } finally {
          setLoading(false);
        }
      }
    };

    loadTransaksiFromId();
  }, [wisata]);


  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);

        // Ambil user
        const userId = await AsyncStorage.getItem('userId');
        const nama = await AsyncStorage.getItem('userNamaLengkap');
        setUser({ id: parseInt(userId), nama_lengkap: nama });

        let transaksi = null;
        let wisataData = null;

        const allWisata = await getAllWisata();

        // Kasus 1: jika hanya id_pemesanan yang dikirim dari route.params
        if (wisata.id_pemesanan) {
          const res = await axios.get(`http://172.20.10.3:8080/trspemesanan?id=${wisata.id_pemesanan}`);
          transaksi = res.data;

          wisataData = allWisata.find((w) => w.id === transaksi.id_wisata);
          const harga = parseInt(wisataData?.harga_tiket || wisataData?.harga || 0);

          setHargaTiket(harga);
          setTotalHarga(transaksi.total_harga || 0);
          setJumlahTiket(transaksi.jumlah_tiket.toString());

          setTransaksiData({
            ...transaksi,
            nama_pengguna: nama,
            nama_wisata: wisataData?.nama_wisata || '-',
            harga_tiket: harga,
          });

          setShowQR(true);
        }
        // Kasus 2: data wisata lengkap dikirim dari screen sebelumnya
        else if (wisata.id) {
          wisataData = allWisata.find((w) => w.id === wisata.id);
          const harga = parseInt(wisataData?.harga_tiket || wisataData?.harga || 0);
          setHargaTiket(harga);
        }
      } catch (err) {
        console.error('❌ Gagal mengambil data wisata / transaksi:', err);
        Alert.alert('Error', 'Gagal memuat data.');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);



  useEffect(() => {
    const fetchHargaTiket = async () => {
      try {
        const allWisata = await getAllWisata();
        const matchedWisata = allWisata.find((w) => w.id === wisata.id);
        if (matchedWisata) {
          setHargaTiket(parseInt(matchedWisata.harga_tiket || matchedWisata.harga || 0));
        } else {
          setHargaTiket(0);
        }
      } catch (err) {
        console.error('Gagal mengambil data wisata:', err);
        setHargaTiket(0);
      }
    };

    fetchHargaTiket();
  }, [wisata]);

  useEffect(() => {
    const getUserData = async () => {
      try {
        const userId = await AsyncStorage.getItem('userId');
        const nama = await AsyncStorage.getItem('userNamaLengkap');
        if (userId && nama) {
          setUser({
            id: parseInt(userId),
            nama_lengkap: nama,
          });
        } else {
          Alert.alert('Error', 'Pengguna belum login.');
        }
      } catch (err) {
        console.error('Gagal mendapatkan data user', err);
      }
    };

    getUserData();
  }, []);

  useEffect(() => {
    const jumlah = parseInt(jumlahTiket || 0);
    if (!isNaN(jumlah)) {
      setTotalHarga(hargaTiket * jumlah);
    } else {
      setTotalHarga(0);
    }
  }, [jumlahTiket, hargaTiket]);

  const handlePemesanan = async () => {
    if (!jumlahTiket || isNaN(jumlahTiket) || parseInt(jumlahTiket) <= 0) {
      Alert.alert('Error', 'Masukkan jumlah tiket yang valid.');
      return;
    }
    if (!user?.id) {
      Alert.alert('Error', 'Pengguna belum login.');
      return;
    }

    const payload = {
      id: 0,
      id_wisata: wisata.id,
      id_pengguna: user.id,
      jumlah_tiket: parseInt(jumlahTiket),
      total_harga: totalHarga,
      tanggal_pemesanan: new Date().toISOString().split('T')[0],
    };

    try {
      setLoading(true);
      const result = await postPemesanan(payload);

      if (result?.result === 200) {
        Alert.alert('✅ Sukses', result.message || 'Pemesanan berhasil dibuat.');

        const transaksi = {
          id: result.id || payload.id,
          status: 'Pending',
          nama_pengguna: user.nama_lengkap,
          nama_wisata: wisata?.nama_wisata || wisata?.name || '-',
          harga_tiket: hargaTiket,
          jumlah_tiket: parseInt(jumlahTiket),
          total_harga: totalHarga,
          tanggal_pemesanan: payload.tanggal_pemesanan,
          id_wisata: wisata.id,
          id_pengguna: user.id,
        };

        console.log('=== Data transaksi berhasil dibuat ===');
        console.log('Payload kirim:', payload);
        console.log('Response backend:', result);
        console.log('Transaksi untuk state:', transaksi);
        console.log('=======================================');

        setTransaksiData(transaksi);
        setShowQR(true);
      } else {
        Alert.alert('❌ Gagal', result.message || 'Terjadi kesalahan saat menyimpan.');
      }
    } catch (error) {
      console.error('Gagal melakukan pemesanan:', error);
      Alert.alert('Error', 'Tidak dapat menghubungi server.');
    } finally {
      setLoading(false);
    }
  };

  const simpanStrukKeGaleri = async () => {
    try {
      const permission = await MediaLibrary.requestPermissionsAsync();
      if (!permission.granted) {
        Alert.alert('Izin Ditolak', 'Aplikasi tidak memiliki izin menyimpan ke galeri.');
        return;
      }

      const uri = await captureRef(strukRef, {
        format: 'png',
        quality: 1,
      });

      const asset = await MediaLibrary.createAssetAsync(uri);
      await MediaLibrary.createAlbumAsync('Bukti-Pemesanan', asset, false);

      Alert.alert('✅ Berhasil', 'Bukti pemesanan berhasil disimpan ke galeri!');
    } catch (error) {
      console.error('❌ Gagal simpan bukti pemesanan:', error);
      Alert.alert('Gagal', 'Terjadi kesalahan saat menyimpan bukti pemesanan.');
    }
  };


  const handleSelesaikan = async () => {
    console.log('✔️ Tombol Selesaikan ditekan');

    if (!transaksiData || !transaksiData.id || transaksiData.id === 0) {
      console.log('❌ Data transaksi tidak valid:', transaksiData);
      Alert.alert('Error', 'Data transaksi tidak valid. Tidak dapat menyelesaikan pemesanan.');
      return;
    }

    try {
      setLoading(true);

      // Ambil data transaksi dari backend berdasarkan ID
      const fullTransaksi = await axios.get(`http://172.20.10.3:8080/trspemesanan?id=${transaksiData.id}`);
      const existingData = fullTransaksi?.data;

      if (!existingData || !existingData.id) {
        Alert.alert('Error', 'Transaksi tidak ditemukan di server.');
        return;
      }

      // Update hanya status menjadi "Selesai"
      const updatePayload = {
        ...existingData,
        status: "Selesai",
      };

      console.log('🚀 Mengirim update PUT:', updatePayload);

      const response = await axios.put('http://172.20.10.3:8080/trspemesanan', updatePayload);

      console.log('✅ Respon dari backend:', response.data);

      if (response?.data?.result === 200) {
        Alert.alert('✅ Berhasil', 'Pemesanan telah diselesaikan!');
        setTransaksiData(prev => ({ ...prev, status: 'Selesai' }));
      } else {
        Alert.alert('❌ Gagal', response?.data?.message || 'Gagal menyelesaikan pemesanan.');
      }

    } catch (err) {
      console.error('Terjadi error saat menyelesaikan pemesanan:', err);
      if (err.response) {
        console.error('Respon error dari backend:', err.response.data);
        Alert.alert('❌ Error', err.response.data?.message || 'Terjadi kesalahan pada server.');
      } else {
        Alert.alert('❌ Error', 'Tidak dapat menghubungi server.');
      }
    } finally {
      setLoading(false);
    }
  };




  const simpanQRKeGaleri = async () => {
    try {
      const permission = await MediaLibrary.requestPermissionsAsync();
      if (!permission.granted) {
        Alert.alert('Izin ditolak', 'Tidak dapat menyimpan gambar tanpa izin.');
        return;
      }

      const uri = await captureRef(qrRef.current, {
        format: 'png',
        quality: 1,
      });

      const asset = await MediaLibrary.createAssetAsync(uri);
      await MediaLibrary.createAlbumAsync('QR-Pemesanan', asset, false);

      Alert.alert('✅ Disimpan', 'QR Code berhasil disimpan ke galeri!');
    } catch (error) {
      console.error('Gagal simpan QR:', error);
      Alert.alert('Gagal', 'Tidak bisa menyimpan QR Code.');
    }
  };

  const renderQRString = () => {
    if (!transaksiData) return '';
    return `Nama: ${transaksiData.nama_pengguna}
Wisata: ${transaksiData.nama_wisata}
Harga Tiket: Rp${transaksiData.harga_tiket}
Jumlah Tiket: ${transaksiData.jumlah_tiket}
Total Harga: Rp${transaksiData.total_harga}
Tanggal: ${transaksiData.tanggal_pemesanan}`;
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>
        {transaksiData?.status === 'Selesai' ? '' : 'Pemesanan Tiket'}
      </Text>

      {transaksiData?.status !== 'Selesai' && (
        <>
          <Text style={styles.label}>Nama Wisata:</Text>
          <Text style={styles.readonly}>
            {transaksiData?.nama_wisata || wisata?.nama_wisata || wisata?.name || '-'}
          </Text>

          <Text style={styles.label}>Harga per Tiket:</Text>
          <Text style={styles.readonly}>Rp {hargaTiket}</Text>

          <Text style={styles.label}>Jumlah Tiket:</Text>
          <TextInput
            style={styles.input}
            keyboardType="number-pad"
            placeholder="Masukkan jumlah tiket"
            value={jumlahTiket}
            onChangeText={setJumlahTiket}
          />

          <Text style={styles.label}>Total Harga:</Text>
          <Text style={styles.total}>Rp {totalHarga}</Text>
        </>
      )}



      {(!transaksiData || (transaksiData.status !== 'Pending' && transaksiData.status !== 'Selesai')) && (
        <TouchableOpacity
          style={[styles.button, loading && { backgroundColor: '#999' }]}
          onPress={handlePemesanan}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Lanjutkan Pemesanan</Text>
          )}
        </TouchableOpacity>
      )}


      {showQR && transaksiData && (
        <View style={{ marginTop: 30, alignItems: 'center' }}>
          {/* Tampilkan struk HANYA jika status "Selesai" */}
          {transaksiData.status === 'Selesai' && (
            <>
              {/* Struk yang akan disimpan */}
              <View ref={strukRef} collapsable={false} style={styles.strukBox}>
                <Text style={styles.strukTitle}> Bukti Pemesanan</Text>

                <View style={styles.strukRow}>
                  <Text style={styles.strukLabel}>Nama</Text>
                  <Text style={styles.strukValue}>{transaksiData.nama_pengguna}</Text>
                </View>

                <View style={styles.strukRow}>
                  <Text style={styles.strukLabel}>Wisata</Text>
                  <Text style={styles.strukValue}>{transaksiData.nama_wisata}</Text>
                </View>

                <View style={styles.strukRow}>
                  <Text style={styles.strukLabel}>Harga</Text>
                  <Text style={styles.strukValue}>Rp {transaksiData.harga_tiket}</Text>
                </View>

                <View style={styles.strukRow}>
                  <Text style={styles.strukLabel}>Jumlah</Text>
                  <Text style={styles.strukValue}>{transaksiData.jumlah_tiket}</Text>
                </View>

                <View style={styles.strukRow}>
                  <Text style={styles.strukLabel}>Total</Text>
                  <Text style={styles.strukValue}>Rp {transaksiData.total_harga}</Text>
                </View>

                <View style={styles.strukRow}>
                  <Text style={styles.strukLabel}>Tanggal</Text>
                  <Text style={styles.strukValue}>{transaksiData.tanggal_pemesanan}</Text>
                </View>

                <View style={styles.strukRow}>
                  <Text style={styles.strukLabel}>Status</Text>
                  <Text style={[styles.strukValue, { color: 'green' }]}>
                    {transaksiData.status}
                  </Text>
                </View>

                <Text style={{ marginTop: 15, fontWeight: 'bold' }}>QR Code:</Text>
                <View
                  style={{ backgroundColor: '#fff', padding: 10, marginTop: 10 }}
                >
                  <QRCode value={renderQRString()} size={200} />
                </View>
              </View>

              
              <TouchableOpacity
                style={[styles.button, { backgroundColor: 'green', marginTop: 20 }]}
                onPress={simpanStrukKeGaleri}
              >
                <Feather name="download" size={20} color="#fff" />
              </TouchableOpacity>

            </>
          )}

          {/* Tombol konfirmasi hanya muncul jika status masih Pending */}
          {transaksiData.status === 'Pending' && (
            <TouchableOpacity
              style={[styles.button, { backgroundColor: 'orange', marginTop: 20 }]}
              onPress={handleSelesaikan}
            >
              <Text style={styles.buttonText}>Konfirmasi Pemesanan</Text>
            </TouchableOpacity>
          )}
        </View>

      )}


    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    paddingBottom: 50,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  label: {
    fontWeight: 'bold',
    marginTop: 15,
  },
  readonly: {
    padding: 10,
    backgroundColor: '#f0f0f0',
    borderRadius: 6,
    marginTop: 4,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    padding: 10,
    marginTop: 4,
  },
  total: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#007bff',
    marginTop: 4,
  },
  button: {
    backgroundColor: '#007bff',
    padding: 15,
    borderRadius: 8,
    marginTop: 30,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  strukContainer: {
    marginTop: 30,
    alignItems: 'center',
  },
  strukBox: {
    width: '100%',
    padding: 20,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    backgroundColor: '#fdfdfd',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  strukTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 15,
  },
  strukRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  strukLabel: {
    fontWeight: '600',
    color: '#555',
  },
  strukValue: {
    fontWeight: 'bold',
    color: '#222',
  },

});
