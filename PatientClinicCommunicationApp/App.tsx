import React, { useEffect } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Provider as PaperProvider } from 'react-native-paper';
import { Provider as ReduxProvider } from 'react-redux';
import { NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import AppNavigator from './src/navigation/AppNavigator';
import { store } from './src/store';
import { theme } from './src/theme';
import { initDatabase } from './src/database/database';

const App = () => {
  useEffect(() => {
    // Initialize the database when the app starts
    initDatabase()
      .then(() => {
        console.log('Database initialized successfully');
      })
      .catch(error => {
        console.error('Failed to initialize database', error);
      });
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ReduxProvider store={store}>
        <PaperProvider theme={theme}>
          <SafeAreaProvider>
            <NavigationContainer>
              <StatusBar barStyle="dark-content" backgroundColor={theme.colors.background} />
              <AppNavigator />
            </NavigationContainer>
          </SafeAreaProvider>
        </PaperProvider>
      </ReduxProvider>
    </GestureHandlerRootView>
  );
};

export default App;