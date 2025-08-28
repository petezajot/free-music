export interface Albums {
    topalbums: {album: [Album]};
};

interface Album {
    name: string;
    playcount: number;
    mbid: string;
    url: string;
    artist: {
        name: string;
        mbid: string;
        url: string;
    };
    image: { '#text': string; size: string }[];
}