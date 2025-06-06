import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
  Platform,
  Alert,
} from 'react-native';
import {
  Text,
  Card,
  Button,
  Divider,
  List,
  Avatar,
  FAB,
  Modal,
  Portal,
  TextInput,
  IconButton,
  useTheme,
  ActivityIndicator,
} from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import Geolocation from '@react-native-community/geolocation';

import { RootState, AppDispatch } from '../../store';
import { executeSql } from '../../database/database';

// Define emergency contact type
interface EmergencyContact {
  id: string;
  name: string;
  relationship: string;
  phone: string;
}

// Define emergency facility type
interface EmergencyFacility {
  id: string;
  name: string;
  address: string;
  phone: string;
  latitude: number;
  longitude: number;
  distance?: number; // Distance from user's location
}

const EmergencyScreen: React.FC = () => {
  const theme = useTheme();
  const navigation = useNavigation();
  const dispatch = useDispatch<AppDispatch>();
  
  // State for user location
  const [loading, setLoading] = useState(true);
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  
  // State for emergency contacts
  const [contacts, setContacts] = useState<EmergencyContact[]>([]);
  const [selectedContact, setSelectedContact] = useState<EmergencyContact | null>(null);
  
  // State for emergency facilities
  const [facilities, setFacilities] = useState<EmergencyFacility[]>([]);
  
  // State for contact modal
  const [contactModalVisible, setContactModalVisible] = useState(false);
  const [contactName, setContactName] = useState('');
  const [contactRelationship, setContactRelationship] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  
  // Get user data from Redux store
  const user = useSelector((state: RootState) => state.user.userData);
  
  useEffect(() => {
    getCurrentLocation();
    loadEmergencyContacts();
    loadEmergencyFacilities();
  }, []);
  
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
        Alert.alert('Error', 'Unable to get your current location. Some features may be limited.');
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
    );
  };
  
  const loadEmergencyContacts = async () => {
    try {
      // In a real app, this would fetch from the database
      // For now, we'll use sample data
      const sampleContacts: EmergencyContact[] = [
        {
          id: '1',
          name: 'John Doe',
          relationship: 'Spouse',
          phone: '(555) 123-4567',
        },
        {
          id: '2',
          name: 'Jane Smith',
          relationship: 'Parent',
          phone: '(555) 987-6543',
        },
      ];
      
      setContacts(sampleContacts);
    } catch (error) {
      console.error('Error loading emergency contacts:', error);
    }
  };
  
  const loadEmergencyFacilities = async () => {
    try {
      // In a real app, this would fetch from the database or an API
      // For now, we'll use sample data
      const sampleFacilities: EmergencyFacility[] = [
        {
          id: '1',
          name: 'City General Hospital ER',
          address: '123 Main St, San Francisco, CA',
          phone: '(555) 111-2222',
          latitude: 37.7749,
          longitude: -122.4194,
        },
        {
          id: '2',
          name: 'Urgent Care Center',
          address: '456 Market St, San Francisco, CA',
          phone: '(555) 333-4444',
          latitude: 37.7831,
          longitude: -122.4075,
        },
        {
          id: '3',
          name: 'Memorial Hospital Emergency',
          address: '789 Oak St, San Francisco, CA',
          phone: '(555) 555-6666',
          latitude: 37.7759,
          longitude: -122.4245,
        },
      ];
      
      if (userLocation) {
        // Calculate distance for each facility
        const facilitiesWithDistance = sampleFacilities.map(facility => ({
          ...facility,
          distance: calculateDistance(
            userLocation.latitude,
            userLocation.longitude,
            facility.latitude,
            facility.longitude
          ),
        }));
        
        // Sort by distance
        facilitiesWithDistance.sort((a, b) => (a.distance || 0) - (b.distance || 0));
        
        setFacilities(facilitiesWithDistance);
      } else {
        setFacilities(sampleFacilities);
      }
    } catch (error) {
      console.error('Error loading emergency facilities:', error);
    }
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
  
  const handleCallEmergency = () => {
    // Call emergency services (911 in the US)
    const emergencyNumber = '911';
    
    Alert.alert(
      'Call Emergency Services',
      `Are you sure you want to call ${emergencyNumber}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Call', 
          style: 'destructive',
          onPress: () => {
            const phoneUrl = `tel:${emergencyNumber}`;
            Linking.canOpenURL(phoneUrl)
              .then(supported => {
                if (supported) {
                  return Linking.openURL(phoneUrl);
                } else {
                  Alert.alert('Error', 'Phone calls are not supported on this device');
                }
              })
              .catch(err => console.error('Error opening phone app:', err));
          }
        },
      ]
    );
  };
  
  const handleCallContact = (contact: EmergencyContact) => {
    Alert.alert(
      'Call Contact',
      `Are you sure you want to call ${contact.name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Call', 
          onPress: () => {
            const phoneUrl = `tel:${contact.phone.replace(/\D/g, '')}`;
            Linking.canOpenURL(phoneUrl)
              .then(supported => {
                if (supported) {
                  return Linking.openURL(phoneUrl);
                } else {
                  Alert.alert('Error', 'Phone calls are not supported on this device');
                }
              })
              .catch(err => console.error('Error opening phone app:', err));
          }
        },
      ]
    );
  };
  
  const handleCallFacility = (facility: EmergencyFacility) => {
    Alert.alert(
      'Call Facility',
      `Are you sure you want to call ${facility.name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Call', 
          onPress: () => {
            const phoneUrl = `tel:${facility.phone.replace(/\D/g, '')}`;
            Linking.canOpenURL(phoneUrl)
              .then(supported => {
                if (supported) {
                  return Linking.openURL(phoneUrl);
                } else {
                  Alert.alert('Error', 'Phone calls are not supported on this device');
                }
              })
              .catch(err => console.error('Error opening phone app:', err));
          }
        },
      ]
    );
  };
  
  const handleGetDirections = (facility: EmergencyFacility) => {
    // Open maps app with directions
    const scheme = Platform.select({ ios: 'maps:0,0?q=', android: 'geo:0,0?q=' });
    const latLng = `${facility.latitude},${facility.longitude}`;
    const label = facility.name;
    const url = Platform.select({
      ios: `${scheme}${label}@${latLng}`,
      android: `${scheme}${latLng}(${label})`,
    });

    if (url) {
      Linking.openURL(url).catch(err => {
        console.error('Error opening maps:', err);
        Alert.alert('Error', 'Could not open maps application');
      });
    }
  };
  
  const handleAddContact = () => {
    setSelectedContact(null);
    resetContactForm();
    setContactModalVisible(true);
  };
  
  const handleEditContact = (contact: EmergencyContact) => {
    setSelectedContact(contact);
    setContactName(contact.name);
    setContactRelationship(contact.relationship);
    setContactPhone(contact.phone);
    setContactModalVisible(true);
  };
  
  const handleDeleteContact = (contact: EmergencyContact) => {
    Alert.alert(
      'Delete Contact',
      `Are you sure you want to delete ${contact.name} from your emergency contacts?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: () => {
            // In a real app, this would dispatch an action to delete the contact
            const updatedContacts = contacts.filter(c => c.id !== contact.id);
            setContacts(updatedContacts);
            Alert.alert('Success', 'Contact deleted successfully');
          }
        },
      ]
    );
  };
  
  const handleSaveContact = () => {
    // Validate form
    if (!contactName) {
      Alert.alert('Error', 'Please enter a name for the contact');
      return;
    }
    
    if (!contactPhone) {
      Alert.alert('Error', 'Please enter a phone number for the contact');
      return;
    }
    
    // Create or update contact
    if (selectedContact) {
      // Update existing contact
      const updatedContacts = contacts.map(contact => 
        contact.id === selectedContact.id
          ? {
              ...contact,
              name: contactName,
              relationship: contactRelationship,
              phone: contactPhone,
            }
          : contact
      );
      
      setContacts(updatedContacts);
      Alert.alert('Success', 'Contact updated successfully');
    } else {
      // Create new contact
      const newContact: EmergencyContact = {
        id: Date.now().toString(),
        name: contactName,
        relationship: contactRelationship,
        phone: contactPhone,
      };
      
      setContacts([...contacts, newContact]);
      Alert.alert('Success', 'Contact added successfully');
    }
    
    // Close modal
    setContactModalVisible(false);
  };
  
  const resetContactForm = () => {
    setContactName('');
    setContactRelationship('');
    setContactPhone('');
  };
  
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.error} />
        <Text style={styles.loadingText}>Loading emergency services...</Text>
      </View>
    );
  }
  
  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Emergency Call Button */}
        <Card style={[styles.emergencyCard, { backgroundColor: theme.colors.error }]}>
          <TouchableOpacity onPress={handleCallEmergency}>
            <Card.Content style={styles.emergencyContent}>
              <MaterialCommunityIcons name="phone-alert" size={40} color="white" />
              <View style={styles.emergencyTextContainer}>
                <Text style={styles.emergencyTitle}>Call Emergency Services</Text>
                <Text style={styles.emergencySubtitle}>Call 911 for immediate assistance</Text>
              </View>
            </Card.Content>
          </TouchableOpacity>
        </Card>
        
        {/* User Medical Info Card */}
        <Card style={styles.card}>
          <Card.Content>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>Your Medical Information</Text>
              <MaterialCommunityIcons name="medical-bag" size={24} color={theme.colors.primary} />
            </View>
            
            <Divider style={styles.divider} />
            
            <List.Item
              title="Blood Type"
              description={user?.blood_type || 'Not provided'}
              left={props => <List.Icon {...props} icon="water" color={theme.colors.error} />}
            />
            
            <List.Item
              title="Allergies"
              description={user?.allergies?.join(', ') || 'None reported'}
              left={props => <List.Icon {...props} icon="alert-circle" color="#FFA000" />}
            />
            
            <List.Item
              title="Medications"
              description={user?.medications?.join(', ') || 'None reported'}
              left={props => <List.Icon {...props} icon="pill" color={theme.colors.primary} />}
            />
            
            <List.Item
              title="Medical Conditions"
              description={user?.medical_conditions?.join(', ') || 'None reported'}
              left={props => <List.Icon {...props} icon="heart-pulse" color={theme.colors.error} />}
            />
            
            <Button 
              mode="outlined" 
              onPress={() => navigation.navigate('MedicalRecords')}
              style={styles.viewMoreButton}
              icon="chevron-right"
              contentStyle={{ flexDirection: 'row-reverse' }}
            >
              View Full Medical Records
            </Button>
          </Card.Content>
        </Card>
        
        {/* Emergency Contacts */}
        <Card style={styles.card}>
          <Card.Content>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>Emergency Contacts</Text>
              <IconButton 
                icon="plus" 
                size={20} 
                onPress={handleAddContact} 
                style={styles.addButton}
              />
            </View>
            
            <Divider style={styles.divider} />
            
            {contacts.length > 0 ? (
              contacts.map((contact) => (
                <View key={contact.id}>
                  <View style={styles.contactItem}>
                    <Avatar.Text 
                      size={50} 
                      label={contact.name.substring(0, 2).toUpperCase()} 
                      backgroundColor={theme.colors.primary}
                    />
                    
                    <View style={styles.contactInfo}>
                      <Text style={styles.contactName}>{contact.name}</Text>
                      <Text style={styles.contactRelationship}>{contact.relationship}</Text>
                      <Text style={styles.contactPhone}>{contact.phone}</Text>
                    </View>
                    
                    <View style={styles.contactActions}>
                      <IconButton 
                        icon="phone" 
                        size={24} 
                        onPress={() => handleCallContact(contact)} 
                        style={[styles.contactActionButton, { backgroundColor: theme.colors.primary + '20' }]}
                        iconColor={theme.colors.primary}
                      />
                      
                      <IconButton 
                        icon="pencil" 
                        size={24} 
                        onPress={() => handleEditContact(contact)} 
                        style={[styles.contactActionButton, { backgroundColor: theme.colors.secondary + '20' }]}
                        iconColor={theme.colors.secondary}
                      />
                      
                      <IconButton 
                        icon="delete" 
                        size={24} 
                        onPress={() => handleDeleteContact(contact)} 
                        style={[styles.contactActionButton, { backgroundColor: theme.colors.error + '20' }]}
                        iconColor={theme.colors.error}
                      />
                    </View>
                  </View>
                  <Divider style={styles.divider} />
                </View>
              ))
            ) : (
              <View style={styles.emptyStateContainer}>
                <Text style={styles.emptyStateText}>No emergency contacts added yet</Text>
                <Button 
                  mode="contained" 
                  onPress={handleAddContact}
                  style={styles.emptyStateButton}
                  icon="plus"
                >
                  Add Contact
                </Button>
              </View>
            )}
          </Card.Content>
        </Card>
        
        {/* Nearby Emergency Facilities */}
        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.cardTitle}>Nearby Emergency Facilities</Text>
            
            <Divider style={styles.divider} />
            
            {userLocation && (
              <View style={styles.mapContainer}>
                <MapView
                  provider={PROVIDER_GOOGLE}
                  style={styles.map}
                  initialRegion={{
                    latitude: userLocation.latitude,
                    longitude: userLocation.longitude,
                    latitudeDelta: 0.05,
                    longitudeDelta: 0.05,
                  }}
                  showsUserLocation={true}
                >
                  {facilities.map((facility) => (
                    <Marker
                      key={facility.id}
                      coordinate={{
                        latitude: facility.latitude,
                        longitude: facility.longitude,
                      }}
                      title={facility.name}
                      description={facility.address}
                      pinColor="red"
                    />
                  ))}
                </MapView>
              </View>
            )}
            
            {facilities.map((facility) => (
              <Card key={facility.id} style={styles.facilityCard}>
                <Card.Content>
                  <Text style={styles.facilityName}>{facility.name}</Text>
                  <Text style={styles.facilityAddress}>{facility.address}</Text>
                  <Text style={styles.facilityPhone}>{facility.phone}</Text>
                  
                  {facility.distance && (
                    <Text style={styles.facilityDistance}>{facility.distance} km away</Text>
                  )}
                  
                  <View style={styles.facilityActions}>
                    <Button 
                      mode="contained" 
                      onPress={() => handleCallFacility(facility)}
                      style={[styles.facilityButton, { backgroundColor: theme.colors.error }]}
                      icon="phone"
                    >
                      Call
                    </Button>
                    
                    <Button 
                      mode="contained" 
                      onPress={() => handleGetDirections(facility)}
                      style={styles.facilityButton}
                      icon="directions"
                    >
                      Directions
                    </Button>
                  </View>
                </Card.Content>
              </Card>
            ))}
          </Card.Content>
        </Card>
        
        {/* First Aid Tips */}
        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.cardTitle}>First Aid Tips</Text>
            
            <Divider style={styles.divider} />
            
            <List.Accordion
              title="CPR (Cardiopulmonary Resuscitation)"
              left={props => <List.Icon {...props} icon="heart-pulse" />}
            >
              <List.Item 
                title="1. Call emergency services (911) immediately"
                titleNumberOfLines={2}
              />
              <List.Item 
                title="2. Place the person on their back on a firm surface"
                titleNumberOfLines={2}
              />
              <List.Item 
                title="3. Begin chest compressions (100-120 per minute)"
                titleNumberOfLines={2}
              />
              <List.Item 
                title="4. Push hard and fast in the center of the chest"
                titleNumberOfLines={2}
              />
              <List.Item 
                title="5. Allow the chest to completely recoil between compressions"
                titleNumberOfLines={2}
              />
            </List.Accordion>
            
            <List.Accordion
              title="Choking"
              left={props => <List.Icon {...props} icon="hand-back-right" />}
            >
              <List.Item 
                title="1. Encourage the person to cough"
                titleNumberOfLines={2}
              />
              <List.Item 
                title="2. If unable to cough, perform back blows between shoulder blades"
                titleNumberOfLines={2}
              />
              <List.Item 
                title="3. If back blows fail, perform abdominal thrusts (Heimlich maneuver)"
                titleNumberOfLines={2}
              />
              <List.Item 
                title="4. Repeat until object is dislodged or emergency services arrive"
                titleNumberOfLines={2}
              />
            </List.Accordion>
            
            <List.Accordion
              title="Severe Bleeding"
              left={props => <List.Icon {...props} icon="water" color={theme.colors.error} />}
            >
              <List.Item 
                title="1. Apply direct pressure to the wound with a clean cloth"
                titleNumberOfLines={2}
              />
              <List.Item 
                title="2. If blood soaks through, add another layer without removing the first"
                titleNumberOfLines={2}
              />
              <List.Item 
                title="3. If possible, elevate the wound above the heart"
                titleNumberOfLines={2}
              />
              <List.Item 
                title="4. Secure the dressing with a bandage"
                titleNumberOfLines={2}
              />
              <List.Item 
                title="5. Seek immediate medical attention"
                titleNumberOfLines={2}
              />
            </List.Accordion>
          </Card.Content>
        </Card>
      </ScrollView>
      
      {/* Emergency Call FAB */}
      <FAB
        style={[styles.fab, { backgroundColor: theme.colors.error }]}
        icon="phone"
        label="Call 911"
        onPress={handleCallEmergency}
      />
      
      {/* Add/Edit Contact Modal */}
      <Portal>
        <Modal
          visible={contactModalVisible}
          onDismiss={() => setContactModalVisible(false)}
          contentContainerStyle={styles.modalContainer}
        >
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>
              {selectedContact ? 'Edit Emergency Contact' : 'Add Emergency Contact'}
            </Text>
            <IconButton icon="close" size={24} onPress={() => setContactModalVisible(false)} />
          </View>
          
          <View style={styles.modalContent}>
            <TextInput
              label="Name"
              value={contactName}
              onChangeText={setContactName}
              mode="outlined"
              style={styles.input}
            />
            
            <TextInput
              label="Relationship"
              value={contactRelationship}
              onChangeText={setContactRelationship}
              mode="outlined"
              style={styles.input}
            />
            
            <TextInput
              label="Phone Number"
              value={contactPhone}
              onChangeText={setContactPhone}
              mode="outlined"
              keyboardType="phone-pad"
              style={styles.input}
            />
            
            <Button
              mode="contained"
              onPress={handleSaveContact}
              style={styles.saveButton}
              disabled={!contactName || !contactPhone}
            >
              {selectedContact ? 'Update Contact' : 'Save Contact'}
            </Button>
          </View>
        </Modal>
      </Portal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 80, // Space for FAB
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
  },
  emergencyCard: {
    marginBottom: 16,
    borderRadius: 10,
  },
  emergencyContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  emergencyTextContainer: {
    marginLeft: 16,
  },
  emergencyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
  emergencySubtitle: {
    fontSize: 14,
    color: 'white',
    opacity: 0.8,
  },
  card: {
    marginBottom: 16,
    borderRadius: 10,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  divider: {
    marginVertical: 10,
  },
  viewMoreButton: {
    marginTop: 10,
    alignSelf: 'flex-end',
  },
  addButton: {
    margin: 0,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
  },
  contactInfo: {
    flex: 1,
    marginLeft: 15,
  },
  contactName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  contactRelationship: {
    fontSize: 14,
    color: '#666',
  },
  contactPhone: {
    fontSize: 14,
    color: '#666',
  },
  contactActions: {
    flexDirection: 'row',
  },
  contactActionButton: {
    margin: 0,
    marginLeft: 5,
  },
  emptyStateContainer: {
    alignItems: 'center',
    padding: 20,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 10,
  },
  emptyStateButton: {
    marginTop: 10,
  },
  mapContainer: {
    height: 200,
    marginBottom: 16,
    borderRadius: 10,
    overflow: 'hidden',
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  facilityCard: {
    marginBottom: 10,
    elevation: 2,
  },
  facilityName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  facilityAddress: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  facilityPhone: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  facilityDistance: {
    fontSize: 14,
    color: '#007AFF',
    marginTop: 4,
  },
  facilityActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  facilityButton: {
    flex: 1,
    marginHorizontal: 5,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },
  modalContainer: {
    backgroundColor: 'white',
    margin: 20,
    borderRadius: 10,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  modalContent: {
    padding: 15,
  },
  input: {
    marginBottom: 15,
  },
  saveButton: {
    marginTop: 10,
  },
});

export default EmergencyScreen;