import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import {
  postPemesanan,
  getAllWisata,
  fetchTransaksiById,
  handleSelesaikanPemesanan,
} from "../API";
import AsyncStorage from "@react-native-async-storage/async-storage";
import QRCode from "react-native-qrcode-svg";
import { captureRef } from "react-native-view-shot";
import * as MediaLibrary from "expo-media-library";
import { Feather } from "@expo/vector-icons";
import Notifikasi from "../components/Notifikasi";
import axios from "axios";

export default function PemesananScreen({ route }) {
  const { wisata } = route.params;

  const [jumlahTiket, setJumlahTiket] = useState("");
  const [totalHarga, setTotalHarga] = useState(0);
  const [hargaTiket, setHargaTiket] = useState(0);
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);
  const [showQR, setShowQR] = useState(false);
  const [loadingSelesai, setLoadingSelesai] = useState(false);
  const [notif, setNotif] = useState({
    visible: false,
    message: "",
    type: "success",
  });
  const showNotif = (message, type = "success") =>
    setNotif({ visible: true, message, type });
  const strukRef = useRef();
  const [transaksiData, setTransaksiData] = useState(null);
  const qrRef = useRef();

  useEffect(() => {
    const loadTransaksiFromId = async () => {
      if (wisata && wisata.id_pemesanan) {
        try {
          setLoading(true);
          const res = await axios.get(
            `http://172.20.10.9:8080/trspemesanan?id=${wisata.id_pemesanan}`
          );
          const transaksi = res.data;

          // Ambil data wisata
          const allWisata = await getAllWisata();
          const matchedWisata = allWisata.find(
            (w) => w.id === transaksi.id_wisata
          );

          const harga = matchedWisata
            ? parseInt(matchedWisata.harga_tiket || matchedWisata.harga || 0)
            : 0;

          setTransaksiData({
            ...transaksi,
            nama_pengguna: user?.nama_lengkap || "",
            nama_wisata: matchedWisata?.nama_wisata || "-",
            harga_tiket: harga,
          });

          setShowQR(true); // tampilkan QR otomatis
        } catch (err) {
          console.error("Gagal ambil data transaksi:", err);
          showNotif("Gagal mengambil data transaksi.", "error");
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

        const userId = await AsyncStorage.getItem("userId");
        const nama = await AsyncStorage.getItem("userNamaLengkap");
        setUser({ id: parseInt(userId), nama_lengkap: nama });

        let transaksi = null;
        let wisataData = null;

        const allWisata = await getAllWisata();

        // Jika ada id_pemesanan
        if (wisata.id_pemesanan) {
          const res = await axios.get(
            `http://172.20.10.9:8080/trspemesanan?id=${wisata.id_pemesanan}`
          );
          transaksi = res.data;
          wisataData = allWisata.find((w) => w.id === transaksi.id_wisata);
          const harga = parseInt(
            wisataData?.harga_tiket || wisataData?.harga || 0
          );

          setHargaTiket(harga);
          setTotalHarga(transaksi.total_harga || 0);
          setJumlahTiket(transaksi.jumlah_tiket.toString());

          setTransaksiData({
            ...transaksi,
            nama_pengguna: nama,
            nama_wisata: wisataData?.nama_wisata || "-",
            harga_tiket: harga,
          });

          setShowQR(true);
        }
        // Jika hanya data wisata
        else if (wisata.id) {
          wisataData = allWisata.find((w) => w.id === wisata.id);
          const harga = parseInt(
            wisataData?.harga_tiket || wisataData?.harga || 0
          );
          setHargaTiket(harga);
        }
      } catch (err) {
        console.error("❌ Gagal mengambil data wisata / transaksi:", err);
        showNotif("Gagal memuat data.", "error"); // ⬅️ ganti Alert
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
          setHargaTiket(
            parseInt(matchedWisata.harga_tiket || matchedWisata.harga || 0)
          );
        } else {
          setHargaTiket(0);
        }
      } catch (err) {
        console.error("Gagal mengambil data wisata:", err);
        setHargaTiket(0);
      }
    };

    fetchHargaTiket();
  }, [wisata]);

  useEffect(() => {
    const getUserData = async () => {
      try {
        const userId = await AsyncStorage.getItem("userId");
        const nama = await AsyncStorage.getItem("userNamaLengkap");
        if (userId && nama) {
          setUser({
            id: parseInt(userId),
            nama_lengkap: nama,
          });
        } else {
          showNotif("Pengguna belum login.", "error"); // ⬅️ ganti Alert
        }
      } catch (err) {
        console.error("Gagal mendapatkan data user", err);
      }
    };

    getUserData();
  }, []);

  useEffect(() => {
    const jumlah = parseInt(jumlahTiket || 0);
    setTotalHarga(!isNaN(jumlah) ? hargaTiket * jumlah : 0);
  }, [jumlahTiket, hargaTiket]);

  const handlePemesanan = async () => {
    if (!jumlahTiket || isNaN(jumlahTiket) || parseInt(jumlahTiket) <= 0) {
      showNotif("Masukkan jumlah tiket yang valid.", "error");
      return;
    }
    if (!user?.id) {
      showNotif("Pengguna belum login.", "error");
      return;
    }

    const payload = {
      id: 0,
      id_wisata: wisata.id,
      id_pengguna: user.id,
      jumlah_tiket: parseInt(jumlahTiket),
      total_harga: totalHarga,
      tanggal_pemesanan: new Date().toISOString().split("T")[0],
    };

    try {
      setLoading(true);
      const result = await postPemesanan(payload);

      if (result?.result === 200) {
        showNotif(result.message || "Pemesanan berhasil dibuat.");
        const transaksi = {
          id: result.id || payload.id,
          status: "Pending",
          nama_pengguna: user.nama_lengkap,
          nama_wisata: wisata?.nama_wisata || wisata?.name || "-",
          harga_tiket: hargaTiket,
          jumlah_tiket: parseInt(jumlahTiket),
          total_harga: totalHarga,
          tanggal_pemesanan: payload.tanggal_pemesanan,
          id_wisata: wisata.id,
          id_pengguna: user.id,
        };
        setTransaksiData(transaksi);
        setShowQR(true);
      } else {
        showNotif(
          result.message || "Terjadi kesalahan saat menyimpan.",
          "error"
        );
      }
    } catch (err) {
      console.error("Gagal melakukan pemesanan:", err);
      showNotif("Tidak dapat menghubungi server.", "error");
    } finally {
      setLoading(false);
    }
  };

  const simpanStrukKeGaleri = async () => {
    try {
      const permission = await MediaLibrary.requestPermissionsAsync();
      if (!permission.granted) {
        showNotif("Aplikasi tidak memiliki izin menyimpan ke galeri.", "error");
        return;
      }

      const uri = await captureRef(strukRef, { format: "png", quality: 1 });
      const asset = await MediaLibrary.createAssetAsync(uri);
      await MediaLibrary.createAlbumAsync("Bukti-Pemesanan", asset, false);

      showNotif("Bukti pemesanan berhasil disimpan ke galeri!");
    } catch (err) {
      console.error("❌ Gagal simpan bukti pemesanan:", err);
      showNotif("Terjadi kesalahan saat menyimpan bukti pemesanan.", "error");
    }
  };

  const handleSelesaikan = async () => {
    if (!transaksiData?.id) {
      showNotif("Data transaksi tidak valid.", "error");
      return;
    }

    try {
      setLoading(true);
      // Ambil transaksi terbaru
      const { data: existingData } = await axios.get(
        `http://172.20.10.9:8080/trspemesanan?id=${transaksiData.id}`
      );
      if (!existingData?.id) {
        showNotif("Transaksi tidak ditemukan di server.", "error");
        return;
      }

      const updatePayload = { ...existingData, status: "Selesai" };
      const { data: response } = await axios.put(
        "http://172.20.10.9:8080/trspemesanan",
        updatePayload
      );

      if (response?.result === 200) {
        showNotif("Pemesanan telah diselesaikan!");
        setTransaksiData((prev) => ({ ...prev, status: "Selesai" }));
      } else {
        showNotif(
          response?.message || "Gagal menyelesaikan pemesanan.",
          "error"
        );
      }
    } catch (err) {
      console.error("❌ Error saat menyelesaikan pemesanan:", err);
      showNotif(
        err.response?.data?.message || "Tidak dapat menghubungi server.",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  const renderQRString = () => {
    if (!transaksiData) return "";
    return `Nama: ${transaksiData.nama_pengguna}
    Wisata: ${transaksiData.nama_wisata}
    Harga Tiket: Rp${transaksiData.harga_tiket}
    Jumlah Tiket: ${transaksiData.jumlah_tiket}
    Total Harga: Rp${transaksiData.total_harga}
    Tanggal: ${transaksiData.tanggal_pemesanan}`;
  };

  return (
    <View style={{ flex: 1 }}>
      {/* —————————————————  Layar konten  ————————————————— */}
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>
          {transaksiData?.status === "Selesai" ? "" : "Pemesanan Tiket"}
        </Text>

        {/* ① Form pemesanan (hanya saat belum “Selesai”) */}
        {transaksiData?.status !== "Selesai" && (
          <>
            <Text style={styles.label}>Nama Wisata:</Text>
            <Text style={styles.readonly}>
              {transaksiData?.nama_wisata ||
                wisata?.nama_wisata ||
                wisata?.name ||
                "-"}
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

        {/* ② Tombol “Lanjutkan Pemesanan” (saat belum ada transaksi) */}
        {(!transaksiData ||
          (transaksiData.status !== "Pending" &&
            transaksiData.status !== "Selesai")) && (
          <TouchableOpacity
            style={[styles.button, loading && { backgroundColor: "#999" }]}
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

        {/* ③ Detail / QR / Konfirmasi */}
        {showQR && transaksiData && (
          <View style={{ marginTop: 30, alignItems: "center" }}>
            {/* Struk tampil HANYA bila status Selesai */}
            {transaksiData.status === "Selesai" && (
              <>
                {/* -------- STRUK ---------- */}
                <View
                  ref={strukRef}
                  collapsable={false}
                  style={styles.strukBox}
                >
                  <Text style={styles.strukTitle}>Bukti Pemesanan</Text>

                  {[
                    ["Nama", transaksiData.nama_pengguna],
                    ["Wisata", transaksiData.nama_wisata],
                    ["Harga", `Rp ${transaksiData.harga_tiket}`],
                    ["Jumlah", transaksiData.jumlah_tiket],
                    ["Total", `Rp ${transaksiData.total_harga}`],
                    [
                      "Tanggal",
                      new Date(
                        transaksiData.tanggal_pemesanan
                      ).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      }),
                    ],
                  ].map(([label, val]) => (
                    <View key={label} style={styles.strukRow}>
                      <Text style={styles.strukLabel}>{label}</Text>
                      <Text style={styles.strukValue}>{val}</Text>
                    </View>
                  ))}

                  <View style={styles.strukRow}>
                    <Text style={styles.strukLabel}>Status</Text>
                    <Text style={[styles.strukValue, { color: "green" }]}>
                      {transaksiData.status}
                    </Text>
                  </View>

                  <Text style={{ marginTop: 15, fontWeight: "bold" }}>
                    QR Code:
                  </Text>
                  <View
                    style={{
                      backgroundColor: "#fff",
                      padding: 10,
                      marginTop: 10,
                    }}
                  >
                    <QRCode value={renderQRString()} size={200} />
                  </View>
                </View>

                {/* Tombol download struk */}
                <TouchableOpacity
                  style={[
                    styles.button,
                    { backgroundColor: "green", marginTop: 20 },
                  ]}
                  onPress={simpanStrukKeGaleri}
                >
                  <Feather name="download" size={20} color="#fff" />
                </TouchableOpacity>
              </>
            )}

            {/* Tombol konfirmasi saat masih Pending */}
            {transaksiData.status === "Pending" && (
              <TouchableOpacity
                style={[
                  styles.button,
                  { backgroundColor: "orange", marginTop: 20 },
                ]}
                onPress={handleSelesaikan}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.buttonText}>Konfirmasi Pemesanan</Text>
                )}
              </TouchableOpacity>
            )}
          </View>
        )}
      </ScrollView>

      {/* —————————————————  TOAST NOTIFIKASI  ————————————————— */}
      <Notifikasi
        visible={notif.visible}
        message={notif.message}
        type={notif.type}
        onClose={() => setNotif((p) => ({ ...p, visible: false }))}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    paddingBottom: 50,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  label: {
    fontWeight: "bold",
    marginTop: 15,
  },
  readonly: {
    padding: 10,
    backgroundColor: "#f0f0f0",
    borderRadius: 6,
    marginTop: 4,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 6,
    padding: 10,
    marginTop: 4,
  },
  total: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#007bff",
    marginTop: 4,
  },
  button: {
    backgroundColor: "#007bff",
    padding: 15,
    borderRadius: 8,
    marginTop: 30,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  strukContainer: {
    marginTop: 30,
    alignItems: "center",
  },
  strukBox: {
    width: "100%",
    padding: 20,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    backgroundColor: "#fdfdfd",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  strukTitle: {
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 15,
  },
  strukRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  strukLabel: {
    fontWeight: "600",
    color: "#555",
  },
  strukValue: {
    fontWeight: "bold",
    color: "#222",
  },
});
