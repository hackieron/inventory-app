
import { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Pressable,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import MapView, { Marker, Region } from 'react-native-maps';
import * as Location from 'expo-location';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@/constants/theme';

export type MapCoordinates = {
    latitude: number;
    longitude: number;
};

type Props = {
    value: MapCoordinates | null;
    address: string;
    onChange: (coordinates: MapCoordinates) => void;
    onAddressChange: (address: string) => void;
};

const INITIAL_REGION: Region = {
    latitude: 14.5995,
    longitude: 120.9842,
    latitudeDelta: 0.025,
    longitudeDelta: 0.025,
};

export default function LocationMapPicker({
    value,
    address,
    onChange,
    onAddressChange,
}: Props) {
    const [loading, setLoading] = useState(false);
    const [map, setMap] = useState<MapView | null>(null);

    const useCurrentLocation = async () => {
        try {
            setLoading(true);

            const { status } =
                await Location.requestForegroundPermissionsAsync();

            if (status !== 'granted') {
                Alert.alert(
                    'Permission required',
                    'Allow location access to use your current position.'
                );
                return;
            }

            const position = await Location.getCurrentPositionAsync({
                accuracy: Location.Accuracy.High,
            });

            const coordinates = {
                latitude: position.coords.latitude,
                longitude: position.coords.longitude,
            };

            await selectLocation(coordinates);

            map?.animateToRegion(
                {
                    ...coordinates,
                    latitudeDelta: 0.005,
                    longitudeDelta: 0.005,
                },
                500
            );
        } catch {
            Alert.alert(
                'Location unavailable',
                'Unable to retrieve your current location.'
            );
        } finally {
            setLoading(false);
        }
    };
    const selectLocation = async (coordinates: MapCoordinates) => {
        onChange(coordinates);
        onAddressChange('');

        try {
            const results = await Location.reverseGeocodeAsync(coordinates);

            if (results.length > 0) {
                const place = results[0];

                const formattedAddress = [
                    place.streetNumber,
                    place.street,
                    place.district,
                    place.city,
                    place.region,
                    place.postalCode,
                    place.country,
                ]
                    .filter(Boolean)
                    .join(', ');

                onAddressChange(formattedAddress);
            }
        } catch (error) {
            console.error('Reverse geocoding failed:', error);
        }
    };
    return (
        <View style={styles.container}>
            <MapView
                ref={setMap}
                style={styles.map}
                initialRegion={INITIAL_REGION}
                onPress={(event) => {
                    void selectLocation(event.nativeEvent.coordinate);
                }}
            >
                {value && (
                    <Marker
                        coordinate={value}
                        draggable
                        onDragEnd={(event) => {
                            void selectLocation(event.nativeEvent.coordinate);
                        }}
                    />
                )}
            </MapView>

            <Pressable
                style={styles.locationButton}
                onPress={useCurrentLocation}
                disabled={loading}
            >
                {loading ? (
                    <ActivityIndicator color={colors.primary} />
                ) : (
                    <Ionicons
                        name="locate-outline"
                        size={21}
                        color={colors.primary}
                    />
                )}
            </Pressable>

            <View style={styles.footer}>
                <Ionicons
                    name="location-outline"
                    size={17}
                    color={colors.primary}
                />

                <Text style={styles.coordinates}>
                    {address || 'Select a location on the map'}
                </Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        borderRadius: 18,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: colors.border,
        backgroundColor: colors.surface,
    },
    map: {
        width: '100%',
        height: 240,
    },
    locationButton: {
        position: 'absolute',
        right: 12,
        top: 12,
        width: 44,
        height: 44,
        borderRadius: 14,
        backgroundColor: colors.surface,
        alignItems: 'center',
        justifyContent: 'center',
        elevation: 4,
    },
    footer: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 13,
        gap: 8,
    },
    coordinates: {
        flex: 1,
        fontSize: 12,
        color: colors.textMuted,
    },
});
