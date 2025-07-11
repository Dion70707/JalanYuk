import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import {
  postPemesanan,
  getAllWisata,
} from '../API';
import AsyncStorage from '@react-native-async-storage/async-storage';
import QRCode from 'react-native-qrcode-svg';
import { captureRef } from 'react-native-view-shot';
import * as MediaLibrary from 'expo-media-library';
import { Feather } from '@expo/vector-icons';
import axios from 'axios';

// 🔔 Import reusable notification component
import Notifikasi from '../components/Notifikasi';

// Dapatkan lebar layar sekali saja
const { width } = Dimensions.get('window');

export default function PemesananScreen({ route }) {
  const { wisata } = route.params;

  const [jumlahTiket, setJumlahTiket] = useState('');
  const [totalHarga, setTotalHarga] = useState(0);
  const [hargaTiket, setHargaTiket] = useState(0);
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);
  const [showQR, setShowQR] = useState(false);
  const [transaksiData, setTransaksiData] = useState(null);
  const strukRef = useRef();
  const qrRef = useRef();
  const [notif, setNotif] = useState({
    visible: false,
    message: '',
    type: 'success', 
  });

  const showNotif = (message, type = 'success') => {
    setNotif({ visible: true, message, type });
  };

  useEffect(() => {
    const loadTransaksiFromId = async () => {
      if (wisata && wisata.id_pemesanan) {
        try {
          setLoading(true);
          const res = await axios.get(
            `http://172.20.10.9:8080/trspemesanan?id=${wisata.id_pemesanan}`,
          );
          const transaksi = res.data;

          const allWisata = await getAllWisata();
          const matchedWisata = allWisata.find((w) => w.id === transaksi.id_wisata);

          const harga = matchedWisata ? parseInt(matchedWisata.harga_tiket || matchedWisata.harga || 0, 10) : 0;

          setTransaksiData({
            ...transaksi,
            nama_pengguna: user?.nama_lengkap || '',
            nama_wisata: matchedWisata?.nama_wisata || '-',
            harga_tiket: harga,
          });

          setShowQR(true); 
        } catch (err) {
          console.error('Gagal ambil data transaksi:', err);
          showNotif('Gagal mengambil data transaksi.', 'error');
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

        const userId = await AsyncStorage.getItem('userId');
        const nama = await AsyncStorage.getItem('userNamaLengkap');
        setUser({ id: parseInt(userId, 10), nama_lengkap: nama });

        let transaksi = null;
        let wisataData = null;

        const allWisata = await getAllWisata();

        if (wisata.id_pemesanan) {
          const res = await axios.get(
            `http://172.20.10.9:8080/trspemesanan?id=${wisata.id_pemesanan}`,
          );
          transaksi = res.data;

          wisataData = allWisata.find((w) => w.id === transaksi.id_wisata);
          const harga = parseInt(wisataData?.harga_tiket || wisataData?.harga || 0, 10);

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
        } else if (wisata.id) {
          // Kasus 2: data wisata lengkap dikirim
          wisataData = allWisata.find((w) => w.id === wisata.id);
          const harga = parseInt(wisataData?.harga_tiket || wisataData?.harga || 0, 10);
          setHargaTiket(harga);
        }
      } catch (err) {
        console.error('Gagal mengambil data wisata / transaksi:', err);
        showNotif('Gagal memuat data.', 'error');
      } finally {
        setLoading(false);
      }
    };

    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Ambil harga tiap perubahan wisata
  useEffect(() => {
    const fetchHargaTiket = async () => {
      try {
        const allWisata = await getAllWisata();
        const matchedWisata = allWisata.find((w) => w.id === wisata.id);
        if (matchedWisata) {
          setHargaTiket(parseInt(matchedWisata.harga_tiket || matchedWisata.harga || 0, 10));
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

  // Hitung total
  useEffect(() => {
    const jumlah = parseInt(jumlahTiket || 0, 10);
    if (!Number.isNaN(jumlah)) {
      setTotalHarga(hargaTiket * jumlah);
    } else {
      setTotalHarga(0);
    }
  }, [jumlahTiket, hargaTiket]);

  // ============================
  //   PEMESANAN BARU
  // ============================
  const handlePemesanan = async () => {
    if (!jumlahTiket || Number.isNaN(jumlahTiket) || parseInt(jumlahTiket, 10) <= 0) {
      showNotif('Masukkan jumlah tiket yang valid.', 'error');
      return;
    }
    if (!user?.id) {
      showNotif('Pengguna belum login.', 'error');
      return;
    }

    const payload = {
      id: 0,
      id_wisata: wisata.id,
      id_pengguna: user.id,
      jumlah_tiket: parseInt(jumlahTiket, 10),
      total_harga: totalHarga,
      tanggal_pemesanan: new Date().toISOString().split('T')[0],
    };

    try {
      setLoading(true);
      const result = await postPemesanan(payload);

      if (result?.result === 200) {
        showNotif(result.message || 'Pemesanan berhasil dibuat.', 'success');

        const transaksi = {
          id: result.id || payload.id,
          status: 'Pending',
          nama_pengguna: user.nama_lengkap,
          nama_wisata: wisata?.nama_wisata || wisata?.name || '-',
          harga_tiket: hargaTiket,
          jumlah_tiket: parseInt(jumlahTiket, 10),
          total_harga: totalHarga,
          tanggal_pemesanan: payload.tanggal_pemesanan,
          id_wisata: wisata.id,
          id_pengguna: user.id,
        };

        setTransaksiData(transaksi);
        setShowQR(true);
      } else {
        showNotif(result.message || 'Terjadi kesalahan saat menyimpan.', 'error');
      }
    } catch (error) {
      console.error('Gagal melakukan pemesanan:', error);
      showNotif('Tidak dapat menghubungi server.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const simpanStrukKeGaleri = async () => {
    try {
      const permission = await MediaLibrary.requestPermissionsAsync();
      if (!permission.granted) {
        showNotif('Aplikasi tidak memiliki izin menyimpan ke galeri.', 'error');
        return;
      }

      const uri = await captureRef(strukRef, {
        format: 'png',
        quality: 1,
      });

      const asset = await MediaLibrary.createAssetAsync(uri);
      await MediaLibrary.createAlbumAsync('Bukti-Pemesanan', asset, false);

      showNotif('Bukti pemesanan berhasil disimpan ke galeri!', 'success');
    } catch (error) {
      console.error('Gagal simpan bukti pemesanan:', error);
      showNotif('Terjadi kesalahan saat menyimpan bukti pemesanan.', 'error');
    }
  };

  const simpanQRKeGaleri = async () => {
    try {
      const permission = await MediaLibrary.requestPermissionsAsync();
      if (!permission.granted) {
        showNotif('Tidak dapat menyimpan gambar tanpa izin.', 'error');
        return;
      }

      const uri = await captureRef(qrRef.current, {
        format: 'png',
        quality: 1,
      });

      const asset = await MediaLibrary.createAssetAsync(uri);
      await MediaLibrary.createAlbumAsync('QR-Pemesanan', asset, false);

      showNotif('QR Code berhasil disimpan ke galeri!', 'success');
    } catch (error) {
      console.error('Gagal simpan QR:', error);
      showNotif('Tidak bisa menyimpan QR Code.', 'error');
    }
  };

  const handleSelesaikan = async () => {
    if (!transaksiData?.id || transaksiData.id === 0) {
      showNotif('Data transaksi tidak valid. Tidak dapat menyelesaikan pemesanan.', 'error');
      return;
    }

    try {
      setLoading(true);
      const { data: existingData } = await axios.get(
        `http://172.20.10.9:8080/trspemesanan?id=${transaksiData.id}`,
      );

      if (!existingData?.id) {
        showNotif('Transaksi tidak ditemukan di server.', 'error');
        return;
      }

      const updatePayload = {
        ...existingData,
        status: 'Selesai',
      };

      const { data: response } = await axios.put(
        'http://172.20.10.9:8080/trspemesanan',
        updatePayload,
      );

      if (response?.result === 200) {
        showNotif('Pemesanan telah diselesaikan!', 'success');
        setTransaksiData((prev) => ({ ...prev, status: 'Selesai' }));
      } else {
        showNotif(response?.message || 'Gagal menyelesaikan pemesanan.', 'error');
      }
    } catch (err) {
      console.error('Terjadi error saat menyelesaikan pemesanan:', err);
      if (err.response?.data) {
        showNotif(err.response.data.message || 'Terjadi kesalahan dari server.', 'error');
      } else {
        showNotif('Tidak dapat menghubungi server.', 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  const renderQRString = () => {
    if (!transaksiData) return '';
    return `Nama: ${transaksiData.nama_pengguna}\nWisata: ${transaksiData.nama_wisata}\nHarga Tiket: Rp${transaksiData.harga_tiket}\nJumlah Tiket: ${transaksiData.jumlah_tiket}\nTotal Harga: Rp${transaksiData.total_harga}\nTanggal: ${transaksiData.tanggal_pemesanan}`;
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* 🔔 Komponen Notifikasi */}
      <Notifikasi
        visible={notif.visible}
        message={notif.message}
        type={notif.type}
        onClose={() => setNotif({ ...notif, visible: false })}
      />

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

      {!transaksiData && (
        <TouchableOpacity
          style={[styles.button, loading && { backgroundColor: '#999' }]}
          onPress={handlePemesanan}
          disabled={loading}
        >
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Lanjutkan Pemesanan</Text>}
        </TouchableOpacity>
      )}

      {showQR && transaksiData && (
        <View style={{ marginTop: 30, alignItems: 'center' }}>
          {transaksiData.status === 'Selesai' && (
            <>
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
                  <Text style={styles.strukValue}>{new Date(transaksiData.tanggal_pemesanan).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</Text>
                </View>
                <View style={styles.strukRow}>
                  <Text style={styles.strukLabel}>Status</Text>
                  <Text style={[styles.strukValue, { color: 'green' }]}>{transaksiData.status}</Text>
                </View>
                <Text style={{ marginTop: 15, fontWeight: 'bold' }}>QR Code:</Text>
                <View style={{ backgroundColor: '#fff', padding: 10, marginTop: 10 }}>
                  <QRCode value={renderQRString()} size={200} />
                </View>
              </View>

              <TouchableOpacity style={[styles.button, { backgroundColor: 'green', marginTop: 20 }]} onPress={simpanStrukKeGaleri}>
                <Feather name="download" size={20} color="#fff" />
              </TouchableOpacity>
            </>
          )}

          {transaksiData.status === 'Pending' && (
            <TouchableOpacity style={[styles.button, { backgroundColor: 'orange', marginTop: 20 }]} onPress={handleSelesaikan} disabled={loading}>
              {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Konfirmasi Pemesanan</Text>}
            </TouchableOpacity>
          )}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingBottom: 40,
    paddingHorizontal: 24,
    paddingTop: 12,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 16,
  },
  label: {
    fontWeight: 'bold',
    marginBottom: 4,
  },
  readonly: {
    backgroundColor: '#f0f0f0',
    padding: 10,
    borderRadius: 8,
    marginBottom: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    borderRadius: 8,
    marginBottom: 12,
  },
  total: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#007BFF',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  strukBox: {
    width: width * 0.9,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 12,
    padding: 16,
  },
  strukTitle: {
    fontWeight: 'bold',
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 12,
  },
  strukRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 2,
  },
  strukLabel: {
    fontWeight: 'bold',
  },
  strukValue: {
    textAlign: 'right',
  },
});