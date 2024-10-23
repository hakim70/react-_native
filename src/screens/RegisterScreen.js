import { useRoute } from '@react-navigation/native';
import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import MapView, { Polygon, Marker } from 'react-native-maps';

// Function to parse WKT polygons into coordinate arrays for MapView
const parseWKTPolygon = (wkt) => {
  try {
    const wktWithoutSrid = wkt.replace(/SRID=\d+;POLYGON \(\(/, '').replace(/\)\)$/, '');
    const coordinatesStr = wktWithoutSrid.split(', ');

    const parsedCoordinates = coordinatesStr.map(coord => {
      const [latitude, longitude] = coord.split(' ').map(parseFloat);
      return { latitude, longitude };
    });

    return parsedCoordinates;
  } catch (error) {
    console.error("Error parsing WKT polygon:", error);
    return [];
  }
};

export default function PolygonesScreen() {
  const route = useRoute();
  const { projectId } = route.params;
  const [polygons, setPolygons] = useState([]);
  const [nodes, setNodes] = useState([]);  // State for nodes
  const [datas, setDatas] = useState([]);  // New state for datas
  const [cityData, setCityData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPolygons = async () => {
      try {
        const response = await axios.get(`http://192.168.43.236:8000/fetch_parcelles/?polygon_id=${projectId}`);
        
        if (response.data && response.data.parcelles && response.data.city_data && response.data.nodes && response.data.datas) {
          setPolygons(response.data.parcelles);
          setCityData(response.data.city_data);
          setNodes(response.data.nodes);  // Save nodes data
          setDatas(response.data.datas);  // Save datas data
          
          // Log datas to the console
          console.log("Datas:", response.data.datas);
        } else {
          throw new Error('Unexpected response format');
        }
      } catch (error) {
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

  const firstPolygonCoords = polygons.length > 0 ? parseWKTPolygon(polygons[0].polygon) : [];
  const initialLat = firstPolygonCoords.length > 0 ? firstPolygonCoords[0].latitude : cityData?.latitude;
  const initialLon = firstPolygonCoords.length > 0 ? firstPolygonCoords[0].longitude : cityData?.longitude;

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        initialRegion={{
          latitude: isFinite(initialLat) ? initialLat : cityData.latitude,
          longitude: isFinite(initialLon) ? initialLon : cityData.longitude,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
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

        {/* Render nodes as markers */}
        {nodes.map((node, index) => (
          <Marker
            key={index}
            coordinate={{
              latitude: parseFloat(node.latitude),
              longitude: parseFloat(node.longitude),
            }}
            title={node.name}
            description={`Référence: ${node.reference}, Sensors: ${node.sensors}`}
          />
        ))}
      </MapView>

      {/* Log and Display Datas */}
      {datas.length > 0 && (
        <View style={styles.datasContainer}>
          <Text style={styles.datasTitle}>Datas:</Text>
          {datas.map((data, index) => (
            <Text key={index} style={styles.dataItem}>
              {`Node ID: ${data.node}, Sensor: ${data.sensor}, Value: ${data.value}`}
            </Text>
          ))}
        </View>
      )}
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
  datasContainer: {
    padding: 10,
  },
  datasTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  dataItem: {
    fontSize: 14,
  },
});



// ////////////////////////////////////////////////////////
// import { useRoute } from '@react-navigation/native';
// import axios from 'axios';
// import React, { useEffect, useState } from 'react';
// import { ActivityIndicator, StyleSheet, Text, View, ScrollView } from 'react-native';
// import MapView, { Polygon, Marker } from 'react-native-maps';

// // Function to parse WKT polygons into coordinate arrays for MapView
// const parseWKTPolygon = (wkt) => {
//   try {
//     const wktWithoutSrid = wkt.replace(/SRID=\d+;POLYGON \(\(/, '').replace(/\)\)$/, '');
//     const coordinatesStr = wktWithoutSrid.split(', ');

//     const parsedCoordinates = coordinatesStr.map(coord => {
//       const [latitude, longitude] = coord.split(' ').map(parseFloat);
//       return { latitude, longitude };
//     });

//     return parsedCoordinates;
//   } catch (error) {
//     console.error("Error parsing WKT polygon:", error);
//     return [];
//   }
// };

// export default function PolygonesScreen() {
//   const route = useRoute();
//   const { projectId } = route.params;

//   const [polygons, setPolygons] = useState([]);
//   const [nodes, setNodes] = useState([]);  // State for nodes
//   const [datas, setDatas] = useState([]);  // New state for datas
//   const [cityData, setCityData] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);

//   useEffect(() => {
//     const fetchPolygons = async () => {
//       try {
//         const response = await axios.get(`http://192.168.203.123:8000/fetch_parcelles/?polygon_id=${projectId}`);
        
//         if (response.data && response.data.parcelles && response.data.city_data && response.data.nodes && response.data.datas) {
//           setPolygons(response.data.parcelles);
//           setCityData(response.data.city_data);
//           setNodes(response.data.nodes);  // Save nodes data
//           setDatas(response.data.datas);  // Save datas data
          
//           // Log datas to the console
//           console.log("Datas:", response.data.datas);
//         } else {
//           throw new Error('Unexpected response format');
//         }
//       } catch (error) {
//         setError('Erreur lors de la récupération des polygones');
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchPolygons();
//   }, [projectId]);

//   if (loading) {
//     return (
//       <View style={styles.loadingContainer}>
//         <ActivityIndicator size="large" color="#0000ff" />
//       </View>
//     );
//   }

//   if (error) {
//     return (
//       <View style={styles.errorContainer}>
//         <Text style={styles.errorMessage}>{error}</Text>
//       </View>
//     );
//   }

//   const firstPolygonCoords = polygons.length > 0 ? parseWKTPolygon(polygons[0].polygon) : [];
//   const initialLat = firstPolygonCoords.length > 0 ? firstPolygonCoords[0].latitude : cityData?.latitude;
//   const initialLon = firstPolygonCoords.length > 0 ? firstPolygonCoords[0].longitude : cityData?.longitude;

//   return (
//     <View style={styles.container}>
//       <MapView
//         style={styles.map}
//         initialRegion={{
//           latitude: isFinite(initialLat) ? initialLat : cityData.latitude,
//           longitude: isFinite(initialLon) ? initialLon : cityData.longitude,
//           latitudeDelta: 0.05,
//           longitudeDelta: 0.05,
//         }}
//       >
//         {polygons.map((polygon, index) => (
//           <Polygon
//             key={index}
//             coordinates={parseWKTPolygon(polygon.polygon)}
//             strokeColor="#000"
//             fillColor="rgba(0, 200, 0, 0.5)"
//             strokeWidth={2}
//           />
//         ))}

//         {/* Render nodes as markers */}
//         {nodes.map((node, index) => (
//           <Marker
//             key={index}
//             coordinate={{
//               latitude: parseFloat(node.latitude),
//               longitude: parseFloat(node.longitude),
//             }}
//             title={node.name}
//             description={`Référence: ${node.reference}, Sensors: ${node.sensors}`}
//           />
//         ))}
//       </MapView>

//       {/* Display Datas */}
//       <ScrollView style={styles.datasContainer}>
//         <Text style={styles.datasTitle}>Données des capteurs :</Text>
//         {datas.map((data, index) => (
//           <View key={index} style={styles.dataItem}>
//             <Text>Node ID: {data.node}</Text>
//             <Text>Capteur: {data.sensor}</Text>
//             <Text>Valeur: {data.value}</Text>
//           </View>
//         ))}
//       </ScrollView>
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//   },
//   map: {
//     width: '100%',
//     height: '60%',
//   },
//   loadingContainer: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   errorContainer: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     padding: 20,
//   },
//   errorMessage: {
//     color: 'red',
//     fontSize: 16,
//     textAlign: 'center',
//   },
//   datasContainer: {
//     padding: 10,
//     backgroundColor: '#f0f0f0',
//     height: '40%',  // Adjust the size of the data display area
//   },
//   datasTitle: {
//     fontSize: 18,
//     fontWeight: 'bold',
//     marginBottom: 10,
//   },
//   dataItem: {
//     backgroundColor: '#fff',
//     padding: 10,
//     borderRadius: 8,
//     marginBottom: 10,
//   },
// });
