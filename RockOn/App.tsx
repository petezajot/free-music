import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import HomeTabs from './app/HomeTabs';
import AlbumDetails from './app/albumDetails';
import PlayerView from './app/playerView';

import CustomHeader from './components/SearchBar';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <NavigationContainer>
        <Stack.Navigator initialRouteName="Home">
          <Stack.Screen
            name="Home"
            component={HomeTabs}
            options={{
              headerShown: false
            }}
          />
          <Stack.Screen
            name="AlbumDetails"
            component={AlbumDetails}
          />
          <Stack.Screen
            name="PlayerView"
            component={PlayerView}
          />
        </Stack.Navigator>
        <StatusBar style="auto" />
      </NavigationContainer>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
