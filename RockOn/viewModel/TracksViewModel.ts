import { useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Tracks } from "../model/Tracks";
import { misc } from "../misc";

export const useTracksViewModel = () => {
    const [tracks, setTracks] = useState<Tracks[]>([]);
    const [loading, setLoading] = useState<boolean>(false);

    const fetchTracks = async (artist: string, album: string) => {
        setLoading(true);
        try {
            const cacheKey = `tracks_${misc.normalize(artist)}_${misc.normalize(album)}`;
            const cached = await AsyncStorage.getItem(cacheKey);

            if (cached) {
                const parsed = JSON.parse(cached);
                setTracks(parsed);
                return JSON.parse(cached);
            }
            
            const res = await fetch(`http://ws.audioscrobbler.com/2.0/?method=album.getinfo&api_key=af455b394c76ef42c9de2c617c66465f&artist=${encodeURIComponent(artist)}&album=${misc.normalize(album)}&format=json`);
            const json = await res.json();
            const rawTracks = json.album.tracks.track;

            const mapped: Tracks[] = rawTracks.map((t: any) => ({
                name: t.name,
                duration: t.duration,
                '@attr': t['@attr'] ? { rank: t['@attr'].rank } : undefined,
            }));

            await AsyncStorage.setItem(cacheKey, JSON.stringify(mapped));
            setTracks(mapped);
        } catch (error) {
            console.error("Error fetching tracks: ", error);
        } finally {
            setLoading(false);
        }
    };

    return { tracks, loading, fetchTracks };
};