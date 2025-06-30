import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

const Detail = ({ route }) => {
  const { pengguna, roleName } = route.params;
  const navigation = useNavigation();

  return (
    <View style={styles.wrapper}>
      {/* ✅ Header custom tetap di atas */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Detail Pengguna</Text>
      </View>

      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.card}>
          <Text style={styles.label}>Nama Lengkap</Text>
          <Text style={styles.value}>{pengguna.nama_lengkap}</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.label}>Email</Text>
          <Text style={styles.value}>{pengguna.email}</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.label}>Role</Text>
          <Text style={styles.value}>{roleName}</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.label}>Status</Text>
          <Text
            style={[
              styles.value,
              pengguna.status === 'Aktif' ? styles.active : styles.inactive,
            ]}
          >
            {pengguna.status}
          </Text>
        </View>

        {pengguna.telp && (
          <View style={styles.card}>
            <Text style={styles.label}>Telepon</Text>
            <Text style={styles.value}>{pengguna.telp}</Text>
          </View>
        )}

        {pengguna.alamat && (
          <View style={styles.card}>
            <Text style={styles.label}>Alamat</Text>
            <Text style={styles.value}>{pengguna.alamat}</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

export default Detail;

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: '#f0f4f8',
  },
  header: {
    backgroundColor: '#007bff',
    paddingTop: 50,
    paddingBottom: 16,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginLeft: 12,
  },
  container: {
    padding: 20,
  },
  card: {
    backgroundColor: '#fff',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    marginBottom: 16,

    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 5,

    elevation: 3,
  },
  label: {
    fontWeight: '700',
    fontSize: 14,
    color: '#555',
    marginBottom: 6,
  },
  value: {
    fontSize: 16,
    color: '#222',
    lineHeight: 22,
  },
  active: {
    color: '#4CAF50',
    fontWeight: 'bold',
  },
  inactive: {
    color: '#F44336',
    fontWeight: 'bold',
  },
});
