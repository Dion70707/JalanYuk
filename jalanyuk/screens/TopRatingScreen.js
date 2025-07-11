import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
} from 'react-native';

const FALLBACK_IMAGE = 'https:192.168.136.125:8080';

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

export default function TopRatingScreen({ route, navigation }) {
  const { data } = route.params;
  const [ratingFilter, setRatingFilter] = useState('ALL');

  const filterByRating = (item) => {
    if (ratingFilter === 'ALL') return true;
    return Math.floor(item.rating) === parseInt(ratingFilter);
  };

  const filteredData = [...data]
    .filter(filterByRating)
    .sort((a, b) => b.rating - a.rating);

  const RatingFilterButton = ({ label, value }) => (
    <TouchableOpacity
      style={[
        styles.filterButton,
        ratingFilter === value && styles.filterButtonActive,
      ]}
      onPress={() => setRatingFilter(value)}
    >
      <Text
        style={[
          styles.filterButtonText,
          ratingFilter === value && styles.filterButtonTextActive,
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );

  const renderItem = ({ item }) => (
    <View style={styles.card}>
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
          <Text style={styles.category}>Kategori: {item.category}</Text>
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
    <View style={styles.container}>
      <Text style={styles.header}>Top Rating Wisata</Text>
      <View style={styles.filterContainer}>
        <RatingFilterButton label="⭐ 5" value="5" />
        <RatingFilterButton label="⭐ 4" value="4" />
        <RatingFilterButton label="⭐ 3" value="3" />
        <RatingFilterButton label="⭐ 2" value="2" />
        <RatingFilterButton label="⭐ 1" value="1" />
        <RatingFilterButton label="Semua" value="ALL" />
      </View>
      <FlatList
        data={filteredData}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
        contentContainerStyle={{ paddingBottom: 20 }}
      />
    </View>
  );
}
const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#fff',
      paddingHorizontal: 16,
      paddingTop: 10,
    },
    header: {
      fontSize: 22,
      fontWeight: 'bold',
      marginBottom: 16,
    },
    filterContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      marginBottom: 16,
    },
    filterButton: {
      paddingVertical: 6,
      paddingHorizontal: 12,
      borderRadius: 20,
      backgroundColor: '#eee',
      marginRight: 8,
      marginBottom: 8,
    },
    filterButtonActive: {
      backgroundColor: '#3498db',
    },
    filterButtonText: {
      fontSize: 14,
      color: '#333',
    },
    filterButtonTextActive: {
      color: '#fff',
      fontWeight: 'bold',
    },
    card: {
      backgroundColor: '#fff',
      borderRadius: 10,
      marginBottom: 16,
      overflow: 'hidden',
      elevation: 3,
    },
    image: {
      width: '100%',
      height: 180,
    },
    cardContent: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      padding: 12,
    },
    info: {
      flex: 1,
      paddingRight: 10,
    },
    title: {
      fontSize: 18,
      fontWeight: 'bold',
    },
    price: {
      fontSize: 16,
      color: '#2ecc71',
      marginTop: 4,
    },
    subtitle: {
      fontSize: 14,
      color: '#666',
      marginTop: 4,
    },
    category: {
      fontSize: 14,
      color: '#777',
      marginTop: 4,
    },
    detailButton: {
      backgroundColor: '#3498db',
      paddingVertical: 8,
      paddingHorizontal: 14,
      borderRadius: 6,
      alignSelf: 'center',
      justifyContent: 'center',
    },
    detailButtonText: {
      color: '#fff',
      fontSize: 14,
      fontWeight: 'bold',
    },
  });
  