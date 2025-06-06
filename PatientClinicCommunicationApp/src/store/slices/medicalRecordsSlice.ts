import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '..';

// Define types
export interface MedicalRecord {
  id: string;
  type: 'prescription' | 'labResult' | 'diagnosis' | 'scan' | 'xray' | 'report' | 'invoice';
  title: string;
  date: string;
  doctorId: string;
  doctorName: string;
  clinicId: string;
  clinicName: string;
  description?: string;
  fileUrl?: string;
  isDigitallySigned: boolean;
  signedBy?: string;
  signatureDate?: string;
}

interface MedicalRecordsState {
  records: MedicalRecord[];
  loading: boolean;
  error: string | null;
  selectedRecord: MedicalRecord | null;
}

// Initial state
const initialState: MedicalRecordsState = {
  records: [],
  loading: false,
  error: null,
  selectedRecord: null,
};

// Mock data for demonstration
const mockMedicalRecords: MedicalRecord[] = [
  {
    id: '1',
    type: 'prescription',
    title: 'Antibiotic Prescription',
    date: '2023-09-15',
    doctorId: 'doctor1',
    doctorName: 'Dr. John Smith',
    clinicId: 'clinic1',
    clinicName: 'City Health Clinic',
    description: 'Amoxicillin 500mg, 3 times daily for 7 days',
    isDigitallySigned: true,
    signedBy: 'Dr. John Smith',
    signatureDate: '2023-09-15',
  },
  {
    id: '2',
    type: 'labResult',
    title: 'Blood Test Results',
    date: '2023-09-10',
    doctorId: 'doctor2',
    doctorName: 'Dr. Sarah Johnson',
    clinicId: 'clinic2',
    clinicName: 'Family Medical Center',
    description: 'Complete blood count and lipid panel',
    fileUrl: 'https://example.com/lab-results/123456.pdf',
    isDigitallySigned: true,
    signedBy: 'Dr. Sarah Johnson',
    signatureDate: '2023-09-10',
  },
  {
    id: '3',
    type: 'scan',
    title: 'Chest X-Ray',
    date: '2023-08-20',
    doctorId: 'doctor3',
    doctorName: 'Dr. Michael Brown',
    clinicId: 'clinic3',
    clinicName: 'Radiology Center',
    description: 'Routine chest X-ray examination',
    fileUrl: 'https://example.com/scans/chest-xray-123.jpg',
    isDigitallySigned: true,
    signedBy: 'Dr. Michael Brown',
    signatureDate: '2023-08-20',
  },
  {
    id: '4',
    type: 'invoice',
    title: 'Consultation Fee',
    date: '2023-09-15',
    doctorId: 'doctor1',
    doctorName: 'Dr. John Smith',
    clinicId: 'clinic1',
    clinicName: 'City Health Clinic',
    description: 'Payment for consultation on September 15, 2023',
    fileUrl: 'https://example.com/invoices/inv-2023-09-15.pdf',
    isDigitallySigned: false,
  },
];

// Async thunks
export const fetchMedicalRecords = createAsyncThunk(
  'medicalRecords/fetchAll',
  async (_, { getState, rejectWithValue }) => {
    try {
      // In a real app, this would be an API call using the token from auth state
      const state = getState() as RootState;
      const token = state.auth.token;
      
      if (!token) {
        return rejectWithValue('Authentication required');
      }
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Return mock data
      return mockMedicalRecords;
    } catch (error) {
      return rejectWithValue('Failed to fetch medical records');
    }
  }
);

export const fetchMedicalRecordById = createAsyncThunk(
  'medicalRecords/fetchById',
  async (recordId: string, { getState, rejectWithValue }) => {
    try {
      // In a real app, this would be an API call
      const state = getState() as RootState;
      const token = state.auth.token;
      
      if (!token) {
        return rejectWithValue('Authentication required');
      }
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Find the record in mock data
      const record = mockMedicalRecords.find(r => r.id === recordId);
      
      if (!record) {
        return rejectWithValue('Medical record not found');
      }
      
      return record;
    } catch (error) {
      return rejectWithValue('Failed to fetch medical record');
    }
  }
);

export const uploadMedicalRecord = createAsyncThunk(
  'medicalRecords/upload',
  async (
    record: Omit<MedicalRecord, 'id' | 'isDigitallySigned' | 'signedBy' | 'signatureDate'>,
    { getState, rejectWithValue }
  ) => {
    try {
      // In a real app, this would be an API call
      const state = getState() as RootState;
      const token = state.auth.token;
      
      if (!token) {
        return rejectWithValue('Authentication required');
      }
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Generate a new ID (in a real app, this would come from the server)
      const newRecord: MedicalRecord = {
        ...record,
        id: Date.now().toString(),
        isDigitallySigned: false,
      };
      
      return newRecord;
    } catch (error) {
      return rejectWithValue('Failed to upload medical record');
    }
  }
);

export const signMedicalRecord = createAsyncThunk(
  'medicalRecords/sign',
  async (
    { recordId, doctorName }: { recordId: string; doctorName: string },
    { getState, rejectWithValue }
  ) => {
    try {
      // In a real app, this would be an API call
      const state = getState() as RootState;
      const token = state.auth.token;
      
      if (!token) {
        return rejectWithValue('Authentication required');
      }
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      return {
        recordId,
        doctorName,
        signatureDate: new Date().toISOString().split('T')[0],
      };
    } catch (error) {
      return rejectWithValue('Failed to sign medical record');
    }
  }
);

// Create slice
const medicalRecordsSlice = createSlice({
  name: 'medicalRecords',
  initialState,
  reducers: {
    selectRecord: (state, action: PayloadAction<string>) => {
      state.selectedRecord = state.records.find(record => record.id === action.payload) || null;
    },
    clearSelectedRecord: (state) => {
      state.selectedRecord = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch all medical records
    builder
      .addCase(fetchMedicalRecords.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMedicalRecords.fulfilled, (state, action: PayloadAction<MedicalRecord[]>) => {
        state.loading = false;
        state.records = action.payload;
      })
      .addCase(fetchMedicalRecords.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
    
    // Fetch medical record by ID
    builder
      .addCase(fetchMedicalRecordById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMedicalRecordById.fulfilled, (state, action: PayloadAction<MedicalRecord>) => {
        state.loading = false;
        state.selectedRecord = action.payload;
      })
      .addCase(fetchMedicalRecordById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
    
    // Upload medical record
    builder
      .addCase(uploadMedicalRecord.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(uploadMedicalRecord.fulfilled, (state, action: PayloadAction<MedicalRecord>) => {
        state.loading = false;
        state.records.push(action.payload);
      })
      .addCase(uploadMedicalRecord.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
    
    // Sign medical record
    builder
      .addCase(signMedicalRecord.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        signMedicalRecord.fulfilled,
        (
          state,
          action: PayloadAction<{ recordId: string; doctorName: string; signatureDate: string }>
        ) => {
          state.loading = false;
          const index = state.records.findIndex(
            record => record.id === action.payload.recordId
          );
          if (index !== -1) {
            state.records[index].isDigitallySigned = true;
            state.records[index].signedBy = action.payload.doctorName;
            state.records[index].signatureDate = action.payload.signatureDate;
          }
          if (state.selectedRecord?.id === action.payload.recordId) {
            state.selectedRecord.isDigitallySigned = true;
            state.selectedRecord.signedBy = action.payload.doctorName;
            state.selectedRecord.signatureDate = action.payload.signatureDate;
          }
        }
      )
      .addCase(signMedicalRecord.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { selectRecord, clearSelectedRecord, clearError } = medicalRecordsSlice.actions;
export default medicalRecordsSlice.reducer;