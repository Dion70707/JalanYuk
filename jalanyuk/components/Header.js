import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

const Header = ({ title, showLogout = false, onLogout }) => {
    return (
        <View style={styles.headerContainer}>
            <View style={styles.side}>
                <Image source={require('../assets/jalanyuk.png')} style={styles.logo} />
            </View>

            <View style={styles.center}>
                <Text style={styles.headerTitle}>{title}</Text>
            </View>

            <View style={styles.side}>
                {showLogout && (
                    <TouchableOpacity onPress={onLogout}>
                        <Ionicons name="log-out-outline" size={26} color="#fff" />
                    </TouchableOpacity>
                )}
            </View>
        </View>
    );
};


export default Header;

const styles = StyleSheet.create({
    headerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#007bff',
        height: 60,
        paddingHorizontal: 10,
    },
    side: {
        width: 50,
        alignItems: 'center',
        justifyContent: 'center',
    },
    center: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    logo: {
        width: 50,
        height: 50,
        resizeMode: 'contain',
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#fff',
    },
});
