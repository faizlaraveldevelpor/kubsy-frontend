import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  FlatList,
  Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/theme/color';
import { Fonts } from '@/theme/fonts';

const countries = [
  {
    id: '1',
    name: 'Pakistan',
    code: '+92',
    flag: 'https://flagcdn.com/w320/pk.png',
  },
  {
    id: '2',
    name: 'United States',
    code: '+1',
    flag: 'https://flagcdn.com/w320/us.png',
  },
  {
    id: '3',
    name: 'United Kingdom',
    code: '+44',
    flag: 'https://flagcdn.com/w320/gb.png',
  },
  {
    id: '4',
    name: 'India',
    code: '+91',
    flag: 'https://flagcdn.com/w320/in.png',
  },
  {
    id: '5',
    name: 'Canada',
    code: '+1',
    flag: 'https://flagcdn.com/w320/ca.png',
  },
];

const Selectlocation = () => {
  const router = useRouter();
  const [selected, setSelected] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  const filteredCountries = countries.filter(item =>
    item.name.toLowerCase().includes(search.toLowerCase())
  );

  const renderItem = ({ item }: any) => (
    <TouchableOpacity
      style={styles.countryRow}
      onPress={() => setSelected(item.id)}
    >
      <Image source={{ uri: item.flag }} style={styles.flag} />

      <View style={styles.countryInfo}>
        <Text style={styles.countryName}>{item.name}</Text>
        <Text style={styles.countryCode}>{item.code}</Text>
      </View>

      <View style={styles.radioOuter}>
        {selected === item.id && <View style={styles.radioInner} />}
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>

      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={26} color={Colors.white} />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Select Your Location</Text>
      </View>

      {/* SEARCH */}
      <View style={styles.searchBox}>
        <Ionicons name="search" size={18} color={Colors.white} />
        <TextInput
          placeholder="Search country"
          style={styles.input}
          value={search}
          onChangeText={setSearch}
          placeholderTextColor={Colors.black}
          
        />
      </View>

      {/* COUNTRY LIST */}
      <FlatList
        data={filteredCountries}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        contentContainerStyle={{ paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}
      />

      {/* CONTINUE BUTTON */}
      <View style={styles.bottom}>
        <TouchableOpacity
          style={[
            styles.continueBtn,
            { opacity: selected ? 1 : 0.5 },
          ]}
          disabled={!selected} onPress={()=>router.back()}
        >
          <Text style={styles.continueText}>Continue</Text>
        </TouchableOpacity>
      </View>

    </View>
  );
};

export default Selectlocation;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    paddingHorizontal: 16,
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 50,
    marginBottom: 20,
  },
  backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(0,0,0,0.25)', alignItems: 'center', justifyContent: 'center' },

  headerTitle: {
    fontSize: 20,
    // fontWeight: '600',
    color:Colors.black,
    fontFamily:Fonts.bold
  },

  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.black,
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 46,
    marginBottom: 15,
  },

  input: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
    color:Colors.black,
    fontFamily:Fonts.bold

  },

  countryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },

  flag: {
    width: 36,
    height: 24,
    borderRadius: 4,
  },

  countryInfo: {
    flex: 1,
    marginLeft: 12,
    
  },

  countryName: {
    fontSize: 16,
    // fontWeight: '500',
    color:Colors.black,
    fontFamily:Fonts.medium

  },

  countryCode: {
    fontSize: 14,
    color: '#666',
    fontFamily:Fonts.regular

  },

  radioOuter: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },

  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.primary,
  },

  bottom: {
    position: 'absolute',
    bottom: 20,
    left: 16,
    right: 16,
  },

  continueBtn: {
    backgroundColor: Colors.primary,
    height: 52,
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
  },

  continueText: {
    color: Colors.white,
    fontSize: 16,
    fontFamily:Fonts.bold
  },
});
