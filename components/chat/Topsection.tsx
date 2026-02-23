import React from 'react';
import { View, StyleSheet, TextInput, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaTop } from '@/hooks/useSafeAreaTop';
import { Colors } from '@/theme/color';
import { Fonts } from '@/theme/fonts';

type TopsectionProps = {
  searchQuery: string;
  onSearchChange: (q: string) => void;
};

const Topsection = ({ searchQuery, onSearchChange }: TopsectionProps) => {
  const safeTop = useSafeAreaTop();

  return (
    <View style={[styles.container, { paddingTop: safeTop + 8 }]}>
      <View style={styles.titleRow}>
        <Text style={styles.title}>Chats</Text>
      </View>

      <View style={styles.searchRow}>
        <Ionicons name="search" size={18} color={Colors.lightPink + '80'} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search conversations…"
          placeholderTextColor={Colors.lightPink + '50'}
          value={searchQuery}
          onChangeText={onSearchChange}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => onSearchChange('')} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Ionicons name="close-circle" size={18} color={Colors.lightPink + '60'} />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.background,
    paddingHorizontal: 18,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  title: {
    fontSize: 26,
    fontFamily: Fonts.bold,
    color: Colors.white,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.darkPlum,
    borderRadius: 14,
    paddingHorizontal: 14,
    height: 44,
    gap: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: Colors.white,
    fontFamily: Fonts.regular,
    paddingVertical: 0,
  },
});

export default Topsection;
