import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';

const QueueList = ({ tracks, currentIndex }: { tracks: Track[]; currentIndex: number }) => {
    const upcomingTracks = tracks.slice(currentIndex + 1);

    return (
        <View style={{ marginTop: 30 }}>
            <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 18 }}>Próximas canciones</Text>
            {upcomingTracks.map((track, index) => (
                <View key={index} style={{ flexDirection: 'row', alignItems: 'center', marginVertical: 5 }}>
                    <Icon name="music" size={20} color="#fff" />
                    <Text style={{ marginLeft: 10, color: '#fff' }} numberOfLines={1}>
                        {track.name}
                    </Text>
                </View>
            ))}
            {upcomingTracks.length === 0 && (
                <Text style={{ color: '#ccc', marginTop: 10 }}>No hay más canciones en la cola</Text>
            )}
        </View>
    );
};

export default QueueList;