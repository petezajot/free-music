import { useState, useEffect, useRef } from "react";
import { View, Text, Image, TouchableOpacity, StyleSheet, ImageBackground } from "react-native";
import { useRoute } from '@react-navigation/native';
import { Audio } from 'expo-av';
import Icon from 'react-native-vector-icons/FontAwesome';
import Slider from '@react-native-community/slider';
import { useSongsViewModel } from "../viewModel/SongsViewModel";
import { misc } from "../misc";

type SongData = {
    tracks: {
        '@attr': { rank: string } | undefined;
        name: string;
        duration: string;
    }
};

export default function PlayerView() {
    const route = useRoute<{ params: SongData }>();
    const { tracks, image, artist } = route.params;
    const [currentIndex, setCurrentIndex] = useState(0);
    const [audio, setAudio] = useState<Audio.Sound | null>(null);
    const [duration, setDuration] = useState(0);
    const [position, setPosition] = useState(0);
    const [isPlaying, setIsPlaying] = useState(true);
    const [isShuffle, setIsShuffle] = useState(false);
    const [playedIndices, setPlayedIndices] = useState<number[]>([]);
    const { fetchSongs, songs } = useSongsViewModel();
    const isFirstTrack = currentIndex === 0;
    const isLastTrack = isShuffle
        ? playedIndices.length === tracks.length
        : currentIndex === tracks.length - 1;


    useEffect(() => {
        const track = tracks[currentIndex];
        fetchSongs(artist, track.name); // 1- Ejecutamos el método que retornará el ID de la canción
    }, [currentIndex]);

    useEffect(() => {
        if (songs.length > 0) {
            const firstSong = songs[0]; // 2- Aquí ya tenemos el ID de la canción
            playTrack(firstSong.id.toString()); // 3- Reproducimos la canción con el ID obtenido (Descomentar linea al terminar los estilos)
        }
    }, [songs]);

    const playTrack = async (videoId: string) => {
        // 🔇 Detener y descargar el audio anterior si existe
        if (audio) {
            setDuration(0);
            await audio.stopAsync();
            await audio.unloadAsync();
            setAudio(null);
        }

        const streamUrl = `http://192.168.100.107:3000/api/audio/getAudioWithUrl/${videoId}` // 4- Construimos la URL de streaming
        const { sound } = await Audio.Sound.createAsync(
            { uri: streamUrl },
            { shouldPlay: true }
        );

        setAudio(sound);

        sound.setOnPlaybackStatusUpdate((status) => {
            if (status.isLoaded) {
                setDuration(status.durationMillis || 0);
                setPosition(status.positionMillis || 0);

                if (status.didJustFinish) {
                    if (isShuffle) {
                        const nextIndex = getNextRandomIndex();
                        setCurrentIndex(nextIndex);
                    } else if (currentIndex < tracks.length - 1) {
                        setCurrentIndex((prev) => prev + 1);
                    }
                }

            }
        });


        await sound.playAsync(); // 5- Reproducimos la canción
        setIsPlaying(true);
    };

    const togglePlayback = async () => {
        if (!audio) return;

        const status = await audio.getStatusAsync();

        if (status.isLoaded) {
            if (status.isPlaying) {
                await audio.pauseAsync();
                setIsPlaying(false);
            } else {
                await audio.playAsync();
                setIsPlaying(true);
            }
        }
    };

    const goToPreviousTrack = () => {
        if (isShuffle && playedIndices.length > 1) {
            const updatedHistory = [...playedIndices];
            updatedHistory.pop(); // Elimina la actual
            const previousIndex = updatedHistory[updatedHistory.length - 1];
            setPlayedIndices(updatedHistory);
            setCurrentIndex(previousIndex);
        } else if (!isFirstTrack) {
            setCurrentIndex(prev => prev - 1);
        }
    };


    const goToNextTrack = () => {
        if (isShuffle) {
            const nextIndex = getNextRandomIndex();
            setCurrentIndex(nextIndex);
        } else if (!isLastTrack) {
            setCurrentIndex(prev => prev + 1);
        }
    };


    const getNextRandomIndex = () => {
        const remainingIndices = tracks
            .map((_, index) => index)
            .filter(index => !playedIndices.includes(index));

        if (remainingIndices.length === 0) {
            // Reinicia si ya se han reproducido todas
            const resetIndex = Math.floor(Math.random() * tracks.length);
            setPlayedIndices([resetIndex]);
            return resetIndex;
        }

        const randomIndex = remainingIndices[Math.floor(Math.random() * remainingIndices.length)];
        setPlayedIndices(prev => [...prev, randomIndex]);
        return randomIndex;
    };

    useEffect(() => {
        if (isShuffle && !playedIndices.includes(currentIndex)) {
            setPlayedIndices(prev => [...prev, currentIndex]);
        }
    }, [currentIndex]);

    useEffect(() => {
        return () => {
            if (audio) {
                audio.unloadAsync(); // 🔥 Detiene y libera el audio anterior
            }
        };
    }, [audio]);

    useEffect(() => {
        setCurrentIndex(0);
        if (audio) {
            audio.unloadAsync();
            setAudio(null);
            setPlayedIndices([]);
        }
    }, [artist]);

    return (
        <ImageBackground
            style={styles.container}
            source={{ uri: image }}
            resizeMode="cover"
        >
            <View style={styles.overlay} />
            <Image
                source={{ uri: image }}
                style={{ width: 100, height: 100, marginTop: 0 }}
            />
            <Text style={{ fontSize: 20, fontWeight: 'bold', marginTop: 10, color: "#FFFFFF" }} numberOfLines={1}>{artist}</Text>
            <Text style={styles.time}>{tracks[currentIndex]?.name}</Text>


            <Slider
                style={{ width: '100%' }}
                minimumValue={0}
                maximumValue={duration}
                value={position}
                minimumTrackTintColor="#FFFFFF"
                maximumTrackTintColor="#ccc"
                thumbTintColor="#FFFFFF"
                onSlidingComplete={async (value) => {
                    if (audio) {
                        await audio.setPositionAsync(value);
                    }
                }}
            />
            <Text style={{ marginTop: 8, color: "#FFFFFF" }}>
                {misc.formatTime(position)} / {misc.formatTime(duration)}
            </Text>

            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 20, width: '60%' }}>
                <TouchableOpacity
                    onPress={goToPreviousTrack}
                    disabled={isFirstTrack}
                    style={{ opacity: isFirstTrack ? 0.5 : 1 }}
                >
                    <Icon name="backward" size={30} color="#fff" />
                </TouchableOpacity>

                <TouchableOpacity onPress={togglePlayback} size={30}>
                    {isPlaying ? <Icon name="pause" size={30} color="#fff" /> : <Icon name="play" size={30} color="#fff" />}
                </TouchableOpacity>

                <TouchableOpacity
                    onPress={goToNextTrack}
                    disabled={isLastTrack}
                    style={{ opacity: isLastTrack ? 0.5 : 1 }}
                >
                    <Icon name="forward" size={30} color="#fff" />
                </TouchableOpacity>

                <TouchableOpacity onPress={() => {
                    setIsShuffle(prev => !prev);
                    setPlayedIndices([]); // Reinicia historial al cambiar modo
                }}>
                    <Icon name={"random"} size={30} color={isShuffle ? "#fff" : "gray"} />
                </TouchableOpacity>
            </View>
        </ImageBackground>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
    overlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0, 0, 0, 0.8)', // ajusta la opacidad aquí
    },
    time: {
        marginBottom: 10,
        fontSize: 16,
        color: "#FFFFFF",
    },
});