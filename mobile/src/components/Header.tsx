import React from 'react';
import { StyleSheet, View, Text, Pressable } from 'react-native';
import { Sparkles, ShoppingBag } from 'lucide-react-native';
import { useStore } from '../store/useStore';

interface HeaderProps {
  onCartPress?: () => void;
  showCart?: boolean;
}

export default function Header({ onCartPress, showCart = true }: HeaderProps) {
  const cart = useStore((state) => state.cart);
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <View style={styles.container}>
      <View style={styles.logoRow}>
        <Sparkles size={16} color="#d4af37" style={styles.logoIcon} />
        <Text style={styles.logoText}>CHOCHETE</Text>
      </View>
      
      {showCart && (
        <Pressable onPress={onCartPress} style={styles.cartButton}>
          <ShoppingBag size={20} color="#ffffff" />
          {cartCount > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{cartCount}</Text>
            </View>
          )}
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 60,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
    backgroundColor: 'rgba(4, 2, 10, 0.5)',
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  logoIcon: {
    transform: [{ rotate: '15deg' }],
  },
  logoText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
    letterSpacing: 2,
  },
  cartButton: {
    position: 'relative',
    padding: 6,
  },
  badge: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: '#d4af37',
    borderRadius: 9,
    width: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    color: '#090514',
    fontSize: 9,
    fontWeight: 'bold',
  },
});
