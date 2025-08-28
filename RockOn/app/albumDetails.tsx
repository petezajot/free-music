import { useState, useEffect } from 'react';
import { View, Text, Image, StyleSheet, FlatList, ImageBackground, Alert, InteractionManager, Modal } from 'react-native';
import { useRoute } from '@react-navigation/native';
import { IconButton, ProgressBar } from 'react-native-paper';
import { useTracksViewModel } from '../viewModel/TracksViewModel';
import { useSongsViewModel } from '../viewModel/SongsViewModel';
import MiniPlayer from '../components/MiniPlayer';
import LoaderView from '../components/LoaderView';
import { misc } from '../misc';

type AlbumDetailsRouteParams = {
    id: number;
    nombre: string;
};

export default function AlbumDetails({ navigation }: { navigation: any }) {
    const route = useRoute<{ params: AlbumDetailsRouteParams }>();
    const { name, image, artist } = route.params;
    const { tracks, fetchTracks } = useTracksViewModel();
    const { songs, loading, songLocation, fetchSongs, downloadSong, fetchSongsDirect } = useSongsViewModel();
    const [selectedSong, setSelectedSong] = useState<string>("");
    const [justDownload, setJustDownload] = useState<boolean>(false);
    const [ytSongId, setYtSongId] = useState<string>("");
    const [songName, setSongName] = useState<string>("");
    const [showPlayer, setShowPlayer] = useState(false);
    const [progress, setProgress] = useState(0);
    const [showProgress, setShowProgress] = useState(false);

    useEffect(() => {
        fetchTracks(artist, name);
    }, []);

    const getSongData = (name: string, artist: string, trackNumber: number, justDownload: boolean) => {
        setJustDownload(justDownload);
        setSelectedSong(name);
        fetchSongs(artist, name);
        setSongName(`${name}`);
    };

    useEffect(() => {
        if (songs.length > 0) {
            const firstSong = songs[0];

            if (justDownload) {
                downloadSong(firstSong.id.toString(), selectedSong, true);
            } else {
                setShowPlayer(true);
                setYtSongId(firstSong.id.toString());
            }
        }
    }, [songs]);

    useEffect(() => {
        if (justDownload) {
            Alert.alert('Descarga completa', `La canción "${selectedSong}" ha sido descargada.`);
            return;
        }
        if (songLocation) {
            const firstSong = songs[0];
            // navigation.navigate('PlayerView', { tracks: tracks });
        }
    }, [songLocation]);

    // Download full album
    const downloadFullAlbum = () => {
        Alert.alert(
            'Descargar álbum',
            `¿Deseas descargar todas las canciones del álbum "${name}"?`,
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Descargar',
                    onPress: () => {
                        InteractionManager.runAfterInteractions(() => {
                            downloadAlbum();
                        });
                    }
                }
            ]
        );
    };

    const downloadAlbum = async () => {
        setShowProgress(true);
        let completed = 0;
        const total = tracks.length;

        for (const track of tracks) {
            try {
                const songData = await fetchSongsDirect(artist, track.name); // obtiene el ID
                const songId = songData[0]?.id;


                if (songId) {
                    await downloadSong(songId, track.name, false, artist, name, image);
                    completed++;
                    setProgress(completed / total);
                }
            } catch (error) {
                console.error(`Error al descargar ${track.name}:`, error);
            }
        }

        setShowProgress(false);
        Alert.alert('Descarga completa', `Se descargaron ${completed} canciones.`);
    };


    return (
        <View style={styles.container}>
            <ImageBackground
                source={{ uri: image }}
                style={styles.background}
                resizeMode="cover"
            >
                <Image
                    source={{ uri: image }}
                    style={{ width: 200, height: 200, marginTop: 0 }}
                />
                <View style={{ flexDirection: 'row', width: '100%', height: 65, backgroundColor: 'rgba(0, 0, 0, 0.8)', bottom: 40 }}>
                    <Text style={styles.albumTitle} numberOfLines={1}>{name}</Text>
                    <IconButton icon="play" iconColor="#FFFFFF" size={24} onPress={() => { navigation.navigate('PlayerView', { tracks: tracks, image: image, artist: artist }); }} />
                    <IconButton icon="download" iconColor="#FFFFFF" size={24} onPress={() => { downloadFullAlbum() }} />
                </View>
            </ImageBackground>


            {loading ? (
                <LoaderView />
            ) : tracks.length === 0 ? (
                <Text style={{ marginTop: 20 }}>No se encontraron canciones</Text>
            ) : (
                <FlatList
                    style={[styles.trackItems, { marginBottom: showPlayer ? 45 : -10 }]}
                    data={tracks}
                    keyExtractor={(item) => item.name}
                    renderItem={({ item }) => (
                        <View style={styles.itemContent}>
                            <View style={{ display: 'flex', flexDirection: 'column', marginBottom: 10 }}>
                                <Text style={styles.itemName}>
                                    {`${item['@attr']?.rank ?? '-'} ${item.name ?? 'Sin nombre'}`}
                                </Text>

                                <Text style={styles.itemDuration}>{misc.formatDuration(item.duration)}</Text>
                            </View>
                            <View style={{ display: 'flex', flexDirection: 'row' }}>
                                <IconButton icon="play" onPress={() => getSongData(item.name, artist, item['@attr']?.rank, false)} />
                                <IconButton icon="download" onPress={() => getSongData(item.name, artist, item['@attr']?.rank, true)} />
                            </View>
                        </View>
                    )}
                />
            )}
            {showPlayer &&
                (<MiniPlayer
                    name={songName}
                    artist={artist}
                    location={ytSongId}
                    image={image}
                />)
            }

            {showProgress && (
                <Modal transparent>
                    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#00000088' }}>
                        <Text style={{ color: 'white', marginBottom: 10 }}>Descargando álbum...</Text>
                        <ProgressBar progress={progress} color="#FFFFFF" style={{ width: 200 }} />
                    </View>
                </Modal>
            )}

        </View>
    );
}

const styles = StyleSheet.create({
    background: {
        height: 250,
        width: '100%',
        justifyContent: 'center',
        alignItems: 'center',
        opacity: 0.9
    },
    container: {
        flex: 1,
        backgroundColor: '#fff',
        alignItems: 'center',
    },
    albumTitle: {
        fontSize: 22,
        color: '#FFFFFF',
        height: 50,
        width: '70%',
        textAlign: 'left',
        paddingLeft: 10,
        paddingTop: 10,
        marginRight: 5,
        fontWeight: 'bold',
        verticalAlign: 'center',
    },
    trackItems: {
        width: '100%',
        bottom: 5,
        top: -45,
        height: '100%',
        padding: 5,
        marginBottom: -10,
        backgroundColor: '#f0f0f0',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.1,
        shadowRadius: 5,
        elevation: 2,
    },
    itemContent: {
        padding: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#ccc',
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    itemName: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 5,
    },
    itemDuration: {
        fontSize: 14,
        color: '#666',
    }
});