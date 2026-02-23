import { useEffect } from 'react';
import * as Location from 'expo-location';
import { supabase } from '@/lib/supabase';

export const useLocationOnStart = () => {
  useEffect(() => {
    const saveLocationOnStart = async () => {
      try {
        // 1️⃣ Request foreground location permission
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          console.log('Location permission denied');
          return;
        }

        // 2️⃣ Get current location
        const loc = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.High,
        });
        const newLocation = {
          latitude: loc.coords.latitude,
          longitude: loc.coords.longitude,
        };
        console.log('Fetched location:', newLocation);

        // 3️⃣ Get logged-in user
        const { data: sessionData } = await supabase.auth.getSession();
        const user = sessionData?.session?.user;
        if (!user) {
          console.log('No logged-in user');
          return;
        }

        // 4️⃣ Check if profile row exists
        const { data: profile, error: selectError } = await supabase
          .from('profiles')
          .select('location')
          .eq('id', user.id)
          .maybeSingle();

        if (selectError) {
          console.log('Error fetching profile:', selectError.message);
          return;
        }

        // 5️⃣ Insert if profile does not exist
        if (!profile) {
          const { data: insertData, error: insertError } = await supabase
            .from('profiles')
            .insert({
              id: user.id,
              location: newLocation,
            });

          if (insertError) console.log('Insert error:', insertError.message);
          else console.log('Profile created with location:', insertData);
        } else {
          // 6️⃣ Update location (har dafa)
          const { data: updateData, error: updateError } = await supabase
            .from('profiles')
            .update({ location: newLocation })
            .eq('id', user.id);

          if (updateError) console.log('Update error:', updateError.message);
          else console.log('Profile location updated:', updateData);
        }
      } catch (err: any) {
        console.log('Location hook error:', err.message || err);
      }
    };

    saveLocationOnStart();
  }, []);
};
