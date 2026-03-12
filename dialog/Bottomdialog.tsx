import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  Animated,
  TouchableOpacity,
  Dimensions,
  Pressable,
  PanResponder,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import MultiSlider from '@ptomasroos/react-native-multi-slider';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '@/theme/color';
import { Fonts } from '@/theme/fonts';
import { useDispatch, useSelector } from 'react-redux';
import { agefilter, intrestsfilter, distancefilterfnc, genderfilterfnc } from '@/store/profileSlice';

const { height, width } = Dimensions.get('window');
const SLIDER_LENGTH = width - 80;

// Wahi interests jo Intrestes.tsx (signup) mein hain – filter ke liye
const INTERESTS = [
  { label: 'Music', icon: 'musical-notes-outline' },
  { label: 'Sports', icon: 'football-outline' },
  { label: 'Travel', icon: 'airplane-outline' },
  { label: 'Food', icon: 'restaurant-outline' },
  { label: 'Movies', icon: 'film-outline' },
  { label: 'Fitness', icon: 'barbell-outline' },
  { label: 'Books', icon: 'book-outline' },
  { label: 'Photography', icon: 'camera-outline' },
  { label: 'Gaming', icon: 'game-controller-outline' },
  { label: 'Art', icon: 'color-palette-outline' },
  { label: 'Technology', icon: 'laptop-outline' },
  { label: 'Fashion', icon: 'shirt-outline' },
];

export default function BottomFilterDialog({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const translateY = useRef(new Animated.Value(height)).current;
  const dispatch = useDispatch();

  const reduxInterests = useSelector((state: any) => state?.profileSlice?.intrestesfilter);
  const reduxAge = useSelector((state: any) => state?.profileSlice?.agefilter);
  const reduxDistance = useSelector((state: any) => state?.profileSlice?.distancefilter);
  const reduxGender = useSelector((state: any) => state?.profileSlice?.genderfilter);

  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [ageRange, setAgeRange] = useState<number[]>([18, 40]);
  const [distanceRange, setDistanceRange] = useState<number[]>([5, 50]);
  const [gender, setGender] = useState('');

  useEffect(() => {
    if (visible) {
      setSelectedInterests(Array.isArray(reduxInterests) && reduxInterests.length > 0 ? reduxInterests : []);
      setAgeRange(Array.isArray(reduxAge) && reduxAge.length >= 2 ? reduxAge : [18, 40]);
      setDistanceRange(Array.isArray(reduxDistance) && reduxDistance.length >= 2 ? reduxDistance : [5, 50]);
      setGender(reduxGender && String(reduxGender).trim() ? String(reduxGender) : '');
      Animated.timing(translateY, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [visible, reduxInterests, reduxAge, reduxDistance, reduxGender]);

  const closeModal = () => {
    Animated.timing(translateY, {
      toValue: height,
      duration: 200,
      useNativeDriver: true,
    }).start(() => onClose());
  };

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, g) => g.dy > 10,
      onPanResponderMove: (_, g) => {
        if (g.dy > 0) translateY.setValue(g.dy);
      },
      onPanResponderRelease: (_, g) => {
        if (g.dy > 120) closeModal();
        else {
          Animated.spring(translateY, {
            toValue: 0,
            stiffness: 150,
            damping: 20,
            useNativeDriver: true,
          }).start();
        }
      },
    })
  ).current;

  const toggleInterest = (label: string) => {
    setSelectedInterests((prev) =>
      prev.includes(label) ? prev.filter((i) => i !== label) : [...prev, label]
    );
  };

  const handleApply = () => {
    dispatch(intrestsfilter(selectedInterests));
    dispatch(agefilter(ageRange));
    dispatch(distancefilterfnc(distanceRange));
    dispatch(genderfilterfnc(gender));
    closeModal();
  };

  const handleReset = () => {
    setSelectedInterests([]);
    setAgeRange([18, 40]);
    setDistanceRange([5, 50]);
    setGender('');
    dispatch(intrestsfilter([]));
    dispatch(agefilter([18, 40]));
    dispatch(distancefilterfnc([5, 50]));
    dispatch(genderfilterfnc(''));
  };

  const hasActiveFilters =
    selectedInterests.length > 0 ||
    ageRange[0] !== 18 || ageRange[1] !== 40 ||
    distanceRange[0] !== 5 || distanceRange[1] !== 50 ||
    gender !== '';

  if (!visible) return null;

  return (
    <Modal transparent animationType="none" visible={visible}>
      <Pressable style={styles.overlay} onPress={closeModal} />
      <Animated.View
        {...panResponder.panHandlers}
        style={[styles.sheet, { transform: [{ translateY }] }]}
      >
        {/* Handle */}
        <View style={styles.handleBar} />

        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={closeModal} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <Ionicons name="close" size={24} color={Colors.lightPink} />
          </TouchableOpacity>
          <Text style={styles.title}>Filters</Text>
          {hasActiveFilters ? (
            <TouchableOpacity onPress={handleReset} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <Text style={styles.resetLink}>Reset</Text>
            </TouchableOpacity>
          ) : (
            <View style={{ width: 45 }} />
          )}
        </View>

        {/* Divider */}
        <View style={styles.divider} />

        <ScrollView showsVerticalScrollIndicator={false} bounces={false}>
          {/* Show Me (Gender) */}
          <Text style={styles.sectionLabel}>Show Me</Text>
          <View style={styles.genderRow}>
            {(['Male', 'Female', 'Other'] as const).map((g) => {
              const active = gender === g;
              const icon = g === 'Male' ? 'male' : g === 'Female' ? 'female' : 'transgender';
              return (
                <TouchableOpacity
                  key={g}
                  style={[styles.genderBtn, active && styles.genderBtnActive]}
                  onPress={() => setGender(gender === g ? '' : g)}
                  activeOpacity={0.85}
                >
                  <Ionicons
                    name={icon}
                    size={16}
                    color={active ? '#fff' : Colors.lightPink + '70'}
                    style={{ marginRight: 6 }}
                  />
                  <Text style={[styles.genderText, active && styles.genderTextActive]}>
                    {g}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Interests */}
          <Text style={styles.sectionLabel}>Interests</Text>
          <View style={styles.chipsRow}>
            {INTERESTS.map((item) => {
              const active = selectedInterests.includes(item.label);
              return (
                <TouchableOpacity
                  key={item.label}
                  style={[styles.chip, active && styles.chipActive]}
                  onPress={() => toggleInterest(item.label)}
                  activeOpacity={0.8}
                >
                  <Ionicons
                    name={item.icon as any}
                    size={16}
                    color={active ? '#fff' : Colors.lightPink}
                  />
                  <Text style={[styles.chipText, active && styles.chipTextActive]}>
                    {item.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Age Range */}
          <View style={styles.ageHeader}>
            <Text style={styles.sectionLabel}>Age Range</Text>
            <View style={styles.ageBadge}>
              <Text style={styles.ageBadgeText}>{ageRange[0]} – {ageRange[1]}</Text>
            </View>
          </View>

          <View style={styles.sliderWrap}>
            <MultiSlider
              values={ageRange}
              sliderLength={SLIDER_LENGTH}
              onValuesChange={(vals) => setAgeRange(vals)}
              min={18}
              max={60}
              step={1}
              selectedStyle={styles.sliderTrackActive}
              unselectedStyle={styles.sliderTrackInactive}
              markerStyle={styles.sliderThumb}
            />
            <View style={styles.sliderLabels}>
              <Text style={styles.sliderLabelText}>18</Text>
              <Text style={styles.sliderLabelText}>60</Text>
            </View>
          </View>

          {/* Distance */}
          <View style={styles.distanceHeader}>
            <Text style={styles.sectionLabel}>Distance</Text>
            <View style={styles.ageBadge}>
              <Text style={styles.ageBadgeText}>{distanceRange[0]} – {distanceRange[1]} km</Text>
            </View>
          </View>

          <View style={styles.sliderWrap}>
            <MultiSlider
              values={distanceRange}
              sliderLength={SLIDER_LENGTH}
              onValuesChange={(vals) => setDistanceRange(vals)}
              min={1}
              max={200}
              step={1}
              selectedStyle={styles.sliderTrackActive}
              unselectedStyle={styles.sliderTrackInactive}
              markerStyle={styles.sliderThumb}
            />
            <View style={styles.sliderLabels}>
              <Text style={styles.sliderLabelText}>1 km</Text>
              <Text style={styles.sliderLabelText}>200 km</Text>
            </View>
          </View>
        </ScrollView>

        {/* Footer */}
        <View style={styles.footer}>
          <TouchableOpacity activeOpacity={0.9} onPress={handleApply}>
            <LinearGradient
              colors={[Colors.primary, Colors.secondary]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.applyBtn}
            >
              <Text style={styles.applyText}>Apply Filters</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
  },
  sheet: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    maxHeight: height * 0.85,
    backgroundColor: Colors.background,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 24,
    paddingBottom: 36,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
  },

  /* Handle */
  handleBar: {
    width: 36,
    height: 4,
    backgroundColor: Colors.lightPink + '30',
    alignSelf: 'center',
    borderRadius: 2,
    marginTop: 12,
    marginBottom: 16,
  },

  /* Header */
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    fontSize: 20,
    fontFamily: Fonts.bold,
    color: Colors.white,
  },
  resetLink: {
    fontSize: 14,
    fontFamily: Fonts.bold,
    color: Colors.primary,
  },

  /* Divider */
  divider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.06)',
    marginVertical: 18,
  },

  /* Section label */
  sectionLabel: {
    fontSize: 16,
    fontFamily: Fonts.bold,
    color: Colors.white,
    marginBottom: 12,
  },

  /* Gender */
  genderRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 28,
  },
  genderBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 13,
    borderRadius: 14,
    backgroundColor: Colors.darkPlum,
  },
  genderBtnActive: {
    backgroundColor: Colors.primary,
  },
  genderText: {
    fontSize: 14,
    fontFamily: Fonts.medium,
    color: Colors.lightPink + '70',
  },
  genderTextActive: {
    color: '#fff',
    fontFamily: Fonts.bold,
  },

  /* Chips */
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 28,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 22,
    backgroundColor: Colors.darkPlum,
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  chipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  chipText: {
    fontSize: 14,
    fontFamily: Fonts.medium,
    color: Colors.lightPink,
  },
  chipTextActive: {
    color: '#fff',
  },

  /* Age */
  ageHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  ageBadge: {
    backgroundColor: Colors.primary + '20',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 10,
  },
  ageBadgeText: {
    fontSize: 13,
    fontFamily: Fonts.bold,
    color: Colors.primary,
  },

  /* Distance */
  distanceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
    marginTop: 28,
  },

  /* Slider */
  sliderWrap: {
    alignItems: 'center',
    marginTop: 10,
    overflow: 'visible',
  },
  sliderTrackActive: {
    backgroundColor: Colors.primary,
    height: 4,
    borderRadius: 2,
  },
  sliderTrackInactive: {
    backgroundColor: Colors.darkPlum,
    height: 4,
    borderRadius: 2,
  },
  sliderThumb: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#fff',
    borderWidth: 3,
    borderColor: Colors.primary,
    elevation: 3,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  sliderLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: SLIDER_LENGTH,
    paddingHorizontal: 4,
    marginTop: 6,
  },
  sliderLabelText: {
    fontSize: 12,
    fontFamily: Fonts.regular,
    color: Colors.lightPink + '50',
  },

  /* Footer */
  footer: {
    marginTop: 24,
  },
  applyBtn: {
    height: 54,
    borderRadius: 27,
    alignItems: 'center',
    justifyContent: 'center',
  },
  applyText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: Fonts.bold,
  },
});
