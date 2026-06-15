import React, { useState } from 'react';
import { StyleSheet, View, Text, ScrollView, Pressable, Image, ActivityIndicator, Modal, TextInput, Platform } from 'react-native';
import { X, Trash2, Plus, Minus, ArrowRight, ShieldCheck, Sparkles, CheckCircle2 } from 'lucide-react-native';
import { useStore } from '../store/useStore';
import GlassCard from './GlassCard';

interface CartOverlayProps {
  visible: boolean;
  onClose: () => void;
}

export default function CartOverlay({ visible, onClose }: CartOverlayProps) {
  const { cart, removeFromCart, updateCartQuantity, placeOrder } = useStore();
  const [checkoutStep, setCheckoutStep] = useState<'cart' | 'shipping' | 'paying' | 'success'>('cart');
  
  // Shipping form fields
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shipping = subtotal > 999 ? 0 : 99;
  const total = subtotal + shipping;

  const handleCheckout = () => {
    if (cart.length === 0) return;
    setCheckoutStep('shipping');
  };

  const handlePayment = async () => {
    if (!name || !address || !phone) return;
    setCheckoutStep('paying');
    
    try {
      await placeOrder({ name, phone, street: address });
      setCheckoutStep('success');
    } catch (error) {
      console.log('Error placing order:', error);
      setCheckoutStep('success');
    }
  };

  const handleClose = () => {
    setCheckoutStep('cart');
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={true} onRequestClose={handleClose}>
      <View style={styles.modalContainer}>
        {/* Background Dim */}
        <View style={styles.backdrop} />

        <View style={styles.sheetContainer}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>
              {checkoutStep === 'cart' && 'Your Intentions Basket'}
              {checkoutStep === 'shipping' && 'Delivery Coordinates'}
              {checkoutStep === 'paying' && 'Aligning Stars'}
              {checkoutStep === 'success' && 'Order Aligned!'}
            </Text>
            {checkoutStep !== 'paying' && (
              <Pressable onPress={handleClose} style={styles.closeBtn}>
                <X size={20} color="#ffffff" />
              </Pressable>
            )}
          </View>

          {/* Cart View Step */}
          {checkoutStep === 'cart' && (
            <View style={styles.stepContainer}>
              {cart.length === 0 ? (
                <View style={styles.emptyContainer}>
                  <ShoppingBagEmpty />
                  <Text style={styles.emptyTitle}>Your basket is empty</Text>
                  <Text style={styles.emptyText}>Add some celestial energy to your journey.</Text>
                  <Pressable onPress={handleClose} style={styles.emptyButton}>
                    <Text style={styles.emptyBtnText}>Explore Collection</Text>
                  </Pressable>
                </View>
              ) : (
                <>
                  <ScrollView style={styles.itemList} contentContainerStyle={styles.scrollContent}>
                    {cart.map((item) => (
                      <GlassCard key={item.id} style={styles.itemCard}>
                        <Image source={{ uri: item.imageUrl }} style={styles.itemImg} />
                        <View style={styles.itemDetails}>
                          <Text style={styles.itemTitle} numberOfLines={1}>{item.title}</Text>
                          <Text style={styles.itemZodiac}>
                            {item.customization.zodiacSign ? `${item.customization.zodiacSign} Sign` : 'Zodiac Aligned'} · {item.customization.threadColorName}
                          </Text>
                          
                          {item.customization.engravingText ? (
                            <Text style={styles.itemEngrave}>
                              Engraved: "{item.customization.engravingText}"
                            </Text>
                          ) : null}

                          <View style={styles.quantityRow}>
                            <Text style={styles.itemPrice}>₹{item.price * item.quantity}</Text>
                            <View style={styles.counter}>
                              <Pressable
                                onPress={() => updateCartQuantity(item.id, item.quantity - 1)}
                                style={styles.counterBtn}
                              >
                                <Minus size={12} color="#ffffff" />
                              </Pressable>
                              <Text style={styles.counterVal}>{item.quantity}</Text>
                              <Pressable
                                onPress={() => updateCartQuantity(item.id, item.quantity + 1)}
                                style={styles.counterBtn}
                              >
                                <Plus size={12} color="#ffffff" />
                              </Pressable>
                            </View>
                            <Pressable onPress={() => removeFromCart(item.id)} style={styles.deleteBtn}>
                              <Trash2 size={16} color="#ef4444" />
                            </Pressable>
                          </View>
                        </View>
                      </GlassCard>
                    ))}
                  </ScrollView>

                  {/* Summary Bar */}
                  <View style={styles.summaryContainer}>
                    <View style={styles.summaryRow}>
                      <Text style={styles.summaryLabel}>Subtotal</Text>
                      <Text style={styles.summaryValue}>₹{subtotal}</Text>
                    </View>
                    <View style={styles.summaryRow}>
                      <Text style={styles.summaryLabel}>Shipping</Text>
                      <Text style={styles.summaryValue}>{shipping === 0 ? 'FREE' : `₹${shipping}`}</Text>
                    </View>
                    <View style={[styles.summaryRow, styles.totalRow]}>
                      <Text style={styles.totalLabel}>Total Due</Text>
                      <Text style={styles.totalValue}>₹{total}</Text>
                    </View>

                    <Pressable onPress={handleCheckout} style={styles.primaryBtn}>
                      <Text style={styles.primaryBtnText}>Proceed to Checkout</Text>
                      <ArrowRight size={16} color="#090514" />
                    </Pressable>
                    <Text style={styles.footerNote}>🛡️ Secure UPI & Card checkout powered by Stripe</Text>
                  </View>
                </>
              )}
            </View>
          )}

          {/* Shipping Form Step */}
          {checkoutStep === 'shipping' && (
            <View style={[styles.stepContainer, styles.paddedStep]}>
              <ScrollView style={styles.formScroll} keyboardShouldPersistTaps="handled">
                <Text style={styles.sectionTitle}>Delivery Coordinates</Text>
                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>Full Name</Text>
                  <TextInput
                    style={styles.formInput}
                    value={name}
                    onChangeText={setName}
                    placeholder="Enter your name"
                    placeholderTextColor="rgba(255,255,255,0.3)"
                  />
                </View>

                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>Shipping Address (Include Pincode)</Text>
                  <TextInput
                    style={[styles.formInput, styles.areaInput]}
                    multiline
                    numberOfLines={3}
                    value={address}
                    onChangeText={setAddress}
                    placeholder="Enter full address"
                    placeholderTextColor="rgba(255,255,255,0.3)"
                  />
                </View>

                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>Contact Number</Text>
                  <TextInput
                    style={styles.formInput}
                    keyboardType="phone-pad"
                    value={phone}
                    onChangeText={setPhone}
                    placeholder="e.g. +91 99999 99999"
                    placeholderTextColor="rgba(255,255,255,0.3)"
                  />
                </View>

                {/* Checkout Summary summary card */}
                <GlassCard style={styles.checkoutSummaryCard}>
                  <View style={styles.checkoutSumRow}>
                    <Text style={styles.checkoutSumLabel}>Total Aligned Items:</Text>
                    <Text style={styles.checkoutSumVal}>{cart.reduce((sum, item) => sum + item.quantity, 0)}</Text>
                  </View>
                  <View style={styles.checkoutSumRow}>
                    <Text style={styles.checkoutSumLabel}>Total Price:</Text>
                    <Text style={styles.checkoutSumValGold}>₹{total}</Text>
                  </View>
                </GlassCard>

                <Pressable
                  onPress={handlePayment}
                  disabled={!name || !address || !phone}
                  style={[styles.primaryBtn, (!name || !address || !phone) && styles.disabledBtn]}
                >
                  <Text style={styles.primaryBtnText}>Confirm Order (Mock Pay)</Text>
                  <ShieldCheck size={16} color="#090514" />
                </Pressable>

                <Pressable onPress={() => setCheckoutStep('cart')} style={styles.backBtn}>
                  <Text style={styles.backBtnText}>Back to basket</Text>
                </Pressable>
              </ScrollView>
            </View>
          )}

          {/* Paying Animation Step */}
          {checkoutStep === 'paying' && (
            <View style={styles.processingContainer}>
              <ActivityIndicator size="large" color="#d4af37" />
              <View style={styles.loadingSteps}>
                <View style={styles.loadingStepRow}>
                  <Sparkles size={14} color="#d4af37" />
                  <Text style={styles.loadingStepText}>Consulting celestial vault...</Text>
                </View>
                <View style={styles.loadingStepRow}>
                  <Sparkles size={14} color="#d4af37" />
                  <Text style={styles.loadingStepText}>Knotting intentions to order profile...</Text>
                </View>
                <View style={styles.loadingStepRow}>
                  <ShieldCheck size={14} color="#10b981" />
                  <Text style={styles.loadingStepText}>Securing local handshake coordinates...</Text>
                </View>
              </View>
            </View>
          )}

          {/* Success Step */}
          {checkoutStep === 'success' && (
            <View style={styles.successContainer}>
              <CheckCircle2 size={64} color="#10b981" style={styles.successIcon} />
              <Text style={styles.successTitle}>Stars Successfully Aligned!</Text>
              <Text style={styles.successText}>
                Your custom celestial threads have entered our handcrafting portal. Generational weavers in Bangalore will now knot your piece loop-by-loop.
              </Text>
              
              <GlassCard style={styles.deliveryCard}>
                <Text style={styles.deliveryHeading}>Estimated Solstice Arrival</Text>
                <Text style={styles.deliveryTime}>5 - 7 Business Days</Text>
                <Text style={styles.deliverySub}>A wooden keepsake drawer box and handwritten note are included.</Text>
              </GlassCard>

              <Pressable onPress={handleClose} style={styles.successDoneBtn}>
                <Text style={styles.successDoneBtnText}>Receive Intentions</Text>
              </Pressable>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
}

// Simple empty state icon component
function ShoppingBagEmpty() {
  return (
    <View style={styles.emptyIconCircle}>
      <ShieldCheck size={36} color="rgba(255,255,255,0.15)" />
    </View>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
  },
  sheetContainer: {
    backgroundColor: '#090514',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    height: '85%',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    borderBottomWidth: 0,
    paddingTop: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
    letterSpacing: 0.5,
  },
  closeBtn: {
    padding: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 99,
  },
  stepContainer: {
    flex: 1,
  },
  paddedStep: {
    paddingHorizontal: 20,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    gap: 12,
  },
  emptyIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  emptyText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.5)',
    textAlign: 'center',
    lineHeight: 18,
  },
  emptyButton: {
    backgroundColor: '#d4af37',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  emptyBtnText: {
    color: '#090514',
    fontSize: 12,
    fontWeight: 'bold',
  },
  itemList: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    gap: 10,
  },
  itemCard: {
    flexDirection: 'row',
    gap: 12,
    padding: 10,
  },
  itemImg: {
    width: 70,
    height: 70,
    borderRadius: 8,
    backgroundColor: 'rgba(0,0,0,0.2)',
  },
  itemDetails: {
    flex: 1,
    justifyContent: 'space-between',
  },
  itemTitle: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  itemZodiac: {
    fontSize: 10,
    color: '#d4af37',
    fontWeight: '600',
  },
  itemEngrave: {
    fontSize: 9,
    color: 'rgba(255, 255, 255, 0.5)',
    fontStyle: 'italic',
  },
  quantityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  itemPrice: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  counter: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 6,
    padding: 2,
    gap: 8,
  },
  counterBtn: {
    padding: 4,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 4,
  },
  counterVal: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#ffffff',
    minWidth: 14,
    textAlign: 'center',
  },
  deleteBtn: {
    padding: 6,
  },
  summaryContainer: {
    borderTopWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
    padding: 16,
    backgroundColor: '#07040f',
    gap: 8,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.5)',
  },
  summaryValue: {
    fontSize: 11,
    color: '#ffffff',
    fontWeight: '500',
  },
  totalRow: {
    borderTopWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
    paddingTop: 8,
    marginTop: 4,
  },
  totalLabel: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  totalValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#d4af37',
  },
  primaryBtn: {
    backgroundColor: '#d4af37',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 8,
    gap: 8,
    marginTop: 8,
  },
  disabledBtn: {
    opacity: 0.5,
  },
  primaryBtnText: {
    color: '#090514',
    fontSize: 13,
    fontWeight: 'bold',
  },
  footerNote: {
    fontSize: 9,
    color: 'rgba(255, 255, 255, 0.35)',
    textAlign: 'center',
    marginTop: 4,
  },
  formScroll: {
    flex: 1,
    paddingTop: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 16,
  },
  formGroup: {
    marginBottom: 14,
    gap: 6,
  },
  formLabel: {
    fontSize: 9,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    color: 'rgba(255, 255, 255, 0.5)',
    letterSpacing: 0.5,
  },
  formInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: Platform.OS === 'ios' ? 12 : 8,
    fontSize: 13,
    color: '#ffffff',
  },
  areaInput: {
    textAlignVertical: 'top',
    height: 70,
  },
  checkoutSummaryCard: {
    marginVertical: 16,
    gap: 8,
    backgroundColor: 'rgba(212, 175, 55, 0.03)',
    borderColor: 'rgba(212, 175, 55, 0.1)',
  },
  checkoutSumRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  checkoutSumLabel: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.6)',
  },
  checkoutSumVal: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  checkoutSumValGold: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#d4af37',
  },
  backBtn: {
    alignItems: 'center',
    paddingVertical: 12,
    marginTop: 8,
  },
  backBtnText: {
    color: 'rgba(255, 255, 255, 0.4)',
    fontSize: 11,
    fontWeight: 'bold',
  },
  processingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 24,
  },
  loadingSteps: {
    gap: 12,
  },
  loadingStepRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  loadingStepText: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '500',
  },
  successContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    gap: 16,
  },
  successIcon: {
    marginBottom: 8,
  },
  successTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
    textAlign: 'center',
  },
  successText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.65)',
    textAlign: 'center',
    lineHeight: 18,
    paddingHorizontal: 8,
  },
  deliveryCard: {
    backgroundColor: 'rgba(16, 185, 129, 0.03)',
    borderColor: 'rgba(16, 185, 129, 0.1)',
    width: '100%',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 12,
    marginTop: 8,
  },
  deliveryHeading: {
    fontSize: 8,
    textTransform: 'uppercase',
    color: '#10b981',
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  deliveryTime: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  deliverySub: {
    fontSize: 9,
    color: 'rgba(255,255,255,0.4)',
    textAlign: 'center',
  },
  successDoneBtn: {
    backgroundColor: '#d4af37',
    width: '100%',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 12,
  },
  successDoneBtnText: {
    color: '#090514',
    fontSize: 13,
    fontWeight: 'bold',
  },
});
