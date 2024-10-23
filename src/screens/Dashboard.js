import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Dimensions,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

export default function ProjectListScreen({ navigation }) {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [nodes, setNodes] = useState([]);
  const [error, setError] = useState(null);

  // Fonction pour récupérer les projets
  const fetchProjects = async () => {
    try {
      const token = await AsyncStorage.getItem('access_token');
      if (!token) {
        throw new Error("Aucun token d'authentification trouvé");
      }

      const response = await axios.get('http://192.168.43.236:8000/projC/', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setProjects(response.data.projects);
      setNodes(response.data.nodes);
    } catch (error) {
      console.error('Erreur lors de la récupération des projets:', error);
      setError(error.response?.data?.detail || 'Erreur lors de la récupération des projets');
    } finally {
      setLoading(false);
    }
  };

  // Fonction pour gérer la déconnexion
  const logoutUser = async () => {
    try {
      const refreshToken = await AsyncStorage.getItem('refresh_token');
      const authToken = await AsyncStorage.getItem('access_token');

      await axios.post(
        'http://192.168.43.236:8000/authmobile/logout/',
        { refresh: refreshToken },
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        }
      );

      await AsyncStorage.removeItem('access_token');
      await AsyncStorage.removeItem('refresh_token');
      navigation.navigate('LoginScreen');
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error.response ? error.response.data : error.message);
    }
  };

  // Définir les options de la navbar, y compris le bouton "Logout"
  useEffect(() => {
    fetchProjects();

    // Configurer la navbar avec le bouton "Logout"
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity onPress={logoutUser} style={styles.navButton}>
          <Text style={styles.navButtonText}>Logout</Text>
        </TouchableOpacity>
      ),
      headerTitle: 'Liste des Projets',
    });
  }, []);

  const handleFWIAlert = (node) => {
    if (node.FWI >= 35) {
      Alert.alert(
        'Alerte Danger',
        `Le projet ${node.name} a un FWI de ${node.FWI}, ce qui le rend dangereux !`,
        [{ text: 'OK', onPress: () => console.log('Alerte fermée') }]
      );
    }
  };

  const showAlert = (action) => Alert.alert('Action', `Vous avez appuyé sur ${action}`);

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

  return (
    <FlatList
      data={projects}
      keyExtractor={item => item.polygon_id.toString()}
      renderItem={({ item }) => {
        const today = new Date();
        const isExpired = new Date(item.date_fin) < today;
        const filteredNodes = nodes.filter(node => node.parcelle === item.polygon_id);

        return (
          <View style={[styles.box, isExpired ? { backgroundColor: '#ffe6e6' } : null]}>
            <Image
              source={{ uri: `http://192.168.43.236:8000${item.piece_joindre}` }}
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

              {isExpired && (
                <Text style={styles.expiredText}>Ce projet est expiré</Text>
              )}

              <Text style={styles.nodeInfo}>FWI des nœuds associés :</Text>
              {filteredNodes.length > 0 ? (
                filteredNodes.map((node) => {
                  handleFWIAlert(node);
                  return (
                    <Text key={node.id} style={styles.nodeFWI}>
                      - {node.name} : FWI = {node.FWI}
                    </Text>
                  );
                })
              ) : (
                <Text>Aucun nœud associé</Text>
              )}

              <View style={styles.buttons}>
                <TouchableOpacity
                  style={[styles.button, styles.view]}
                  onPress={() => navigation.navigate('RegisterScreen', { projectId: item.polygon_id })}
                >
                  <Image
                    style={styles.icon}
                    source={{ uri: 'https://i.fbcd.co/products/pinterest/2d0d653b122559da2b463fd2c0cec10d6594da8648ca234764f6cb66352fd910.jpg' }}
                  />
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.button, styles.logout]}
                  onPress={logoutUser}
                >
                  <Image
                    style={styles.icon}
                    source={{ uri: 'https://img.icons8.com/color/70/000000/logout.png' }}
                  />
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.button, styles.message]}
                  onPress={() => showAlert('Message')}
                >
                  <Image
                    style={styles.icon}
                    source={{ uri: 'https://img.icons8.com/color/70/000000/plus.png' }}
                  />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        );
      }}
      ListEmptyComponent={<Text style={styles.emptyMessage}>Aucun projet trouvé</Text>}
      refreshing={loading}
      onRefresh={fetchProjects}
      style={{ flex: 1 }}
    />
  );
}

const { width, height } = Dimensions.get('window');

const styles = StyleSheet.create({
  navButton: {
    marginRight: 10,
    padding: 5,
    backgroundColor: '#ff6347',
    borderRadius: 5,
  },
  navButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  image: {
    width: width * 0.2,
    height: width * 0.2,
  },
  box: {
    padding: 20,
    marginTop: 5,
    marginBottom: 5,
    backgroundColor: 'white',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  boxContent: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    color: '#151515',
    textAlign: 'center',
  },
  description: {
    fontSize: 15,
    color: '#646464',
    textAlign: 'center',
  },
  buttons: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
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
  logout: {
    backgroundColor: '#ff6347',
  },
  message: {
    backgroundColor: '#255B22',
  },
  date: {
    fontSize: 14,
    color: '#999999',
    marginTop: 5,
    textAlign: 'center',
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
  },
  errorMessage: {
    color: 'red',
  },
  expiredText: {
    color: 'red',
    fontWeight: 'bold',
  },
  nodeInfo: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  nodeFWI: {
    fontSize: 14,
    color: '#333',
    textAlign: 'center',
  },
  emptyMessage: {
    textAlign: 'center',
    color: '#888',
    marginTop: 20,
  },
});
