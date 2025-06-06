import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
  Image,
} from 'react-native';
import {
  Text,
  Card,
  Button,
  Divider,
  Avatar,
  List,
  IconButton,
  Modal,
  Portal,
  TextInput,
  useTheme,
  ActivityIndicator,
} from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import ImagePicker from 'react-native-image-picker';

import { RootState, AppDispatch } from '../../store';
import { logout } from '../../store/slices/authSlice';
import { updateUserProfile } from '../../store/slices/userSlice';

// Define user profile type
interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone?: string;
  date_of_birth?: string;
  gender?: string;
  profile_picture?: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    zip_code?: string;
    country?: string;
  };
}

// Define user preferences type
interface UserPreferences {
  notifications: boolean;
  dark_mode: boolean;
  language: string;
}

const ProfileScreen: React.FC = () => {
  const theme = useTheme();
  const navigation = useNavigation();
  const dispatch = useDispatch<AppDispatch>();
  
  // Get user data from Redux store
  const user = useSelector((state: RootState) => state.user.userData);
  const loading = useSelector((state: RootState) => state.user.loading);
  
  // State for user profile
  const [editMode, setEditMode] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [gender, setGender] = useState('');
  const [street, setStreet] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [zipCode, setZipCode] = useState('');
  const [country, setCountry] = useState('');
  const [profilePicture, setProfilePicture] = useState<string | undefined>(undefined);
  
  // State for user preferences
  const [preferences, setPreferences] = useState<UserPreferences>({
    notifications: true,
    dark_mode: false,
    language: 'English',
  });
  
  // State for modals
  const [securityModalVisible, setSecurityModalVisible] = useState(false);
  const [languageModalVisible, setLanguageModalVisible] = useState(false);
  
  // Available languages
  const languages = ['English', 'Spanish', 'French', 'German', 'Chinese', 'Japanese'];
  
  useEffect(() => {
    if (user) {
      // Initialize form with user data
      setName(user.name || '');
      setEmail(user.email || '');
      setPhone(user.phone || '');
      setDateOfBirth(user.date_of_birth || '');
      setGender(user.gender || '');
      setProfilePicture(user.profile_picture);
      
      if (user.address) {
        setStreet(user.address.street || '');
        setCity(user.address.city || '');
        setState(user.address.state || '');
        setZipCode(user.address.zip_code || '');
        setCountry(user.address.country || '');
      }
    }
  }, [user]);
  
  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Logout', 
          onPress: () => {
            dispatch(logout());
          }
        },
      ]
    );
  };
  
  const handleEditProfile = () => {
    setEditMode(true);
  };
  
  const handleCancelEdit = () => {
    // Reset form to original values
    if (user) {
      setName(user.name || '');
      setEmail(user.email || '');
      setPhone(user.phone || '');
      setDateOfBirth(user.date_of_birth || '');
      setGender(user.gender || '');
      setProfilePicture(user.profile_picture);
      
      if (user.address) {
        setStreet(user.address.street || '');
        setCity(user.address.city || '');
        setState(user.address.state || '');
        setZipCode(user.address.zip_code || '');
        setCountry(user.address.country || '');
      }
    }
    
    setEditMode(false);
  };
  
  const handleSaveProfile = () => {
    // Validate form
    if (!name) {
      Alert.alert('Error', 'Name is required');
      return;
    }
    
    if (!email) {
      Alert.alert('Error', 'Email is required');
      return;
    }
    
    // Update user profile
    const updatedProfile: UserProfile = {
      id: user?.id || '',
      name,
      email,
      phone,
      date_of_birth: dateOfBirth,
      gender,
      profile_picture: profilePicture,
      address: {
        street,
        city,
        state,
        zip_code: zipCode,
        country,
      },
    };
    
    dispatch(updateUserProfile(updatedProfile));
    setEditMode(false);
  };
  
  const handleChangeProfilePicture = () => {
    const options = {
      title: 'Select Profile Picture',
      storageOptions: {
        skipBackup: true,
        path: 'images',
      },
    };
    
    ImagePicker.showImagePicker(options, (response) => {
      if (response.didCancel) {
        console.log('User cancelled image picker');
      } else if (response.error) {
        console.log('ImagePicker Error: ', response.error);
        Alert.alert('Error', 'Failed to pick image');
      } else {
        setProfilePicture(response.uri);
      }
    });
  };
  
  const handleToggleNotifications = (value: boolean) => {
    setPreferences({ ...preferences, notifications: value });
    // In a real app, this would dispatch an action to update user preferences
  };
  
  const handleToggleDarkMode = (value: boolean) => {
    setPreferences({ ...preferences, dark_mode: value });
    // In a real app, this would dispatch an action to update user preferences and theme
  };
  
  const handleChangeLanguage = (language: string) => {
    setPreferences({ ...preferences, language });
    setLanguageModalVisible(false);
    // In a real app, this would dispatch an action to update user preferences and app language
  };
  
  const handleOpenSecuritySettings = () => {
    setSecurityModalVisible(true);
  };
  
  const handleCloseSecurityModal = () => {
    setSecurityModalVisible(false);
  };
  
  const handleEnableBiometrics = () => {
    // In a real app, this would enable biometric authentication
    Alert.alert('Success', 'Biometric authentication enabled');
    handleCloseSecurityModal();
  };
  
  const handleChangePassword = () => {
    // In a real app, this would navigate to a change password screen
    Alert.alert('Change Password', 'Navigate to change password screen');
    handleCloseSecurityModal();
  };
  
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={styles.loadingText}>Loading profile...</Text>
      </View>
    );
  }
  
  return (
    <ScrollView style={styles.container}>
      {/* Profile Header */}
      <View style={styles.profileHeader}>
        <View style={styles.profilePictureContainer}>
          {profilePicture ? (
            <Avatar.Image 
              size={100} 
              source={{ uri: profilePicture }} 
            />
          ) : (
            <Avatar.Text 
              size={100} 
              label={name ? name.substring(0, 2).toUpperCase() : 'U'} 
              backgroundColor={theme.colors.primary}
            />
          )}
          
          {editMode && (
            <TouchableOpacity 
              style={styles.editPictureButton}
              onPress={handleChangeProfilePicture}
            >
              <MaterialCommunityIcons name="camera" size={20} color="white" />
            </TouchableOpacity>
          )}
        </View>
        
        <View style={styles.profileInfo}>
          {editMode ? (
            <TextInput
              label="Name"
              value={name}
              onChangeText={setName}
              mode="outlined"
              style={styles.input}
            />
          ) : (
            <Text style={styles.userName}>{user?.name || 'User'}</Text>
          )}
          
          {!editMode && (
            <Text style={styles.userEmail}>{user?.email || 'user@example.com'}</Text>
          )}
          
          {!editMode && (
            <Button 
              mode="contained" 
              onPress={handleEditProfile}
              style={styles.editButton}
              icon="account-edit"
            >
              Edit Profile
            </Button>
          )}
        </View>
      </View>
      
      {/* Edit Profile Form */}
      {editMode && (
        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.sectionTitle}>Personal Information</Text>
            
            <TextInput
              label="Email"
              value={email}
              onChangeText={setEmail}
              mode="outlined"
              keyboardType="email-address"
              style={styles.input}
            />
            
            <TextInput
              label="Phone"
              value={phone}
              onChangeText={setPhone}
              mode="outlined"
              keyboardType="phone-pad"
              style={styles.input}
            />
            
            <TextInput
              label="Date of Birth"
              value={dateOfBirth}
              onChangeText={setDateOfBirth}
              mode="outlined"
              placeholder="YYYY-MM-DD"
              style={styles.input}
              right={<TextInput.Icon icon="calendar" />}
            />
            
            <TextInput
              label="Gender"
              value={gender}
              onChangeText={setGender}
              mode="outlined"
              style={styles.input}
            />
            
            <Text style={[styles.sectionTitle, { marginTop: 20 }]}>Address</Text>
            
            <TextInput
              label="Street"
              value={street}
              onChangeText={setStreet}
              mode="outlined"
              style={styles.input}
            />
            
            <TextInput
              label="City"
              value={city}
              onChangeText={setCity}
              mode="outlined"
              style={styles.input}
            />
            
            <TextInput
              label="State/Province"
              value={state}
              onChangeText={setState}
              mode="outlined"
              style={styles.input}
            />
            
            <TextInput
              label="ZIP/Postal Code"
              value={zipCode}
              onChangeText={setZipCode}
              mode="outlined"
              style={styles.input}
            />
            
            <TextInput
              label="Country"
              value={country}
              onChangeText={setCountry}
              mode="outlined"
              style={styles.input}
            />
            
            <View style={styles.formActions}>
              <Button 
                mode="outlined" 
                onPress={handleCancelEdit}
                style={[styles.formButton, { borderColor: theme.colors.error }]}
                textColor={theme.colors.error}
              >
                Cancel
              </Button>
              
              <Button 
                mode="contained" 
                onPress={handleSaveProfile}
                style={styles.formButton}
              >
                Save
              </Button>
            </View>
          </Card.Content>
        </Card>
      )}
      
      {/* Profile Sections (when not in edit mode) */}
      {!editMode && (
        <>
          {/* Personal Information */}
          <Card style={styles.card}>
            <Card.Content>
              <Text style={styles.sectionTitle}>Personal Information</Text>
              
              <List.Item
                title="Phone"
                description={user?.phone || 'Not provided'}
                left={props => <List.Icon {...props} icon="phone" />}
              />
              
              <Divider />
              
              <List.Item
                title="Date of Birth"
                description={user?.date_of_birth || 'Not provided'}
                left={props => <List.Icon {...props} icon="calendar" />}
              />
              
              <Divider />
              
              <List.Item
                title="Gender"
                description={user?.gender || 'Not provided'}
                left={props => <List.Icon {...props} icon="gender-male-female" />}
              />
            </Card.Content>
          </Card>
          
          {/* Address */}
          <Card style={styles.card}>
            <Card.Content>
              <Text style={styles.sectionTitle}>Address</Text>
              
              <List.Item
                title="Home Address"
                description={
                  user?.address?.street && user.address.city
                    ? `${user.address.street}, ${user.address.city}, ${user.address.state || ''} ${user.address.zip_code || ''}, ${user.address.country || ''}`
                    : 'No address provided'
                }
                left={props => <List.Icon {...props} icon="home" />}
              />
            </Card.Content>
          </Card>
          
          {/* Medical Information */}
          <Card style={styles.card}>
            <Card.Content>
              <Text style={styles.sectionTitle}>Medical Information</Text>
              
              <TouchableOpacity 
                style={styles.medicalInfoItem}
                onPress={() => navigation.navigate('MedicalRecords')}
              >
                <View style={styles.medicalInfoIcon}>
                  <MaterialCommunityIcons name="file-document" size={24} color={theme.colors.primary} />
                </View>
                <View style={styles.medicalInfoContent}>
                  <Text style={styles.medicalInfoTitle}>Medical Records</Text>
                  <Text style={styles.medicalInfoDescription}>View and manage your medical records</Text>
                </View>
                <MaterialCommunityIcons name="chevron-right" size={24} color="#999" />
              </TouchableOpacity>
              
              <Divider style={styles.divider} />
              
              <TouchableOpacity 
                style={styles.medicalInfoItem}
                onPress={() => navigation.navigate('Appointments')}
              >
                <View style={styles.medicalInfoIcon}>
                  <MaterialCommunityIcons name="calendar-check" size={24} color={theme.colors.primary} />
                </View>
                <View style={styles.medicalInfoContent}>
                  <Text style={styles.medicalInfoTitle}>Appointments</Text>
                  <Text style={styles.medicalInfoDescription}>View and manage your appointments</Text>
                </View>
                <MaterialCommunityIcons name="chevron-right" size={24} color="#999" />
              </TouchableOpacity>
              
              <Divider style={styles.divider} />
              
              <TouchableOpacity 
                style={styles.medicalInfoItem}
                onPress={() => navigation.navigate('Payments')}
              >
                <View style={styles.medicalInfoIcon}>
                  <MaterialCommunityIcons name="credit-card" size={24} color={theme.colors.primary} />
                </View>
                <View style={styles.medicalInfoContent}>
                  <Text style={styles.medicalInfoTitle}>Payments</Text>
                  <Text style={styles.medicalInfoDescription}>View and manage your payment history</Text>
                </View>
                <MaterialCommunityIcons name="chevron-right" size={24} color="#999" />
              </TouchableOpacity>
            </Card.Content>
          </Card>
          
          {/* App Settings */}
          <Card style={styles.card}>
            <Card.Content>
              <Text style={styles.sectionTitle}>App Settings</Text>
              
              <View style={styles.settingItem}>
                <View style={styles.settingContent}>
                  <MaterialCommunityIcons name="bell" size={24} color={theme.colors.primary} />
                  <Text style={styles.settingText}>Notifications</Text>
                </View>
                <Switch
                  value={preferences.notifications}
                  onValueChange={handleToggleNotifications}
                  trackColor={{ false: '#767577', true: theme.colors.primary + '80' }}
                  thumbColor={preferences.notifications ? theme.colors.primary : '#f4f3f4'}
                />
              </View>
              
              <Divider style={styles.divider} />
              
              <View style={styles.settingItem}>
                <View style={styles.settingContent}>
                  <MaterialCommunityIcons name="theme-light-dark" size={24} color={theme.colors.primary} />
                  <Text style={styles.settingText}>Dark Mode</Text>
                </View>
                <Switch
                  value={preferences.dark_mode}
                  onValueChange={handleToggleDarkMode}
                  trackColor={{ false: '#767577', true: theme.colors.primary + '80' }}
                  thumbColor={preferences.dark_mode ? theme.colors.primary : '#f4f3f4'}
                />
              </View>
              
              <Divider style={styles.divider} />
              
              <TouchableOpacity 
                style={styles.settingItem}
                onPress={() => setLanguageModalVisible(true)}
              >
                <View style={styles.settingContent}>
                  <MaterialCommunityIcons name="translate" size={24} color={theme.colors.primary} />
                  <Text style={styles.settingText}>Language</Text>
                </View>
                <View style={styles.settingValue}>
                  <Text>{preferences.language}</Text>
                  <MaterialCommunityIcons name="chevron-right" size={24} color="#999" />
                </View>
              </TouchableOpacity>
              
              <Divider style={styles.divider} />
              
              <TouchableOpacity 
                style={styles.settingItem}
                onPress={handleOpenSecuritySettings}
              >
                <View style={styles.settingContent}>
                  <MaterialCommunityIcons name="shield-lock" size={24} color={theme.colors.primary} />
                  <Text style={styles.settingText}>Security</Text>
                </View>
                <MaterialCommunityIcons name="chevron-right" size={24} color="#999" />
              </TouchableOpacity>
            </Card.Content>
          </Card>
          
          {/* Logout Button */}
          <Button 
            mode="outlined" 
            onPress={handleLogout}
            style={styles.logoutButton}
            textColor={theme.colors.error}
            icon="logout"
          >
            Logout
          </Button>
        </>
      )}
      
      {/* Language Selection Modal */}
      <Portal>
        <Modal
          visible={languageModalVisible}
          onDismiss={() => setLanguageModalVisible(false)}
          contentContainerStyle={styles.modalContainer}
        >
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Select Language</Text>
            <IconButton icon="close" size={24} onPress={() => setLanguageModalVisible(false)} />
          </View>
          
          <ScrollView>
            {languages.map((language) => (
              <TouchableOpacity
                key={language}
                style={[
                  styles.languageItem,
                  preferences.language === language && styles.selectedLanguageItem,
                ]}
                onPress={() => handleChangeLanguage(language)}
              >
                <Text
                  style={[
                    styles.languageText,
                    preferences.language === language && styles.selectedLanguageText,
                  ]}
                >
                  {language}
                </Text>
                {preferences.language === language && (
                  <MaterialCommunityIcons name="check" size={24} color={theme.colors.primary} />
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>
        </Modal>
      </Portal>
      
      {/* Security Settings Modal */}
      <Portal>
        <Modal
          visible={securityModalVisible}
          onDismiss={handleCloseSecurityModal}
          contentContainerStyle={styles.modalContainer}
        >
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Security Settings</Text>
            <IconButton icon="close" size={24} onPress={handleCloseSecurityModal} />
          </View>
          
          <View style={styles.modalContent}>
            <TouchableOpacity 
              style={styles.securityItem}
              onPress={handleChangePassword}
            >
              <MaterialCommunityIcons name="key" size={24} color={theme.colors.primary} />
              <Text style={styles.securityItemText}>Change Password</Text>
            </TouchableOpacity>
            
            <Divider style={styles.divider} />
            
            <TouchableOpacity 
              style={styles.securityItem}
              onPress={handleEnableBiometrics}
            >
              <MaterialCommunityIcons name="fingerprint" size={24} color={theme.colors.primary} />
              <Text style={styles.securityItemText}>Enable Biometric Authentication</Text>
            </TouchableOpacity>
            
            <Divider style={styles.divider} />
            
            <TouchableOpacity style={styles.securityItem}>
              <MaterialCommunityIcons name="two-factor-authentication" size={24} color={theme.colors.primary} />
              <Text style={styles.securityItemText}>Two-Factor Authentication</Text>
              <Switch
                value={false}
                onValueChange={() => {
                  Alert.alert('Info', 'This feature is coming soon');
                }}
                trackColor={{ false: '#767577', true: theme.colors.primary + '80' }}
                thumbColor={'#f4f3f4'}
                style={{ marginLeft: 'auto' }}
              />
            </TouchableOpacity>
          </View>
        </Modal>
      </Portal>
    </ScrollView>
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
  profileHeader: {
    flexDirection: 'row',
    padding: 20,
    backgroundColor: 'white',
    alignItems: 'center',
  },
  profilePictureContainer: {
    position: 'relative',
  },
  editPictureButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#007AFF',
    borderRadius: 15,
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileInfo: {
    marginLeft: 20,
    flex: 1,
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  userEmail: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
  },
  editButton: {
    marginTop: 10,
  },
  card: {
    margin: 10,
    borderRadius: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  input: {
    marginBottom: 15,
  },
  formActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  formButton: {
    flex: 1,
    marginHorizontal: 5,
  },
  divider: {
    marginVertical: 10,
  },
  medicalInfoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
  },
  medicalInfoIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  medicalInfoContent: {
    flex: 1,
    marginLeft: 15,
  },
  medicalInfoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  medicalInfoDescription: {
    fontSize: 14,
    color: '#666',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
  },
  settingContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingText: {
    fontSize: 16,
    marginLeft: 15,
  },
  settingValue: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoutButton: {
    margin: 20,
    borderColor: '#ff6b6b',
  },
  modalContainer: {
    backgroundColor: 'white',
    margin: 20,
    borderRadius: 10,
    maxHeight: '80%',
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
  languageItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  selectedLanguageItem: {
    backgroundColor: '#f0f8ff',
  },
  languageText: {
    fontSize: 16,
  },
  selectedLanguageText: {
    color: '#007AFF',
    fontWeight: 'bold',
  },
  securityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
  },
  securityItemText: {
    fontSize: 16,
    marginLeft: 15,
  },
});

export default ProfileScreen;