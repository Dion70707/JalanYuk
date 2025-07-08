import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { getAllReviews, getAllPenggunas } from '../API';

export default function UlasanScreen({ route, navigation }) {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [penggunaMap, setPenggunaMap] = useState({});

  const { id } = route.params || {}; 

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [reviewData, penggunaData] = await Promise.all([
          getAllReviews(),
          getAllPenggunas()
        ]);

        const map = {};
        penggunaData.forEach(p => {
          map[p.id] = p;
        });
        setPenggunaMap(map);

        // Filter ulasan berdasarkan id_wisata (jika ada)
        const filtered = id
          ? reviewData.filter(r => r.id_wisata === id)
          : reviewData;
        setReviews(filtered);
      } catch (error) {
        console.error('Gagal ambil data ulasan/pengguna:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#007bff" />
        <Text>Memuat ulasan...</Text>
      </View>
    );
  }

  if (reviews.length === 0) {
    return (
      <View style={styles.centered}>
        <Text>Tidak ada ulasan tersedia.</Text>
      </View>
    );
  }

  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#fff' }} contentContainerStyle={{ padding: 12 }}>
      <Text style={styles.screenTitle}>Ulasan Pengguna</Text>

      {reviews.map((review) => {
        const pengguna = penggunaMap[review.id_pengguna];
        const namaLengkap = pengguna?.nama_lengkap || `User ${review.id_pengguna}`;
        const foto = pengguna?.foto || 'https://i.pravatar.cc/50';

        return (
          <View key={review.id} style={styles.reviewCard}>
            <View style={styles.header}>
              <Image
                source={{ uri: foto }}
                style={styles.avatar}
              />
              <Text style={styles.username}>{namaLengkap}</Text>
            </View>

            <View style={styles.ratingContainer}>
              {[1, 2, 3, 4, 5].map((star) => (
                <FontAwesome
                  key={star}
                  name="star"
                  size={18}
                  color={star <= review.rating ? '#f4c542' : '#ccc'}
                  style={{ marginRight: 2 }}
                />
              ))}
              <Text style={styles.ratingNumber}>{review.rating}</Text>
            </View>

            <Text style={styles.comment}>{review.komentar}</Text>
          </View>
        );
      })}

      <TouchableOpacity
        onPress={() => navigation.goBack()}
        style={styles.backButton}
      >
        <Text style={styles.backButtonText}>← Kembali</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screenTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  reviewCard: {
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  username: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  ratingNumber: {
    marginLeft: 6,
    fontWeight: 'bold',
    color: '#444',
  },
  comment: {
    fontSize: 14,
    color: '#333',
  },
  backButton: {
    marginTop: 16,
    alignItems: 'center',
  },
  backButtonText: {
    color: '#007bff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
