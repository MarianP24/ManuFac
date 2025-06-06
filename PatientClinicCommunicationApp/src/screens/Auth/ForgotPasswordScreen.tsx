import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { TextInput, Button, Text, HelperText, IconButton } from 'react-native-paper';
import { StackNavigationProp } from '@react-navigation/stack';
import { AuthStackParamList } from '../../navigation/AuthNavigator';
import { theme } from '../../theme';

type ForgotPasswordScreenNavigationProp = StackNavigationProp<AuthStackParamList, 'ForgotPassword'>;

interface ForgotPasswordScreenProps {
  navigation: ForgotPasswordScreenNavigationProp;
}

const ForgotPasswordScreen: React.FC<ForgotPasswordScreenProps> = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [loading, setLoading] = useState(false);
  const [resetSent, setResetSent] = useState(false);

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) {
      setEmailError('Email is required');
      return false;
    } else if (!emailRegex.test(email)) {
      setEmailError('Please enter a valid email address');
      return false;
    }
    setEmailError('');
    return true;
  };

  const handleResetPassword = async () => {
    const isEmailValid = validateEmail(email);

    if (isEmailValid) {
      setLoading(true);
      
      // In a real app, this would be an API call to send a password reset email
      // For now, we'll simulate a successful password reset request
      setTimeout(() => {
        setLoading(false);
        setResetSent(true);
      }, 1500);
    }
  };

  const handleBackToLogin = () => {
    navigation.navigate('Login');
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <IconButton
            icon="arrow-left"
            size={24}
            onPress={handleBackToLogin}
            style={styles.backButton}
          />
        </View>

        <View style={styles.formContainer}>
          {!resetSent ? (
            <>
              <Text style={styles.title}>Reset Password</Text>
              <Text style={styles.subtitle}>
                Enter your email address and we'll send you instructions to reset your password.
              </Text>

              <TextInput
                label="Email"
                value={email}
                onChangeText={setEmail}
                mode="outlined"
                keyboardType="email-address"
                autoCapitalize="none"
                style={styles.input}
                error={!!emailError}
                left={<TextInput.Icon icon="email" />}
              />
              {emailError ? <HelperText type="error" visible={!!emailError}>{emailError}</HelperText> : null}

              <Button
                mode="contained"
                onPress={handleResetPassword}
                style={styles.button}
                loading={loading}
                disabled={loading}
              >
                Send Reset Instructions
              </Button>
            </>
          ) : (
            <>
              <View style={styles.successContainer}>
                <IconButton
                  icon="check-circle"
                  size={80}
                  color={theme.colors.primary}
                  style={styles.successIcon}
                />
                <Text style={styles.title}>Check Your Email</Text>
                <Text style={styles.subtitle}>
                  We've sent password reset instructions to {email}. Please check your email inbox.
                </Text>
                <Button
                  mode="contained"
                  onPress={handleBackToLogin}
                  style={styles.button}
                >
                  Back to Login
                </Button>
              </View>
            </>
          )}

          <View style={styles.loginContainer}>
            <Text style={styles.loginText}>Remember your password? </Text>
            <TouchableOpacity onPress={handleBackToLogin}>
              <Text style={styles.loginLink}>Sign In</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  backButton: {
    marginLeft: -10,
  },
  formContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 10,
    color: theme.colors.onBackground,
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 20,
    color: theme.colors.onSurface,
    opacity: 0.7,
  },
  input: {
    marginBottom: 10,
  },
  button: {
    marginTop: 20,
    marginBottom: 20,
    paddingVertical: 8,
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 10,
  },
  loginText: {
    color: theme.colors.onSurface,
  },
  loginLink: {
    color: theme.colors.primary,
    fontWeight: 'bold',
  },
  successContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  successIcon: {
    marginBottom: 20,
  },
});

export default ForgotPasswordScreen;