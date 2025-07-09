import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  Platform,
  Dimensions,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import Tab from '../components/Tab'; // ✅ Import komponen Tab

const MasterMenu = [
  { title: 'Wisata', icon: 'image' },
  { title: 'Role', icon: 'people' },
  { title: 'Galeri', icon: 'images' },
  { title: 'Kota', icon: 'location' },
  { title: 'Pengguna', icon: 'person' },
];

const AdminScreen = () => {
  const navigation = useNavigation();
  const [selectedTab, setSelectedTab] = useState('Dashboard');

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.grid}>
          {MasterMenu.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={styles.card}
              onPress={() => {
                if (item.title === 'Role') {
                  navigation.navigate('RoleIndex');
                }else if (item.title === 'Pengguna') {
                  navigation.navigate('PenggunaIndex');
                }else if (item.title === 'Wisata') {
                  navigation.navigate('WisataIndex');
                }
                else if (item.title === 'Galeri') {
                  navigation.navigate('GaleriIndex');
                }
              }}
            >
              <Ionicons name={item.icon} size={36} color="#007bff" />
              <Text style={styles.cardText}>{item.title}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {/* ✅ Gunakan komponen Tab */}
      <Tab selectedTab={selectedTab} setSelectedTab={setSelectedTab} />
    </SafeAreaView>
  );
};

export default AdminScreen;

const screenWidth = Dimensions.get('window').width;
const cardSize = (screenWidth - 60) / 3;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f2f2f2',
  },
  container: {
    flexGrow: 1,
    paddingVertical: 30,
    paddingHorizontal: 10,
    alignItems: 'center',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  card: {
    width: cardSize,
    height: cardSize,
    backgroundColor: '#fff',
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    margin: 5,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
  },
  cardText: {
    marginTop: 8,
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});
