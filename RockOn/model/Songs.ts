export interface Songs {
    code: number;
    message: string;
    body: [SongData];
};

interface SongData {
    id: number;
    title: string;
    duration: number;
}