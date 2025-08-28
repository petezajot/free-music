import { useState, useEffect } from "react";
import { View, Text, Image, TouchableOpacity, StyleSheet, ImageBackground } from "react-native";
import { useRoute } from '@react-navigation/native';
import { AudioManager } from "../modules/AudioManager";
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

export default function LocalPlayer() {
    const route = useRoute<{ params: SongData }>();
    const { selectedTracks } = route.params;
    const [currentIndex, setCurrentIndex] = useState(0);
    const [duration, setDuration] = useState(0);
    const [position, setPosition] = useState(0);
    const [isPlaying, setIsPlaying] = useState(true);
    const [isShuffle, setIsShuffle] = useState(false);
    const [playedIndices, setPlayedIndices] = useState<number[]>([]);

    const isFirstTrack = currentIndex === 0;
    const isLastTrack = isShuffle
        ? playedIndices.length === selectedTracks.length
        : currentIndex === selectedTracks.length - 1;

    useEffect(() => {
        const track = selectedTracks[currentIndex];
        AudioManager.play(track.location.toString(), (status) => {
            if (!status.isLoaded) return;
            setDuration(status.durationMillis || 0);
            setPosition(status.positionMillis || 0);

            if (status.didJustFinish) {
                const nextIndex = isShuffle ? getNextRandomIndex() : currentIndex + 1;
                if (nextIndex < selectedTracks.length) {
                    setCurrentIndex(nextIndex);
                }
            }
        });
        setIsPlaying(true);
    }, [currentIndex]);

    /*useEffect(() => {
        return () => {
            AudioManager.unload(); // 🔥 Detiene y libera el audio al salir
        };
    }, []);*/

    const togglePlayback = async () => {
        await AudioManager.toggle();
        setIsPlaying(prev => !prev);
    };

    const goToPreviousTrack = () => {
        if (isShuffle && playedIndices.length > 1) {
            const updatedHistory = [...playedIndices];
            updatedHistory.pop();
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
        const remainingIndices = selectedTracks
            .map((_, index) => index)
            .filter(index => !playedIndices.includes(index));

        if (remainingIndices.length === 0) {
            const resetIndex = Math.floor(Math.random() * selectedTracks.length);
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
        setCurrentIndex(0);
        setPlayedIndices([]);
    }, [selectedTracks[0].artist]);

    return (
        <ImageBackground
            style={styles.container}
            source={{ uri: selectedTracks[0].image }}
            resizeMode="cover"
        >
            <View style={styles.overlay} />
            <Image
                source={{ uri: selectedTracks[0].image }}
                style={{ width: 100, height: 100, marginTop: 0 }}
            />
            <Text style={{ fontSize: 20, fontWeight: 'bold', marginTop: 10, color: "#FFFFFF" }} numberOfLines={1}>{selectedTracks[0].artist}</Text>
            <Text style={styles.time}>{selectedTracks[currentIndex]?.name}</Text>

            <Slider
                style={{ width: '100%' }}
                minimumValue={0}
                maximumValue={duration}
                value={position}
                minimumTrackTintColor="#FFFFFF"
                maximumTrackTintColor="#ccc"
                thumbTintColor="#FFFFFF"
                onSlidingComplete={async (value) => {
                    const sound = AudioManager.getSound();
                    if (sound) {
                        await sound.setPositionAsync(value);
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
                    setPlayedIndices([]);
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
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
    },
    time: {
        marginBottom: 10,
        fontSize: 16,
        color: "#FFFFFF",
    },
});
