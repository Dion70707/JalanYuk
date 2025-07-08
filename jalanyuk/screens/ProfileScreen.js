import React, { useEffect, useState } from 'react';
import { 
  View, Text, StyleSheet, SafeAreaView, ActivityIndicator, Platform, StatusBar 
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { getAllRoles, getPenggunaById } from '../API';

const ProfileScreen = () => {
  const [pengguna, setPengguna] = useState(null);
  const [roleName, setRoleName] = useState('');
  const [loading, setLoading] = useState(true);

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

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <CustomHeader />
        <ActivityIndicator size="large" color="#007bff" style={{marginTop: 30}} />
      </SafeAreaView>
    );
  }

  if (!pengguna) {
    return (
      <SafeAreaView style={styles.container}>
        <CustomHeader />
        <Text style={{ textAlign: 'center', marginTop: 30 }}>Data pengguna tidak ditemukan.</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <CustomHeader />
      <View style={styles.card}>
        <Ionicons name="person-circle" size={120} color="#007bff" style={{marginBottom: 20}} />

        <InfoRow label="Nama Lengkap" value={pengguna.nama_lengkap} />
        <InfoRow label="Email" value={pengguna.email} />
        <InfoRow  value={roleName} />
        <InfoRow 
          label="Status" 
          value={
            <View style={[
              styles.statusBadge, 
              pengguna.status === 'Aktif' ? styles.active : styles.inactive
            ]}>
              <Text style={styles.statusText}>{pengguna.status}</Text>
            </View>
          } 
        />
      </View>
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

export default ProfileScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f4f8',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
    alignItems: 'center',
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
  inactive: {
    backgroundColor: '#f9e6e6',
  },
  statusTextInactive: {
    fontWeight: 'bold',
    fontSize: 14,
    color: '#F44336',
  },
});
