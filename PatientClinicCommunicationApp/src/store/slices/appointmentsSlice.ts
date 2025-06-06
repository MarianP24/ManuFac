import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '..';

// Define types
export interface Appointment {
  id: string;
  clinicId: string;
  clinicName: string;
  doctorId: string;
  doctorName: string;
  specialization: string;
  date: string;
  time: string;
  status: 'scheduled' | 'completed' | 'cancelled' | 'pending';
  notes?: string;
  virtualMeeting?: boolean;
  meetingLink?: string;
}

interface AppointmentsState {
  appointments: Appointment[];
  loading: boolean;
  error: string | null;
  selectedAppointment: Appointment | null;
}

// Initial state
const initialState: AppointmentsState = {
  appointments: [],
  loading: false,
  error: null,
  selectedAppointment: null,
};

// Mock data for demonstration
const mockAppointments: Appointment[] = [
  {
    id: '1',
    clinicId: 'clinic1',
    clinicName: 'City Health Clinic',
    doctorId: 'doctor1',
    doctorName: 'Dr. John Smith',
    specialization: 'Cardiology',
    date: '2023-10-15',
    time: '10:00 AM',
    status: 'scheduled',
    virtualMeeting: false,
  },
  {
    id: '2',
    clinicId: 'clinic2',
    clinicName: 'Family Medical Center',
    doctorId: 'doctor2',
    doctorName: 'Dr. Sarah Johnson',
    specialization: 'General Medicine',
    date: '2023-10-20',
    time: '2:30 PM',
    status: 'scheduled',
    virtualMeeting: true,
    meetingLink: 'https://meeting.example.com/abc123',
  },
];

// Async thunks
export const fetchAppointments = createAsyncThunk(
  'appointments/fetchAll',
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
      return mockAppointments;
    } catch (error) {
      return rejectWithValue('Failed to fetch appointments');
    }
  }
);

export const createAppointment = createAsyncThunk(
  'appointments/create',
  async (appointment: Omit<Appointment, 'id'>, { getState, rejectWithValue }) => {
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
      const newAppointment: Appointment = {
        ...appointment,
        id: Date.now().toString(),
      };
      
      return newAppointment;
    } catch (error) {
      return rejectWithValue('Failed to create appointment');
    }
  }
);

export const updateAppointment = createAsyncThunk(
  'appointments/update',
  async (appointment: Appointment, { getState, rejectWithValue }) => {
    try {
      // In a real app, this would be an API call
      const state = getState() as RootState;
      const token = state.auth.token;
      
      if (!token) {
        return rejectWithValue('Authentication required');
      }
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      return appointment;
    } catch (error) {
      return rejectWithValue('Failed to update appointment');
    }
  }
);

export const cancelAppointment = createAsyncThunk(
  'appointments/cancel',
  async (appointmentId: string, { getState, rejectWithValue }) => {
    try {
      // In a real app, this would be an API call
      const state = getState() as RootState;
      const token = state.auth.token;
      
      if (!token) {
        return rejectWithValue('Authentication required');
      }
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      return appointmentId;
    } catch (error) {
      return rejectWithValue('Failed to cancel appointment');
    }
  }
);

// Create slice
const appointmentsSlice = createSlice({
  name: 'appointments',
  initialState,
  reducers: {
    selectAppointment: (state, action: PayloadAction<string>) => {
      state.selectedAppointment = state.appointments.find(
        appointment => appointment.id === action.payload
      ) || null;
    },
    clearSelectedAppointment: (state) => {
      state.selectedAppointment = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch appointments
    builder
      .addCase(fetchAppointments.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAppointments.fulfilled, (state, action: PayloadAction<Appointment[]>) => {
        state.loading = false;
        state.appointments = action.payload;
      })
      .addCase(fetchAppointments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
    
    // Create appointment
    builder
      .addCase(createAppointment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createAppointment.fulfilled, (state, action: PayloadAction<Appointment>) => {
        state.loading = false;
        state.appointments.push(action.payload);
      })
      .addCase(createAppointment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
    
    // Update appointment
    builder
      .addCase(updateAppointment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateAppointment.fulfilled, (state, action: PayloadAction<Appointment>) => {
        state.loading = false;
        const index = state.appointments.findIndex(
          appointment => appointment.id === action.payload.id
        );
        if (index !== -1) {
          state.appointments[index] = action.payload;
        }
        if (state.selectedAppointment?.id === action.payload.id) {
          state.selectedAppointment = action.payload;
        }
      })
      .addCase(updateAppointment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
    
    // Cancel appointment
    builder
      .addCase(cancelAppointment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(cancelAppointment.fulfilled, (state, action: PayloadAction<string>) => {
        state.loading = false;
        const index = state.appointments.findIndex(
          appointment => appointment.id === action.payload
        );
        if (index !== -1) {
          state.appointments[index].status = 'cancelled';
        }
        if (state.selectedAppointment?.id === action.payload) {
          state.selectedAppointment.status = 'cancelled';
        }
      })
      .addCase(cancelAppointment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { selectAppointment, clearSelectedAppointment, clearError } = appointmentsSlice.actions;
export default appointmentsSlice.reducer;