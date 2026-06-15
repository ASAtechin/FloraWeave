export function getCelestialBody(slug: string) {
  const s = (slug || '').toLowerCase();
  if (s.includes('sun') || s.includes('helios') || s.includes('aura') || s === 'aura-alignment-thread-bracelet') {
    return { name: 'Helios (The Sun)', icon: '☀️', color: '#FBBF24', description: 'Vitality & Aura core energy alignment' };
  }
  if (s.includes('moon') || s.includes('luna') || s.includes('constellation') || s === 'celestial-constellation-drop-earrings') {
    return { name: 'Luna (The Moon)', icon: '🌙', color: '#E2E8F0', description: 'Quartz crystal intuition and lunar tides reflection' };
  }
  if (s.includes('venus') || s.includes('ishtar') || s.includes('silk') || s === 'zodiac-silk-cord-anklet') {
    return { name: 'Venus (Ishtar)', icon: '🪐', color: '#F472B6', description: 'Beauty, grace, and freshwater pearl sync' };
  }
  if (s.includes('nebula') || s.includes('galaxy') || s.includes('keepsake') || s === 'zodiac-birth-flower-keepsake-gift-set') {
    return { name: 'Nebula Andromeda', icon: '🌌', color: '#C084FC', description: 'All-inclusive cosmic flora-stellar matrices' };
  }
  if (s.includes('jupiter') || s.includes('guru') || s.includes('flower-anklet') || s === 'zodiac-flower-anklets') {
    return { name: 'Jupiter (Guru)', icon: '🪐', color: '#F59E0B', description: '12-Flower zodiac expansion and blessings' };
  }
  // Fallback
  return { name: 'Gaia (Earth Portal)', icon: '🌍', color: '#38BDF8', description: 'Grounding elemental coordinates' };
}
