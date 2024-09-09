import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function ProjectListScreen({ navigation }) {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchProjects = async () => {
    try {
      const token = await AsyncStorage.getItem('access_token'); // Retrieve token
      if (!token) {
        throw new Error('Aucun token d\'authentification trouvé');
      }

      const response = await axios.get('http://192.168.89.123:8000/projC/', {
        headers: {
          Authorization: `Bearer ${token}`, // Include token in headers
        },
      });

      console.log("Projets récupérés avec succès:", response.data);
      setProjects(response.data.projects); // Update state with projects
    } catch (error) {
      console.error('Erreur lors de la récupération des projets:', error);
      setError(error.response?.data?.detail || 'Erreur lors de la récupération des projets');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  // Function to handle button actions
  const showAlert = (action) => Alert.alert('Action', `Vous avez appuyé sur ${action}`);

  // Show loading indicator while fetching data
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  // Show error message if there's an error
  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorMessage}>{error}</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={projects}
      keyExtractor={item => item.polygon_id.toString()} // Use polygon_id as unique key
      renderItem={({ item }) => (
        <View style={styles.box}>
          <Image
            source={{ uri: `http://192.168.42.123:8000${item.piece_joindre}` }}
            style={styles.image} 
          />
          <View style={styles.boxContent}>
            <Text style={styles.title}>Nom du projet : {item.name}</Text>
            <Text style={styles.description}>Description : {item.descp}</Text>
            <Text style={styles.date}>
              Date de début : {new Date(item.date_debut).toLocaleDateString()}
            </Text>
            <Text style={styles.date}>
              Date de fin : {new Date(item.date_fin).toLocaleDateString()}
            </Text>

            {/* Buttons */}
            <View style={styles.buttons}>
            <TouchableOpacity
  style={[styles.button, styles.view]}
  onPress={() => navigation.navigate('RegisterScreen', { projectId: item.polygon_id })}>
  <Image
    style={styles.icon}
    source={{ uri: 'https://img.icons8.com/color/70/000000/filled-like.png' }}
  />
</TouchableOpacity>

              <TouchableOpacity
                style={[styles.button, styles.profile]}
                onPress={() => showAlert('Profil')}>
                <Image
                  style={styles.icon}
                  source={{ uri: 'https://img.icons8.com/color/70/000000/cottage.png' }}
                />
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.button, styles.message]}
                onPress={() => showAlert('Message')}>
                <Image
                  style={styles.icon}
                  source={{ uri: 'https://img.icons8.com/color/70/000000/plus.png' }}
                />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
      ListEmptyComponent={<Text style={styles.emptyMessage}>Aucun projet trouvé</Text>}
      refreshing={loading}
      onRefresh={fetchProjects}
      style={{ flex: 1 }}
    />
  );
}

const styles = StyleSheet.create({
  image: {
    width: 100,
    height: 100,
  },
  box: {
    padding: 20,
    marginTop: 5,
    marginBottom: 5,
    backgroundColor: 'white',
    flexDirection: 'row',
  },
  boxContent: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'flex-start',
    marginLeft: 10,
  },
  title: {
    fontSize: 18,
    color: '#151515',
  },
  description: {
    fontSize: 15,
    color: '#646464',
  },
  buttons: {
    flexDirection: 'row',
  },
  button: {
    height: 35,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
    width: 50,
    marginRight: 5,
    marginTop: 5,
  },
  icon: {
    width: 20,
    height: 20,
  },
  view: {
    backgroundColor: '#eee',
  },
  profile: {
    backgroundColor: '#1E90FF',
  },
  message: {
    backgroundColor: '#228B22',
  },
  date: {
    fontSize: 14,
    color: '#999999',
    marginTop: 5,
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
  emptyMessage: {
    textAlign: 'center',
    padding: 20,
    color: '#999999',
    fontSize: 16,
  },
});
