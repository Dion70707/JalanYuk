// src/API.js

import axios from 'axios';

const BASE_URL = 'http://192.168.43.81:8080';

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

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

// ====== WISATA API ======
export const getAllWisata = async () => {
  try {
    const response = await api.get('/wisatas');
    return response.data;
  } catch (error) {
    console.error('Error fetching wisata list:', error);
    throw error;
  }
};

export const getWisataById = async (id) => {
  try {
    const response = await api.get('/wisata', {
      params: { id },
    });
    return response.data;
  } catch (error) {
    console.error(`Error fetching wisata with id ${id}:`, error);
    throw error;
  }
};

export const createWisata = async (wisata) => {
  try {
    const response = await api.post('/wisata', wisata);
    return response.data;
  } catch (error) {
    console.error('Error creating wisata:', error);
    throw error;
  }
};

export const updateWisata = async (wisata) => {
  try {
    const response = await api.put('/wisata', wisata);
    return response.data;
  } catch (error) {
    console.error('Error updating wisata:', error);
    throw error;
  }
};

export const deleteWisata = async (id) => {
  try {
    const response = await api.delete('/wisata', {
      params: { id },
    });
    return response.data;
  } catch (error) {
    console.error(`Error deleting wisata with id ${id}:`, error);
    throw error;
  }
};

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

  getAllWisata,
  getWisataById,
  createWisata,
  updateWisata,
  deleteWisata,

  getImageUrlById,
};

