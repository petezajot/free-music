
/**
 * Ejemplo de construcción del modelo de "Tracks"
 * {
 * "album": "Twilight of the Thunder God",
 * "artist": "Amon Amarth",
 * "image": "https://lastfm.freetls.fastly.net/i/u/174s/452a220c6c6d41a4a651aa5da2e3d07b.png",
 * "location": "file:///data/user/0/host.exp.exponent/files/Twilight%20of%20the%20Thunder%20God.mp3",
 * "name": "Twilight of the Thunder God"
 * }
 */

export type Playlist = {
  id: string;
  name: string;
  tracks: Track[];
};

export type Track = {
  id: string;
  album: string;
  name: string;
  artist: string;
  location: string;
  image?: string;
};
