import { useEffect, useCallback, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { List } from 'react-native-paper';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Modal, ScrollView } from 'react-native';
import { IconButton } from 'react-native-paper';
import { DownloadedSong } from '../model/DownloadedSongs';
import MiniPlayer from '../components/MiniPlayer';
import { misc } from '../misc';

export default function DownloadsScreen() {
    const [songs, setSongs] = useState<DownloadedSong[]>([]);
    const [groupedSongs, setGroupedSongs] = useState({});
    const [isVisible, setVisible] = useState(false);
    const [selectedAlbum, setSelectedAlbum] = useState('');
    const [selectedTracks, setSelectedTracks] = useState([]);
    const [selectedArtist, setSelectedArtist] = useState('');
    const [songData, setSongData] = useState({})
    const [showPlayer, setShowPlayer] = useState(false);

    const openModal = (tracks, album, artist) => {
        setSelectedAlbum(album);
        setSelectedTracks(tracks);
        setSelectedArtist(artist)
        setVisible(true);
    };

    const playSong = (songName: string, location: string, image: string) => {
        var data = {
            name:songName,
            location:location,
            image: image
        }
        setSongData(data)
        setShowPlayer(true);
    }

    useFocusEffect(
        useCallback(() => {
            const loadDownloads = async () => {
                const downloads = await misc.getDownloadedSongs();
                const grouped = {};

                downloads.forEach(song => {
                    const { artist, album } = song;
                    if (!grouped[artist]) grouped[artist] = {};
                    if (!grouped[artist][album]) grouped[artist][album] = [];
                    grouped[artist][album].push(song);
                });
                setGroupedSongs(grouped);
            };
            loadDownloads();
        }, [])
    );

    return (
        <View style={{ flex: 1, padding: 10, height: '100%', width: '100%' }}>
            {Object.entries(groupedSongs).map(([artist, albums]) => (
                <List.Accordion title={artist} key={artist} style={{ backgroundColor: '#333', marginVertical: 2, borderRadius: 8 }} titleStyle={{ color: '#fff', fontWeight: 'bold' }}>
                    {Object.entries(albums).map(([album, tracks]) => (
                        <List.Item
                            title={album}
                            key={album}
                            onPress={() => openModal(tracks, album, artist)}
                        />
                    ))}
                </List.Accordion>
            ))}

            <Modal
                visible={isVisible}
                transparent={true}
                animationType="slide"
                onRequestClose={() => setVisible(false)}
            >
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>{selectedAlbum}</Text>

                        <View style={styles.iconGroup}>
                            <IconButton icon="play" onPress={() => console.log(`Reproducir ${selectedAlbum} completo`)} />
                            <IconButton icon="playlist-plus" onPress={() => console.log(`Agregar ${selectedAlbum} completo a lista de reproducción`)} />
                        </View>

                        <ScrollView contentContainerStyle={styles.scrollContent}>
                            {selectedTracks.map(track => (
                                <View style={styles.card} key={track.location}>
                                    <Text style={styles.trackText}>🎵 {track.name}</Text>
                                    <View style={styles.iconGroup}>
                                        <IconButton icon="play" onPress={() => playSong(track.name, track.location, track.image)} />
                                        <IconButton icon="playlist-plus" onPress={() => console.log("Add: ", track.name)} />
                                    </View>
                                </View>
                            ))}
                        </ScrollView>

                        <TouchableOpacity onPress={() => setVisible(false)} style={styles.closeButton}>
                            <Text style={styles.closeButtonText}>Cerrar</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

            {showPlayer &&
                (<MiniPlayer
                    name={songData.name}
                    artist={selectedArtist}
                    location={songData.location}
                    image={songData.image}
                    isLocal={true}
                />)
            }

        </View>
    );
};

const styles = StyleSheet.create({
    modalContainer: {
        flex: 1,
        justifyContent: 'flex-end',
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    modalContent: {
        backgroundColor: 'white',
        padding: 20,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        maxHeight: '80%',
    },
    closeButton: {
        marginTop: 20,
        backgroundColor: '#6200ee',
        paddingVertical: 10,
        borderRadius: 8,
        alignItems: 'center',
    },
    closeButtonText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 16,
    },
    card: {
        flexDirection: 'row',
        alignItems: 'center',         // ✅ Alineación vertical
        justifyContent: 'space-between', // ✅ Distribución horizontal
        backgroundColor: '#fff',
        borderRadius: 4,
        padding: 10,
        marginVertical: 4,
        marginHorizontal: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 2,
        elevation: 4,
    },
    iconGroup: {
        flexDirection: 'row',
        alignItems: 'center',        // ✅ Alineación vertical dentro del grupo
    },
    modalTitle: {
        fontSize: 20,
    }
});
