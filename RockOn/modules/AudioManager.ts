import { Audio } from 'expo-av';

let sound: Audio.Sound | null = null;

export const AudioManager = {
    async play(uri: string, onStatusUpdate: (status: Audio.PlaybackStatus) => void) {
        if (sound) {
            const status = await sound.getStatusAsync();
            if (status.isLoaded) {
                await sound.stopAsync();
                await sound.unloadAsync();
            }
        }

        const { sound: newSound } = await Audio.Sound.createAsync(
            { uri },
            { shouldPlay: true }
        );

        sound = newSound;
        sound.setOnPlaybackStatusUpdate(onStatusUpdate);
        await sound.playAsync();
    },

    async toggle() {
        if (!sound) return;
        const status = await sound.getStatusAsync();
        if (status.isLoaded) {
            if (status.isPlaying) {
                await sound.pauseAsync();
            } else {
                await sound.playAsync();
            }
        }
    },

    async unload() {
        if (sound) {
            await sound.unloadAsync();
            sound = null;
        }
    },

    getSound() {
        return sound;
    }
};
