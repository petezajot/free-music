import React, { useState, useLayoutEffect, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { View, Modal, Text, TextInput, Button, TouchableOpacity, StyleSheet, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import uuid from 'react-native-uuid';
import { Playlist } from '../model/Playlists';

export default function Playlists() {
    const navigation = useNavigation();
    const [modalVisible, setModalVisible] = useState(false);
    const [playlistName, setPlaylistName] = useState('');
    const [listOfLists, setListOfLists] = useState([]);

    useFocusEffect(
        useCallback(() => {
            getAllPlaylists()
                .then(res => {
                    setListOfLists(res);
                })
                .catch(error => {
                    console.error("Error: ", error)
                });
            getAllPlaylists();
        }, [])
    );

    useLayoutEffect(() => {
        navigation.setOptions({
            headerRight: () => (
                <TouchableOpacity onPress={() => setModalVisible(true)} style={{ marginRight: 15 }}>
                    <Ionicons name="add" size={24} color="black" />
                </TouchableOpacity>
            ),
        });
    }, [navigation]);

    const handleCreate = async () => {
        // Aquí puedes guardar la playlist con AsyncStorage
        const newListId = uuid.v4();
        const playlist: Playlist = {
            id: newListId,
            name: playlistName,
            tracks: [],
        };

        await AsyncStorage.setItem(`playlist-${playlist.name}-${playlist.id}`, JSON.stringify(playlist));
        console.log('Nueva playlist:', playlistName);
        setPlaylistName('');
        setModalVisible(false);
    };

    const getAllPlaylists = async (): Promise<Playlist[]> => {
        const keys = await AsyncStorage.getAllKeys();
        const playlistKeys = keys.filter(k => k.startsWith('playlist-'));
        const items = await AsyncStorage.multiGet(playlistKeys);
        return items.map(([_, value]) => JSON.parse(value || '{}'));
    };

    const goToPlayer = (item: any) => {
        console.log("ID: ", item.id);
        console.log("NAME: ", item.name);
        console.log("TRACKS: ", item.tracks);
        navigation.navigate('LocalPlayer', { selectedTracks: item.tracks })
    };

    return (
        <View style={{ flex: 1 }}>
            {/* Contenido principal aquí */}

            <FlatList
                data={listOfLists}
                keyExtractor={(item) => item.id}
                numColumns={2}
                contentContainerStyle={styles.listContainer}
                renderItem={({ item }) => (
                    <TouchableOpacity style={styles.card} onPress={() => goToPlayer(item)}>
                        <Ionicons name="musical-notes-outline" size={40} color="#333" style={styles.icon} />
                        <Text style={styles.title}>{item.name}</Text>
                    </TouchableOpacity>
                )}
            />


            <Modal visible={modalVisible} animationType="slide" transparent>
                <View style={{
                    flex: 1,
                    justifyContent: 'center',
                    backgroundColor: 'rgba(0,0,0,0.5)',
                    padding: 20
                }}>
                    <View style={{
                        backgroundColor: 'white',
                        borderRadius: 10,
                        padding: 20
                    }}>
                        <Text style={{ fontSize: 18, marginBottom: 10 }}>Nombre de la nueva lista</Text>
                        <TextInput
                            value={playlistName}
                            onChangeText={setPlaylistName}
                            placeholder="Mi playlist"
                            style={{ borderBottomWidth: 1, marginBottom: 20 }}
                        />
                        <Button title="Crear" onPress={handleCreate} color="green" />
                        <Button title="Cancelar" onPress={() => setModalVisible(false)} color="gray" />
                    </View>
                </View>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
    },
    listContainer: {
        padding: 10,
    },
    card: {
        flex: 1,
        margin: 8,
        aspectRatio: 1, // cuadrado
        borderRadius: 12,
        backgroundColor: '#f0f0f0',
        alignItems: 'center',
        justifyContent: 'center',
        elevation: 3, // sombra en Android
    },
    icon: {
        width: 40,
        height: 40,
        marginBottom: 8,
        tintColor: '#333',
    },
    title: {
        fontSize: 16,
        fontWeight: '600',
        textAlign: 'center',
    },
});