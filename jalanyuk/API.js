// src/API.js

import axios from 'axios';

const BASE_URL = 'http://10.1.56.34:8080';

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export async function getAllKota() {
  try {
    const response = await api.get('/kotas'); // Pastikan endpoint /kotas tersedia di backend
    return response.data;
  } catch (error) {
    console.error('Gagal mengambil data kota:', error);
    throw error;
  }
}
export async function getAllReviews() {
  try {
    const response = await api.get('/trsriviews');
    return response.data;  // asumsi backend mengembalikan array ulasan
  } catch (error) {
    console.error('Error fetching reviews:', error);
    throw error;
  }
}
// Fungsi POST review
export async function postReview(reviewData) {
  try {
    const response = await api.post('/trsriview', reviewData);
    return response.data;
  } catch (error) {
    console.error('Error posting review:', error);
    throw error;
  }
}
// base 
export async function getGaleriByWisataId(idWisata) {
  try {
    const res = await fetch(`${BASE_URL}/galeri/wisata/${idWisata}`);
    if (!res.ok) throw new Error('Gagal mengambil galeri');

    const data = await res.json();

    // Tambahan pengecekan agar tidak error saat .filter()
    if (Array.isArray(data)) {
      return data;
    } else if (data && typeof data === 'object') {
      return [data]; // Ubah jadi array 1 elemen
    } else {
      return [];
    }
  } catch (error) {
    console.warn(`❌ Error saat fetch galeri wisata ID ${idWisata}:`, error);
    return []; // Fallback aman
  }
}


export async function getAllWisata() {
  const res = await fetch(`${BASE_URL}/wisatas`);
  if (!res.ok) throw new Error('Failed to fetch wisata');
  return res.json();
}


export async function getWisataById(id) {
  try {
    const response = await axios.get(`${BASE_URL}/wisatas`, {
      params: { id: id },
    });

    // Ambil wisata pertama dari array jika response-nya berupa array
    const data = Array.isArray(response.data) ? response.data[0] : response.data;

    return data;
  } catch (error) {
    console.error('API getWisataById error:', error.response?.status, error.response?.data);
    throw new Error('Failed to fetch wisata by id');
  }
}

export async function addWisata(data) {
  const res = await fetch(`${BASE_URL}/wisata`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to add wisata');
  return res.json();
}

export async function updateWisata(data) {
  const res = await fetch(`${BASE_URL}/wisata`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to update wisata');
  return res.json();
}

export async function deleteWisata(id) {
  const res = await fetch(`${BASE_URL}/wisata?id=${id}`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error('Failed to delete wisata');
  return res.json();
}

//galeri
export async function getAllGaleri() {
  const res = await fetch(`${BASE_URL}/galeris`);
  return res.json();
}

export async function getGaleriById(id) {
  const res = await fetch(`${BASE_URL}/galeri?id=${id}`);
  return res.json();
}

export const addGaleri = async (formData) => {
  try {
    const response = await fetch(`${BASE_URL}/upload-galeri`, {
      method: 'POST',
      body: formData,
      // ✅ Jangan set headers Content-Type!
    });
    return response;
  } catch (error) {
    console.error('API error:', error);
    throw error;
  }
};


export const updateGaleri = async (formData) => {
  try {
    const response = await fetch(`${BASE_URL}/galeri`, {
      method: 'PUT',
      body: formData,
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.json();
  } catch (error) {
    console.error('Update error:', error);
    throw error;
  }
};



export async function deleteGaleri(id) {
  const res = await fetch(`${BASE_URL}/galeri?id=${id}`, {
    method: 'DELETE',
  });
  return res.json();
}
// ====== ROLE API ======
export const getAllRoles = async (status) => {
  try {
    const response = await api.get('/roles', {
      params: { status }, // ✅ pastikan status dikirim sebagai query param
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching roles:', error);
    throw error;
  }
};

export const getRoleById = async (id) => {
  try {
    const response = await api.get('/role', {
      params: { id },
    });
    return response.data;
  } catch (error) {
    console.error(`Error fetching role with id ${id}:`, error);
    throw error;
  }
};

export const createRole = async (role) => {
  try {
    const response = await api.post('/role', role);
    return response.data;
  } catch (error) {
    console.error('Error creating role:', error);
    throw error;
  }
};

export const updateRole = async (role) => {
  try {
    const response = await api.put('/role', role, {
      params: { id: role.id_role }, // ✅ tambahkan id sebagai query param
    });
    return response.data;
  } catch (error) {
    console.error('Error updating role:', error);
    throw error;
  }
};

export const deleteRole = async (id) => {
  try {
    const response = await api.delete('/role', {
      params: { id },
    });
    return response.data;
  } catch (error) {
    console.error(`Error deleting role with id ${id}:`, error);
    throw error;
  }
};

export const toggleRoleStatus = async (id, status) => {
  try {
    const response = await api.put('/role/status', null, {
      params: { id, status },
    });
    return response.data;
  } catch (error) {
    console.error('Error toggling role status:', error);
    throw error;
  }
};

export const getAllPenggunas = async (status) => {
  try {
    const response = await api.get('/penggunas', {
      params: { status }, // ✅ pastikan status dikirim sebagai query param
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching roles:', error);
    throw error;
  }
};

export const getPenggunaById = async (id) => {
  try {
    const response = await api.get('/pengguna', {
      params: { id },
    });
    return response.data;
  } catch (error) {
    console.error(`Error fetching pengguna with id ${id}:`, error);
    throw error;
  }
};

export const createPengguna = async (pengguna) => {
  try {
    const response = await api.post('/pengguna', pengguna);
    return response.data;
  } catch (error) {
    console.error('Error creating pengguna:', error);
    throw error;
  }
};

export const updatePengguna = async (pengguna) => {
  try {
    const response = await api.put('/pengguna', pengguna);
    return response.data;
  } catch (error) {
    console.error('Error updating pengguna:', error);
    throw error;
  }
};

export const deletePengguna = async (id) => {
  try {
    const response = await api.delete('/pengguna', {
      params: { id },
    });
    return response.data;
  } catch (error) {
    console.error(`Error deleting pengguna with id ${id}:`, error);
    throw error;
  }
};

export const togglePenggunaStatus = async (id, status) => {
  try {
    const response = await api.put('/pengguna/status', null, {
      params: { id, status },
    });
    return response.data;
  } catch (error) {
    console.error('Error toggling role status:', error);
    throw error;
  }
};



const handleSelesaikanPemesanan = async (order) => {
  try {
    const response = await axios.put('http://10.1.56.34:8080/trspemesanan', {
      ...order,
      status: 'Selesai', // opsional, karena backend juga override
    });

    if (response.data && response.data.result === 200) {
      Alert.alert('Sukses', 'Pemesanan berhasil diselesaikan.');
      fetchMyOrders(); // refresh data
    } else {
      Alert.alert('Gagal', 'Gagal menyelesaikan pemesanan.');
    }
  } catch (err) {
    console.error('Error saat menyelesaikan pemesanan:', err);
    Alert.alert('Error', 'Terjadi kesalahan saat menyelesaikan pemesanan.');
  }
};

export const getAllPemesanan = async (payload) => {
  try {
    const response = await axios.get(`${BASE_URL}/trspemesanans`, payload);
    return response.data;
  } catch (error) {
    console.error('Gagal melakukan POST pemesanan:', error);
    throw error;
  }
};

export const postPemesanan = async (payload) => {
  try {
    const response = await axios.post(`${BASE_URL}/trspemesanan`, payload);
    return response.data;
  } catch (error) {
    console.error('Gagal melakukan POST pemesanan:', error);
    throw error;
  }
};

const fetchTransaksiById = async (id) => {
  try {
    const response = await axios.get(`http://10.1.56.34:8080/trspemesanan?id=${id}`);
    return response.data; // diasumsikan backend mengembalikan objek TrsPemesanan
  } catch (error) {
    console.error('Gagal ambil data transaksi:', error);
    return null;
  }
};


// ====== WISATA API ======


export const getImageUrlById = (id_galeri) => {
  return `${BASE_URL}/galeri/image/${id_galeri}`;
};


export default {
  getAllRoles,
  getRoleById,
  createRole,
  updateRole,
  deleteRole,
  toggleRoleStatus,

  getAllPenggunas,
  getPenggunaById,
  createPengguna,
  updatePengguna,
  deletePengguna,
  togglePenggunaStatus,


  getImageUrlById,
};

