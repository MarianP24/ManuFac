import React, { useEffect, useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Platform,
} from 'react-native';
import { Text, Card, Button, Avatar, Divider, FAB, useTheme } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useDispatch, useSelector } from 'react-redux';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

import { RootState, AppDispatch } from '../../store';
import { RootStackParamList } from '../../navigation/AppNavigator';
import { fetchUpcomingAppointments } from '../../store/slices/appointmentsSlice';
import { fetchNotifications } from '../../store/slices/notificationsSlice';
import { fetchMedicalRecords } from '../../store/slices/medicalRecordsSlice';

type DashboardScreenNavigationProp = StackNavigationProp<RootStackParamList>;

const DashboardScreen: React.FC = () => {
  const navigation = useNavigation<DashboardScreenNavigationProp>();
  const dispatch = useDispatch<AppDispatch>();
  const theme = useTheme();
  const [refreshing, setRefreshing] = useState(false);

  // Get user data from Redux store
  const user = useSelector((state: RootState) => state.user.userData);
  const appointments = useSelector((state: RootState) => state.appointments.upcomingAppointments);
  const notifications = useSelector((state: RootState) => state.notifications.notifications);
  const medicalRecords = useSelector((state: RootState) => state.medicalRecords.recentRecords);

  useEffect(() => {
    loadDashboardData();
  }, [dispatch]);

  const loadDashboardData = async () => {
    try {
      // Fetch data for dashboard
      await Promise.all([
        dispatch(fetchUpcomingAppointments()),
        dispatch(fetchNotifications()),
        dispatch(fetchMedicalRecords()),
      ]);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadDashboardData();
    setRefreshing(false);
  };

  const handleEmergency = () => {
    navigation.navigate('Emergency');
  };

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Welcome Section */}
        <View style={styles.welcomeContainer}>
          <View style={styles.welcomeTextContainer}>
            <Text style={styles.welcomeText}>Hello, {user?.name || 'User'}</Text>
            <Text style={styles.dateText}>
              {new Date().toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </Text>
          </View>
          <Avatar.Image
            size={60}
            source={user?.profile_picture ? { uri: user.profile_picture } : require('../../assets/default-avatar.png')}
          />
        </View>

        {/* Emergency Button */}
        <Card style={[styles.emergencyCard, { backgroundColor: theme.colors.error }]}>
          <TouchableOpacity onPress={handleEmergency}>
            <Card.Content style={styles.emergencyContent}>
              <MaterialCommunityIcons name="ambulance" size={32} color="white" />
              <Text style={styles.emergencyText}>Emergency Assistance</Text>
            </Card.Content>
          </TouchableOpacity>
        </Card>

        {/* Quick Actions */}
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.quickActionsContainer}>
          <TouchableOpacity
            style={styles.quickActionItem}
            onPress={() => navigation.navigate('Appointments')}
          >
            <View style={[styles.iconContainer, { backgroundColor: theme.colors.primary }]}>
              <MaterialCommunityIcons name="calendar-plus" size={24} color="white" />
            </View>
            <Text style={styles.quickActionText}>Book Appointment</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.quickActionItem}
            onPress={() => navigation.navigate('VirtualConsultation')}
          >
            <View style={[styles.iconContainer, { backgroundColor: theme.colors.secondary }]}>
              <MaterialCommunityIcons name="video" size={24} color="white" />
            </View>
            <Text style={styles.quickActionText}>Virtual Consultation</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.quickActionItem}
            onPress={() => navigation.navigate('ClinicLocator')}
          >
            <View style={[styles.iconContainer, { backgroundColor: theme.colors.tertiary }]}>
              <MaterialCommunityIcons name="map-marker" size={24} color="white" />
            </View>
            <Text style={styles.quickActionText}>Find Clinic</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.quickActionItem}
            onPress={() => navigation.navigate('MedicalRecords')}
          >
            <View style={[styles.iconContainer, { backgroundColor: theme.colors.primary }]}>
              <MaterialCommunityIcons name="file-document" size={24} color="white" />
            </View>
            <Text style={styles.quickActionText}>Medical Records</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.quickActionItem}
            onPress={() => navigation.navigate('Payments')}
          >
            <View style={[styles.iconContainer, { backgroundColor: theme.colors.secondary }]}>
              <MaterialCommunityIcons name="credit-card" size={24} color="white" />
            </View>
            <Text style={styles.quickActionText}>Payments</Text>
          </TouchableOpacity>
        </View>

        {/* Upcoming Appointments */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Upcoming Appointments</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Appointments')}>
            <Text style={styles.seeAllText}>See All</Text>
          </TouchableOpacity>
        </View>

        {appointments && appointments.length > 0 ? (
          appointments.slice(0, 2).map((appointment, index) => (
            <Card key={index} style={styles.card}>
              <Card.Content>
                <View style={styles.appointmentHeader}>
                  <View>
                    <Text style={styles.appointmentDate}>
                      {new Date(appointment.date).toLocaleDateString('en-US', {
                        weekday: 'short',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </Text>
                    <Text style={styles.appointmentTime}>{appointment.time}</Text>
                  </View>
                  {appointment.virtual_meeting ? (
                    <Button
                      mode="contained"
                      onPress={() => navigation.navigate('VirtualConsultation')}
                      style={{ backgroundColor: theme.colors.secondary }}
                    >
                      Join
                    </Button>
                  ) : (
                    <Button
                      mode="outlined"
                      onPress={() => navigation.navigate('ClinicLocator')}
                    >
                      Directions
                    </Button>
                  )}
                </View>
                <Divider style={styles.divider} />
                <Text style={styles.doctorName}>Dr. {appointment.doctor_name}</Text>
                <Text style={styles.clinicName}>{appointment.clinic_name}</Text>
              </Card.Content>
            </Card>
          ))
        ) : (
          <Card style={styles.card}>
            <Card.Content>
              <Text style={styles.noDataText}>No upcoming appointments</Text>
              <Button
                mode="contained"
                onPress={() => navigation.navigate('Appointments')}
                style={styles.actionButton}
              >
                Book an Appointment
              </Button>
            </Card.Content>
          </Card>
        )}

        {/* Recent Medical Records */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Medical Records</Text>
          <TouchableOpacity onPress={() => navigation.navigate('MedicalRecords')}>
            <Text style={styles.seeAllText}>See All</Text>
          </TouchableOpacity>
        </View>

        {medicalRecords && medicalRecords.length > 0 ? (
          medicalRecords.slice(0, 2).map((record, index) => (
            <Card key={index} style={styles.card}>
              <Card.Content>
                <View style={styles.recordHeader}>
                  <View>
                    <Text style={styles.recordTitle}>{record.title}</Text>
                    <Text style={styles.recordDate}>
                      {new Date(record.date).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </Text>
                  </View>
                  <MaterialCommunityIcons
                    name={
                      record.type === 'prescription'
                        ? 'prescription'
                        : record.type === 'lab_result'
                        ? 'flask'
                        : 'file-document'
                    }
                    size={24}
                    color={theme.colors.primary}
                  />
                </View>
                <Divider style={styles.divider} />
                <Text style={styles.recordDescription}>
                  {record.description || 'No description available'}
                </Text>
              </Card.Content>
            </Card>
          ))
        ) : (
          <Card style={styles.card}>
            <Card.Content>
              <Text style={styles.noDataText}>No recent medical records</Text>
              <Button
                mode="contained"
                onPress={() => navigation.navigate('MedicalRecords')}
                style={styles.actionButton}
              >
                View Medical Records
              </Button>
            </Card.Content>
          </Card>
        )}

        {/* Recent Payments */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Payments</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Payments')}>
            <Text style={styles.seeAllText}>See All</Text>
          </TouchableOpacity>
        </View>

        <Card style={styles.card}>
          <Card.Content>
            <View style={styles.paymentHeader}>
              <View>
                <Text style={styles.paymentTitle}>Cardiology Consultation</Text>
                <Text style={styles.paymentDate}>Oct 15, 2023</Text>
              </View>
              <Chip mode="outlined" style={{ borderColor: theme.colors.success }}>
                <Text style={{ color: theme.colors.success }}>Completed</Text>
              </Chip>
            </View>
            <Divider style={styles.divider} />
            <View style={styles.paymentDetails}>
              <Text style={styles.paymentAmount}>USD 150.00</Text>
              <Text style={styles.paymentMethod}>Credit Card</Text>
            </View>
          </Card.Content>
        </Card>

        <Card style={styles.card}>
          <Card.Content>
            <View style={styles.paymentHeader}>
              <View>
                <Text style={styles.paymentTitle}>Blood Test</Text>
                <Text style={styles.paymentDate}>Oct 20, 2023</Text>
              </View>
              <Chip mode="outlined" style={{ borderColor: theme.colors.warning }}>
                <Text style={{ color: theme.colors.warning }}>Pending</Text>
              </Chip>
            </View>
            <Divider style={styles.divider} />
            <View style={styles.paymentDetails}>
              <Text style={styles.paymentAmount}>USD 75.50</Text>
              <Button
                mode="contained"
                onPress={() => navigation.navigate('Payments')}
                style={styles.payNowButton}
                compact
              >
                Pay Now
              </Button>
            </View>
          </Card.Content>
        </Card>
      </ScrollView>

      {/* Floating Action Button for quick emergency access */}
      <FAB
        style={[styles.fab, { backgroundColor: theme.colors.error }]}
        icon="phone"
        label="Emergency"
        onPress={handleEmergency}
      />
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
    paddingBottom: 80, // Extra padding for FAB
  },
  welcomeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  welcomeTextContainer: {
    flex: 1,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  dateText: {
    fontSize: 14,
    color: '#666',
  },
  emergencyCard: {
    marginBottom: 20,
    borderRadius: 10,
  },
  emergencyContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
  },
  emergencyText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  quickActionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  quickActionItem: {
    width: '48%',
    alignItems: 'center',
    marginBottom: 10,
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  quickActionText: {
    textAlign: 'center',
    fontSize: 12,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  seeAllText: {
    color: '#007AFF',
  },
  card: {
    marginBottom: 15,
    borderRadius: 10,
  },
  appointmentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  appointmentDate: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  appointmentTime: {
    fontSize: 14,
    color: '#666',
  },
  doctorName: {
    fontSize: 16,
    marginTop: 5,
  },
  clinicName: {
    fontSize: 14,
    color: '#666',
  },
  divider: {
    marginVertical: 10,
  },
  recordHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  recordTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  recordDate: {
    fontSize: 14,
    color: '#666',
  },
  recordDescription: {
    fontSize: 14,
  },
  // Payment styles
  paymentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  paymentTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  paymentDate: {
    fontSize: 14,
    color: '#666',
  },
  paymentDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  paymentAmount: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  paymentMethod: {
    fontSize: 14,
    color: '#666',
  },
  payNowButton: {
    height: 36,
  },
  noDataText: {
    textAlign: 'center',
    marginBottom: 10,
    color: '#666',
  },
  actionButton: {
    marginTop: 10,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },
});

export default DashboardScreen;
