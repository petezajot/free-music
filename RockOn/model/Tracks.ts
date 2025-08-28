export interface Tracks {
    album: {
        artist: string;
        tracks: [Track];
    }
};

interface Track {
    name: string;
    duration: number;
    '@attr'?: { rank: number };
}