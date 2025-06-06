import React, { useEffect, useState } from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useSelector } from 'react-redux';
import { IconButton } from 'react-native-paper';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

import AuthNavigator from './AuthNavigator';
import DashboardScreen from '../screens/Dashboard/DashboardScreen';
import AppointmentsScreen from '../screens/Appointments/AppointmentsScreen';
import ClinicLocatorScreen from '../screens/ClinicLocator/ClinicLocatorScreen';
import MedicalRecordsScreen from '../screens/MedicalRecords/MedicalRecordsScreen';
import ProfileScreen from '../screens/Profile/ProfileScreen';
import EmergencyScreen from '../screens/Emergency/EmergencyScreen';
import VirtualConsultationScreen from '../screens/VirtualConsultation/VirtualConsultationScreen';
import PaymentsScreen from '../screens/Payments/PaymentsScreen';
import { RootState } from '../store';
import { theme } from '../theme';

// Define the types for the navigation parameters
export type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
  Emergency: undefined;
};

export type MainTabParamList = {
  Dashboard: undefined;
  Appointments: undefined;
  ClinicLocator: undefined;
  MedicalRecords: undefined;
  Profile: undefined;
  VirtualConsultation: undefined;
  Payments: undefined;
};

// Create the navigators
const Stack = createStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();

// Main tab navigator
const MainTabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'Dashboard') {
            iconName = focused ? 'view-dashboard' : 'view-dashboard-outline';
          } else if (route.name === 'Appointments') {
            iconName = focused ? 'calendar-check' : 'calendar-check-outline';
          } else if (route.name === 'ClinicLocator') {
            iconName = focused ? 'map-marker' : 'map-marker-outline';
          } else if (route.name === 'MedicalRecords') {
            iconName = focused ? 'file-document' : 'file-document-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'account' : 'account-outline';
          }

          return <MaterialCommunityIcons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: 'gray',
        headerShown: true,
      })}
    >
      <Tab.Screen 
        name="Dashboard" 
        component={DashboardScreen} 
        options={{
          title: 'Home',
          headerRight: () => (
            <IconButton
              icon="bell"
              size={24}
              onPress={() => {/* Handle notifications */}}
              style={{ marginRight: 10 }}
            />
          ),
        }}
      />
      <Tab.Screen 
        name="Appointments" 
        component={AppointmentsScreen}
        options={{ title: 'Appointments' }}
      />
      <Tab.Screen 
        name="ClinicLocator" 
        component={ClinicLocatorScreen}
        options={{ title: 'Find Clinic' }}
      />
      <Tab.Screen 
        name="MedicalRecords" 
        component={MedicalRecordsScreen}
        options={{ title: 'Records' }}
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileScreen}
        options={{ title: 'Profile' }}
      />
    </Tab.Navigator>
  );
};

// Root stack navigator
const AppNavigator = () => {
  // Check if user is authenticated
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate checking authentication status
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  }, []);

  if (loading) {
    // You could return a splash screen here
    return null;
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {!isAuthenticated ? (
        <Stack.Screen name="Auth" component={AuthNavigator} />
      ) : (
        <>
          <Stack.Screen name="Main" component={MainTabNavigator} />
          <Stack.Screen 
            name="Emergency" 
            component={EmergencyScreen}
            options={{ 
              headerShown: true,
              title: 'Emergency',
              headerStyle: {
                backgroundColor: theme.colors.error,
              },
              headerTintColor: '#fff',
            }}
          />
          <Stack.Screen 
            name="VirtualConsultation" 
            component={VirtualConsultationScreen}
            options={{ 
              headerShown: true,
              title: 'Virtual Consultation',
            }}
          />
          <Stack.Screen 
            name="Payments" 
            component={PaymentsScreen}
            options={{ 
              headerShown: true,
              title: 'Payments',
            }}
          />
        </>
      )}
    </Stack.Navigator>
  );
};

export default AppNavigator;