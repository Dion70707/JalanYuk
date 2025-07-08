import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
  Platform,
  StatusBar,
  TouchableOpacity,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import Icon from 'react-native-vector-icons/FontAwesome';
import { getAllRoles, getPenggunaById } from '../API';

const TABS = [
  { key: 'Beranda', label: 'Beranda', icon: 'home' },
  { key: 'Favorit', label: 'Favorit', icon: 'heart' },
  { key: 'MyOrder', label: 'My Order', icon: 'ticket' },
  { key: 'Profile', label: 'Profile', icon: 'user' },
];

const ProfileScreen = ({ navigation }) => {
  const [pengguna, setPengguna] = useState(null);
  const [roleName, setRoleName] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState('Profile');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const userId = await AsyncStorage.getItem('userId');
        if (!userId) return;

        const data = await getPenggunaById(parseInt(userId));
        setPengguna(data);

        const rolesData = await getAllRoles();
        const role = rolesData.find((r) => r.id === data.id_role);
        setRoleName(role?.nama_role || 'Tidak ditemukan');
      } catch (error) {
        console.log('Gagal memuat data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleTabPress = (tabKey) => {
    setSelectedTab(tabKey);
    if (tabKey === 'Beranda') navigation.navigate('Beranda');
    else if (tabKey === 'Favorit') navigation.navigate('Favorit');
    else if (tabKey === 'MyOrder') navigation.navigate('MyOrder');
    // Profile sudah di sini
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <CustomHeader />
        <ActivityIndicator size="large" color="#007bff" style={{ marginTop: 30 }} />
        <TabBar selectedTab={selectedTab} onPress={handleTabPress} />
      </SafeAreaView>
    );
  }

  if (!pengguna) {
    return (
      <SafeAreaView style={styles.container}>
        <CustomHeader />
        <Text style={{ textAlign: 'center', marginTop: 30 }}>Data pengguna tidak ditemukan.</Text>
        <TabBar selectedTab={selectedTab} onPress={handleTabPress} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <CustomHeader />
      <View style={styles.card}>
        <Ionicons name="person-circle" size={120} color="#007bff" style={{ marginBottom: 20 }} />

        <InfoRow label="Nama Lengkap" value={pengguna.nama_lengkap} />
        <InfoRow label="Email" value={pengguna.email} />
        <InfoRow label="Role" value={roleName} />
        <InfoRow
          label="Status"
          value={
            <View
              style={[
                styles.statusBadge,
                pengguna.status === 'Aktif' ? styles.active : styles.inactive,
              ]}
            >
              <Text style={styles.statusText}>
                {pengguna.status}
              </Text>
            </View>
          }
        />
      </View>

      <TabBar selectedTab={selectedTab} onPress={handleTabPress} />
    </SafeAreaView>
  );
};

const InfoRow = ({ label, value }) => (
  <View style={styles.infoRow}>
    <Text style={styles.infoLabel}>{label}</Text>
    {typeof value === 'string' || typeof value === 'number' ? (
      <Text style={styles.infoValue}>{value}</Text>
    ) : (
      value
    )}
  </View>
);

const CustomHeader = () => (
  <View style={styles.header}>
    <Text style={styles.headerTitle}>Profil Saya</Text>
  </View>
);

const TabBar = ({ selectedTab, onPress }) => (
  <View style={styles.tabBar}>
    {TABS.map((tab) => (
      <TouchableOpacity
        key={tab.key}
        style={styles.tabItem}
        onPress={() => onPress(tab.key)}
      >
        <Icon name={tab.icon} size={20} color="#fff" style={styles.tabIcon} />
        <Text style={styles.tabLabel}>{tab.label}</Text>
        {selectedTab === tab.key && <View style={styles.tabIndicator} />}
      </TouchableOpacity>
    ))}
  </View>
);

export default ProfileScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f4f8',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  header: {
    width: '100%',
    height: 56,
    backgroundColor: '#007bff',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  card: {
    backgroundColor: '#fff',
    paddingVertical: 30,
    paddingHorizontal: 25,
    borderRadius: 16,
    width: '90%',
    marginTop: 20,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 18,
  },
  infoLabel: {
    fontWeight: '600',
    color: '#555',
    fontSize: 16,
  },
  infoValue: {
    fontSize: 16,
    color: '#222',
    flexShrink: 1,
    textAlign: 'right',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  active: {
    backgroundColor: '#e6f4ea',
  },
  inactive: {
    backgroundColor: '#f9e6e6',
  },
  statusText: {
    fontWeight: 'bold',
    fontSize: 14,
    color: '#4CAF50',
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#007bff',
    paddingTop: 10,
    paddingBottom: Platform.OS === 'ios' ? 20 : 12,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    width: '100%',
  },
  tabItem: { alignItems: 'center', flex: 1 },
  tabIcon: { marginBottom: 2 },
  tabLabel: { color: '#fff', fontSize: 12, marginTop: 2 },
  tabIndicator: {
    height: 4,
    backgroundColor: '#fff',
    borderRadius: 2,
    marginTop: 6,
    width: '50%',
    alignSelf: 'center',
  },
});
