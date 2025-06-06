import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
  RefreshControl,
  Switch,
} from 'react-native';
import {
  Text,
  Card,
  Button,
  FAB,
  Divider,
  Chip,
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
import DateTimePicker from '@react-native-community/datetimepicker';

import { RootState, AppDispatch } from '../../store';
import { fetchUpcomingAppointments, fetchPastAppointments } from '../../store/slices/appointmentsSlice';

// Define appointment type
interface Appointment {
  id: string;
  date: string;
  time: string;
  doctor_name: string;
  clinic_name: string;
  status: 'scheduled' | 'completed' | 'cancelled';
  notes?: string;
  virtual_meeting: boolean;
  meeting_link?: string;
}

// Define doctor type
interface Doctor {
  id: string;
  name: string;
  specialization: string;
  clinic_id: string;
}

// Define clinic type
interface Clinic {
  id: string;
  name: string;
  address: string;
}

const AppointmentsScreen: React.FC = () => {
  const theme = useTheme();
  const navigation = useNavigation();
  const dispatch = useDispatch<AppDispatch>();

  // State for appointments
  const [activeTab, setActiveTab] = useState<'upcoming' | 'past'>('upcoming');
  const [refreshing, setRefreshing] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);

  // State for new appointment modal
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [selectedClinic, setSelectedClinic] = useState<Clinic | null>(null);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedTime, setSelectedTime] = useState('09:00 AM');
  const [notes, setNotes] = useState('');
  const [isVirtual, setIsVirtual] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  // Sample data for doctors and clinics
  const [doctors, setDoctors] = useState<Doctor[]>([
    { id: '1', name: 'Dr. John Smith', specialization: 'Cardiologist', clinic_id: '1' },
    { id: '2', name: 'Dr. Sarah Johnson', specialization: 'Pediatrician', clinic_id: '2' },
    { id: '3', name: 'Dr. Michael Brown', specialization: 'Dermatologist', clinic_id: '3' },
    { id: '4', name: 'Dr. Emily Davis', specialization: 'Neurologist', clinic_id: '4' },
    { id: '5', name: 'Dr. Robert Wilson', specialization: 'Orthopedic Surgeon', clinic_id: '5' },
  ]);

  const [clinics, setClinics] = useState<Clinic[]>([
    { id: '1', name: 'City General Hospital', address: '123 Main St, San Francisco, CA' },
    { id: '2', name: 'Downtown Medical Center', address: '456 Market St, San Francisco, CA' },
    { id: '3', name: 'Bay Area Pediatrics', address: '789 Oak St, San Francisco, CA' },
    { id: '4', name: 'Golden Gate Urgent Care', address: '101 California St, San Francisco, CA' },
    { id: '5', name: 'Pacific Heights Medical Group', address: '2100 Webster St, San Francisco, CA' },
  ]);

  // Get appointments from Redux store
  const upcomingAppointments = useSelector((state: RootState) => 
    state.appointments.upcomingAppointments || []
  );
  const pastAppointments = useSelector((state: RootState) => 
    state.appointments.pastAppointments || []
  );
  const loading = useSelector((state: RootState) => state.appointments.loading);

  useEffect(() => {
    loadAppointments();
  }, [dispatch]);

  const loadAppointments = async () => {
    try {
      await Promise.all([
        dispatch(fetchUpcomingAppointments()),
        dispatch(fetchPastAppointments()),
      ]);
    } catch (error) {
      console.error('Error loading appointments:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadAppointments();
    setRefreshing(false);
  };

  const handleNewAppointment = () => {
    setModalVisible(true);
  };

  const handleCloseModal = () => {
    setModalVisible(false);
    resetForm();
  };

  const resetForm = () => {
    setSelectedDoctor(null);
    setSelectedClinic(null);
    setSelectedDate(new Date());
    setSelectedTime('09:00 AM');
    setNotes('');
    setIsVirtual(false);
  };

  const handleSaveAppointment = () => {
    // In a real app, this would dispatch an action to save the appointment
    console.log('Saving appointment:', {
      doctor: selectedDoctor,
      clinic: selectedClinic,
      date: selectedDate,
      time: selectedTime,
      notes,
      isVirtual,
    });

    // Close modal
    handleCloseModal();

    // Show confirmation
    alert('Appointment scheduled successfully!');
  };

  const handleCancelAppointment = (appointment: Appointment) => {
    // In a real app, this would dispatch an action to cancel the appointment
    alert(`Appointment with ${appointment.doctor_name} on ${appointment.date} cancelled.`);
  };

  const handleRescheduleAppointment = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    // Pre-fill form with appointment details
    const doctor = doctors.find(d => d.name === appointment.doctor_name) || null;
    const clinic = clinics.find(c => c.name === appointment.clinic_name) || null;

    setSelectedDoctor(doctor);
    setSelectedClinic(clinic);
    setSelectedDate(new Date(appointment.date));
    setSelectedTime(appointment.time);
    setNotes(appointment.notes || '');
    setIsVirtual(appointment.virtual_meeting);

    // Show modal
    setModalVisible(true);
  };

  const handleDateChange = (event: any, date?: Date) => {
    setShowDatePicker(false);
    if (date) {
      setSelectedDate(date);
    }
  };

  const handleTimeChange = (event: any, date?: Date) => {
    setShowTimePicker(false);
    if (date) {
      const hours = date.getHours();
      const minutes = date.getMinutes();
      const ampm = hours >= 12 ? 'PM' : 'AM';
      const formattedHours = hours % 12 || 12;
      const formattedMinutes = minutes < 10 ? `0${minutes}` : minutes;
      setSelectedTime(`${formattedHours}:${formattedMinutes} ${ampm}`);
    }
  };

  const renderAppointmentItem = ({ item }: { item: Appointment }) => (
    <Card style={styles.appointmentCard}>
      <Card.Content>
        <View style={styles.appointmentHeader}>
          <View>
            <Text style={styles.dateText}>
              {new Date(item.date).toLocaleDateString('en-US', {
                weekday: 'short',
                month: 'short',
                day: 'numeric',
              })}
            </Text>
            <Text style={styles.timeText}>{item.time}</Text>
          </View>
          <Chip 
            mode="outlined"
            style={[
              styles.statusChip,
              { 
                backgroundColor: 
                  item.status === 'scheduled' 
                    ? theme.colors.primary + '20' 
                    : item.status === 'completed'
                    ? theme.colors.success + '20'
                    : theme.colors.error + '20',
                borderColor:
                  item.status === 'scheduled' 
                    ? theme.colors.primary 
                    : item.status === 'completed'
                    ? theme.colors.success
                    : theme.colors.error,
              }
            ]}
          >
            <Text style={{ 
              color: 
                item.status === 'scheduled' 
                  ? theme.colors.primary 
                  : item.status === 'completed'
                  ? theme.colors.success
                  : theme.colors.error,
              textTransform: 'capitalize',
            }}>
              {item.status}
            </Text>
          </Chip>
        </View>

        <Divider style={styles.divider} />

        <View style={styles.appointmentDetails}>
          <View style={styles.detailRow}>
            <MaterialCommunityIcons name="doctor" size={20} color={theme.colors.primary} />
            <Text style={styles.detailText}>{item.doctor_name}</Text>
          </View>

          <View style={styles.detailRow}>
            <MaterialCommunityIcons name="hospital-building" size={20} color={theme.colors.primary} />
            <Text style={styles.detailText}>{item.clinic_name}</Text>
          </View>

          {item.notes && (
            <View style={styles.detailRow}>
              <MaterialCommunityIcons name="note-text" size={20} color={theme.colors.primary} />
              <Text style={styles.detailText}>{item.notes}</Text>
            </View>
          )}

          {item.virtual_meeting && (
            <View style={styles.detailRow}>
              <MaterialCommunityIcons name="video" size={20} color={theme.colors.secondary} />
              <Text style={[styles.detailText, { color: theme.colors.secondary }]}>
                Virtual Appointment
              </Text>
            </View>
          )}
        </View>

        {activeTab === 'upcoming' && (
          <View style={styles.actionButtons}>
            {item.virtual_meeting && (
              <Button 
                mode="contained" 
                onPress={() => navigation.navigate('VirtualConsultation')}
                style={[styles.actionButton, { backgroundColor: theme.colors.secondary }]}
                icon="video"
              >
                Join
              </Button>
            )}

            <Button 
              mode="outlined" 
              onPress={() => handleRescheduleAppointment(item)}
              style={styles.actionButton}
              icon="calendar-edit"
            >
              Reschedule
            </Button>

            <Button 
              mode="outlined" 
              onPress={() => handleCancelAppointment(item)}
              style={[styles.actionButton, { borderColor: theme.colors.error }]}
              textColor={theme.colors.error}
              icon="calendar-remove"
            >
              Cancel
            </Button>
          </View>
        )}
      </Card.Content>
    </Card>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyStateContainer}>
      <MaterialCommunityIcons 
        name={activeTab === 'upcoming' ? 'calendar-blank' : 'calendar-check'} 
        size={80} 
        color={theme.colors.primary} 
        style={{ opacity: 0.5 }}
      />
      <Text style={styles.emptyStateTitle}>
        No {activeTab === 'upcoming' ? 'upcoming' : 'past'} appointments
      </Text>
      {activeTab === 'upcoming' && (
        <Button 
          mode="contained" 
          onPress={handleNewAppointment}
          style={styles.emptyStateButton}
        >
          Schedule an Appointment
        </Button>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Tabs */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[
            styles.tab,
            activeTab === 'upcoming' && { borderBottomColor: theme.colors.primary, borderBottomWidth: 2 },
          ]}
          onPress={() => setActiveTab('upcoming')}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === 'upcoming' && { color: theme.colors.primary, fontWeight: 'bold' },
            ]}
          >
            Upcoming
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.tab,
            activeTab === 'past' && { borderBottomColor: theme.colors.primary, borderBottomWidth: 2 },
          ]}
          onPress={() => setActiveTab('past')}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === 'past' && { color: theme.colors.primary, fontWeight: 'bold' },
            ]}
          >
            Past
          </Text>
        </TouchableOpacity>
      </View>

      {/* Appointments List */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={styles.loadingText}>Loading appointments...</Text>
        </View>
      ) : (
        <FlatList
          data={activeTab === 'upcoming' ? upcomingAppointments : pastAppointments}
          keyExtractor={(item) => item.id}
          renderItem={renderAppointmentItem}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={renderEmptyState}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        />
      )}

      {/* FAB for adding new appointment */}
      {activeTab === 'upcoming' && (
        <FAB
          style={[styles.fab, { backgroundColor: theme.colors.primary }]}
          icon="plus"
          onPress={handleNewAppointment}
          label="New Appointment"
        />
      )}

      {/* New Appointment Modal */}
      <Portal>
        <Modal
          visible={modalVisible}
          onDismiss={handleCloseModal}
          contentContainerStyle={styles.modalContainer}
        >
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>
              {selectedAppointment ? 'Reschedule Appointment' : 'New Appointment'}
            </Text>
            <IconButton icon="close" size={24} onPress={handleCloseModal} />
          </View>

          <ScrollView style={styles.modalScrollView}>
            <Text style={styles.inputLabel}>Select Doctor</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.doctorsList}>
              {doctors.map((doctor) => (
                <TouchableOpacity
                  key={doctor.id}
                  style={[
                    styles.doctorCard,
                    selectedDoctor?.id === doctor.id && {
                      borderColor: theme.colors.primary,
                      backgroundColor: theme.colors.primary + '10',
                    },
                  ]}
                  onPress={() => setSelectedDoctor(doctor)}
                >
                  <View style={styles.doctorAvatar}>
                    <Text style={styles.doctorInitials}>
                      {doctor.name.split(' ').map((n) => n[0]).join('')}
                    </Text>
                  </View>
                  <Text style={styles.doctorName}>{doctor.name}</Text>
                  <Text style={styles.doctorSpecialty}>{doctor.specialization}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <Text style={styles.inputLabel}>Select Clinic</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.clinicsList}>
              {clinics.map((clinic) => (
                <TouchableOpacity
                  key={clinic.id}
                  style={[
                    styles.clinicCard,
                    selectedClinic?.id === clinic.id && {
                      borderColor: theme.colors.primary,
                      backgroundColor: theme.colors.primary + '10',
                    },
                  ]}
                  onPress={() => setSelectedClinic(clinic)}
                >
                  <Text style={styles.clinicName}>{clinic.name}</Text>
                  <Text style={styles.clinicAddress}>{clinic.address}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <Text style={styles.inputLabel}>Select Date</Text>
            <TouchableOpacity
              style={styles.dateTimeInput}
              onPress={() => setShowDatePicker(true)}
            >
              <MaterialCommunityIcons name="calendar" size={24} color={theme.colors.primary} />
              <Text style={styles.dateTimeText}>
                {selectedDate.toLocaleDateString('en-US', {
                  weekday: 'long',
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </Text>
            </TouchableOpacity>

            {showDatePicker && (
              <DateTimePicker
                value={selectedDate}
                mode="date"
                display="default"
                onChange={handleDateChange}
                minimumDate={new Date()}
              />
            )}

            <Text style={styles.inputLabel}>Select Time</Text>
            <TouchableOpacity
              style={styles.dateTimeInput}
              onPress={() => setShowTimePicker(true)}
            >
              <MaterialCommunityIcons name="clock" size={24} color={theme.colors.primary} />
              <Text style={styles.dateTimeText}>{selectedTime}</Text>
            </TouchableOpacity>

            {showTimePicker && (
              <DateTimePicker
                value={new Date(`2023-01-01T${selectedTime.replace(' AM', ':00').replace(' PM', ':00')}`)}
                mode="time"
                display="default"
                onChange={handleTimeChange}
              />
            )}

            <Text style={styles.inputLabel}>Notes (Optional)</Text>
            <TextInput
              value={notes}
              onChangeText={setNotes}
              placeholder="Add any notes or reason for visit"
              multiline
              numberOfLines={3}
              mode="outlined"
              style={styles.notesInput}
            />

            <View style={styles.virtualToggle}>
              <Text style={styles.inputLabel}>Virtual Appointment</Text>
              <Switch
                value={isVirtual}
                onValueChange={setIsVirtual}
                color={theme.colors.primary}
              />
            </View>

            <Button
              mode="contained"
              onPress={handleSaveAppointment}
              style={styles.saveButton}
              disabled={!selectedDoctor || !selectedClinic}
            >
              {selectedAppointment ? 'Update Appointment' : 'Schedule Appointment'}
            </Button>
          </ScrollView>
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
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: 'white',
    elevation: 2,
  },
  tab: {
    flex: 1,
    paddingVertical: 15,
    alignItems: 'center',
  },
  tabText: {
    fontSize: 16,
  },
  listContent: {
    padding: 16,
    paddingBottom: 80, // Space for FAB
  },
  appointmentCard: {
    marginBottom: 16,
    borderRadius: 10,
  },
  appointmentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dateText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  timeText: {
    fontSize: 14,
    color: '#666',
  },
  statusChip: {
    height: 30,
  },
  divider: {
    marginVertical: 10,
  },
  appointmentDetails: {
    marginTop: 5,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  detailText: {
    marginLeft: 10,
    fontSize: 14,
    flex: 1,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 15,
  },
  actionButton: {
    flex: 1,
    marginHorizontal: 5,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },
  emptyStateContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    height: 300,
  },
  emptyStateTitle: {
    fontSize: 18,
    marginVertical: 10,
    color: '#666',
  },
  emptyStateButton: {
    marginTop: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
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
  modalScrollView: {
    padding: 15,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 15,
    marginBottom: 10,
  },
  doctorsList: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  doctorCard: {
    width: 150,
    padding: 15,
    marginRight: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    alignItems: 'center',
  },
  doctorAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#e0e0e0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  doctorInitials: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  doctorName: {
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  doctorSpecialty: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    marginTop: 5,
  },
  clinicsList: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  clinicCard: {
    width: 200,
    padding: 15,
    marginRight: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  clinicName: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  clinicAddress: {
    fontSize: 12,
    color: '#666',
    marginTop: 5,
  },
  dateTimeInput: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    marginBottom: 15,
  },
  dateTimeText: {
    marginLeft: 10,
    fontSize: 16,
  },
  notesInput: {
    marginBottom: 15,
  },
  virtualToggle: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  saveButton: {
    marginTop: 10,
    marginBottom: 20,
  },
});

export default AppointmentsScreen;
