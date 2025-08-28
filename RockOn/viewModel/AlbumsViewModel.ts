import { useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Albums } from "../model/Albums";
import { misc } from "../misc";

export const useAlbumsViewModel = () => {
    const [albums, setAlbums] = useState<Albums[]>([]);
    const [loading, setLoading] = useState<boolean>(false);

    const fetchAlbums = async (artist: string) => {
        setLoading(true);
        try {
            const cacheKey = `topAlbums_${misc.normalize(artist)}`;
            const cached = await AsyncStorage.getItem(cacheKey);

            if (cached) {
                const parsed = JSON.parse(cached);
                setAlbums(parsed); // <-- Esto actualiza el estado
                return parsed;
            }

            const res = await fetch(`http://ws.audioscrobbler.com/2.0/?method=artist.gettopalbums&artist=${encodeURIComponent(artist)}&api_key=af455b394c76ef42c9de2c617c66465f&format=json`);
            const json = await res.json();
            const rawAlbums = json.topalbums.album;

            const mapped: Albums[] = rawAlbums.map((a: any) => ({
                name: a.name,
                playcount: parseInt(a.playcount),
                image: a.image?.[2]?.['#text'] || '',
                artist: a.artist?.name || '',
            }));

            await AsyncStorage.setItem(cacheKey, JSON.stringify(mapped));
            setAlbums(mapped);
        } catch (error) {
            console.log("Error fetching albums: ", error);
        } finally {
            setLoading(false);
        }
    };

    return { albums, loading, fetchAlbums };
};