import { ActivityIndicator } from "react-native-paper";
import { View, StyleSheet } from "react-native";

export default function LoaderView() {
    return (
        <View style={styles.container}>
            <ActivityIndicator size="large" color="gray" />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        position: 'absolute',
        top: 0,
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 1,
    },
});