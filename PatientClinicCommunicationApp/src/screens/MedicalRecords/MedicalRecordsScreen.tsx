import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Alert,
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
  Menu,
} from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import DocumentPicker from 'react-native-document-picker';

import { RootState, AppDispatch } from '../../store';
import { fetchMedicalRecords } from '../../store/slices/medicalRecordsSlice';

// Define medical record type
interface MedicalRecord {
  id: string;
  title: string;
  type: 'prescription' | 'lab_result' | 'imaging' | 'report' | 'other';
  date: string;
  doctor_name?: string;
  clinic_name?: string;
  description?: string;
  file_url?: string;
  is_digitally_signed: boolean;
}

const MedicalRecordsScreen: React.FC = () => {
  const theme = useTheme();
  const navigation = useNavigation();
  const dispatch = useDispatch<AppDispatch>();
  
  // State for medical records
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<MedicalRecord | null>(null);
  const [menuVisible, setMenuVisible] = useState(false);
  const [menuAnchor, setMenuAnchor] = useState({ x: 0, y: 0 });
  
  // State for new record modal
  const [modalVisible, setModalVisible] = useState(false);
  const [title, setTitle] = useState('');
  const [recordType, setRecordType] = useState<MedicalRecord['type']>('report');
  const [recordDate, setRecordDate] = useState(new Date().toISOString().split('T')[0]);
  const [doctorName, setDoctorName] = useState('');
  const [clinicName, setClinicName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedFile, setSelectedFile] = useState<{ name: string; uri: string } | null>(null);
  
  // Get medical records from Redux store
  const medicalRecords = useSelector((state: RootState) => 
    state.medicalRecords.records || []
  );
  const loading = useSelector((state: RootState) => state.medicalRecords.loading);
  
  // Filter options
  const filters = ['All', 'Prescriptions', 'Lab Results', 'Imaging', 'Reports'];
  
  useEffect(() => {
    loadMedicalRecords();
  }, [dispatch]);
  
  const loadMedicalRecords = async () => {
    try {
      await dispatch(fetchMedicalRecords());
    } catch (error) {
      console.error('Error loading medical records:', error);
    }
  };
  
  const onRefresh = async () => {
    setRefreshing(true);
    await loadMedicalRecords();
    setRefreshing(false);
  };
  
  const handleNewRecord = () => {
    setSelectedRecord(null);
    resetForm();
    setModalVisible(true);
  };
  
  const handleEditRecord = (record: MedicalRecord) => {
    setSelectedRecord(record);
    setTitle(record.title);
    setRecordType(record.type);
    setRecordDate(record.date);
    setDoctorName(record.doctor_name || '');
    setClinicName(record.clinic_name || '');
    setDescription(record.description || '');
    setSelectedFile(record.file_url ? { name: 'Existing Document', uri: record.file_url } : null);
    setModalVisible(true);
  };
  
  const handleCloseModal = () => {
    setModalVisible(false);
  };
  
  const resetForm = () => {
    setTitle('');
    setRecordType('report');
    setRecordDate(new Date().toISOString().split('T')[0]);
    setDoctorName('');
    setClinicName('');
    setDescription('');
    setSelectedFile(null);
  };
  
  const handleSaveRecord = () => {
    // Validate form
    if (!title) {
      Alert.alert('Error', 'Please enter a title for the record');
      return;
    }
    
    // In a real app, this would dispatch an action to save the record
    console.log('Saving medical record:', {
      id: selectedRecord?.id || Date.now().toString(),
      title,
      type: recordType,
      date: recordDate,
      doctor_name: doctorName,
      clinic_name: clinicName,
      description,
      file_url: selectedFile?.uri,
      is_digitally_signed: false,
    });
    
    // Close modal
    handleCloseModal();
    
    // Show confirmation
    Alert.alert(
      'Success', 
      selectedRecord ? 'Medical record updated successfully!' : 'Medical record added successfully!'
    );
  };
  
  const handlePickDocument = async () => {
    try {
      const result = await DocumentPicker.pick({
        type: [DocumentPicker.types.pdf, DocumentPicker.types.images],
      });
      
      setSelectedFile({
        name: result[0].name || 'Document',
        uri: result[0].uri,
      });
    } catch (err) {
      if (DocumentPicker.isCancel(err)) {
        // User cancelled the picker
      } else {
        console.error('Error picking document:', err);
        Alert.alert('Error', 'Failed to pick document');
      }
    }
  };
  
  const handleViewRecord = (record: MedicalRecord) => {
    if (record.file_url) {
      // In a real app, this would open the document viewer
      Alert.alert('View Document', `Opening ${record.title}`);
    } else {
      Alert.alert('No Document', 'This record does not have an attached document');
    }
  };
  
  const handleDeleteRecord = (record: MedicalRecord) => {
    Alert.alert(
      'Delete Record',
      `Are you sure you want to delete "${record.title}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: () => {
            // In a real app, this would dispatch an action to delete the record
            Alert.alert('Success', 'Record deleted successfully');
          }
        },
      ]
    );
  };
  
  const handleShareRecord = (record: MedicalRecord) => {
    // In a real app, this would open a share dialog
    Alert.alert('Share', `Sharing ${record.title}`);
  };
  
  const handleDownloadRecord = (record: MedicalRecord) => {
    // In a real app, this would download the document
    Alert.alert('Download', `Downloading ${record.title}`);
  };
  
  const openMenu = (record: MedicalRecord, event: any) => {
    setSelectedRecord(record);
    setMenuAnchor({ x: event.nativeEvent.pageX, y: event.nativeEvent.pageY });
    setMenuVisible(true);
  };
  
  const closeMenu = () => {
    setMenuVisible(false);
  };
  
  const getFilteredRecords = () => {
    let filtered = [...medicalRecords];
    
    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(record => 
        record.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (record.description && record.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (record.doctor_name && record.doctor_name.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (record.clinic_name && record.clinic_name.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }
    
    // Apply type filter
    if (activeFilter && activeFilter !== 'All') {
      const filterMap: Record<string, MedicalRecord['type'][]> = {
        'Prescriptions': ['prescription'],
        'Lab Results': ['lab_result'],
        'Imaging': ['imaging'],
        'Reports': ['report'],
      };
      
      const types = filterMap[activeFilter];
      if (types) {
        filtered = filtered.filter(record => types.includes(record.type));
      }
    }
    
    // Sort by date (newest first)
    return filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  };
  
  const getRecordTypeIcon = (type: MedicalRecord['type']) => {
    switch (type) {
      case 'prescription':
        return 'prescription';
      case 'lab_result':
        return 'flask';
      case 'imaging':
        return 'radiology-box';
      case 'report':
        return 'file-document';
      default:
        return 'file';
    }
  };
  
  const getRecordTypeLabel = (type: MedicalRecord['type']) => {
    switch (type) {
      case 'prescription':
        return 'Prescription';
      case 'lab_result':
        return 'Lab Result';
      case 'imaging':
        return 'Imaging';
      case 'report':
        return 'Report';
      default:
        return 'Other';
    }
  };
  
  const renderRecordItem = ({ item }: { item: MedicalRecord }) => (
    <Card style={styles.recordCard}>
      <Card.Content>
        <View style={styles.recordHeader}>
          <View style={styles.recordTitleContainer}>
            <Text style={styles.recordTitle}>{item.title}</Text>
            <Text style={styles.recordDate}>
              {new Date(item.date).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
              })}
            </Text>
          </View>
          
          <IconButton
            icon="dots-vertical"
            size={24}
            onPress={(e) => openMenu(item, e)}
          />
        </View>
        
        <View style={styles.recordTypeContainer}>
          <Chip 
            icon={() => (
              <MaterialCommunityIcons 
                name={getRecordTypeIcon(item.type)} 
                size={16} 
                color={theme.colors.primary} 
              />
            )}
            style={styles.recordTypeChip}
          >
            {getRecordTypeLabel(item.type)}
          </Chip>
          
          {item.is_digitally_signed && (
            <Chip 
              icon="check-decagram" 
              style={styles.signedChip}
            >
              Signed
            </Chip>
          )}
        </View>
        
        <Divider style={styles.divider} />
        
        {(item.doctor_name || item.clinic_name) && (
          <View style={styles.recordDetails}>
            {item.doctor_name && (
              <View style={styles.detailRow}>
                <MaterialCommunityIcons name="doctor" size={18} color={theme.colors.primary} />
                <Text style={styles.detailText}>{item.doctor_name}</Text>
              </View>
            )}
            
            {item.clinic_name && (
              <View style={styles.detailRow}>
                <MaterialCommunityIcons name="hospital-building" size={18} color={theme.colors.primary} />
                <Text style={styles.detailText}>{item.clinic_name}</Text>
              </View>
            )}
          </View>
        )}
        
        {item.description && (
          <>
            <Divider style={styles.divider} />
            <Text style={styles.descriptionLabel}>Description:</Text>
            <Text style={styles.description}>{item.description}</Text>
          </>
        )}
        
        <View style={styles.recordActions}>
          <Button 
            mode="contained" 
            onPress={() => handleViewRecord(item)}
            icon="eye"
            style={styles.viewButton}
          >
            View
          </Button>
          
          <Button 
            mode="outlined" 
            onPress={() => handleShareRecord(item)}
            icon="share-variant"
            style={styles.actionButton}
          >
            Share
          </Button>
        </View>
      </Card.Content>
    </Card>
  );
  
  const renderEmptyState = () => (
    <View style={styles.emptyStateContainer}>
      <MaterialCommunityIcons 
        name="file-document" 
        size={80} 
        color={theme.colors.primary} 
        style={{ opacity: 0.5 }}
      />
      <Text style={styles.emptyStateTitle}>No medical records found</Text>
      <Text style={styles.emptyStateSubtitle}>
        Add your medical records to keep track of your health history
      </Text>
      <Button 
        mode="contained" 
        onPress={handleNewRecord}
        style={styles.emptyStateButton}
      >
        Add Medical Record
      </Button>
    </View>
  );
  
  return (
    <View style={styles.container}>
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <TextInput
          placeholder="Search medical records"
          value={searchQuery}
          onChangeText={setSearchQuery}
          mode="outlined"
          style={styles.searchInput}
          left={<TextInput.Icon icon="magnify" />}
          right={
            searchQuery ? (
              <TextInput.Icon icon="close" onPress={() => setSearchQuery('')} />
            ) : null
          }
        />
      </View>
      
      {/* Filter Chips */}
      <View style={styles.filtersContainer}>
        <FlatList
          data={filters}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item) => item}
          renderItem={({ item }) => (
            <Chip
              selected={activeFilter === item || (activeFilter === null && item === 'All')}
              onPress={() => setActiveFilter(item === 'All' ? null : item)}
              style={styles.filterChip}
              selectedColor={theme.colors.primary}
            >
              {item}
            </Chip>
          )}
          contentContainerStyle={styles.filtersList}
        />
      </View>
      
      {/* Records List */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={styles.loadingText}>Loading medical records...</Text>
        </View>
      ) : (
        <FlatList
          data={getFilteredRecords()}
          keyExtractor={(item) => item.id}
          renderItem={renderRecordItem}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={renderEmptyState}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        />
      )}
      
      {/* FAB for adding new record */}
      <FAB
        style={[styles.fab, { backgroundColor: theme.colors.primary }]}
        icon="plus"
        onPress={handleNewRecord}
        label="Add Record"
      />
      
      {/* Record Options Menu */}
      <Menu
        visible={menuVisible}
        onDismiss={closeMenu}
        anchor={menuAnchor}
      >
        <Menu.Item 
          onPress={() => {
            closeMenu();
            if (selectedRecord) handleViewRecord(selectedRecord);
          }} 
          title="View" 
          leadingIcon="eye"
        />
        <Menu.Item 
          onPress={() => {
            closeMenu();
            if (selectedRecord) handleEditRecord(selectedRecord);
          }} 
          title="Edit" 
          leadingIcon="pencil"
        />
        <Menu.Item 
          onPress={() => {
            closeMenu();
            if (selectedRecord) handleShareRecord(selectedRecord);
          }} 
          title="Share" 
          leadingIcon="share-variant"
        />
        <Menu.Item 
          onPress={() => {
            closeMenu();
            if (selectedRecord) handleDownloadRecord(selectedRecord);
          }} 
          title="Download" 
          leadingIcon="download"
        />
        <Divider />
        <Menu.Item 
          onPress={() => {
            closeMenu();
            if (selectedRecord) handleDeleteRecord(selectedRecord);
          }} 
          title="Delete" 
          leadingIcon="delete"
          titleStyle={{ color: theme.colors.error }}
        />
      </Menu>
      
      {/* New/Edit Record Modal */}
      <Portal>
        <Modal
          visible={modalVisible}
          onDismiss={handleCloseModal}
          contentContainerStyle={styles.modalContainer}
        >
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>
              {selectedRecord ? 'Edit Medical Record' : 'Add Medical Record'}
            </Text>
            <IconButton icon="close" size={24} onPress={handleCloseModal} />
          </View>
          
          <FlatList
            data={[{ key: 'form' }]} // Hack to make FlatList work with a single item
            renderItem={() => (
              <View style={styles.modalContent}>
                <TextInput
                  label="Title"
                  value={title}
                  onChangeText={setTitle}
                  mode="outlined"
                  style={styles.input}
                />
                
                <Text style={styles.inputLabel}>Record Type</Text>
                <View style={styles.recordTypeOptions}>
                  {(['prescription', 'lab_result', 'imaging', 'report', 'other'] as MedicalRecord['type'][]).map((type) => (
                    <Chip
                      key={type}
                      selected={recordType === type}
                      onPress={() => setRecordType(type)}
                      style={styles.typeChip}
                      icon={() => (
                        <MaterialCommunityIcons 
                          name={getRecordTypeIcon(type)} 
                          size={16} 
                          color={recordType === type ? theme.colors.primary : '#666'} 
                        />
                      )}
                    >
                      {getRecordTypeLabel(type)}
                    </Chip>
                  ))}
                </View>
                
                <TextInput
                  label="Date"
                  value={recordDate}
                  onChangeText={setRecordDate}
                  mode="outlined"
                  style={styles.input}
                  right={<TextInput.Icon icon="calendar" />}
                />
                
                <TextInput
                  label="Doctor Name (Optional)"
                  value={doctorName}
                  onChangeText={setDoctorName}
                  mode="outlined"
                  style={styles.input}
                />
                
                <TextInput
                  label="Clinic/Hospital Name (Optional)"
                  value={clinicName}
                  onChangeText={setClinicName}
                  mode="outlined"
                  style={styles.input}
                />
                
                <TextInput
                  label="Description (Optional)"
                  value={description}
                  onChangeText={setDescription}
                  mode="outlined"
                  multiline
                  numberOfLines={3}
                  style={styles.input}
                />
                
                <Text style={styles.inputLabel}>Document</Text>
                {selectedFile ? (
                  <View style={styles.selectedFileContainer}>
                    <MaterialCommunityIcons name="file-document" size={24} color={theme.colors.primary} />
                    <Text style={styles.selectedFileName}>{selectedFile.name}</Text>
                    <IconButton icon="close" size={20} onPress={() => setSelectedFile(null)} />
                  </View>
                ) : (
                  <Button 
                    mode="outlined" 
                    onPress={handlePickDocument}
                    icon="upload"
                    style={styles.uploadButton}
                  >
                    Upload Document
                  </Button>
                )}
                
                <Button
                  mode="contained"
                  onPress={handleSaveRecord}
                  style={styles.saveButton}
                  disabled={!title}
                >
                  {selectedRecord ? 'Update Record' : 'Save Record'}
                </Button>
              </View>
            )}
            keyExtractor={(item) => item.key}
          />
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
  searchContainer: {
    padding: 16,
    paddingBottom: 8,
    backgroundColor: 'white',
  },
  searchInput: {
    backgroundColor: '#f5f5f5',
  },
  filtersContainer: {
    backgroundColor: 'white',
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  filtersList: {
    paddingVertical: 8,
  },
  filterChip: {
    marginRight: 8,
  },
  listContent: {
    padding: 16,
    paddingBottom: 80, // Space for FAB
  },
  recordCard: {
    marginBottom: 16,
    borderRadius: 10,
  },
  recordHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  recordTitleContainer: {
    flex: 1,
  },
  recordTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  recordDate: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  recordTypeContainer: {
    flexDirection: 'row',
    marginTop: 8,
  },
  recordTypeChip: {
    marginRight: 8,
  },
  signedChip: {
    backgroundColor: '#e6f7e6',
  },
  divider: {
    marginVertical: 10,
  },
  recordDetails: {
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
  descriptionLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  description: {
    fontSize: 14,
    color: '#333',
  },
  recordActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 15,
  },
  viewButton: {
    flex: 1,
    marginRight: 8,
  },
  actionButton: {
    flex: 1,
    marginLeft: 8,
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
    fontWeight: 'bold',
  },
  emptyStateSubtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
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
  modalContent: {
    padding: 15,
  },
  input: {
    marginBottom: 15,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 5,
    marginBottom: 10,
  },
  recordTypeOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 15,
  },
  typeChip: {
    margin: 4,
  },
  selectedFileContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    marginBottom: 15,
  },
  selectedFileName: {
    flex: 1,
    marginLeft: 10,
  },
  uploadButton: {
    marginBottom: 15,
  },
  saveButton: {
    marginTop: 10,
    marginBottom: 20,
  },
});

export default MedicalRecordsScreen;