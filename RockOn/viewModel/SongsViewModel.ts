import { useState } from "react";
import * as FileSystem from 'expo-file-system';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Songs } from "../model/Songs";
import { DownloadedSong } from "../model/DownloadedSongs";
import { misc } from "../misc";

export const useSongsViewModel = () => {
    const [songs, setSongs] = useState<Songs[]>([]);
    const [songLocation, setSongLocation] = useState<string>("");
    const [loading, setLoading] = useState<boolean>(false);

    const fetchSongs = async (artist: string, song: string) => {
        setLoading(true);
        try {
            const songName = `${artist} - ${song} HQ`;

            const body = { query: songName };
            const res = await fetch(`http://192.168.100.107:3000/api/search/search`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(body),
                });

            const json = await res.json();
            const rawSongs = json.body;

            const mapped: Songs[] = rawSongs.map((s: any) => ({
                id: s.id,
                title: s.title,
                duration: s.duration,
            }));
            setSongs(mapped);
        } catch (error) {
            console.error("Error fetching songs: ", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchSongsDirect = async (artist: string, song: string) => {
        try {
            const songName = `${artist} - ${song} HQ`;

            const body = { query: songName };
            const res = await fetch(`http://192.168.100.107:3000/api/search/search`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(body),
                });

            const json = await res.json();
            const rawSongs = json.body;

            const mapped: Songs[] = rawSongs.map((s: any) => ({
                id: s.id,
                title: s.title,
                duration: s.duration,
            }));

            return mapped
        } catch (error) {
            console.error("Error fetching songs: ", error);
        }
    };

    const downloadSong = async (videoId: string, songName: string, showLoader: boolean, artist: string = "", album: string = "", image: string = "") => {
        setLoading(showLoader);
        try {
            const downloadUrl = `http://192.168.100.107:3000/api/audio/downloadAudio/${videoId}`;
            const fileUri = `${FileSystem.documentDirectory}${songName}.mp3`;

            // Descargar el archivo
            const downloadResumable = FileSystem.createDownloadResumable(
                downloadUrl,
                fileUri
            );

            const { uri } = await downloadResumable.downloadAsync();
            setSongLocation(uri);

            const trackName = songName.replace(/[^a-zA-Z0-9 \-_]/g, ''); // Limpia el nombre de caracteres inválidos
            const artistName = artist || 'Unknown Artist';
            const albumName = album || 'Unknown Album';
            const fileLocation = uri;
            const downloadedSong: DownloadedSong = {
                name: trackName,
                artist: artistName,
                album: albumName,
                location: fileLocation,
                image: image
            };
            await saveDownloadedSong(downloadedSong);

        } catch (error) {
            console.error("Error downloading song: ", error);
        } finally {
            setLoading(false);
        }
    };

    const saveDownloadedSong = async (song: DownloadedSong) => {
        try {
            const existing = await AsyncStorage.getItem('downloadedSongs');
            const songs = existing ? JSON.parse(existing) : [];

            // Evita duplicados
            const alreadyExists = songs.some((s: DownloadedSong) => s.location === song.location);
            if (!alreadyExists) {
                songs.push(song);
                await AsyncStorage.setItem('downloadedSongs', JSON.stringify(songs));
            }
        } catch (error) {
            console.error('Error guardando la canción:', error);
        }
    };



    return { songs, loading, songLocation, fetchSongs, downloadSong, fetchSongsDirect };
};