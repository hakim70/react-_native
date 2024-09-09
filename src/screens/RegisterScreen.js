import React, { useEffect, useState } from 'react';
import { StyleSheet, View, ActivityIndicator, Text } from 'react-native';
import MapView, { Polygon } from 'react-native-maps';
import axios from 'axios';
import { useRoute } from '@react-navigation/native';

// Function to convert WKT data to an array of coordinates
const parseWKTPolygon = (wkt) => {
  // Remove SRID and surrounding POLYGON((...))
  const wktWithoutSrid = wkt.replace(/SRID=\d+;POLYGON \(\(/, '').replace(/\)\)$/, '');
  // Split by ', ' to get individual coordinates
  const coordinatesStr = wktWithoutSrid.split(', ');

  // Convert each coordinate pair to {latitude, longitude}
  return coordinatesStr.map(coord => {
    const [longitude, latitude] = coord.split(' ').map(parseFloat);
    return { latitude, longitude };
  });
};

export default function PolygonesScreen() {
  const route = useRoute();
  const { projectId } = route.params;

  const [polygons, setPolygons] = useState([]);
  const [cityData, setCityData] = useState({ latitude: 33.811, longitude: 9.0748 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Function to fetch polygons from API
    const fetchPolygons = async () => {
      try {
        const response = await axios.get(`http://192.168.89.123:8000/fetch_parcelles/?polygon_id=${projectId}`);
        setPolygons(response.data.parcelles);
        setCityData(response.data.city_data);
      } catch (error) {
        console.error("Erreur lors de la récupération des polygones :", error);
        setError('Erreur lors de la récupération des polygones');
      } finally {
        setLoading(false);
      }
    };

    fetchPolygons();
  }, [projectId]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorMessage}>{error}</Text>
      </View>
    );
  }

  // Determine initial region
  const firstPolygonCoords = polygons.length > 0 ? parseWKTPolygon(polygons[0].polygon) : [];
  const initialLat = firstPolygonCoords.length > 0 ? firstPolygonCoords[0].latitude : cityData.latitude;
  const initialLon = firstPolygonCoords.length > 0 ? firstPolygonCoords[0].longitude : cityData.longitude;

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        initialRegion={{
          latitude: isFinite(initialLat) ? initialLat : cityData.latitude,
          longitude: isFinite(initialLon) ? initialLon : cityData.longitude,
          latitudeDelta: 0.1,
          longitudeDelta: 0.1,
        }}
      >
        {polygons.map((polygon, index) => (
          <Polygon
            key={index}
            coordinates={parseWKTPolygon(polygon.polygon)}
            strokeColor="#000"
            fillColor="rgba(0, 200, 0, 0.5)"
            strokeWidth={2}
          />
        ))}
      </MapView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    width: '100%',
    height: '100%',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorMessage: {
    color: 'red',
    fontSize: 16,
    textAlign: 'center',
  },
});
