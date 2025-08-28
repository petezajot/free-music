import React, { useRef } from 'react';
import { Animated, StyleSheet, Dimensions } from 'react-native';
import { PanGestureHandler } from 'react-native-gesture-handler';

const screenHeight = Dimensions.get('window').height;

const DraggableElement = ({ children }: { children: React.ReactNode }) => {
    const translateY = useRef(new Animated.Value(0)).current;
    const offsetY = useRef(0);

    const onGestureEvent = Animated.event(
        [{ nativeEvent: { translationY: translateY } }],
        { useNativeDriver: true }
    );

    const onHandlerStateChange = ({ nativeEvent }: any) => {
        if (nativeEvent.state === 5) { // Gesture ended
            offsetY.current += nativeEvent.translationY;
            const clampedY = Math.max(-screenHeight * 0.5, Math.min(offsetY.current, screenHeight * 0.5));
            Animated.timing(translateY, {
                toValue: clampedY,
                duration: 200,
                useNativeDriver: true,
            }).start(() => {
                translateY.setValue(clampedY); // actualiza el valor base
            });
        }
    };

    return (
        <PanGestureHandler
            onGestureEvent={onGestureEvent}
            onHandlerStateChange={onHandlerStateChange}
        >
            <Animated.View style={[styles.player, { transform: [{ translateY }] }]}>
                {children}
            </Animated.View>
        </PanGestureHandler>
    );
};

const styles = StyleSheet.create({
    player: {
        position: 'absolute',
        bottom: 0,
        width: '100%',
        height: 80,
        backgroundColor: '#222',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 100,
    },
});

export default DraggableElement;