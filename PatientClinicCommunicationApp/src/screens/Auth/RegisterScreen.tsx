import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { TextInput, Button, Text, HelperText, Checkbox } from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import { StackNavigationProp } from '@react-navigation/stack';
import { AuthStackParamList } from '../../navigation/AuthNavigator';
import { register, clearError } from '../../store/slices/authSlice';
import { RootState, AppDispatch } from '../../store';
import { theme } from '../../theme';

type RegisterScreenNavigationProp = StackNavigationProp<AuthStackParamList, 'Register'>;

interface RegisterScreenProps {
  navigation: RegisterScreenNavigationProp;
}

const RegisterScreen: React.FC<RegisterScreenProps> = ({ navigation }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [nameError, setNameError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');
  const [secureTextEntry, setSecureTextEntry] = useState(true);
  const [secureConfirmTextEntry, setSecureConfirmTextEntry] = useState(true);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [termsError, setTermsError] = useState('');

  const dispatch = useDispatch<AppDispatch>();
  const { loading, error } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    // Clear any previous errors when component mounts
    dispatch(clearError());
  }, [dispatch]);

  const validateName = (name: string): boolean => {
    if (!name) {
      setNameError('Name is required');
      return false;
    } else if (name.length < 2) {
      setNameError('Name must be at least 2 characters');
      return false;
    }
    setNameError('');
    return true;
  };

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

  const validatePassword = (password: string): boolean => {
    if (!password) {
      setPasswordError('Password is required');
      return false;
    } else if (password.length < 6) {
      setPasswordError('Password must be at least 6 characters');
      return false;
    }
    setPasswordError('');
    return true;
  };

  const validateConfirmPassword = (confirmPassword: string): boolean => {
    if (!confirmPassword) {
      setConfirmPasswordError('Please confirm your password');
      return false;
    } else if (confirmPassword !== password) {
      setConfirmPasswordError('Passwords do not match');
      return false;
    }
    setConfirmPasswordError('');
    return true;
  };

  const validateTerms = (): boolean => {
    if (!termsAccepted) {
      setTermsError('You must accept the terms and conditions');
      return false;
    }
    setTermsError('');
    return true;
  };

  const handleRegister = async () => {
    const isNameValid = validateName(name);
    const isEmailValid = validateEmail(email);
    const isPasswordValid = validatePassword(password);
    const isConfirmPasswordValid = validateConfirmPassword(confirmPassword);
    const areTermsAccepted = validateTerms();

    if (isNameValid && isEmailValid && isPasswordValid && isConfirmPasswordValid && areTermsAccepted) {
      try {
        await dispatch(register({ name, email, password })).unwrap();
        // Registration successful, navigation will be handled by AppNavigator
      } catch (err) {
        // Error is already handled in the slice
        console.error('Registration failed:', err);
      }
    }
  };

  const toggleSecureTextEntry = () => {
    setSecureTextEntry(!secureTextEntry);
  };

  const toggleSecureConfirmTextEntry = () => {
    setSecureConfirmTextEntry(!secureConfirmTextEntry);
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
        <View style={styles.formContainer}>
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>Sign up to get started with the app</Text>

          {error && <HelperText type="error" visible={!!error}>{error}</HelperText>}

          <TextInput
            label="Full Name"
            value={name}
            onChangeText={setName}
            mode="outlined"
            style={styles.input}
            error={!!nameError}
            left={<TextInput.Icon icon="account" />}
          />
          {nameError ? <HelperText type="error" visible={!!nameError}>{nameError}</HelperText> : null}

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

          <TextInput
            label="Password"
            value={password}
            onChangeText={setPassword}
            mode="outlined"
            secureTextEntry={secureTextEntry}
            style={styles.input}
            error={!!passwordError}
            left={<TextInput.Icon icon="lock" />}
            right={
              <TextInput.Icon
                icon={secureTextEntry ? 'eye' : 'eye-off'}
                onPress={toggleSecureTextEntry}
              />
            }
          />
          {passwordError ? <HelperText type="error" visible={!!passwordError}>{passwordError}</HelperText> : null}

          <TextInput
            label="Confirm Password"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            mode="outlined"
            secureTextEntry={secureConfirmTextEntry}
            style={styles.input}
            error={!!confirmPasswordError}
            left={<TextInput.Icon icon="lock-check" />}
            right={
              <TextInput.Icon
                icon={secureConfirmTextEntry ? 'eye' : 'eye-off'}
                onPress={toggleSecureConfirmTextEntry}
              />
            }
          />
          {confirmPasswordError ? <HelperText type="error" visible={!!confirmPasswordError}>{confirmPasswordError}</HelperText> : null}

          <View style={styles.termsContainer}>
            <Checkbox
              status={termsAccepted ? 'checked' : 'unchecked'}
              onPress={() => setTermsAccepted(!termsAccepted)}
              color={theme.colors.primary}
            />
            <View style={styles.termsTextContainer}>
              <Text style={styles.termsText}>
                I agree to the{' '}
                <Text style={styles.termsLink} onPress={() => {}}>
                  Terms of Service
                </Text>{' '}
                and{' '}
                <Text style={styles.termsLink} onPress={() => {}}>
                  Privacy Policy
                </Text>
              </Text>
            </View>
          </View>
          {termsError ? <HelperText type="error" visible={!!termsError}>{termsError}</HelperText> : null}

          <Button
            mode="contained"
            onPress={handleRegister}
            style={styles.button}
            loading={loading}
            disabled={loading}
          >
            Create Account
          </Button>

          <View style={styles.loginContainer}>
            <Text style={styles.loginText}>Already have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
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
    justifyContent: 'center',
  },
  formContainer: {
    width: '100%',
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
  termsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 10,
  },
  termsTextContainer: {
    flex: 1,
    marginLeft: 10,
  },
  termsText: {
    fontSize: 14,
    color: theme.colors.onSurface,
  },
  termsLink: {
    color: theme.colors.primary,
    fontWeight: 'bold',
  },
  button: {
    marginTop: 10,
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
});

export default RegisterScreen;