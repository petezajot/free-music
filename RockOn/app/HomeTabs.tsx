// HomeTabs.tsx
import React from 'react';
import { TouchableOpacity } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

import Home from './home';
import DownloadsScreen from './downloadsScreen';
import Playlists from './playlistsView';

const Tab = createBottomTabNavigator();

export default function HomeTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }) => {
          let iconName = 'home';

          if (route.name === 'Inicio') iconName = 'home-outline';
          if (route.name === 'Descargados') iconName = 'download-outline';
          if (route.name === "Playlists") iconName = 'list';

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#000000',
        tabBarInactiveTintColor: 'gray',
        headerShown: false,
      })}
    >
      <Tab.Screen
        name="Inicio"
        component={Home} />
      <Tab.Screen
        name="Descargados"
        component={DownloadsScreen}
        options={{
          title: 'Mis Descargas', // Este es el título que aparecerá en el header
          headerShown: true       // Asegúrate de que el header esté visible
        }} />
      <Tab.Screen
        name="Playlists"
        component={Playlists}
        options={{
          title: 'Playlists', // Este es el título que aparecerá en el header
          headerShown: true,       // Asegúrate de que el header esté visible
        }} />
    </Tab.Navigator>
  );
}
