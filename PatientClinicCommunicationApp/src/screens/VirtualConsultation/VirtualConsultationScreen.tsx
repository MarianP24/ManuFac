import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Alert,
  Platform,
} from 'react-native';
import {
  Text,
  Card,
  Button,
  IconButton,
  Avatar,
  Divider,
  Badge,
  useTheme,
  ActivityIndicator,
  Portal,
  Modal,
  TextInput,
} from 'react-native-paper';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { WebView } from 'react-native-webview';

import { RootState, AppDispatch } from '../../store';

// Define virtual consultation type
interface VirtualConsultation {
  id: string;
  doctor_name: string;
  doctor_specialization: string;
  date: string;
  time: string;
  status: 'scheduled' | 'in-progress' | 'completed' | 'cancelled';
  meeting_link: string;
  meeting_id: string;
  notes?: string;
}

const VirtualConsultationScreen: React.FC = () => {
  const theme = useTheme();
  const navigation = useNavigation();
  const route = useRoute();
  const dispatch = useDispatch<AppDispatch>();
  const { width, height } = Dimensions.get('window');
  
  // State for virtual consultation
  const [loading, setLoading] = useState(true);
  const [inMeeting, setInMeeting] = useState(false);
  const [consultation, setConsultation] = useState<VirtualConsultation | null>(null);
  const [upcomingConsultations, setUpcomingConsultations] = useState<VirtualConsultation[]>([]);
  const [pastConsultations, setPastConsultations] = useState<VirtualConsultation[]>([]);
  
  // State for chat
  const [chatVisible, setChatVisible] = useState(false);
  const [messages, setMessages] = useState<{ id: string; sender: string; text: string; timestamp: string }[]>([]);
  const [newMessage, setNewMessage] = useState('');
  
  // State for controls
  const [micMuted, setMicMuted] = useState(false);
  const [cameraOff, setCameraOff] = useState(false);
  const [speakerOn, setSpeakerOn] = useState(true);
  
  // Refs
  const webViewRef = useRef<WebView>(null);
  
  useEffect(() => {
    // Load consultations
    loadConsultations();
    
    // Check if we're joining a specific meeting
    const appointmentId = route.params?.appointmentId;
    if (appointmentId) {
      joinSpecificMeeting(appointmentId);
    }
  }, [route.params]);
  
  const loadConsultations = async () => {
    try {
      // In a real app, this would fetch from the Redux store or API
      // For now, we'll use sample data
      const sampleConsultations: VirtualConsultation[] = [
        {
          id: '1',
          doctor_name: 'Dr. John Smith',
          doctor_specialization: 'Cardiologist',
          date: new Date().toISOString().split('T')[0], // Today
          time: '10:00 AM',
          status: 'scheduled',
          meeting_link: 'https://meet.example.com/abc123',
          meeting_id: 'abc123',
          notes: 'Follow-up appointment for heart condition',
        },
        {
          id: '2',
          doctor_name: 'Dr. Sarah Johnson',
          doctor_specialization: 'Dermatologist',
          date: new Date(Date.now() + 86400000).toISOString().split('T')[0], // Tomorrow
          time: '2:30 PM',
          status: 'scheduled',
          meeting_link: 'https://meet.example.com/def456',
          meeting_id: 'def456',
          notes: 'Skin rash examination',
        },
        {
          id: '3',
          doctor_name: 'Dr. Michael Brown',
          doctor_specialization: 'Neurologist',
          date: new Date(Date.now() - 86400000).toISOString().split('T')[0], // Yesterday
          time: '11:15 AM',
          status: 'completed',
          meeting_link: 'https://meet.example.com/ghi789',
          meeting_id: 'ghi789',
          notes: 'Headache consultation',
        },
      ];
      
      // Split into upcoming and past
      const now = new Date();
      const upcoming: VirtualConsultation[] = [];
      const past: VirtualConsultation[] = [];
      
      sampleConsultations.forEach(consultation => {
        const consultationDate = new Date(`${consultation.date}T${consultation.time}`);
        if (consultationDate > now || consultation.status === 'scheduled') {
          upcoming.push(consultation);
        } else {
          past.push(consultation);
        }
      });
      
      setUpcomingConsultations(upcoming);
      setPastConsultations(past);
      setLoading(false);
    } catch (error) {
      console.error('Error loading consultations:', error);
      setLoading(false);
    }
  };
  
  const joinSpecificMeeting = (appointmentId: string) => {
    // Find the appointment in upcoming consultations
    const appointment = upcomingConsultations.find(c => c.id === appointmentId);
    if (appointment) {
      joinMeeting(appointment);
    }
  };
  
  const joinMeeting = (meeting: VirtualConsultation) => {
    setConsultation(meeting);
    setInMeeting(true);
    
    // In a real app, this would connect to a video conferencing service
    // For now, we'll simulate a chat with sample messages
    setMessages([
      {
        id: '1',
        sender: 'System',
        text: 'Welcome to your virtual consultation. The doctor will join shortly.',
        timestamp: new Date().toISOString(),
      },
    ]);
  };
  
  const endMeeting = () => {
    Alert.alert(
      'End Consultation',
      'Are you sure you want to end this consultation?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'End', 
          style: 'destructive',
          onPress: () => {
            setInMeeting(false);
            setConsultation(null);
            setChatVisible(false);
            setMessages([]);
            setNewMessage('');
            setMicMuted(false);
            setCameraOff(false);
            setSpeakerOn(true);
          }
        },
      ]
    );
  };
  
  const toggleMic = () => {
    setMicMuted(!micMuted);
    // In a real app, this would mute the microphone in the video call
  };
  
  const toggleCamera = () => {
    setCameraOff(!cameraOff);
    // In a real app, this would turn the camera on/off in the video call
  };
  
  const toggleSpeaker = () => {
    setSpeakerOn(!speakerOn);
    // In a real app, this would toggle the speaker in the video call
  };
  
  const toggleChat = () => {
    setChatVisible(!chatVisible);
  };
  
  const sendMessage = () => {
    if (!newMessage.trim()) return;
    
    const message = {
      id: Date.now().toString(),
      sender: 'You',
      text: newMessage.trim(),
      timestamp: new Date().toISOString(),
    };
    
    setMessages([...messages, message]);
    setNewMessage('');
    
    // Simulate doctor response after a short delay
    setTimeout(() => {
      const doctorMessage = {
        id: (Date.now() + 1).toString(),
        sender: consultation?.doctor_name || 'Doctor',
        text: 'Thank you for your message. How can I help you today?',
        timestamp: new Date().toISOString(),
      };
      
      setMessages(prevMessages => [...prevMessages, doctorMessage]);
    }, 2000);
  };
  
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };
  
  const isToday = (dateString: string) => {
    const today = new Date().toISOString().split('T')[0];
    return dateString === today;
  };
  
  const renderConsultationItem = (item: VirtualConsultation, isPast: boolean = false) => (
    <Card style={styles.consultationCard} key={item.id}>
      <Card.Content>
        <View style={styles.consultationHeader}>
          <View>
            <Text style={styles.dateText}>
              {isToday(item.date) ? 'Today' : formatDate(item.date)}
            </Text>
            <Text style={styles.timeText}>{item.time}</Text>
          </View>
          
          <Badge
            style={[
              styles.statusBadge,
              {
                backgroundColor: 
                  item.status === 'scheduled' 
                    ? theme.colors.primary + '20' 
                    : item.status === 'in-progress'
                    ? theme.colors.secondary + '20'
                    : item.status === 'completed'
                    ? theme.colors.success + '20'
                    : theme.colors.error + '20',
                color:
                  item.status === 'scheduled' 
                    ? theme.colors.primary 
                    : item.status === 'in-progress'
                    ? theme.colors.secondary
                    : item.status === 'completed'
                    ? theme.colors.success
                    : theme.colors.error,
              }
            ]}
          >
            {item.status === 'in-progress' ? 'In Progress' : item.status.charAt(0).toUpperCase() + item.status.slice(1)}
          </Badge>
        </View>
        
        <Divider style={styles.divider} />
        
        <View style={styles.doctorInfo}>
          <Avatar.Text 
            size={50} 
            label={item.doctor_name.split(' ').map(n => n[0]).join('')} 
            backgroundColor={theme.colors.primary}
          />
          <View style={styles.doctorDetails}>
            <Text style={styles.doctorName}>{item.doctor_name}</Text>
            <Text style={styles.doctorSpecialty}>{item.doctor_specialization}</Text>
          </View>
        </View>
        
        {item.notes && (
          <View style={styles.notesContainer}>
            <Text style={styles.notesLabel}>Notes:</Text>
            <Text style={styles.notes}>{item.notes}</Text>
          </View>
        )}
        
        {!isPast && (
          <Button 
            mode="contained" 
            onPress={() => joinMeeting(item)}
            style={styles.joinButton}
            icon="video"
            disabled={!isToday(item.date)}
          >
            {isToday(item.date) ? 'Join Meeting' : 'Not Available Yet'}
          </Button>
        )}
      </Card.Content>
    </Card>
  );
  
  // Meeting view
  if (inMeeting && consultation) {
    return (
      <View style={styles.meetingContainer}>
        {/* Video Area */}
        <View style={[styles.videoContainer, cameraOff && styles.cameraOffContainer]}>
          {cameraOff ? (
            <View style={styles.cameraOffContent}>
              <MaterialCommunityIcons name="camera-off" size={50} color="#fff" />
              <Text style={styles.cameraOffText}>Camera is off</Text>
            </View>
          ) : (
            // In a real app, this would be a video component
            <View style={styles.videoPlaceholder}>
              <Text style={styles.videoPlaceholderText}>Doctor's Video Feed</Text>
              <MaterialCommunityIcons name="account-tie" size={80} color="#fff" />
            </View>
          )}
          
          {/* Self view */}
          <View style={styles.selfViewContainer}>
            <View style={[styles.selfView, cameraOff && styles.cameraOffSelfView]}>
              {cameraOff ? (
                <MaterialCommunityIcons name="camera-off" size={24} color="#fff" />
              ) : (
                <Text style={styles.selfViewText}>Your Camera</Text>
              )}
            </View>
          </View>
          
          {/* Meeting info */}
          <View style={styles.meetingInfoContainer}>
            <Text style={styles.meetingInfoText}>
              {consultation.doctor_name} • {consultation.time}
            </Text>
          </View>
        </View>
        
        {/* Controls */}
        <View style={styles.controlsContainer}>
          <TouchableOpacity 
            style={[styles.controlButton, micMuted && styles.controlButtonActive]} 
            onPress={toggleMic}
          >
            <MaterialCommunityIcons 
              name={micMuted ? "microphone-off" : "microphone"} 
              size={24} 
              color={micMuted ? "#fff" : "#333"} 
            />
            <Text style={[styles.controlText, micMuted && styles.controlTextActive]}>
              {micMuted ? "Unmute" : "Mute"}
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.controlButton, cameraOff && styles.controlButtonActive]} 
            onPress={toggleCamera}
          >
            <MaterialCommunityIcons 
              name={cameraOff ? "camera-off" : "camera"} 
              size={24} 
              color={cameraOff ? "#fff" : "#333"} 
            />
            <Text style={[styles.controlText, cameraOff && styles.controlTextActive]}>
              {cameraOff ? "Start Video" : "Stop Video"}
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.controlButton, !speakerOn && styles.controlButtonActive]} 
            onPress={toggleSpeaker}
          >
            <MaterialCommunityIcons 
              name={speakerOn ? "volume-high" : "volume-off"} 
              size={24} 
              color={!speakerOn ? "#fff" : "#333"} 
            />
            <Text style={[styles.controlText, !speakerOn && styles.controlTextActive]}>
              {speakerOn ? "Speaker" : "Muted"}
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.controlButton, chatVisible && styles.controlButtonActive]} 
            onPress={toggleChat}
          >
            <MaterialCommunityIcons 
              name="chat" 
              size={24} 
              color={chatVisible ? "#fff" : "#333"} 
            />
            <Text style={[styles.controlText, chatVisible && styles.controlTextActive]}>
              Chat
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.controlButton, styles.endCallButton]} 
            onPress={endMeeting}
          >
            <MaterialCommunityIcons name="phone-hangup" size={24} color="#fff" />
            <Text style={[styles.controlText, styles.endCallText]}>End</Text>
          </TouchableOpacity>
        </View>
        
        {/* Chat Panel */}
        {chatVisible && (
          <View style={styles.chatContainer}>
            <View style={styles.chatHeader}>
              <Text style={styles.chatTitle}>Chat</Text>
              <IconButton icon="close" size={20} onPress={toggleChat} />
            </View>
            
            <ScrollView style={styles.messagesContainer}>
              {messages.map(message => (
                <View 
                  key={message.id} 
                  style={[
                    styles.messageItem,
                    message.sender === 'You' ? styles.userMessage : styles.otherMessage,
                  ]}
                >
                  <Text style={styles.messageSender}>{message.sender}</Text>
                  <Text style={styles.messageText}>{message.text}</Text>
                  <Text style={styles.messageTime}>
                    {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </Text>
                </View>
              ))}
            </ScrollView>
            
            <View style={styles.chatInputContainer}>
              <TextInput
                value={newMessage}
                onChangeText={setNewMessage}
                placeholder="Type a message..."
                mode="outlined"
                style={styles.chatInput}
                right={
                  <TextInput.Icon 
                    icon="send" 
                    onPress={sendMessage} 
                    disabled={!newMessage.trim()}
                    color={newMessage.trim() ? theme.colors.primary : '#999'}
                  />
                }
              />
            </View>
          </View>
        )}
      </View>
    );
  }
  
  // Consultations list view
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={styles.loadingText}>Loading virtual consultations...</Text>
      </View>
    );
  }
  
  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Virtual Consultations</Text>
        <Text style={styles.headerSubtitle}>
          Connect with healthcare providers from anywhere
        </Text>
      </View>
      
      {/* Upcoming Consultations */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Upcoming Consultations</Text>
        
        {upcomingConsultations.length > 0 ? (
          upcomingConsultations.map(consultation => renderConsultationItem(consultation))
        ) : (
          <Card style={styles.emptyStateCard}>
            <Card.Content style={styles.emptyStateContent}>
              <MaterialCommunityIcons 
                name="calendar-blank" 
                size={60} 
                color={theme.colors.primary} 
                style={{ opacity: 0.5 }}
              />
              <Text style={styles.emptyStateText}>No upcoming virtual consultations</Text>
              <Button 
                mode="contained" 
                onPress={() => navigation.navigate('Appointments')}
                style={styles.emptyStateButton}
              >
                Schedule Consultation
              </Button>
            </Card.Content>
          </Card>
        )}
      </View>
      
      {/* Past Consultations */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Past Consultations</Text>
        
        {pastConsultations.length > 0 ? (
          pastConsultations.map(consultation => renderConsultationItem(consultation, true))
        ) : (
          <Card style={styles.emptyStateCard}>
            <Card.Content style={styles.emptyStateContent}>
              <MaterialCommunityIcons 
                name="history" 
                size={60} 
                color={theme.colors.primary} 
                style={{ opacity: 0.5 }}
              />
              <Text style={styles.emptyStateText}>No past virtual consultations</Text>
            </Card.Content>
          </Card>
        )}
      </View>
      
      {/* How It Works */}
      <Card style={styles.howItWorksCard}>
        <Card.Content>
          <Text style={styles.howItWorksTitle}>How Virtual Consultations Work</Text>
          
          <Divider style={styles.divider} />
          
          <View style={styles.stepContainer}>
            <View style={[styles.stepIcon, { backgroundColor: theme.colors.primary }]}>
              <Text style={styles.stepNumber}>1</Text>
            </View>
            <View style={styles.stepContent}>
              <Text style={styles.stepTitle}>Schedule an Appointment</Text>
              <Text style={styles.stepDescription}>
                Book a virtual consultation through the Appointments section
              </Text>
            </View>
          </View>
          
          <View style={styles.stepContainer}>
            <View style={[styles.stepIcon, { backgroundColor: theme.colors.secondary }]}>
              <Text style={styles.stepNumber}>2</Text>
            </View>
            <View style={styles.stepContent}>
              <Text style={styles.stepTitle}>Prepare for Your Visit</Text>
              <Text style={styles.stepDescription}>
                Find a quiet place with good internet connection and test your camera and microphone
              </Text>
            </View>
          </View>
          
          <View style={styles.stepContainer}>
            <View style={[styles.stepIcon, { backgroundColor: theme.colors.tertiary }]}>
              <Text style={styles.stepNumber}>3</Text>
            </View>
            <View style={styles.stepContent}>
              <Text style={styles.stepTitle}>Join the Meeting</Text>
              <Text style={styles.stepDescription}>
                Click "Join Meeting" button when it's time for your appointment
              </Text>
            </View>
          </View>
          
          <View style={styles.stepContainer}>
            <View style={[styles.stepIcon, { backgroundColor: theme.colors.primary }]}>
              <Text style={styles.stepNumber}>4</Text>
            </View>
            <View style={styles.stepContent}>
              <Text style={styles.stepTitle}>Consult with Your Doctor</Text>
              <Text style={styles.stepDescription}>
                Discuss your health concerns just like an in-person visit
              </Text>
            </View>
          </View>
        </Card.Content>
      </Card>
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
  header: {
    padding: 20,
    backgroundColor: 'white',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#666',
    marginTop: 5,
  },
  section: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  consultationCard: {
    marginBottom: 16,
    borderRadius: 10,
  },
  consultationHeader: {
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
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  divider: {
    marginVertical: 10,
  },
  doctorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 10,
  },
  doctorDetails: {
    marginLeft: 15,
  },
  doctorName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  doctorSpecialty: {
    fontSize: 14,
    color: '#666',
  },
  notesContainer: {
    marginTop: 5,
    marginBottom: 10,
  },
  notesLabel: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  notes: {
    fontSize: 14,
    color: '#333',
  },
  joinButton: {
    marginTop: 10,
  },
  emptyStateCard: {
    borderRadius: 10,
  },
  emptyStateContent: {
    alignItems: 'center',
    padding: 20,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#666',
    marginVertical: 10,
    textAlign: 'center',
  },
  emptyStateButton: {
    marginTop: 10,
  },
  howItWorksCard: {
    margin: 16,
    borderRadius: 10,
    marginBottom: 30,
  },
  howItWorksTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  stepContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginVertical: 10,
  },
  stepIcon: {
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepNumber: {
    color: 'white',
    fontWeight: 'bold',
  },
  stepContent: {
    marginLeft: 15,
    flex: 1,
  },
  stepTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  stepDescription: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
  },
  meetingContainer: {
    flex: 1,
    backgroundColor: '#000',
  },
  videoContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#333',
  },
  cameraOffContainer: {
    backgroundColor: '#222',
  },
  cameraOffContent: {
    alignItems: 'center',
  },
  cameraOffText: {
    color: '#fff',
    marginTop: 10,
  },
  videoPlaceholder: {
    alignItems: 'center',
  },
  videoPlaceholderText: {
    color: '#fff',
    marginBottom: 10,
  },
  selfViewContainer: {
    position: 'absolute',
    top: 20,
    right: 20,
  },
  selfView: {
    width: 100,
    height: 150,
    backgroundColor: '#555',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cameraOffSelfView: {
    backgroundColor: '#333',
  },
  selfViewText: {
    color: '#fff',
    fontSize: 12,
  },
  meetingInfoContainer: {
    position: 'absolute',
    top: 20,
    left: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: 10,
    borderRadius: 5,
  },
  meetingInfoText: {
    color: '#fff',
  },
  controlsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    paddingVertical: 15,
  },
  controlButton: {
    alignItems: 'center',
    padding: 10,
    borderRadius: 10,
  },
  controlButtonActive: {
    backgroundColor: '#555',
  },
  controlText: {
    marginTop: 5,
    fontSize: 12,
  },
  controlTextActive: {
    color: '#fff',
  },
  endCallButton: {
    backgroundColor: '#ff4d4d',
  },
  endCallText: {
    color: '#fff',
  },
  chatContainer: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    width: '80%',
    backgroundColor: 'white',
    borderLeftWidth: 1,
    borderLeftColor: '#ddd',
  },
  chatHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  chatTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  messagesContainer: {
    flex: 1,
    padding: 10,
  },
  messageItem: {
    padding: 10,
    borderRadius: 10,
    marginBottom: 10,
    maxWidth: '80%',
  },
  userMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#e3f2fd',
  },
  otherMessage: {
    alignSelf: 'flex-start',
    backgroundColor: '#f5f5f5',
  },
  messageSender: {
    fontWeight: 'bold',
    fontSize: 14,
  },
  messageText: {
    fontSize: 14,
    marginTop: 5,
  },
  messageTime: {
    fontSize: 12,
    color: '#999',
    alignSelf: 'flex-end',
    marginTop: 5,
  },
  chatInputContainer: {
    padding: 10,
    borderTopWidth: 1,
    borderTopColor: '#ddd',
  },
  chatInput: {
    backgroundColor: '#fff',
  },
});

export default VirtualConsultationScreen;