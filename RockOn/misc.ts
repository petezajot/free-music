import AsyncStorage from '@react-native-async-storage/async-storage';
import { DownloadedSong } from './model/DownloadedSongs';

export const misc = {
    formatDuration: (seconds: number): string => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    },
    normalize: (str: string) => {
        let strNorm = misc.cleanString(str)
        return strNorm.trim().toLowerCase()
    },
    cleanString: (str: string) => {
        return str.replace(/[^a-zA-Z0-9 ]/g, "");
    },
    formatTime: (millis: number) => {
        const totalSeconds = Math.floor(millis / 1000);
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
    },
    getDownloadedSongs: async (): Promise<DownloadedSong[]> => {
        const data = await AsyncStorage.getItem('downloadedSongs');
        return data ? JSON.parse(data) : [];
    }
}; 