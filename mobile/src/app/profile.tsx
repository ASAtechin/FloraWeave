import React, { useState } from 'react';
import { StyleSheet, View, Text, ScrollView, Pressable, Image, TextInput, Modal, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { 
  User, Sparkles, Heart, ClipboardList, Trash2, ShieldCheck, 
  ChevronRight, Calendar, Printer, UserCheck, AlertCircle, ArrowLeft, RefreshCw
} from 'lucide-react-native';
import CosmicBackground from '@/components/CosmicBackground';
import Header from '@/components/Header';
import GlassCard from '@/components/GlassCard';
import CartOverlay from '@/components/CartOverlay';
import ProductDetailsModal from '@/components/ProductDetailsModal';
import { useStore, SavedDesign, Order } from '@/store/useStore';
import { MOCK_PRODUCTS } from '@/lib/api';

// Astrological calculation helpers
function getZodiacSign(day: number, month: number): string {
  if ((month === 3 && day >= 21) || (month === 4 && day <= 19)) return 'Aries';
  if ((month === 4 && day >= 20) || (month === 5 && day <= 20)) return 'Taurus';
  if ((month === 5 && day >= 21) || (month === 6 && day <= 20)) return 'Gemini';
  if ((month === 6 && day >= 21) || (month === 7 && day <= 22)) return 'Cancer';
  if ((month === 7 && day >= 23) || (month === 8 && day <= 22)) return 'Leo';
  if ((month === 8 && day >= 23) || (month === 9 && day <= 22)) return 'Virgo';
  if ((month === 9 && day >= 23) || (month === 10 && day <= 22)) return 'Libra';
  if ((month === 10 && day >= 23) || (month === 11 && day <= 21)) return 'Scorpio';
  if ((month === 11 && day >= 22) || (month === 12 && day <= 21)) return 'Sagittarius';
  if ((month === 12 && day >= 22) || (month === 1 && day <= 19)) return 'Capricorn';
  if ((month === 1 && day >= 20) || (month === 2 && day <= 18)) return 'Aquarius';
  return 'Pisces';
}

interface ZodiacElement {
  name: string;
  color: string;
  bg: string;
  desc: string;
}

function getZodiacElement(sign: string): ZodiacElement {
  const lowercase = sign.toLowerCase();
  if (['aries', 'leo', 'sagittarius'].includes(lowercase)) {
    return { name: 'Fire', color: '#ff6b6b', bg: 'rgba(255, 107, 107, 0.15)', desc: 'Passionate, creative, and intuitive.' };
  }
  if (['taurus', 'virgo', 'capricorn'].includes(lowercase)) {
    return { name: 'Earth', color: '#51cf66', bg: 'rgba(81, 207, 102, 0.15)', desc: 'Grounded, practical, and dedicated.' };
  }
  if (['gemini', 'libra', 'aquarius'].includes(lowercase)) {
    return { name: 'Air', color: '#fcc419', bg: 'rgba(252, 196, 25, 0.15)', desc: 'Intellectual, social, and communicative.' };
  }
  return { name: 'Water', color: '#339af0', bg: 'rgba(51, 154, 240, 0.15)', desc: 'Deeply emotional, psychic, and artistic.' };
}

// Pre-defined list of artisans for allocation
const ARTISANS = [
  'Devendra Pratap (Celestial Weaves)',
  'Anya Sharma (Thread Alchemy)',
  'Priya Patel (Sacred Knots)',
  'Rahul Kumar (Orbits & Gems)'
];

export default function ProfileScreen() {
  const { 
    user, savedDesigns, orders, updateUser, 
    deleteSavedDesign, updateOrderStatus, allocateArtisan 
  } = useStore();

  const [cartVisible, setCartVisible] = useState(false);
  const [isAdminMode, setIsAdminMode] = useState(false);

  // Client Profile states
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(user.name);
  const [editDate, setEditDate] = useState(user.birthDate || '');
  const [calculatedZodiac, setCalculatedZodiac] = useState(user.zodiacSign || '');

  // Admin states
  const [selectedAdminOrder, setSelectedAdminOrder] = useState<Order | null>(null);
  const [isArtisanSelectorVisible, setIsArtisanSelectorVisible] = useState(false);

  // Saved Design modal
  const [inspectedDesign, setInspectedDesign] = useState<SavedDesign | null>(null);

  // Dynamic zodiac analysis based on birthdate
  const handleDateChange = (val: string) => {
    setEditDate(val);
    // Parse DD/MM/YYYY
    const parts = val.split('/');
    if (parts.length >= 2) {
      const d = parseInt(parts[0], 10);
      const m = parseInt(parts[1], 10);
      if (!isNaN(d) && !isNaN(m) && d > 0 && d <= 31 && m > 0 && m <= 12) {
        const sign = getZodiacSign(d, m);
        setCalculatedZodiac(sign);
      }
    }
  };

  const handleSaveProfile = () => {
    updateUser({
      name: editName,
      zodiacSign: calculatedZodiac || undefined,
      birthDate: editDate || undefined,
    });
    setIsEditing(false);
  };

  // Astrological computations
  const currentZodiac = user.zodiacSign || calculatedZodiac || 'Cancer';
  const zodiacElement = getZodiacElement(currentZodiac);

  // Admin order metrics
  const pendingOrders = orders.filter(o => o.status === 'PENDING').length;
  const inProductionOrders = orders.filter(o => o.status === 'HANDCRAFTING').length;
  const shippedOrders = orders.filter(o => o.status === 'SHIPPED' || o.status === 'DELIVERED').length;

  const handlePrintSlip = (orderId: string) => {
    Alert.alert(
      "🖨️ Printer Command",
      `Sending packaging slip for ${orderId} to thermal printer...`,
      [{ text: "OK", onPress: () => {} }]
    );
  };

  return (
    <CosmicBackground style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <Header onCartPress={() => setCartVisible(true)} />

        {/* Dynamic Mode Switch Header */}
        <View style={styles.modeToggleRow}>
          <Text style={styles.modeTitle}>
            {isAdminMode ? "🔮 CHOCHETE ADMIN PORTAL" : "✨ COSMIC SEEKER PORTAL"}
          </Text>
          <Pressable 
            style={[styles.modeToggleBtn, isAdminMode && styles.modeToggleBtnAdmin]}
            onPress={() => setIsAdminMode(!isAdminMode)}
          >
            {isAdminMode ? (
              <>
                <ArrowLeft size={14} color="#090514" />
                <Text style={styles.modeToggleTextAdmin}>Seeker Mode</Text>
              </>
            ) : (
              <>
                <ShieldCheck size={14} color="#d4af37" />
                <Text style={styles.modeToggleText}>Admin Dashboard</Text>
              </>
            )}
          </Pressable>
        </View>

        {!isAdminMode ? (
          /* ========================================================= */
          /* CLIENT PROFILE PORTAL                                     */
          /* ========================================================= */
          <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
            {/* 1. Astral Profile Card */}
            <GlassCard style={styles.profileCard}>
              <View style={styles.profileHeader}>
                <View style={[styles.avatarCircle, { borderColor: zodiacElement.color }]}>
                  <User size={24} color={zodiacElement.color} />
                </View>
                <View style={styles.profileMeta}>
                  <Text style={styles.profileName}>{user.name}</Text>
                  <View style={styles.badgeRow}>
                    <Text style={[styles.profileZodiac, { color: zodiacElement.color }]}>
                      {currentZodiac}
                    </Text>
                    <View style={[styles.elementChip, { backgroundColor: zodiacElement.bg }]}>
                      <Sparkles size={8} color={zodiacElement.color} style={{ marginRight: 4 }} />
                      <Text style={[styles.elementText, { color: zodiacElement.color }]}>
                        {zodiacElement.name}
                      </Text>
                    </View>
                  </View>
                  {user.birthDate && (
                    <Text style={styles.profileDate}>Alignment Coordinates: {user.birthDate}</Text>
                  )}
                </View>
                <Pressable
                  onPress={() => {
                    if (isEditing) {
                      handleSaveProfile();
                    } else {
                      setEditName(user.name);
                      setEditDate(user.birthDate || '');
                      setCalculatedZodiac(user.zodiacSign || '');
                      setIsEditing(true);
                    }
                  }}
                  style={[styles.editBtn, isEditing && styles.editBtnActive]}
                >
                  <Text style={styles.editBtnText}>{isEditing ? 'Save' : 'Edit Alignment'}</Text>
                </Pressable>
              </View>

              {isEditing ? (
                <View style={styles.editForm}>
                  <View style={styles.formGroup}>
                    <Text style={styles.formLabel}>Seeker Name</Text>
                    <TextInput
                      style={styles.formInput}
                      value={editName}
                      onChangeText={setEditName}
                      placeholder="Enter seeker name"
                      placeholderTextColor="rgba(255,255,255,0.3)"
                    />
                  </View>
                  <View style={styles.formRow}>
                    <View style={[styles.formGroup, { flex: 1 }]}>
                      <Text style={styles.formLabel}>Birth Date (DD/MM/YYYY)</Text>
                      <TextInput
                        style={styles.formInput}
                        value={editDate}
                        onChangeText={handleDateChange}
                        placeholder="e.g. 23/10/1995"
                        placeholderTextColor="rgba(255,255,255,0.3)"
                      />
                    </View>
                    <View style={[styles.formGroup, { flex: 1 }]}>
                      <Text style={styles.formLabel}>Calculated Zodiac</Text>
                      <View style={styles.calculatedZodiacBox}>
                        <Text style={styles.calculatedZodiacText}>
                          {calculatedZodiac || 'Auto-generated'}
                        </Text>
                      </View>
                    </View>
                  </View>
                </View>
              ) : (
                <View style={styles.astrologicalInsights}>
                  <Text style={styles.insightTitle}>🌌 Elemental Signature</Text>
                  <Text style={styles.insightDesc}>
                    Your element is <Text style={{ color: zodiacElement.color, fontWeight: 'bold' }}>{zodiacElement.name}</Text>. {zodiacElement.desc} This element guides your styling recommendations.
                  </Text>
                </View>
              )}
            </GlassCard>

            {/* 2. Saved Custom Designs */}
            <View style={styles.sectionHeader}>
              <Heart size={16} color="#d4af37" />
              <Text style={styles.sectionTitle}>Saved Intentions ({savedDesigns.length})</Text>
            </View>

            {savedDesigns.length === 0 ? (
              <GlassCard style={styles.emptyCard}>
                <Text style={styles.emptyText}>You haven't saved any custom configurations yet.</Text>
              </GlassCard>
            ) : (
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.savedScroll} contentContainerStyle={styles.savedScrollContent}>
                {savedDesigns.map((design) => (
                  <GlassCard key={design.id} style={styles.savedCard}>
                    <Image source={{ uri: design.imageUrl }} style={styles.savedImg} />
                    <Text style={styles.savedTitle} numberOfLines={1}>{design.productTitle}</Text>
                    <Text style={styles.savedDesc} numberOfLines={1}>
                      {design.customization.threadColorName} · {design.customization.metalFinish.split(' ')[0] || 'Cotton'}
                    </Text>
                    <View style={styles.savedActionRow}>
                      <Pressable onPress={() => deleteSavedDesign(design.id)} style={styles.trashBtn}>
                        <Trash2 size={12} color="#ff6b6b" />
                      </Pressable>
                      <Pressable onPress={() => setInspectedDesign(design)} style={styles.openDesignBtn}>
                        <Text style={styles.openDesignBtnText}>View</Text>
                      </Pressable>
                    </View>
                  </GlassCard>
                ))}
              </ScrollView>
            )}

            {/* 3. Order History */}
            <View style={styles.sectionHeader}>
              <ClipboardList size={16} color="#d4af37" />
              <Text style={styles.sectionTitle}>Order Portal Coordinates ({orders.length})</Text>
            </View>

            {orders.length === 0 ? (
              <GlassCard style={styles.emptyCard}>
                <Text style={styles.emptyText}>No active checkout sessions detected on the stars.</Text>
              </GlassCard>
            ) : (
              <View style={styles.ordersList}>
                {orders.map((order) => (
                  <GlassCard key={order.id} style={styles.orderCard}>
                    <View style={styles.orderHead}>
                      <Text style={styles.orderId}>{order.id}</Text>
                      <Text style={styles.orderDate}>{order.date}</Text>
                    </View>

                    <View style={styles.orderItems}>
                      {order.items.map((item, idx) => (
                        <Text key={idx} style={styles.orderItemText}>
                          • {item.quantity}x {item.title} ({item.customization.threadColorName || 'Standard'})
                        </Text>
                      ))}
                    </View>

                    {order.artisanName && (
                      <View style={styles.assignedArtisanRow}>
                        <UserCheck size={10} color="#d4af37" style={{ marginRight: 4 }} />
                        <Text style={styles.assignedArtisanText}>
                          Handcrafting by: {order.artisanName}
                        </Text>
                      </View>
                    )}

                    <View style={styles.orderFooter}>
                      <View style={[styles.statusBadge, 
                        order.status === 'PENDING' ? styles.statusPending : 
                        order.status === 'HANDCRAFTING' ? styles.statusCrafting : styles.statusShipped
                      ]}>
                        <Sparkles size={8} color="#ffffff" />
                        <Text style={styles.statusBadgeText}>{order.status}</Text>
                      </View>
                      <Text style={styles.orderTotal}>Total: ₹{order.total}</Text>
                    </View>
                  </GlassCard>
                ))}
              </View>
            )}

            <View style={styles.pad} />
          </ScrollView>
        ) : (
          /* ========================================================= */
          /* ADMIN ORDER MANAGEMENT DASHBOARD                         */
          /* ========================================================= */
          <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
            {/* KPI Metrics Cards */}
            <View style={styles.kpiRow}>
              <GlassCard style={StyleSheet.flatten([styles.kpiCard, { borderLeftColor: '#fcc419', borderLeftWidth: 4 }])}>
                <Text style={styles.kpiTitle}>PENDING</Text>
                <Text style={styles.kpiValue}>{pendingOrders}</Text>
              </GlassCard>
              <GlassCard style={StyleSheet.flatten([styles.kpiCard, { borderLeftColor: '#ff6b6b', borderLeftWidth: 4 }])}>
                <Text style={styles.kpiTitle}>CRAFTING</Text>
                <Text style={styles.kpiValue}>{inProductionOrders}</Text>
              </GlassCard>
              <GlassCard style={StyleSheet.flatten([styles.kpiCard, { borderLeftColor: '#339af0', borderLeftWidth: 4 }])}>
                <Text style={styles.kpiTitle}>COMPLETED</Text>
                <Text style={styles.kpiValue}>{shippedOrders}</Text>
              </GlassCard>
            </View>

            {/* Backlog Header */}
            <View style={styles.sectionHeader}>
              <ClipboardList size={16} color="#d4af37" />
              <Text style={styles.sectionTitle}>Order Backlog & Customizations</Text>
            </View>

            {orders.length === 0 ? (
              <GlassCard style={styles.emptyCard}>
                <Text style={styles.emptyText}>No orders currently in the backlog.</Text>
              </GlassCard>
            ) : (
              <View style={styles.adminOrderList}>
                {orders.map((order) => (
                  <GlassCard key={order.id} style={styles.adminOrderCard}>
                    <View style={styles.adminOrderHeader}>
                      <View>
                        <Text style={styles.adminOrderId}>{order.id}</Text>
                        <Text style={styles.adminOrderDate}>{order.date}</Text>
                      </View>
                      <View style={[styles.statusBadge, 
                        order.status === 'PENDING' ? styles.statusPending : 
                        order.status === 'HANDCRAFTING' ? styles.statusCrafting : styles.statusShipped
                      ]}>
                        <Text style={styles.statusBadgeText}>{order.status}</Text>
                      </View>
                    </View>

                    {/* Quick Customization Summary */}
                    <View style={styles.adminCustomizationSummary}>
                      {order.items.map((item, idx) => (
                        <View key={idx} style={styles.adminSummaryItem}>
                          <Text style={styles.adminItemTitle}>
                            {item.quantity}x {item.title}
                          </Text>
                          {item.customization.engravingText && (
                            <View style={styles.engravingHighlight}>
                              <Text style={styles.engravingHighlightText}>
                                ENGRAVE: "{item.customization.engravingText}"
                              </Text>
                            </View>
                          )}
                          <Text style={styles.adminItemSpecs}>
                            Thread: {item.customization.threadColorName || 'None'} · Size: {item.customization.size} · Charm: {item.customization.charm}
                          </Text>
                        </View>
                      ))}
                    </View>

                    {order.artisanName ? (
                      <View style={styles.artisanAssigned}>
                        <UserCheck size={12} color="#51cf66" style={{ marginRight: 6 }} />
                        <Text style={styles.artisanAssignedText}>
                          Allocated to: {order.artisanName}
                        </Text>
                      </View>
                    ) : (
                      <View style={styles.unallocatedAlert}>
                        <AlertCircle size={12} color="#fcc419" style={{ marginRight: 6 }} />
                        <Text style={styles.unallocatedText}>No artisan allocated yet</Text>
                      </View>
                    )}

                    {/* Actions Row */}
                    <View style={styles.adminActionRow}>
                      <Pressable 
                        style={styles.adminSecondaryBtn}
                        onPress={() => handlePrintSlip(order.id)}
                      >
                        <Printer size={12} color="#ffffff" style={{ marginRight: 6 }} />
                        <Text style={styles.adminSecondaryBtnText}>Print Slip</Text>
                      </Pressable>
                      <Pressable 
                        style={styles.adminPrimaryBtn}
                        onPress={() => setSelectedAdminOrder(order)}
                      >
                        <Text style={styles.adminPrimaryBtnText}>Manage Order</Text>
                        <ChevronRight size={12} color="#090514" />
                      </Pressable>
                    </View>
                  </GlassCard>
                ))}
              </View>
            )}

            <View style={styles.pad} />
          </ScrollView>
        )}

        {/* ========================================================= */}
        {/* ADMIN ORDER MANAGEMENT DIALOG / BOTTOM SHEET MODAL        */}
        {/* ========================================================= */}
        {selectedAdminOrder && (
          <Modal
            animationType="slide"
            transparent={true}
            visible={!!selectedAdminOrder}
            onRequestClose={() => setSelectedAdminOrder(null)}
          >
            <View style={styles.modalOverlay}>
              <View style={styles.modalContent}>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>Manage Order {selectedAdminOrder.id}</Text>
                  <Pressable 
                    onPress={() => {
                      setSelectedAdminOrder(null);
                      setIsArtisanSelectorVisible(false);
                    }}
                    style={styles.closeModalBtn}
                  >
                    <Text style={styles.closeModalBtnText}>✕</Text>
                  </Pressable>
                </View>

                <ScrollView style={styles.modalScroll}>
                  {/* Status Controller */}
                  <Text style={styles.modalSubheading}>Fulfillment Status</Text>
                  <View style={styles.statusTabRow}>
                    {['PENDING', 'HANDCRAFTING', 'SHIPPED', 'DELIVERED'].map((status) => (
                      <Pressable
                        key={status}
                        style={[
                          styles.statusTab,
                          selectedAdminOrder.status === status && styles.statusTabActive
                        ]}
                        onPress={() => {
                          updateOrderStatus(selectedAdminOrder.id, status);
                          setSelectedAdminOrder({ ...selectedAdminOrder, status });
                        }}
                      >
                        <Text style={[
                          styles.statusTabText,
                          selectedAdminOrder.status === status && styles.statusTabTextActive
                        ]}>
                          {status}
                        </Text>
                      </Pressable>
                    ))}
                  </View>

                  {/* Artisan Allocation */}
                  <Text style={[styles.modalSubheading, { marginTop: 20 }]}>Artisan Allocation</Text>
                  {selectedAdminOrder.artisanName ? (
                    <View style={styles.allocatedBox}>
                      <Text style={styles.allocatedBoxText}>
                        Current Artisan: {selectedAdminOrder.artisanName}
                      </Text>
                      <Pressable 
                        onPress={() => setIsArtisanSelectorVisible(true)}
                        style={styles.reallocateBtn}
                      >
                        <Text style={styles.reallocateBtnText}>Change</Text>
                      </Pressable>
                    </View>
                  ) : (
                    <Pressable 
                      style={styles.allocateTriggerBtn}
                      onPress={() => setIsArtisanSelectorVisible(true)}
                    >
                      <UserCheck size={16} color="#d4af37" style={{ marginRight: 8 }} />
                      <Text style={styles.allocateTriggerText}>Allocate Artisan</Text>
                    </Pressable>
                  )}

                  {isArtisanSelectorVisible && (
                    <View style={styles.artisanSelectorContainer}>
                      {ARTISANS.map((artisan) => (
                        <Pressable
                          key={artisan}
                          style={styles.artisanSelectOption}
                          onPress={() => {
                            allocateArtisan(selectedAdminOrder.id, artisan);
                            setSelectedAdminOrder({ ...selectedAdminOrder, artisanName: artisan });
                            setIsArtisanSelectorVisible(false);
                          }}
                        >
                          <Text style={styles.artisanSelectOptionText}>{artisan}</Text>
                        </Pressable>
                      ))}
                    </View>
                  )}

                  {/* Customization Details Table */}
                  <Text style={[styles.modalSubheading, { marginTop: 20 }]}>Custom Specifications</Text>
                  {selectedAdminOrder.items.map((item, index) => (
                    <View key={index} style={styles.specBox}>
                      <Text style={styles.specBoxTitle}>{item.title}</Text>
                      
                      {item.customization.engravingText ? (
                        <View style={styles.engraveSpec}>
                          <Text style={styles.engraveSpecLabel}>ENGRAVED TEXT (MONOSPACE CAPTURE):</Text>
                          <Text style={styles.engraveSpecValue}>
                            {item.customization.engravingText.toUpperCase()}
                          </Text>
                        </View>
                      ) : null}

                      <View style={styles.specTable}>
                        <View style={styles.specTableRow}>
                          <Text style={styles.specLabel}>Thread Color</Text>
                          <Text style={styles.specValue}>{item.customization.threadColorName || 'None'}</Text>
                        </View>
                        <View style={styles.specTableRow}>
                          <Text style={styles.specLabel}>Size Requirement</Text>
                          <Text style={styles.specValue}>{item.customization.size}</Text>
                        </View>
                        <View style={styles.specTableRow}>
                          <Text style={styles.specLabel}>Metal / Cord Style</Text>
                          <Text style={styles.specValue}>{item.customization.metalFinish}</Text>
                        </View>
                        <View style={styles.specTableRow}>
                          <Text style={styles.specLabel}>Astrological Charm</Text>
                          <Text style={styles.specValue}>{item.customization.charm}</Text>
                        </View>
                        <View style={styles.specTableRow}>
                          <Text style={styles.specLabel}>Packaging Box</Text>
                          <Text style={styles.specValue}>{item.customization.packaging}</Text>
                        </View>
                        {item.customization.giftNote ? (
                          <View style={[styles.specTableRow, { borderBottomWidth: 0 }]}>
                            <Text style={styles.specLabel}>Gift Note</Text>
                            <Text style={[styles.specValue, { fontStyle: 'italic' }]}>"{item.customization.giftNote}"</Text>
                          </View>
                        ) : null}
                      </View>
                    </View>
                  ))}
                </ScrollView>

                {/* Print slip inside dialog */}
                <Pressable
                  style={styles.modalPrintBtn}
                  onPress={() => handlePrintSlip(selectedAdminOrder.id)}
                >
                  <Printer size={16} color="#090514" style={{ marginRight: 8 }} />
                  <Text style={styles.modalPrintBtnText}>Send Pack Slip to Printer</Text>
                </Pressable>
              </View>
            </View>
          </Modal>
        )}

        {/* Product Details dialog modal (for saved designs view) */}
        {inspectedDesign && (
          <ProductDetailsModal
            visible={!!inspectedDesign}
            product={MOCK_PRODUCTS.find((p) => p.id === inspectedDesign.productId) || MOCK_PRODUCTS[0]}
            onClose={() => setInspectedDesign(null)}
          />
        )}

        <CartOverlay
          visible={cartVisible}
          onClose={() => setCartVisible(false)}
        />
      </SafeAreaView>
    </CosmicBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  modeToggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  modeTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#ffffff',
    letterSpacing: 0.5,
  },
  modeToggleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(212,175,55,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(212,175,55,0.25)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 99,
    gap: 6,
  },
  modeToggleBtnAdmin: {
    backgroundColor: '#d4af37',
    borderColor: '#d4af37',
  },
  modeToggleText: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#d4af37',
  },
  modeToggleTextAdmin: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#090514',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    gap: 14,
  },
  profileCard: {
    gap: 14,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatarCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255,255,255,0.02)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
  },
  profileMeta: {
    flex: 1,
    justifyContent: 'center',
  },
  profileName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
    gap: 6,
  },
  profileZodiac: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  elementChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  elementText: {
    fontSize: 8,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  profileDate: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.4)',
    marginTop: 2,
  },
  editBtn: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  editBtnActive: {
    backgroundColor: '#d4af37',
    borderColor: '#d4af37',
  },
  editBtnText: {
    color: '#ffffff',
    fontSize: 9,
    fontWeight: 'bold',
  },
  editForm: {
    borderTopWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    paddingTop: 12,
    gap: 10,
  },
  formRow: {
    flexDirection: 'row',
    gap: 8,
  },
  formGroup: {
    gap: 4,
  },
  formLabel: {
    fontSize: 8,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    color: 'rgba(255,255,255,0.4)',
  },
  formInput: {
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 12,
    color: '#ffffff',
  },
  calculatedZodiacBox: {
    backgroundColor: 'rgba(212,175,55,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(212,175,55,0.15)',
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 8,
    justifyContent: 'center',
    height: 38,
  },
  calculatedZodiacText: {
    color: '#d4af37',
    fontSize: 12,
    fontWeight: 'bold',
  },
  astrologicalInsights: {
    borderTopWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    paddingTop: 12,
  },
  insightTitle: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 4,
  },
  insightDesc: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.6)',
    lineHeight: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 10,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  emptyCard: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  emptyText: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.45)',
    textAlign: 'center',
  },
  savedScroll: {
    flexGrow: 0,
  },
  savedScrollContent: {
    gap: 10,
    paddingRight: 16,
  },
  savedCard: {
    width: 130,
    padding: 8,
    gap: 4,
  },
  savedImg: {
    width: '100%',
    height: 90,
    borderRadius: 8,
    backgroundColor: 'rgba(0,0,0,0.2)',
  },
  savedTitle: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  savedDesc: {
    fontSize: 9,
    color: '#d4af37',
    fontWeight: '500',
  },
  savedActionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 2,
  },
  trashBtn: {
    padding: 4,
    backgroundColor: 'rgba(255, 107, 107, 0.08)',
    borderRadius: 4,
  },
  openDesignBtn: {
    backgroundColor: '#d4af37',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  openDesignBtnText: {
    color: '#090514',
    fontSize: 9,
    fontWeight: 'bold',
  },
  ordersList: {
    gap: 10,
  },
  orderCard: {
    padding: 12,
    gap: 8,
  },
  orderHead: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    paddingBottom: 6,
  },
  orderId: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  orderDate: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.4)',
  },
  orderItems: {
    gap: 2,
  },
  orderItemText: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.7)',
  },
  assignedArtisanRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    backgroundColor: 'rgba(212,175,55,0.04)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  assignedArtisanText: {
    fontSize: 9,
    color: '#d4af37',
    fontWeight: '500',
  },
  orderFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    paddingTop: 6,
    marginTop: 2,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 99,
  },
  statusPending: {
    backgroundColor: '#fcc419',
  },
  statusCrafting: {
    backgroundColor: '#ff6b6b',
  },
  statusShipped: {
    backgroundColor: '#339af0',
  },
  statusBadgeText: {
    fontSize: 7,
    color: '#090514',
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  orderTotal: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  /* Admin Dashboard Elements */
  kpiRow: {
    flexDirection: 'row',
    gap: 10,
  },
  kpiCard: {
    flex: 1,
    padding: 10,
    gap: 4,
    alignItems: 'center',
  },
  kpiTitle: {
    fontSize: 8,
    fontWeight: 'bold',
    color: 'rgba(255,255,255,0.4)',
  },
  kpiValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  adminOrderList: {
    gap: 12,
  },
  adminOrderCard: {
    padding: 12,
    gap: 10,
  },
  adminOrderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    paddingBottom: 6,
  },
  adminOrderId: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  adminOrderDate: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.4)',
  },
  adminCustomizationSummary: {
    gap: 6,
  },
  adminSummaryItem: {
    gap: 3,
  },
  adminItemTitle: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  engravingHighlight: {
    backgroundColor: 'rgba(252, 196, 25, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(252, 196, 25, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
    alignSelf: 'flex-start',
  },
  engravingHighlightText: {
    fontFamily: 'monospace',
    fontSize: 9,
    fontWeight: 'bold',
    color: '#fcc419',
  },
  adminItemSpecs: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.5)',
  },
  artisanAssigned: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(81, 207, 102, 0.05)',
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 6,
  },
  artisanAssignedText: {
    fontSize: 10,
    color: '#51cf66',
    fontWeight: '500',
  },
  unallocatedAlert: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(252, 196, 25, 0.05)',
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 6,
  },
  unallocatedText: {
    fontSize: 10,
    color: '#fcc419',
    fontWeight: '500',
  },
  adminActionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
    gap: 8,
  },
  adminSecondaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  adminSecondaryBtnText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  adminPrimaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#d4af37',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    gap: 4,
  },
  adminPrimaryBtnText: {
    color: '#090514',
    fontSize: 10,
    fontWeight: 'bold',
  },
  /* Modal Styles */
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#0c0a09',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '85%',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    paddingBottom: 10,
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  closeModalBtn: {
    padding: 6,
  },
  closeModalBtnText: {
    color: '#ffffff',
    fontSize: 16,
  },
  modalScroll: {
    marginBottom: 16,
  },
  modalSubheading: {
    fontSize: 11,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    color: '#d4af37',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  statusTabRow: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 8,
    padding: 4,
    gap: 4,
  },
  statusTab: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 6,
  },
  statusTabActive: {
    backgroundColor: '#d4af37',
  },
  statusTabText: {
    fontSize: 8,
    fontWeight: 'bold',
    color: 'rgba(255,255,255,0.5)',
  },
  statusTabTextActive: {
    color: '#090514',
  },
  allocatedBox: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(81, 207, 102, 0.05)',
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(81, 207, 102, 0.15)',
  },
  allocatedBoxText: {
    fontSize: 11,
    color: '#51cf66',
    fontWeight: '500',
  },
  reallocateBtn: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  reallocateBtnText: {
    color: '#ffffff',
    fontSize: 9,
    fontWeight: 'bold',
  },
  allocateTriggerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(212,175,55,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(212,175,55,0.15)',
    paddingVertical: 10,
    borderRadius: 8,
  },
  allocateTriggerText: {
    color: '#d4af37',
    fontSize: 12,
    fontWeight: 'bold',
  },
  artisanSelectorContainer: {
    backgroundColor: 'rgba(255,255,255,0.02)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    borderRadius: 8,
    marginTop: 6,
    padding: 4,
  },
  artisanSelectOption: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderColor: 'rgba(255,255,255,0.03)',
  },
  artisanSelectOptionText: {
    fontSize: 11,
    color: '#ffffff',
  },
  specBox: {
    backgroundColor: 'rgba(255,255,255,0.02)',
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.04)',
  },
  specBoxTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 8,
  },
  engraveSpec: {
    backgroundColor: 'rgba(252, 196, 25, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(252, 196, 25, 0.15)',
    borderRadius: 6,
    padding: 8,
    marginBottom: 8,
  },
  engraveSpecLabel: {
    fontSize: 8,
    fontWeight: 'bold',
    color: 'rgba(252,196,25,0.6)',
    marginBottom: 2,
  },
  engraveSpecValue: {
    fontFamily: 'monospace',
    fontSize: 14,
    fontWeight: 'bold',
    color: '#fcc419',
    letterSpacing: 1.5,
  },
  specTable: {
    borderTopWidth: 1,
    borderColor: 'rgba(255,255,255,0.04)',
  },
  specTableRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderColor: 'rgba(255,255,255,0.04)',
  },
  specLabel: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.4)',
  },
  specValue: {
    fontSize: 10,
    color: '#ffffff',
    fontWeight: '500',
  },
  modalPrintBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#d4af37',
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 10,
  },
  modalPrintBtnText: {
    color: '#090514',
    fontSize: 12,
    fontWeight: 'bold',
  },
  pad: {
    height: 80,
  },
});
