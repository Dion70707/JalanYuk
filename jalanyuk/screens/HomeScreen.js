import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  SafeAreaView,
  Platform,
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';

const wisataList = [
  {
    id: '1',
    name: 'Taman Mini Indonesia Indah',
    location: 'Jakarta',
    category: 'Budaya',
    rating: 4.7,
    reviewCount: 2,
    description: 'Taman wisata budaya Indonesia di Jakarta Timur.',
    image: require('../assets/tamanmini.png'),
    latitude: -6.3025,
    longitude: 106.8956,
  },
  {
    id: '2',
    name: 'Kawah Putih',
    location: 'Bandung',
    category: 'Alam',
    rating: 4.6,
    reviewCount: 5,
    description: 'Danau kawah vulkanik berwarna putih kehijauan.',
    image: require('../assets/kawahputih.png'),
    latitude: -7.1665,
    longitude: 107.4022,
  },
  {
    id: '3',
    name: 'Pantai Kuta',
    location: 'Bali',
    category: 'Pantai',
    rating: 4.5,
    reviewCount: 7,
    description: 'Pantai terkenal dengan pasir putih dan ombak untuk berselancar.',
    image: require('../assets/pantaikuta.png'),
    latitude: -8.7177,
    longitude: 115.1685,
  },
  {
    id: '4',
    name: 'Borobudur',
    location: 'Magelang',
    category: 'Sejarah',
    rating: 4.9,
    reviewCount: 10,
    description: 'Candi Buddha terbesar di dunia dan situs warisan dunia UNESCO.',
    image: require('../assets/borobudur.png'),
    latitude: -7.6079,
    longitude: 110.2038,
  },
  {
    id: '5',
    name: 'Raja Ampat',
    location: 'Papua Barat',
    category: 'Alam',
    rating: 4.9,
    reviewCount: 8,
    description: 'Surga bawah laut dengan keanekaragaman hayati laut yang luar biasa.',
    image: require('../assets/rajaampat.png'),
    latitude: -0.2346,
    longitude: 130.5079,
  },
  {
    id: '6',
    name: 'Gunung Bromo',
    location: 'Jawa Timur',
    category: 'Gunung',
    rating: 4.8,
    reviewCount: 6,
    description: 'Gunung berapi aktif dengan pemandangan matahari terbit yang menakjubkan.',
    image: require('../assets/bromo.png'),
    latitude: -7.9425,
    longitude: 112.9530,
  },
  {
    id: '7',
    name: 'Danau Toba',
    location: 'Sumatera Utara',
    category: 'Danau',
    rating: 4.6,
    reviewCount: 9,
    description: 'Danau vulkanik terbesar di Asia Tenggara dengan pulau Samosir di tengahnya.',
    image: require('../assets/danautoba.png'),
    latitude: 2.6785,
    longitude: 98.8752,
  },
  {
    id: '8',
    name: 'Lawang Sewu',
    location: 'Semarang',
    category: 'Sejarah',
    rating: 4.3,
    reviewCount: 4,
    description: 'Gedung peninggalan Belanda yang terkenal dengan arsitekturnya dan cerita mistis.',
    image: require('../assets/lawangsewu.png'),
    latitude: -6.9842,
    longitude: 110.4091,
  },
];

const TABS = [
  { key: 'Beranda', label: 'Beranda', icon: 'home' },
  { key: 'Favorit', label: 'Favorit', icon: 'heart' },
  { key: 'MyOrder', label: 'My Order', icon: 'ticket' },
  { key: 'Profile', label: 'Profile', icon: 'user' },
];

export default function HomeScreen({ navigation }) {
  const [search, setSearch] = useState('');
  const [selectedTab, setSelectedTab] = useState('Beranda');

  const filteredData = wisataList.filter((item) =>
    item.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleTabPress = (tabKey) => {
    setSelectedTab(tabKey);
    if (tabKey === 'Favorit') navigation.navigate('Favorit');
    else if (tabKey === 'Profile') navigation.navigate('Profile');
    else if (tabKey === 'MyOrder') navigation.navigate('MyOrder');
    // tab 'Beranda' tidak perlu pindah karena ini halaman saat ini
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.header}>Wisata Indonesia</Text>

        <TextInput
          placeholder="Cari tempat wisata..."
          value={search}
          onChangeText={setSearch}
          style={styles.search}
          placeholderTextColor="#999"
        />

        <FlatList
          data={filteredData}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingBottom: 80 }}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <Image source={item.image} style={styles.image} />
              <View style={styles.cardContent}>
                <View style={styles.info}>
                  <Text style={styles.title}>{item.name}</Text>
                  <Text style={styles.subtitle}>
                    {item.location} • ⭐ {item.rating} ({item.reviewCount} reviews)
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
      </View>

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
    backgroundColor: '#f2f2f2',
  },
  header: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
    textAlign: 'center',
  },
  search: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    backgroundColor: '#fff',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    marginBottom: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  image: {
    width: '100%',
    height: 180,
  },
  cardContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
  },
  info: {
    flex: 1,
    paddingRight: 10,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
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
});
