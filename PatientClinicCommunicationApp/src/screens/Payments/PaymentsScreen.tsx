import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
  RefreshControl,
  Alert,
} from 'react-native';
import {
  Text,
  Card,
  Button,
  Divider,
  Chip,
  Modal,
  Portal,
  TextInput,
  IconButton,
  useTheme,
  ActivityIndicator,
  Menu,
  List,
} from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { WebView } from 'react-native-webview';

import { RootState, AppDispatch } from '../../store';
import { executeSql } from '../../database/database';

// Define payment type
interface Payment {
  id: string;
  amount: number;
  currency: string;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  payment_method?: string;
  transaction_id?: string;
  invoice_url?: string;
  date: string;
  description: string;
  type: 'appointment' | 'consultation' | 'medication' | 'lab_test' | 'other';
  related_entity_id?: string; // ID of appointment, medical record, etc.
}

const PaymentsScreen: React.FC = () => {
  const theme = useTheme();
  const navigation = useNavigation();
  const dispatch = useDispatch<AppDispatch>();
  
  // State for payments
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [filteredPayments, setFilteredPayments] = useState<Payment[]>([]);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  
  // State for filters
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  // State for payment modal
  const [paymentModalVisible, setPaymentModalVisible] = useState(false);
  const [invoiceModalVisible, setInvoiceModalVisible] = useState(false);
  const [paymentMethodMenuVisible, setPaymentMethodMenuVisible] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string | null>(null);
  
  // Filter options
  const filters = ['All', 'Pending', 'Completed', 'Failed', 'Refunded'];
  const paymentMethods = ['Credit Card', 'Debit Card', 'PayPal', 'Bank Transfer', 'Insurance'];
  
  useEffect(() => {
    loadPayments();
  }, []);
  
  useEffect(() => {
    filterPayments();
  }, [activeFilter, searchQuery, payments]);
  
  const loadPayments = async () => {
    try {
      setLoading(true);
      
      // In a real app, this would fetch from the database
      // For now, we'll use sample data
      const samplePayments: Payment[] = [
        {
          id: '1',
          amount: 150.00,
          currency: 'USD',
          status: 'completed',
          payment_method: 'Credit Card',
          transaction_id: 'txn_123456789',
          invoice_url: 'https://example.com/invoices/123456.pdf',
          date: '2023-10-15',
          description: 'Cardiology Consultation',
          type: 'consultation',
          related_entity_id: '1', // Appointment ID
        },
        {
          id: '2',
          amount: 75.50,
          currency: 'USD',
          status: 'pending',
          date: '2023-10-20',
          description: 'Blood Test',
          type: 'lab_test',
          related_entity_id: '2', // Medical Record ID
        },
        {
          id: '3',
          amount: 200.00,
          currency: 'USD',
          status: 'completed',
          payment_method: 'Insurance',
          transaction_id: 'txn_987654321',
          invoice_url: 'https://example.com/invoices/987654.pdf',
          date: '2023-09-30',
          description: 'X-Ray Imaging',
          type: 'other',
          related_entity_id: '3', // Medical Record ID
        },
        {
          id: '4',
          amount: 50.00,
          currency: 'USD',
          status: 'failed',
          payment_method: 'PayPal',
          date: '2023-10-05',
          description: 'Prescription Medication',
          type: 'medication',
        },
        {
          id: '5',
          amount: 120.00,
          currency: 'USD',
          status: 'refunded',
          payment_method: 'Credit Card',
          transaction_id: 'txn_567891234',
          invoice_url: 'https://example.com/invoices/567891.pdf',
          date: '2023-09-15',
          description: 'Dermatology Appointment',
          type: 'appointment',
          related_entity_id: '5', // Appointment ID
        },
      ];
      
      setPayments(samplePayments);
      setFilteredPayments(samplePayments);
      setLoading(false);
    } catch (error) {
      console.error('Error loading payments:', error);
      setLoading(false);
      Alert.alert('Error', 'Failed to load payments. Please try again later.');
    }
  };
  
  const filterPayments = () => {
    let filtered = [...payments];
    
    // Apply status filter
    if (activeFilter && activeFilter !== 'All') {
      const status = activeFilter.toLowerCase() as Payment['status'];
      filtered = filtered.filter(payment => payment.status === status);
    }
    
    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        payment =>
          payment.description.toLowerCase().includes(query) ||
          payment.payment_method?.toLowerCase().includes(query) ||
          payment.transaction_id?.toLowerCase().includes(query)
      );
    }
    
    setFilteredPayments(filtered);
  };
  
  const onRefresh = async () => {
    setRefreshing(true);
    await loadPayments();
    setRefreshing(false);
  };
  
  const handlePayment = (payment: Payment) => {
    setSelectedPayment(payment);
    setPaymentModalVisible(true);
  };
  
  const processPayment = async () => {
    if (!selectedPayment || !selectedPaymentMethod) {
      Alert.alert('Error', 'Please select a payment method.');
      return;
    }
    
    try {
      // In a real app, this would process the payment through a payment gateway
      // For now, we'll simulate a successful payment
      
      // Update the payment in the state
      const updatedPayments = payments.map(p => {
        if (p.id === selectedPayment.id) {
          return {
            ...p,
            status: 'completed' as const,
            payment_method: selectedPaymentMethod,
            transaction_id: `txn_${Math.floor(Math.random() * 1000000000)}`,
            invoice_url: `https://example.com/invoices/${Math.floor(Math.random() * 1000000)}.pdf`,
          };
        }
        return p;
      });
      
      setPayments(updatedPayments);
      setFilteredPayments(updatedPayments);
      setPaymentModalVisible(false);
      
      // Show success message
      Alert.alert('Success', 'Payment processed successfully!');
      
      // Reset selected payment method
      setSelectedPaymentMethod(null);
    } catch (error) {
      console.error('Error processing payment:', error);
      Alert.alert('Error', 'Failed to process payment. Please try again later.');
    }
  };
  
  const viewInvoice = (payment: Payment) => {
    if (!payment.invoice_url) {
      Alert.alert('Error', 'No invoice available for this payment.');
      return;
    }
    
    setSelectedPayment(payment);
    setInvoiceModalVisible(true);
  };
  
  const downloadInvoice = (payment: Payment) => {
    if (!payment.invoice_url) {
      Alert.alert('Error', 'No invoice available for this payment.');
      return;
    }
    
    // In a real app, this would download the invoice
    Alert.alert('Success', 'Invoice downloaded successfully!');
  };
  
  const renderPaymentItem = ({ item }: { item: Payment }) => {
    const statusColors = {
      pending: theme.colors.warning,
      completed: theme.colors.success,
      failed: theme.colors.error,
      refunded: theme.colors.info,
    };
    
    return (
      <Card style={styles.card}>
        <Card.Content>
          <View style={styles.paymentHeader}>
            <View>
              <Text style={styles.paymentDescription}>{item.description}</Text>
              <Text style={styles.paymentDate}>{new Date(item.date).toLocaleDateString()}</Text>
            </View>
            <Chip
              mode="outlined"
              textStyle={{ color: statusColors[item.status] }}
              style={{ borderColor: statusColors[item.status] }}
            >
              {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
            </Chip>
          </View>
          
          <Divider style={styles.divider} />
          
          <View style={styles.paymentDetails}>
            <View style={styles.paymentDetail}>
              <Text style={styles.paymentDetailLabel}>Amount:</Text>
              <Text style={styles.paymentDetailValue}>
                {item.currency} {item.amount.toFixed(2)}
              </Text>
            </View>
            
            {item.payment_method && (
              <View style={styles.paymentDetail}>
                <Text style={styles.paymentDetailLabel}>Method:</Text>
                <Text style={styles.paymentDetailValue}>{item.payment_method}</Text>
              </View>
            )}
            
            {item.transaction_id && (
              <View style={styles.paymentDetail}>
                <Text style={styles.paymentDetailLabel}>Transaction ID:</Text>
                <Text style={styles.paymentDetailValue}>{item.transaction_id}</Text>
              </View>
            )}
          </View>
          
          <View style={styles.paymentActions}>
            {item.status === 'pending' && (
              <Button
                mode="contained"
                onPress={() => handlePayment(item)}
                style={styles.paymentButton}
              >
                Pay Now
              </Button>
            )}
            
            {item.status === 'completed' && item.invoice_url && (
              <View style={styles.invoiceButtons}>
                <Button
                  mode="outlined"
                  onPress={() => viewInvoice(item)}
                  style={styles.invoiceButton}
                  icon="file-document-outline"
                >
                  View Invoice
                </Button>
                
                <Button
                  mode="outlined"
                  onPress={() => downloadInvoice(item)}
                  style={styles.invoiceButton}
                  icon="download"
                >
                  Download
                </Button>
              </View>
            )}
          </View>
        </Card.Content>
      </Card>
    );
  };
  
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TextInput
          placeholder="Search payments..."
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
      
      <View style={styles.filtersContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {filters.map((filter, index) => (
            <Chip
              key={index}
              selected={activeFilter === filter}
              onPress={() => setActiveFilter(activeFilter === filter ? null : filter)}
              style={styles.filterChip}
              mode="outlined"
            >
              {filter}
            </Chip>
          ))}
        </ScrollView>
      </View>
      
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={styles.loadingText}>Loading payments...</Text>
        </View>
      ) : (
        <FlatList
          data={filteredPayments}
          renderItem={renderPaymentItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <MaterialCommunityIcons
                name="cash-remove"
                size={64}
                color={theme.colors.disabled}
              />
              <Text style={styles.emptyText}>No payments found</Text>
              <Text style={styles.emptySubtext}>
                {activeFilter || searchQuery
                  ? 'Try changing your filters or search query'
                  : 'Your payment history will appear here'}
              </Text>
            </View>
          }
        />
      )}
      
      {/* Payment Modal */}
      <Portal>
        <Modal
          visible={paymentModalVisible}
          onDismiss={() => setPaymentModalVisible(false)}
          contentContainerStyle={styles.modalContainer}
        >
          <Text style={styles.modalTitle}>Process Payment</Text>
          
          {selectedPayment && (
            <>
              <View style={styles.paymentSummary}>
                <Text style={styles.paymentSummaryLabel}>Description:</Text>
                <Text style={styles.paymentSummaryValue}>{selectedPayment.description}</Text>
              </View>
              
              <View style={styles.paymentSummary}>
                <Text style={styles.paymentSummaryLabel}>Amount:</Text>
                <Text style={styles.paymentSummaryValue}>
                  {selectedPayment.currency} {selectedPayment.amount.toFixed(2)}
                </Text>
              </View>
              
              <Divider style={styles.divider} />
              
              <Text style={styles.paymentMethodLabel}>Select Payment Method:</Text>
              
              <Menu
                visible={paymentMethodMenuVisible}
                onDismiss={() => setPaymentMethodMenuVisible(false)}
                anchor={
                  <Button
                    mode="outlined"
                    onPress={() => setPaymentMethodMenuVisible(true)}
                    style={styles.paymentMethodButton}
                    icon="credit-card"
                  >
                    {selectedPaymentMethod || 'Select Payment Method'}
                  </Button>
                }
              >
                {paymentMethods.map((method, index) => (
                  <Menu.Item
                    key={index}
                    onPress={() => {
                      setSelectedPaymentMethod(method);
                      setPaymentMethodMenuVisible(false);
                    }}
                    title={method}
                  />
                ))}
              </Menu>
              
              <View style={styles.modalActions}>
                <Button
                  mode="outlined"
                  onPress={() => setPaymentModalVisible(false)}
                  style={styles.modalButton}
                >
                  Cancel
                </Button>
                
                <Button
                  mode="contained"
                  onPress={processPayment}
                  style={styles.modalButton}
                  disabled={!selectedPaymentMethod}
                >
                  Pay Now
                </Button>
              </View>
            </>
          )}
        </Modal>
      </Portal>
      
      {/* Invoice Modal */}
      <Portal>
        <Modal
          visible={invoiceModalVisible}
          onDismiss={() => setInvoiceModalVisible(false)}
          contentContainerStyle={styles.invoiceModalContainer}
        >
          <View style={styles.invoiceModalHeader}>
            <Text style={styles.modalTitle}>Invoice</Text>
            <IconButton
              icon="close"
              size={24}
              onPress={() => setInvoiceModalVisible(false)}
            />
          </View>
          
          {selectedPayment && selectedPayment.invoice_url && (
            <WebView
              source={{ uri: selectedPayment.invoice_url }}
              style={styles.webView}
              startInLoadingState
              renderLoading={() => (
                <View style={styles.webViewLoading}>
                  <ActivityIndicator size="large" color={theme.colors.primary} />
                </View>
              )}
            />
          )}
          
          <Button
            mode="contained"
            onPress={() => selectedPayment && downloadInvoice(selectedPayment)}
            style={styles.downloadButton}
            icon="download"
          >
            Download Invoice
          </Button>
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
  header: {
    padding: 16,
    backgroundColor: 'white',
  },
  searchInput: {
    backgroundColor: 'white',
  },
  filtersContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  filterChip: {
    marginRight: 8,
  },
  listContent: {
    padding: 16,
  },
  card: {
    marginBottom: 16,
    borderRadius: 8,
  },
  paymentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  paymentDescription: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  paymentDate: {
    fontSize: 14,
    color: '#666',
  },
  divider: {
    marginVertical: 12,
  },
  paymentDetails: {
    marginBottom: 12,
  },
  paymentDetail: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  paymentDetailLabel: {
    fontSize: 14,
    color: '#666',
    width: 100,
  },
  paymentDetailValue: {
    fontSize: 14,
    flex: 1,
  },
  paymentActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  paymentButton: {
    marginLeft: 8,
  },
  invoiceButtons: {
    flexDirection: 'row',
  },
  invoiceButton: {
    marginLeft: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginTop: 8,
  },
  modalContainer: {
    backgroundColor: 'white',
    padding: 20,
    margin: 20,
    borderRadius: 8,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  paymentSummary: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  paymentSummaryLabel: {
    fontSize: 16,
    color: '#666',
    width: 100,
  },
  paymentSummaryValue: {
    fontSize: 16,
    flex: 1,
  },
  paymentMethodLabel: {
    fontSize: 16,
    marginTop: 8,
    marginBottom: 8,
  },
  paymentMethodButton: {
    marginBottom: 16,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 16,
  },
  modalButton: {
    marginLeft: 8,
  },
  invoiceModalContainer: {
    backgroundColor: 'white',
    margin: 20,
    borderRadius: 8,
    height: '80%',
  },
  invoiceModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  webView: {
    flex: 1,
  },
  webViewLoading: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  downloadButton: {
    margin: 16,
  },
});

export default PaymentsScreen;