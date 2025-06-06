import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '..';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Define types
export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone?: string;
  dateOfBirth?: string;
  gender?: 'male' | 'female' | 'other' | 'prefer-not-to-say';
  address?: {
    street?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    country?: string;
  };
  emergencyContact?: {
    name: string;
    relationship: string;
    phone: string;
  };
  medicalInfo?: {
    bloodType?: 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-';
    allergies?: string[];
    medications?: string[];
    conditions?: string[];
    notes?: string;
  };
  preferredClinics?: string[];
  preferredDoctors?: string[];
  profilePicture?: string;
  preferences?: {
    notifications: boolean;
    darkMode: boolean;
    language: string;
  };
}

interface UserState {
  profile: UserProfile | null;
  loading: boolean;
  error: string | null;
}

// Initial state
const initialState: UserState = {
  profile: null,
  loading: false,
  error: null,
};

// Mock user profile for demonstration
const mockUserProfile: UserProfile = {
  id: '1',
  name: 'John Doe',
  email: 'john.doe@example.com',
  phone: '+1 (555) 123-4567',
  dateOfBirth: '1985-05-15',
  gender: 'male',
  address: {
    street: '123 Main St',
    city: 'Anytown',
    state: 'CA',
    zipCode: '12345',
    country: 'USA',
  },
  emergencyContact: {
    name: 'Jane Doe',
    relationship: 'Spouse',
    phone: '+1 (555) 987-6543',
  },
  medicalInfo: {
    bloodType: 'O+',
    allergies: ['Penicillin', 'Peanuts'],
    medications: ['Lisinopril 10mg'],
    conditions: ['Hypertension'],
    notes: 'Regular check-ups every 6 months',
  },
  preferredClinics: ['clinic1', 'clinic3'],
  preferredDoctors: ['doctor1', 'doctor2'],
  preferences: {
    notifications: true,
    darkMode: false,
    language: 'en',
  },
};

// Async thunks
export const fetchUserProfile = createAsyncThunk(
  'user/fetchProfile',
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
      
      // Check if we have a stored profile
      const storedProfile = await AsyncStorage.getItem('userProfile');
      if (storedProfile) {
        return JSON.parse(storedProfile);
      }
      
      // If no stored profile, return mock data and store it
      await AsyncStorage.setItem('userProfile', JSON.stringify(mockUserProfile));
      return mockUserProfile;
    } catch (error) {
      return rejectWithValue('Failed to fetch user profile');
    }
  }
);

export const updateUserProfile = createAsyncThunk(
  'user/updateProfile',
  async (profileData: Partial<UserProfile>, { getState, rejectWithValue }) => {
    try {
      // In a real app, this would be an API call
      const state = getState() as RootState;
      const token = state.auth.token;
      const currentProfile = state.user.profile;
      
      if (!token) {
        return rejectWithValue('Authentication required');
      }
      
      if (!currentProfile) {
        return rejectWithValue('No profile to update');
      }
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Update the profile
      const updatedProfile = {
        ...currentProfile,
        ...profileData,
      };
      
      // Store the updated profile
      await AsyncStorage.setItem('userProfile', JSON.stringify(updatedProfile));
      
      return updatedProfile;
    } catch (error) {
      return rejectWithValue('Failed to update user profile');
    }
  }
);

export const updatePreferences = createAsyncThunk(
  'user/updatePreferences',
  async (
    preferences: Partial<UserProfile['preferences']>,
    { getState, rejectWithValue }
  ) => {
    try {
      // In a real app, this would be an API call
      const state = getState() as RootState;
      const token = state.auth.token;
      const currentProfile = state.user.profile;
      
      if (!token) {
        return rejectWithValue('Authentication required');
      }
      
      if (!currentProfile) {
        return rejectWithValue('No profile to update');
      }
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Update the preferences
      const updatedPreferences = {
        ...currentProfile.preferences,
        ...preferences,
      };
      
      const updatedProfile = {
        ...currentProfile,
        preferences: updatedPreferences,
      };
      
      // Store the updated profile
      await AsyncStorage.setItem('userProfile', JSON.stringify(updatedProfile));
      
      return updatedProfile;
    } catch (error) {
      return rejectWithValue('Failed to update preferences');
    }
  }
);

// Create slice
const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch user profile
    builder
      .addCase(fetchUserProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserProfile.fulfilled, (state, action: PayloadAction<UserProfile>) => {
        state.loading = false;
        state.profile = action.payload;
      })
      .addCase(fetchUserProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
    
    // Update user profile
    builder
      .addCase(updateUserProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateUserProfile.fulfilled, (state, action: PayloadAction<UserProfile>) => {
        state.loading = false;
        state.profile = action.payload;
      })
      .addCase(updateUserProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
    
    // Update preferences
    builder
      .addCase(updatePreferences.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updatePreferences.fulfilled, (state, action: PayloadAction<UserProfile>) => {
        state.loading = false;
        state.profile = action.payload;
      })
      .addCase(updatePreferences.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError } = userSlice.actions;
export default userSlice.reducer;