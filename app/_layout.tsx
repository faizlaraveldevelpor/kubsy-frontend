import { LogBox } from 'react-native';
LogBox.ignoreLogs(['No task registered for key StripeKeepJsAwakeTask']);

const _warn = console.warn;
console.warn = (...args: any[]) => {
  if (typeof args[0] === 'string' && args[0].includes('StripeKeepJsAwakeTask')) return;
  _warn(...args);
};

import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Redirect, router, Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Provider } from 'react-redux';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/theme/color';
import { useFonts } from 'expo-font';
import SplashView from '@/components/SplashView';
// import {
//   Poppins_400Regular,
//   Poppins_500Medium,
//   Poppins_600SemiBold,
//   Poppins_700Bold,
// } from '@expo-google-fonts/poppins';

import { Roboto_700Bold,Roboto_400Regular,Roboto_500Medium,Roboto_600SemiBold, } from '@expo-google-fonts/roboto';
import { supabase } from '@/lib/supabase';
import { useEffect, useRef, useState } from 'react';
import { useLocationOnStart } from '@/hooks/Location';
import { store } from '@/store/Store';
import { StripeProvider } from '@stripe/stripe-react-native';
import { getPaymentConfigFromApi } from '@/lib/paymentConfig';
import { getMyProfile } from '@/services/Profile';
import { GetprofileApi } from '@/store/profileSlice';
import { usePushNotifications } from '@/hooks/usePushNotifications';

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();
  
  const [showSplash, setShowSplash] = useState(true);
  const [publishableKey, setPublishableKey] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const initialRoute = useRef<string | null>(null);
  const hasNavigated = useRef(false);
  usePushNotifications(userId);

  const [loaded] = useFonts({
    Roboto_700Bold, Roboto_400Regular, Roboto_500Medium, Roboto_600SemiBold,
  });

  // Auth check — stores destination without navigating
  useEffect(() => {
    let isMounted = true;

    (async () => {
      try {
        const { data } = await supabase.auth.getUser();
        if (!isMounted) return;

        if (data?.user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('full_name')
            .eq('id', data.user.id)
            .maybeSingle();

          if (!isMounted) return;

          if (!profile || !profile.full_name) {
            initialRoute.current = '/signupsteps/Fillyourprofile';
          } else {
            try {
              const myProfile = await getMyProfile();
              if (isMounted && myProfile?.data) {
                store.dispatch(GetprofileApi(myProfile.data));
              }
            } catch (_) {}
            setUserId(data.user.id);
            initialRoute.current = '/(tabs)';
          }
        } else {
          initialRoute.current = '/startScreen';
        }
      } catch (_) {
        initialRoute.current = '/startScreen';
      }
    })();

    return () => { isMounted = false; };
  }, []);

  // Splash timer — minimum 3 seconds, then hide once auth is also done
  useEffect(() => {
    const timer = setTimeout(() => {
      if (initialRoute.current) {
        setShowSplash(false);
      } else {
        const poll = setInterval(() => {
          if (initialRoute.current) {
            clearInterval(poll);
            setShowSplash(false);
          }
        }, 200);
      }
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  // Navigate once Stack is mounted (splash hidden)
  useEffect(() => {
    if (!showSplash && initialRoute.current && !hasNavigated.current) {
      hasNavigated.current = true;
      router.replace(initialRoute.current as any);
    }
  }, [showSplash]);

  useEffect(() => {
    getPaymentConfigFromApi().then((config) => {
      if (config.publishableKey) setPublishableKey(config.publishableKey);
    });
  }, []);

  if (!loaded || showSplash) {
    return (
      <Provider store={store}>
        <SafeAreaProvider>
          <SplashView />
          <StatusBar style="light" hidden={false} />
        </SafeAreaProvider>
      </Provider>
    );
  }

  return (
    <Provider store={store}>
    <SafeAreaProvider>
    <StripeProvider
      publishableKey={publishableKey || 'pk_test_51OTpUbGYNvzZOOzjYAhfAwgmxSxvCFCGlL5IpVv0pszqWICMcrx4LhrhDQNHmd4kUDzv4QeoAhyhnY7sGd2Si54i00dON7mnmA'}
      urlScheme="kubsy"
    >
    <ThemeProvider value={Colors.background === '#35072B' ? DarkTheme : DefaultTheme}>

      <Stack>
        
          
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
        <Stack.Screen name="userdetail" options={{ headerShown: false }} />
        <Stack.Screen name="Showmore"  options={{ headerShown: false }} />
        <Stack.Screen name="Searchuser" options={{ headerShown: false }} />
<Stack.Screen name="Allnewmatchusers" options={{ headerShown: false }} />
        <Stack.Screen name="Allyourmatch" options={{ headerShown: false }} />
        <Stack.Screen name="Yourmatch" options={{ headerShown: false }} />
        <Stack.Screen name="singlechat" options={{ headerShown: false }} />
        <Stack.Screen name="Getvip" options={{ headerShown: false }} />
        <Stack.Screen name="payments/Payments" options={{ headerShown: false }} />
        <Stack.Screen name="payments/Addnewcard" options={{ headerShown: false }} />
        <Stack.Screen name="payments/Confirmpayment" options={{ headerShown: false }} />
        <Stack.Screen name="setting/Settings" options={{ headerShown: false }} />
        <Stack.Screen name="setting/Parsnalinformation" options={{ headerShown: false }} />
        <Stack.Screen name="setting/DiscoverySettings" options={{ headerShown: false }} />
        <Stack.Screen name="setting/Privacypolicy" options={{ headerShown: false }} />
        <Stack.Screen name="setting/Security" options={{ headerShown: false }} />
        <Stack.Screen name="HelpcenterTopBard/TopTabs" options={{ headerShown: false }} />
        <Stack.Screen name="setting/Changepin" options={{ headerShown: false }} />
        <Stack.Screen name="setting/Changepassword" options={{ headerShown: false }} />
        <Stack.Screen name="setting/Premiumamanagement" options={{ headerShown: false }} />
        <Stack.Screen name="Invitefriends" options={{ headerShown: false }} />
        <Stack.Screen name="setting/Language" options={{ headerShown: false }} />
        <Stack.Screen name="setting/BlockedUsers" options={{ headerShown: false }} />
        <Stack.Screen name="Loginuserdetails" options={{ headerShown: false }} />
        <Stack.Screen name="Editloginuser" options={{ headerShown: false }} />
        <Stack.Screen name="components/PaymentScreen" options={{ headerShown: false }} />

          




          
          <Stack.Screen name="startScreen" options={{ headerShown: false }} />
        {/* <Stack.Screen name="Selectlocation" options={{ headerShown: false }} /> */}
        <Stack.Screen name="Signinpassword" options={{ headerShown: false }} />
        <Stack.Screen name="Signup" options={{ headerShown: false }} />
        <Stack.Screen name="signupsteps/Setuplocation" options={{ headerShown: false }} />
        <Stack.Screen name="signupsteps/Fillyourprofile" options={{ headerShown: false }} />
        <Stack.Screen name="signupsteps/Photos" options={{ headerShown: false }} />
        <Stack.Screen name="signupsteps/Intrestes" options={{ headerShown: false }} />
        <Stack.Screen name="signupsteps/Createpin" options={{ headerShown: false }} />
        <Stack.Screen name="signupsteps/Verifynumber" options={{ headerShown: false }} />
        <Stack.Screen name="signupsteps/Cetagories" options={{ headerShown: false }} />

          
        

        

      </Stack>
<StatusBar style="dark" hidden={true} />    

</ThemeProvider>
</StripeProvider>
</SafeAreaProvider>
</Provider>

  );
}
