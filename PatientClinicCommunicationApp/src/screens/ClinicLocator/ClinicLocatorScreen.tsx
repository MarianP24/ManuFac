import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Dimensions,
  Platform,
  Alert,
} from 'react-native';
import { Text, Card, Searchbar, Chip, Button, ActivityIndicator, useTheme } from 'react-native-paper';
import MapView, { Marker, PROVIDER_GOOGLE, Region } from 'react-native-maps';
import Geolocation from '@react-native-community/geolocation';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

import { RootState, AppDispatch } from '../../store';
import { executeSql, initDatabase } from '../../database/database';

// Define clinic type
interface Clinic {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  zip_code: string;
  phone: string;
  email: string;
  latitude: number;
  longitude: number;
  distance?: number; // Distance from user's location
}

const ClinicLocatorScreen: React.FC = () => {
  const theme = useTheme();
  const dispatch = useDispatch<AppDispatch>();
  const navigation = useNavigation();
  const mapRef = useRef<MapView>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [clinics, setClinics] = useState<Clinic[]>([]);
  const [filteredClinics, setFilteredClinics] = useState<Clinic[]>([]);
  const [selectedClinic, setSelectedClinic] = useState<Clinic | null>(null);
  const [loading, setLoading] = useState(true);
  const [locationPermission, setLocationPermission] = useState(false);
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [region, setRegion] = useState<Region>({
    latitude: 37.78825,
    longitude: -122.4324,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });

  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  const filters = ['Nearest', 'Primary Care', 'Specialists', 'Hospitals', 'Urgent Care'];

  useEffect(() => {
    requestLocationPermission();
    fetchClinics();
  }, []);

  useEffect(() => {
    if (userLocation) {
      // Update region to user's location
      setRegion({
        ...region,
        latitude: userLocation.latitude,
        longitude: userLocation.longitude,
      });

      // Calculate distance for each clinic
      const clinicsWithDistance = clinics.map(clinic => ({
        ...clinic,
        distance: calculateDistance(
          userLocation.latitude,
          userLocation.longitude,
          clinic.latitude,
          clinic.longitude
        ),
      }));

      // Sort by distance
      clinicsWithDistance.sort((a, b) => (a.distance || 0) - (b.distance || 0));

      setClinics(clinicsWithDistance);
      setFilteredClinics(clinicsWithDistance);
    }
  }, [userLocation, clinics.length]);

  useEffect(() => {
    filterClinics();
  }, [searchQuery, activeFilter, clinics]);

  const requestLocationPermission = () => {
    Geolocation.requestAuthorization(
      () => {
        setLocationPermission(true);
        getCurrentLocation();
      },
      (error) => {
        console.error('Location permission error:', error);
        setLocationPermission(false);
        setLoading(false);
        Alert.alert(
          'Location Permission Required',
          'Please enable location services to find clinics near you.',
          [{ text: 'OK' }]
        );
      }
    );
  };

  const getCurrentLocation = () => {
    Geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setUserLocation({ latitude, longitude });
        setLoading(false);
      },
      (error) => {
        console.error('Error getting current location:', error);
        setLoading(false);
        Alert.alert('Error', 'Unable to get your current location.');
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
    );
  };

  const fetchClinics = async () => {
    try {
      // For this implementation, we'll use sample data directly
      // In a real app, we would properly handle database initialization and queries
      useSampleClinicsData();
    } catch (error) {
      console.error('Error fetching clinics:', error);
    } finally {
      setLoading(false);
    }
  };

  // Use sample data directly without trying to save to database
  const useSampleClinicsData = () => {
    const sampleClinics = [
      {
        id: '1',
        name: 'City General Hospital',
        address: '123 Main St',
        city: 'San Francisco',
        state: 'CA',
        zip_code: '94105',
        phone: '(415) 555-1234',
        email: 'info@citygeneralhospital.com',
        latitude: 37.7749,
        longitude: -122.4194,
      },
      {
        id: '2',
        name: 'Downtown Medical Center',
        address: '456 Market St',
        city: 'San Francisco',
        state: 'CA',
        zip_code: '94103',
        phone: '(415) 555-5678',
        email: 'contact@downtownmedical.com',
        latitude: 37.7831,
        longitude: -122.4075,
      },
      {
        id: '3',
        name: 'Bay Area Pediatrics',
        address: '789 Oak St',
        city: 'San Francisco',
        state: 'CA',
        zip_code: '94117',
        phone: '(415) 555-9012',
        email: 'info@bayareapediatrics.com',
        latitude: 37.7759,
        longitude: -122.4245,
      },
      {
        id: '4',
        name: 'Golden Gate Urgent Care',
        address: '101 California St',
        city: 'San Francisco',
        state: 'CA',
        zip_code: '94111',
        phone: '(415) 555-3456',
        email: 'care@ggurgentcare.com',
        latitude: 37.7929,
        longitude: -122.3971,
      },
      {
        id: '5',
        name: 'Pacific Heights Medical Group',
        address: '2100 Webster St',
        city: 'San Francisco',
        state: 'CA',
        zip_code: '94115',
        phone: '(415) 555-7890',
        email: 'info@pacificheightsmed.com',
        latitude: 37.7902,
        longitude: -122.4324,
      },
    ];

    setClinics(sampleClinics);
    setFilteredClinics(sampleClinics);
  };

  // This function has been replaced by useSampleClinicsData

  const filterClinics = () => {
    let filtered = [...clinics];

    // Apply search query filter
    if (searchQuery) {
      filtered = filtered.filter(
        clinic =>
          clinic.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          clinic.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
          clinic.city.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply category filter
    if (activeFilter) {
      if (activeFilter === 'Nearest') {
        // Already sorted by distance
      } else if (activeFilter === 'Primary Care') {
        // Filter logic for primary care
        filtered = filtered.filter(clinic => 
          clinic.name.toLowerCase().includes('primary') || 
          clinic.name.toLowerCase().includes('family')
        );
      } else if (activeFilter === 'Specialists') {
        // Filter logic for specialists
        filtered = filtered.filter(clinic => 
          clinic.name.toLowerCase().includes('specialist') || 
          clinic.name.toLowerCase().includes('cardio') ||
          clinic.name.toLowerCase().includes('neuro') ||
          clinic.name.toLowerCase().includes('ortho')
        );
      } else if (activeFilter === 'Hospitals') {
        // Filter logic for hospitals
        filtered = filtered.filter(clinic => 
          clinic.name.toLowerCase().includes('hospital') || 
          clinic.name.toLowerCase().includes('medical center')
        );
      } else if (activeFilter === 'Urgent Care') {
        // Filter logic for urgent care
        filtered = filtered.filter(clinic => 
          clinic.name.toLowerCase().includes('urgent') || 
          clinic.name.toLowerCase().includes('emergency')
        );
      }
    }

    setFilteredClinics(filtered);
  };

  const calculateDistance = (
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number => {
    // Haversine formula to calculate distance between two points
    const R = 6371; // Radius of the earth in km
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c; // Distance in km
    return parseFloat(distance.toFixed(1));
  };

  const deg2rad = (deg: number): number => {
    return deg * (Math.PI / 180);
  };

  const handleMarkerPress = (clinic: Clinic) => {
    setSelectedClinic(clinic);

    // Animate to the selected clinic
    mapRef.current?.animateToRegion({
      latitude: clinic.latitude,
      longitude: clinic.longitude,
      latitudeDelta: 0.01,
      longitudeDelta: 0.01,
    });
  };

  const handleGetDirections = (clinic: Clinic) => {
    // Open maps app with directions
    const scheme = Platform.select({ ios: 'maps:0,0?q=', android: 'geo:0,0?q=' });
    const latLng = `${clinic.latitude},${clinic.longitude}`;
    const label = clinic.name;
    const url = Platform.select({
      ios: `${scheme}${label}@${latLng}`,
      android: `${scheme}${latLng}(${label})`,
    });

    if (url) {
      // Linking.openURL(url);
      Alert.alert('Navigation', `Opening directions to ${clinic.name}`);
    }
  };

  const renderClinicItem = ({ item }: { item: Clinic }) => (
    <Card 
      style={[
        styles.clinicCard, 
        selectedClinic?.id === item.id && { borderColor: theme.colors.primary, borderWidth: 2 }
      ]}
      onPress={() => handleMarkerPress(item)}
    >
      <Card.Content>
        <Text style={styles.clinicName}>{item.name}</Text>
        <Text style={styles.clinicAddress}>{item.address}, {item.city}</Text>
        {item.distance && (
          <Text style={styles.clinicDistance}>{item.distance} km away</Text>
        )}
        <View style={styles.clinicActions}>
          <Button 
            mode="contained" 
            onPress={() => handleGetDirections(item)}
            style={styles.directionButton}
            icon="directions"
          >
            Directions
          </Button>
          <Button 
            mode="outlined" 
            onPress={() => navigation.navigate('Appointments')}
            style={styles.appointmentButton}
          >
            Book
          </Button>
        </View>
      </Card.Content>
    </Card>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={styles.loadingText}>Loading map and clinics...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Map View */}
      <View style={styles.mapContainer}>
        <MapView
          ref={mapRef}
          provider={PROVIDER_GOOGLE}
          style={styles.map}
          region={region}
          showsUserLocation={true}
          showsMyLocationButton={true}
        >
          {filteredClinics.map((clinic) => (
            <Marker
              key={clinic.id}
              coordinate={{
                latitude: clinic.latitude,
                longitude: clinic.longitude,
              }}
              title={clinic.name}
              description={clinic.address}
              onPress={() => handleMarkerPress(clinic)}
              pinColor={selectedClinic?.id === clinic.id ? theme.colors.primary : undefined}
            />
          ))}
        </MapView>
      </View>

      {/* Search and Filter */}
      <View style={styles.searchContainer}>
        <Searchbar
          placeholder="Search clinics by name or location"
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchBar}
        />

        <FlatList
          data={filters}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item) => item}
          contentContainerStyle={styles.filtersContainer}
          renderItem={({ item }) => (
            <Chip
              selected={activeFilter === item}
              onPress={() => setActiveFilter(activeFilter === item ? null : item)}
              style={styles.filterChip}
              selectedColor={theme.colors.primary}
            >
              {item}
            </Chip>
          )}
        />
      </View>

      {/* Clinics List */}
      <View style={styles.clinicsListContainer}>
        <Text style={styles.clinicsHeader}>
          {filteredClinics.length} {filteredClinics.length === 1 ? 'Clinic' : 'Clinics'} Found
        </Text>

        <FlatList
          data={filteredClinics}
          keyExtractor={(item) => item.id}
          renderItem={renderClinicItem}
          contentContainerStyle={styles.clinicsList}
          showsVerticalScrollIndicator={false}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
  },
  mapContainer: {
    height: Dimensions.get('window').height * 0.4,
    width: '100%',
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  searchContainer: {
    padding: 16,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  searchBar: {
    elevation: 0,
    backgroundColor: '#f0f0f0',
  },
  filtersContainer: {
    paddingVertical: 10,
  },
  filterChip: {
    marginRight: 8,
  },
  clinicsListContainer: {
    flex: 1,
    padding: 16,
  },
  clinicsHeader: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  clinicsList: {
    paddingBottom: 20,
  },
  clinicCard: {
    marginBottom: 10,
    borderRadius: 10,
  },
  clinicName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  clinicAddress: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  clinicDistance: {
    fontSize: 12,
    color: '#007AFF',
    marginTop: 4,
  },
  clinicActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  directionButton: {
    flex: 1,
    marginRight: 5,
  },
  appointmentButton: {
    flex: 1,
    marginLeft: 5,
  },
});

export default ClinicLocatorScreen;
