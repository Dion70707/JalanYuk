import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

const TABS = [
  { key: 'Dashboard', label: 'Dashboard', icon: 'grid' },
  { key: 'Profile', label: 'Profile', icon: 'person' },
];

const Tab = ({ selectedTab, setSelectedTab }) => {
  const navigation = useNavigation();

  const handleTabPress = (tabKey) => {
    setSelectedTab(tabKey);

    if (tabKey === 'Profile') {
      navigation.navigate('Profile');
    } else if (tabKey === 'Dashboard') {
      navigation.navigate('Admin'); 
    }
  };

  return (
    <View style={styles.tabBar}>
      {TABS.map((tab) => (
        <TouchableOpacity
          key={tab.key}
          style={styles.tabItem}
          onPress={() => handleTabPress(tab.key)}
        >
          <Ionicons name={tab.icon} size={22} color="#fff" style={styles.tabIcon} />
          <Text style={styles.tabLabel}>{tab.label}</Text>
          {selectedTab === tab.key && <View style={styles.tabIndicator} />}
        </TouchableOpacity>
      ))}
    </View>
  );
};

export default Tab;

const styles = StyleSheet.create({
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
