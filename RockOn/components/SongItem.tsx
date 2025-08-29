import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  FlatList,
  StyleSheet,
} from 'react-native';
import { Playlist, Track } from '../model/Playlists'; // Asegúrate de importar tus tipos
import { Ionicons } from '@expo/vector-icons';

export const SongItem = ({
  track,
  playlists,
  addTrackToPlaylist,
}: {
  track: Track;
  playlists: Playlist[];
  addTrackToPlaylist: (playlistId: string, name: string, track: Track) => Promise<void>;
}) => {
  const [modalVisible, setModalVisible] = useState(false);

  const handleAddToPlaylist = async (playlist: Playlist) => {
    await addTrackToPlaylist(playlist.id, playlist.name, track);
    setModalVisible(false);
  };

  return (
    <View style={styles.songContainer}>
      <Text style={styles.songTitle}>{track.name}</Text>

      <TouchableOpacity onPress={() => setModalVisible(true)}>
        <Ionicons name="ellipsis-vertical" size={24} color="#333" />
      </TouchableOpacity>

      <Modal visible={modalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Agregar a playlist</Text>
            <FlatList
              data={playlists}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.playlistItem}
                  onPress={() => handleAddToPlaylist(item)}
                >
                  <Ionicons name="musical-notes-outline" size={20} color="#555" />
                  <Text style={styles.playlistName}>{item.name}</Text>
                </TouchableOpacity>
              )}
            />
            <TouchableOpacity onPress={() => setModalVisible(false)}>
              <Text style={styles.cancel}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  songContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 12,
    borderBottomWidth: 1,
    borderColor: '#eee',
  },
  songTitle: {
    fontSize: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  playlistItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
  },
  playlistName: {
    marginLeft: 10,
    fontSize: 16,
  },
  cancel: {
    marginTop: 20,
    textAlign: 'center',
    color: 'gray',
  },
});
