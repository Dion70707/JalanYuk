// HomeScreen.js
import React, { useState, useEffect, useRef } from "react";
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
} from "react-native";
import Icon from "react-native-vector-icons/FontAwesome";
import { getAllWisata, getAllPemesanan, getFavoritList } from "../API";
import AsyncStorage from "@react-native-async-storage/async-storage";
import QRCode from "react-native-qrcode-svg";
import { captureRef } from "react-native-view-shot";
import * as MediaLibrary from "expo-media-library";

/* ──────────────────────────── CONSTANTS ──────────────────────────── */
const IMAGE_BASE_URL = "http://172.20.10.9:8080";
const FALLBACK_IMAGE = "https://via.placeholder.com/400x200.png?text=No+Image";

const TABS = [
  { key: "Beranda", label: "Beranda", icon: "home" },
  { key: "MyOrder", label: "My Order", icon: "ticket" },
  { key: "Favorit", label: "Favorit", icon: "heart" },
  { key: "Profile", label: "Profile", icon: "user" },
];

/* ────────────────────────────── HELPER ───────────────────────────── */
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

/* ──────────────────────────── COMPONENT ──────────────────────────── */
export default function HomeScreen({ navigation }) {
  /* ---------- STATE ---------- */
  const [search, setSearch] = useState("");
  const [selectedTab, setSelectedTab] = useState("Beranda");
  const [wisataList, setWisataList] = useState([]);
  const [loading, setLoading] = useState(true);

  const [orders, setOrders] = useState([]);
  const [orderLoading, setOrderLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [user, setUser] = useState(null);

  const [favoritData, setFavoritData] = useState([]);
  const [activeFilter, setActiveFilter] = useState("Semua");

  const [modalVisible, setModalVisible] = useState(false);
  const [selectedQRData, setSelectedQRData] = useState(null);
  const qrRef = useRef();

  /* ---------- DATA FETCHERS ---------- */
  const fetchWisataData = async () => {
    try {
      setLoading(true);
      const response = await getAllWisata();
      const data = Array.isArray(response) ? response : [];

      const mapped = data.map((item) => {
        const kota = item.alamat?.split(",").pop()?.trim() || "Tidak Diketahui";
        return {
          id: item.id,
          name: item.nama_wisata || "Tanpa Nama",
          location: item.alamat || "Alamat tidak tersedia",
          rating: item.rating_rata ?? 0,
          reviewCount: item.jumlah_review ?? 0,
          category: item.kategori || "Kategori tidak tersedia",
          description: item.deskripsi || "",
          image: item.id_galeri
            ? `${IMAGE_BASE_URL}/galeri/${item.id_galeri}/image`
            : FALLBACK_IMAGE,
          latitude: parseFloat(item.koordinat_lat) || 0,
          longitude: parseFloat(item.koordinat_lng) || 0,
          ticketPrice: item.harga_tiket || 0,
          kota,
        };
      });

      setWisataList(mapped);
    } catch (e) {
      console.error("Gagal memuat data wisata:", e);
    } finally {
      setLoading(false);
    }
  };

  const fetchMyOrders = async () => {
    try {
      setOrderLoading(true);
      const userId = await AsyncStorage.getItem("userId");
      const nama = await AsyncStorage.getItem("userNamaLengkap");
      if (!userId) return;

      setUser({ id: parseInt(userId), nama_lengkap: nama });

      const [allOrders, allWisata] = await Promise.all([
        getAllPemesanan(),
        getAllWisata(),
      ]);

      const filtered = allOrders
        .filter((o) => o.id_pengguna === parseInt(userId))
        .map((o) => {
          const w = allWisata.find((w) => w.id === o.id_wisata);
          return {
            ...o,
            nama_wisata: w?.nama_wisata || "Wisata tidak ditemukan",
          };
        });

      setOrders(filtered);
    } catch (e) {
      console.error("Gagal mengambil data pesanan:", e);
    } finally {
      setOrderLoading(false);
      setRefreshing(false);
    }
  };

  const loadFavorites = async () => {
    try {
      const res = await getFavoritList();
      const userId = await AsyncStorage.getItem("userId");
      if (!userId) return;

      const data = res.data || [];
      const userFav = data.filter((d) => d.idPengguna === parseInt(userId));
      setFavoritData(userFav);
    } catch (e) {
      console.error("Gagal mengambil data favorit:", e);
    }
  };

  /* ---------- FAVORIT UTIL ---------- */
  const getFavoritByWisataId = (idWisata) =>
    favoritData.find(
      (f) => f.idWisata === idWisata && f.idPengguna === user?.id
    );

  const toggleFavorite = async (idWisata) => {
    const userId = await AsyncStorage.getItem("userId");
    if (!userId) return;

    // dapatkan status terkini langsung dari state, tidak perlu fetch lagi
    const existing = favoritData.find((f) => f.idWisata === idWisata);
    const newStatus = existing?.favorit === 1 ? 0 : 1;

    try {
      await toggleFavoritAPI({
        userId: parseInt(userId),
        idWisata,
        favorit: newStatus,
      });
      await loadFavorites(); // refresh state
    } catch (e) {
      console.error("Toggle favorit error:", e);
    }
  };

  /* ---------- EFFECTS ---------- */
  useEffect(() => {
    fetchWisataData();
    fetchMyOrders();
    loadFavorites();
  }, []);

  /* refresh favorit setiap kali user membuka tab Favorit */
  useEffect(() => {
    if (selectedTab === "Favorit") {
      loadFavorites();
    }
  }, [selectedTab]);

  /* ---------- TAB HANDLER ---------- */
  const handleTabPress = (tabKey) => {
    if (tabKey === "Profile") {
      navigation.navigate("Profile");
    } else {
      setSelectedTab(tabKey);
    }
  };

  /* ---------- QR HELPERS ---------- */
  const renderQRString = (order) =>
    `Nama: ${user?.nama_lengkap}
Wisata: ${order.nama_wisata}
Jumlah: ${order.jumlah_tiket}
Total: Rp${order.total_harga}
Tanggal: ${order.tanggal_pemesanan}`;

  const saveQRToGallery = async () => {
    try {
      const { granted } = await MediaLibrary.requestPermissionsAsync();
      if (!granted) {
        Alert.alert("Izin ditolak", "Tidak dapat menyimpan gambar tanpa izin.");
        return;
      }
      const uri = await captureRef(qrRef, { format: "png", quality: 1 });
      const asset = await MediaLibrary.createAssetAsync(uri);
      await MediaLibrary.createAlbumAsync("QR-Pemesanan", asset, false);
      Alert.alert("Sukses", "QR Code berhasil disimpan ke galeri!");
    } catch (e) {
      console.error("Gagal menyimpan QR:", e);
      Alert.alert("Error", "Gagal menyimpan QR.");
    }
  };

  /* ──────────────────────── RENDERERS ──────────────────────── */
  const renderBeranda = () => {
    const list = wisataList
      .filter((w) => w.name.toLowerCase().includes(search.toLowerCase()))
      .sort((a, b) => {
        const kotaA = (a.kota || "").toLowerCase();
        const kotaB = (b.kota || "").toLowerCase();
        return kotaA === kotaB
          ? a.name.localeCompare(b.name)
          : kotaA.localeCompare(kotaB);
      });

    const applySliderSort = (arr) => {
      if (activeFilter === "Rating")
        return [...arr].sort((a, b) => b.rating - a.rating);
      if (activeFilter === "Harga")
        return [...arr].sort((a, b) => a.ticketPrice - b.ticketPrice);
      return arr;
    };

    return (
      <>
        <Text style={styles.header}>Wisata Indonesia</Text>

        {/* 🔍 Search */}
        <TextInput
          placeholder="Cari tempat wisata..."
          value={search}
          onChangeText={setSearch}
          style={styles.search}
          placeholderTextColor="#999"
        />

        {/* 🎚️ Filter Slider */}
        <View style={styles.filterSlider}>
          {["Semua", "Rating", "Harga"].map((f) => (
            <TouchableOpacity
              key={f}
              onPress={() => setActiveFilter(f)}
              style={[
                styles.filterButton,
                activeFilter === f && styles.filterButtonActive,
              ]}
            >
              <Text
                style={[
                  styles.filterButtonText,
                  activeFilter === f && styles.filterButtonTextActive,
                ]}
              >
                {f}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* 🖼️ Quick Slider */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={{ marginBottom: 16 }}
          contentContainerStyle={{ paddingHorizontal: 4 }}
        >
          {/* Top Rating */}
          <TouchableOpacity
            style={[styles.filterCard, { marginRight: 12 }]}
            onPress={() =>
              navigation.navigate("TopRatingScreen", { data: wisataList })
            }
          >
            <ImageWithFallback
              uri={applySliderSort(wisataList)[0]?.image || FALLBACK_IMAGE}
              style={styles.filterCardImage}
            />
            <Text style={styles.filterCardText}>Top Rating</Text>
          </TouchableOpacity>

          {/* Termurah */}
          <TouchableOpacity
            style={[styles.filterCard, { marginRight: 12 }]}
            onPress={() =>
              navigation.navigate("TermurahScreen", { data: wisataList })
            }
          >
            <ImageWithFallback
              uri={
                [...wisataList].sort((a, b) => a.ticketPrice - b.ticketPrice)[0]
                  ?.image || FALLBACK_IMAGE
              }
              style={styles.filterCardImage}
            />
            <Text style={styles.filterCardText}>Termurah</Text>
          </TouchableOpacity>

          {/* Kota */}
          <TouchableOpacity
            style={styles.filterCard}
            onPress={() =>
              navigation.navigate("KotaScreen", { data: wisataList })
            }
          >
            <ImageWithFallback
              uri={
                [...wisataList].sort((a, b) => a.kota.localeCompare(b.kota))[0]
                  ?.image || FALLBACK_IMAGE
              }
              style={styles.filterCardImage}
            />
            <Text style={styles.filterCardText}>Kota</Text>
          </TouchableOpacity>
        </ScrollView>

        {/* 📋 List */}
        {loading ? (
          <ActivityIndicator size="large" color="#007bff" />
        ) : (
          <FlatList
            data={list}
            keyExtractor={(item) => item.id.toString()}
            contentContainerStyle={{ paddingBottom: 80 }}
            renderItem={({ item, index }) => {
              const isNewCity =
                index === 0 || item.kota !== list[index - 1].kota;
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
                        Rp {Number(item.ticketPrice).toLocaleString("id-ID")}
                      </Text>
                      <Text style={styles.subtitle}>
                        {item.location} • ★ {item.rating} ({item.reviewCount}{" "}
                        ulasan)
                      </Text>
                      <Text style={styles.category}>{item.category}</Text>
                    </View>

                    <View style={styles.actionRow}>
                      <TouchableOpacity
                        onPress={() => toggleFavorite(item.id)}
                        style={styles.favoriteIconInline}
                      >
                        <Icon
                          name={
                            getFavoritByWisataId(item.id)?.favorit === 1
                              ? "heart"
                              : "heart-o"
                          }
                          size={20}
                          color="red"
                        />
                      </TouchableOpacity>

                      <TouchableOpacity
                        onPress={() =>
                          navigation.navigate("Detail", { wisata: item })
                        }
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
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={fetchMyOrders} />
      }
    >
      {orderLoading ? (
        <ActivityIndicator size="large" color="#007bff" />
      ) : orders.length === 0 ? (
        <Text style={styles.empty}>Belum ada pemesanan.</Text>
      ) : (
        orders.map((o, i) => (
          <View key={i} style={styles.card}>
            <Text style={styles.label}>Nama Wisata:</Text>
            <Text style={styles.value}>{o.nama_wisata}</Text>

            <Text style={styles.label}>Jumlah Tiket:</Text>
            <Text style={styles.value}>{o.jumlah_tiket}</Text>

            <Text style={styles.label}>Total Harga:</Text>
            <Text style={styles.value}>Rp {o.total_harga}</Text>

            <Text style={styles.label}>Tanggal Pemesanan:</Text>
            <Text style={styles.value}>{o.tanggal_pemesanan}</Text>

            <Text style={styles.label}>Status:</Text>
            <Text
              style={[
                styles.value,
                o.status === "Pending"
                  ? { color: "orange", fontWeight: "bold" }
                  : o.status === "Selesai"
                  ? { color: "green", fontWeight: "bold" }
                  : { color: "#555" },
              ]}
            >
              {o.status}
            </Text>

            <TouchableOpacity
              style={styles.qrButton}
              onPress={() => {
                setSelectedQRData(o);
                setModalVisible(true);
              }}
            >
              <Text style={{ color: "#fff", fontWeight: "bold" }}>
                Lihat QR
              </Text>
            </TouchableOpacity>

            {o.status === "Pending" && (
              <TouchableOpacity
                style={[
                  styles.qrButton,
                  { backgroundColor: "orange", marginTop: 8 },
                ]}
                onPress={() =>
                  navigation.navigate("PesanTiketScreen", {
                    wisata: { id: o.id_wisata },
                  })
                }
              >
                <Text style={{ color: "#fff", fontWeight: "bold" }}>
                  Selesaikan Pemesanan
                </Text>
              </TouchableOpacity>
            )}
          </View>
        ))
      )}
    </ScrollView>
  );

  const renderFavorit = () => {
    const favouriteList = wisataList.filter((w) =>
      favoritData.some((f) => f.idWisata === w.id)
    );

    return (
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <Text style={styles.header}>Wisata Favorit</Text>

        {favouriteList.length === 0 ? (
          <Text style={styles.empty}>Belum ada wisata favorit.</Text>
        ) : (
          favouriteList.map((w) => (
            <View key={w.id} style={styles.card}>
              <ImageWithFallback uri={w.image} style={styles.image} />
              <View style={styles.cardContent}>
                <View style={styles.info}>
                  <Text style={styles.title}>{w.name}</Text>
                  <Text style={styles.subtitle}>
                    {w.location} • ★ {w.rating} ({w.reviewCount} ulasan)
                  </Text>
                  <Text style={styles.category}>{w.category}</Text>
                </View>

                <View style={styles.actionRow}>
                  <TouchableOpacity
                    onPress={() => toggleFavorite(w.id)}
                    style={styles.favoriteIconInline}
                  >
                    <Icon
                      name={
                        getFavoritByWisataId(w.id)?.favorit === 1
                          ? "heart"
                          : "heart-o"
                      }
                      size={20}
                      color="red"
                    />
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => navigation.navigate("Detail", { wisata: w })}
                    style={styles.detailButton}
                  >
                    <Text style={styles.detailButtonText}>Detail</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          ))
        )}
      </ScrollView>
    );
  };

  /* ──────────────────────────── RETURN ──────────────────────────── */
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {selectedTab === "Beranda" && renderBeranda()}
        {selectedTab === "MyOrder" && renderMyOrder()}
        {selectedTab === "Favorit" && renderFavorit()}
      </View>

      {/* Bottom Tab Bar */}
      <View style={styles.tabBar}>
        {TABS.map((tab) => (
          <TouchableOpacity
            key={tab.key}
            style={styles.tabItem}
            onPress={() => handleTabPress(tab.key)}
          >
            <Icon
              name={tab.icon}
              size={20}
              color="#fff"
              style={styles.tabIcon}
            />
            <Text style={styles.tabLabel}>{tab.label}</Text>
            {selectedTab === tab.key && <View style={styles.tabIndicator} />}
          </TouchableOpacity>
        ))}
      </View>

      {/* QR Modal */}
      <Modal visible={modalVisible} transparent animationType="fade">
        <View style={styles.modalBackground}>
          <View style={styles.modalContent}>
            <View ref={qrRef} collapsable={false} style={styles.qrContainer}>
              {selectedQRData && (
                <QRCode value={renderQRString(selectedQRData)} size={200} />
              )}
            </View>
            <TouchableOpacity style={styles.qrSave} onPress={saveQRToGallery}>
              <Text style={{ color: "#fff", fontWeight: "bold" }}>
                Simpan QR
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setModalVisible(false)}
              style={styles.qrClose}
            >
              <Text style={{ color: "#007bff" }}>Tutup</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

/* ───────────────────────────── STYLES ───────────────────────────── */
const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#f2f2f2" },
  container: { flex: 1, padding: 12 },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 16,
    textAlign: "center",
  },
  search: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 10,
    marginBottom: 12,
  },
  filterSlider: { flexDirection: "row", marginBottom: 12 },
  filterButton: {
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 20,
    backgroundColor: "#eee",
    marginRight: 8,
  },
  filterButtonActive: { backgroundColor: "#007bff" },
  filterButtonText: { fontSize: 12 },
  filterButtonTextActive: { color: "#fff" },
  filterCard: {
    width: 120,
    height: 80,
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: "#ddd",
  },
  filterCardImage: { width: "100%", height: "100%" },
  filterCardText: {
    position: "absolute",
    bottom: 4,
    left: 4,
    color: "#fff",
    fontWeight: "bold",
    textShadowColor: "#000",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  cityHeader: {
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 20,
    marginBottom: 8,
  },
  image: {
    width: "100%",
    height: 180,
    backgroundColor: "#ccc",
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    marginBottom: 16,
    elevation: 4,
  },
  cardContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
  },
  info: { flex: 1, paddingRight: 10 },
  title: { fontSize: 18, fontWeight: "bold" },
  price: { color: "#007bff", fontWeight: "bold", marginTop: 4 },
  subtitle: { color: "#666", marginTop: 4 },
  category: { marginTop: 6, fontStyle: "italic", color: "#007bff" },
  actionRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    marginTop: 10,
  },
  favoriteIconInline: { marginRight: 10 },
  detailButton: {
    backgroundColor: "#007bff",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 10,
  },
  detailButtonText: { color: "#fff", fontWeight: "bold" },
  empty: { textAlign: "center", color: "#888", marginTop: 40 },
  label: { fontWeight: "bold", marginTop: 8 },
  value: { color: "#555" },

  /* Tab Bar */
  tabBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    backgroundColor: "#007bff",
    paddingTop: 10,
    paddingBottom: Platform.OS === "ios" ? 20 : 12,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  tabItem: { alignItems: "center", flex: 1 },
  tabIcon: { marginBottom: 2 },
  tabLabel: { color: "#fff", fontSize: 12, marginTop: 2 },
  tabIndicator: {
    height: 4,
    backgroundColor: "#fff",
    borderRadius: 2,
    marginTop: 6,
    width: "50%",
    alignSelf: "center",
  },

  /* QR Modal */
  modalBackground: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 20,
    alignItems: "center",
    width: "80%",
  },
  qrContainer: { padding: 20, backgroundColor: "#fff", borderRadius: 20 },
  qrSave: {
    backgroundColor: "#28a745",
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 10,
    marginTop: 16,
  },
  qrClose: { marginTop: 12 },
  qrButton: {
    backgroundColor: "#007bff",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 10,
    marginTop: 12,
  },
});
