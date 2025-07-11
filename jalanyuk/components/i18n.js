// components/i18n.js
import { I18n } from 'i18n-js';
import * as Localization from 'expo-localization';

const i18n = new I18n({
  en: {
    login: 'Login',
    email: 'Email',
    password: 'Password',
    signIn: 'Sign In',
    signUp: 'Sign Up',
    noAccount: "Don't have an account?",
    loading: 'Loading...',
    errorEmpty: 'Email and password are required.',
    errorLogin: 'Incorrect email or password.',
    errorGeneral: 'An error occurred while logging in.',
    successLogin: 'Login successful!',
    chooseLanguage: 'Choose Language',
    enterFullName: 'Enter Full Name',
    fullName: 'Full Name',
    inputFullName: 'Enter full name',
    inputEmail: 'Enter your email',
    inputPassword: 'Enter password',
    haveAccount: 'Already have an account?',
    successRegister: 'Registration Successful',
    registerToLogin: 'Please login with your account.',
    emailExistTitle: 'Email Already Registered',
    emailExistMessage: 'Use another email to register.',
    registerFailed: 'Failed to register user.',



  },
  id: {
    login: 'Masuk',
    email: 'Email',
    password: 'Kata Sandi',
    signIn: 'Masuk',
    signUp: 'Daftar',
    noAccount: 'Belum punya akun?',
    loading: 'Memuat...',
    errorEmpty: 'Email dan kata sandi wajib diisi.',
    errorLogin: 'Email atau kata sandi salah.',
    errorGeneral: 'Terjadi kesalahan saat login.',
    successLogin: 'Login berhasil!',
    chooseLanguage: 'Pilih Bahasa',
    fullName: 'Nama Lengkap',
    inputFullName: 'Masukkan nama lengkap',
    inputEmail: 'Masukkan email',
    inputPassword: 'Masukkan kata sandi',
    haveAccount: 'Sudah punya akun?',
    successRegister: 'Registrasi Berhasil',
    registerToLogin: 'Silakan login dengan akun Anda.',
    emailExistTitle: 'Email Sudah Terdaftar',
    emailExistMessage: 'Gunakan email lain untuk registrasi.',
    registerFailed: 'Gagal menambahkan pengguna.',
    enterFullName: 'Masukkan Nama Lengkap',
    


  },
});

i18n.enableFallback = true;

export default i18n;
