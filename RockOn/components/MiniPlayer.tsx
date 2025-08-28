import { View, Button, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { Audio } from 'expo-av';
import { useState, useEffect, useRef } from 'react';
import { IconButton } from 'react-native-paper';
import Slider from '@react-native-community/slider';
import { misc } from '../misc';
import * as FileSystem from 'expo-file-system';

export default function MiniPlayer({ name, artist, image, location, isLocal = false }: { name: string; artist: string; image: string; location: string; isLocal: boolean; }) {
    const soundRef = useRef<Audio.Sound | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);

    useEffect(() => {
        const loadSound = async () => {
            const streamUrl = (isLocal ? location : `http://192.168.100.107:3000/api/audio/getAudioWithUrl/${location}`)

            const { sound } = await Audio.Sound.createAsync({ uri: streamUrl });
            soundRef.current = sound;
            await sound.playAsync();
            setIsPlaying(true);
        };

        loadSound();

        return () => {
            soundRef.current?.unloadAsync();
        };
    }, [location]);

    const togglePlayPause = async () => {
        if (!soundRef.current) return;
        const status = await soundRef.current.getStatusAsync();
        if (status.isPlaying) {
            await soundRef.current.pauseAsync();
            setIsPlaying(false);
        } else {
            await soundRef.current.playAsync();
            setIsPlaying(true);
        }
    };

    return (
        <View style={styles.container}>
            <Image source={{ uri: image }} style={styles.image} />
            <View style={styles.infoContainer}>
                <Text style={styles.title} numberOfLines={1}>{name}</Text>
                <Text style={styles.artist} numberOfLines={1}>{artist}</Text>
            </View>
            <IconButton
                icon={isPlaying ? "pause" : "play"}
                size={30}
                onPress={togglePlayPause}
                color="#FFFFFF"
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        bottom: 0,
        width: '99%',
        height: 70,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#1e1e1e',
        padding: 10,
        borderRadius: 10,
        marginBottom: 15,
        marginStart: 10,
        marginEnd: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.8,
        shadowRadius: 2,
        elevation: 5,
    },
    image: {
        width: 50,
        height: 50,
        borderRadius: 5,
    },
    infoContainer: {
        flex: 1,
        marginLeft: 10,
    },
    title: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: 'bold',
    },
    artist: {
        color: '#AAAAAA',
        fontSize: 14,
    },
});