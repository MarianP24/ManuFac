import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '..';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Define types
export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'appointment' | 'medication' | 'result' | 'payment' | 'system' | 'emergency';
  read: boolean;
  createdAt: string;
  data?: {
    appointmentId?: string;
    medicalRecordId?: string;
    paymentId?: string;
    actionUrl?: string;
  };
}

interface NotificationsState {
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;
  error: string | null;
}

// Initial state
const initialState: NotificationsState = {
  notifications: [],
  unreadCount: 0,
  loading: false,
  error: null,
};

// Mock notifications for demonstration
const mockNotifications: Notification[] = [
  {
    id: '1',
    title: 'Appointment Reminder',
    message: 'You have an appointment with Dr. John Smith tomorrow at 10:00 AM.',
    type: 'appointment',
    read: false,
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    data: {
      appointmentId: '1',
    },
  },
  {
    id: '2',
    title: 'Medication Reminder',
    message: 'Time to take your Lisinopril medication.',
    type: 'medication',
    read: true,
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '3',
    title: 'Lab Results Available',
    message: 'Your recent blood test results are now available.',
    type: 'result',
    read: false,
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    data: {
      medicalRecordId: '2',
    },
  },
  {
    id: '4',
    title: 'Payment Confirmation',
    message: 'Your payment of $75.00 for the recent consultation has been processed.',
    type: 'payment',
    read: false,
    createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    data: {
      paymentId: '1',
    },
  },
];

// Async thunks
export const fetchNotifications = createAsyncThunk(
  'notifications/fetchAll',
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
      
      // Check if we have stored notifications
      const storedNotifications = await AsyncStorage.getItem('notifications');
      if (storedNotifications) {
        return JSON.parse(storedNotifications);
      }
      
      // If no stored notifications, return mock data and store it
      await AsyncStorage.setItem('notifications', JSON.stringify(mockNotifications));
      return mockNotifications;
    } catch (error) {
      return rejectWithValue('Failed to fetch notifications');
    }
  }
);

export const markAsRead = createAsyncThunk(
  'notifications/markAsRead',
  async (notificationId: string, { getState, rejectWithValue }) => {
    try {
      // In a real app, this would be an API call
      const state = getState() as RootState;
      const token = state.auth.token;
      
      if (!token) {
        return rejectWithValue('Authentication required');
      }
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Get current notifications
      const currentNotifications = [...state.notifications.notifications];
      const notificationIndex = currentNotifications.findIndex(n => n.id === notificationId);
      
      if (notificationIndex === -1) {
        return rejectWithValue('Notification not found');
      }
      
      // Mark as read
      currentNotifications[notificationIndex] = {
        ...currentNotifications[notificationIndex],
        read: true,
      };
      
      // Store updated notifications
      await AsyncStorage.setItem('notifications', JSON.stringify(currentNotifications));
      
      return notificationId;
    } catch (error) {
      return rejectWithValue('Failed to mark notification as read');
    }
  }
);

export const markAllAsRead = createAsyncThunk(
  'notifications/markAllAsRead',
  async (_, { getState, rejectWithValue }) => {
    try {
      // In a real app, this would be an API call
      const state = getState() as RootState;
      const token = state.auth.token;
      
      if (!token) {
        return rejectWithValue('Authentication required');
      }
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Get current notifications and mark all as read
      const currentNotifications = state.notifications.notifications.map(notification => ({
        ...notification,
        read: true,
      }));
      
      // Store updated notifications
      await AsyncStorage.setItem('notifications', JSON.stringify(currentNotifications));
      
      return true;
    } catch (error) {
      return rejectWithValue('Failed to mark all notifications as read');
    }
  }
);

export const deleteNotification = createAsyncThunk(
  'notifications/delete',
  async (notificationId: string, { getState, rejectWithValue }) => {
    try {
      // In a real app, this would be an API call
      const state = getState() as RootState;
      const token = state.auth.token;
      
      if (!token) {
        return rejectWithValue('Authentication required');
      }
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Get current notifications
      const currentNotifications = state.notifications.notifications.filter(
        n => n.id !== notificationId
      );
      
      // Store updated notifications
      await AsyncStorage.setItem('notifications', JSON.stringify(currentNotifications));
      
      return notificationId;
    } catch (error) {
      return rejectWithValue('Failed to delete notification');
    }
  }
);

export const addNotification = createAsyncThunk(
  'notifications/add',
  async (
    notification: Omit<Notification, 'id' | 'read' | 'createdAt'>,
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
      
      // Create new notification
      const newNotification: Notification = {
        ...notification,
        id: Date.now().toString(),
        read: false,
        createdAt: new Date().toISOString(),
      };
      
      // Get current notifications and add the new one
      const currentNotifications = [
        newNotification,
        ...state.notifications.notifications,
      ];
      
      // Store updated notifications
      await AsyncStorage.setItem('notifications', JSON.stringify(currentNotifications));
      
      return newNotification;
    } catch (error) {
      return rejectWithValue('Failed to add notification');
    }
  }
);

// Create slice
const notificationsSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch notifications
    builder
      .addCase(fetchNotifications.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchNotifications.fulfilled, (state, action: PayloadAction<Notification[]>) => {
        state.loading = false;
        state.notifications = action.payload;
        state.unreadCount = action.payload.filter(n => !n.read).length;
      })
      .addCase(fetchNotifications.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
    
    // Mark as read
    builder
      .addCase(markAsRead.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(markAsRead.fulfilled, (state, action: PayloadAction<string>) => {
        state.loading = false;
        const index = state.notifications.findIndex(n => n.id === action.payload);
        if (index !== -1 && !state.notifications[index].read) {
          state.notifications[index].read = true;
          state.unreadCount -= 1;
        }
      })
      .addCase(markAsRead.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
    
    // Mark all as read
    builder
      .addCase(markAllAsRead.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(markAllAsRead.fulfilled, (state) => {
        state.loading = false;
        state.notifications = state.notifications.map(notification => ({
          ...notification,
          read: true,
        }));
        state.unreadCount = 0;
      })
      .addCase(markAllAsRead.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
    
    // Delete notification
    builder
      .addCase(deleteNotification.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteNotification.fulfilled, (state, action: PayloadAction<string>) => {
        state.loading = false;
        const notification = state.notifications.find(n => n.id === action.payload);
        state.notifications = state.notifications.filter(n => n.id !== action.payload);
        if (notification && !notification.read) {
          state.unreadCount -= 1;
        }
      })
      .addCase(deleteNotification.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
    
    // Add notification
    builder
      .addCase(addNotification.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addNotification.fulfilled, (state, action: PayloadAction<Notification>) => {
        state.loading = false;
        state.notifications.unshift(action.payload);
        state.unreadCount += 1;
      })
      .addCase(addNotification.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError } = notificationsSlice.actions;
export default notificationsSlice.reducer;