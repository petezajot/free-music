import { useEffect, useState } from "react";
import { View, Text, StyleSheet, ActivityIndicator, FlatList, Image, TouchableOpacity } from "react-native";
import { useAlbumsViewModel } from '../viewModel/AlbumsViewModel';
import CustomHeader from '../components/SearchBar';
import LoaderView from "../components/LoaderView";

export default function Home({ navigation }: { navigation: any }) {
    const { albums, loading, fetchAlbums } = useAlbumsViewModel();

    return (
        <View style={styles.container}>
            <CustomHeader onSearch={fetchAlbums} />

            {loading ? (
                <LoaderView />
            ) : albums.length === 0 ? (
                <Text style={styles.emptyText}>Realiza una búsqueda por artista</Text>
            ) : (
                <FlatList
                    data={albums}
                    keyExtractor={(item) => item.name}
                    renderItem={({ item }) => (
                        <TouchableOpacity style={styles.itemContainer} onPress={() => navigation.navigate('AlbumDetails', { playcount: item.playcount, name: item.name, image: item.image, artist: item.artist })}>
                            <Image
                                source={{ uri: item.image }}
                                style={{ width: 100, height: 100, marginTop: 5 }}
                            />
                            <View style={{ marginLeft: 10, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                                <Text>Album: {item.name}</Text>
                                <Text>Reproducciones: {item.playcount}</Text>
                            </View>
                        </TouchableOpacity>
                    )}
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    emptyText: {
        textAlign: 'center',
        marginTop: 50
    },
    itemContainer: {
        padding: 10,
        display: 'flex',
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderBottomColor: '#ccc',
        alignItems: 'center',
        backgroundColor: '#f9f9f9',
        margin: 5,
        borderRadius: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 5,
        elevation: 2,
    }
});