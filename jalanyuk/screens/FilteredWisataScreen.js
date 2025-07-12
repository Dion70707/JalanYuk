// screens/FilteredWisataScreen.js
import React from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Image,
  TouchableOpacity,
} from 'react-native';

const FALLBACK_IMAGE = 'https://via.placeholder.com/400x200.png?text=No+Image';

const ImageWithFallback = ({ uri, style }) => {
  const [error, setError] = React.useState(false);
  return (
    <Image
      source={{ uri: error ? FALLBACK_IMAGE : uri }}
      style={style}
      resizeMode="cover"
      onError={() => setError(true)}
    />
  );
};

export default function FilteredWisataScreen({ route, navigation }) {
  const { filterType, data } = route.params;

  const sortedData = [...data];

  if (filterType === 'Rating') {
    sortedData.sort((a, b) => b.rating - a.rating);
  } else if (filterType === 'Harga') {
    sortedData.sort((a, b) => a.ticketPrice - b.ticketPrice);
  } else if (filterType === 'Kota') {
    sortedData.sort((a, b) => a.kota.localeCompare(b.kota));
  }

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => navigation.navigate('Detail', { wisata: item })}
    >
      <ImageWithFallback uri={item.image} style={styles.image} />
      <Text style={styles.name}>{item.name}</Text>
      <Text style={styles.detail}>★ {item.rating} • {item.kota}</Text>
      <Text style={styles.price}>Rp {item.ticketPrice.toLocaleString('id-ID')}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Wisata Berdasarkan {filterType}</Text>
      <FlatList
        data={sortedData}
        keyExtractor={(item) => item.id.toString()}
        horizontal={true}
        showsHorizontalScrollIndicator={false}
        renderItem={renderItem}
        contentContainerStyle={{ paddingHorizontal: 16 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 20, backgroundColor: '#fff' },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 16, textAlign: 'center' },
  card: {
    width: 220,
    marginRight: 16,
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 3,
  },
  image: { width: '100%', height: 120, backgroundColor: '#ccc' },
  name: { fontSize: 16, fontWeight: 'bold', paddingHorizontal: 8, marginTop: 8 },
  detail: { fontSize: 14, color: '#555', paddingHorizontal: 8 },
  price: { fontSize: 14, fontWeight: 'bold', color: 'green', padding: 8 },
});
