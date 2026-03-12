import { useEffect, useRef, useState } from 'react';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import Constants from 'expo-constants';
import { router } from 'expo-router';
import { clearPushToken, savePushToken } from '@/services/pushToken';

// Module-level flag — sirf logged-in hone pe notifications show hogi
let _isLoggedIn = false;

Notifications.setNotificationHandler({
  handleNotification: async (notification) => {
    const isQuoteOfTheDay = notification.request.content.data?.type === "quote";
    const show = isQuoteOfTheDay || _isLoggedIn;
    return {
      shouldShowAlert: show,
      shouldPlaySound: show,
      shouldSetBadge: _isLoggedIn,
      shouldShowBanner: show,
      shouldShowList: show,
    };
  },
});

export function usePushNotifications(userId: string | null) {
  const [expoPushToken, setExpoPushToken] = useState<string | null>(null);
  const [notification, setNotification] = useState<Notifications.Notification | null>(null);

  const notificationListener = useRef<Notifications.EventSubscription | null>(null);
  const responseListener = useRef<Notifications.EventSubscription | null>(null);

  useEffect(() => {
    if (!userId) {
      _isLoggedIn = false;
      if (__DEV__) console.log('[Push] Step 0: userId nahi hai – login/profile complete karo');
      return;
    }

    _isLoggedIn = true;
    let cancelled = false;
    if (__DEV__) console.log('[Push] Step 0: userId set, 1.2s baad permission + token start');

    // Thodi der baad permission maango taake main screen dikh raha ho (production build ko zyada time do)
    const delayMs = __DEV__ ? 1200 : 2500;
    const t = setTimeout(() => {
      const tryRegister = (isRetry?: boolean) => {
        registerForPushNotificationsAsync().then(async (token) => {
          if (cancelled) return;
          if (!token) {
            if (__DEV__) console.log('[Push] Step 1 FAIL: token nahi mila (permission/emulator/projectId check karo)');
            // Production: ek baar 3s baad retry – native kabhi late ready hota hai
            if (!__DEV__ && !isRetry) {
              setTimeout(() => tryRegister(true), 3000);
            }
            return;
          }
          if (__DEV__) console.log('[Push] Step 1 OK: token mila, ab DB mein save try');
          setExpoPushToken(token);
          let result = await savePushToken(userId, token);
          if (cancelled) return;
          if (!result?.ok) {
            if (__DEV__) console.log('[Push] Step 2: pehli save fail, 2s baad retry');
            await new Promise((r) => setTimeout(r, 2000));
            result = await savePushToken(userId, token);
          }
          if (!cancelled && __DEV__) {
            console.log('[Push] Step 2:', result?.ok ? 'Token DB mein SAVED' : 'Token save FAIL – ' + (result?.error || 'unknown'));
          }
        });
      };
      tryRegister(false);
    }, delayMs);

    return () => {
      cancelled = true;
      clearTimeout(t);
    };
  }, [userId]);

  useEffect(() => {
    if (!userId) return;

    // Foreground mein notification aaye to
    notificationListener.current = Notifications.addNotificationReceivedListener((notif) => {
      setNotification(notif);
    });

    // User ne notification tap kiya to (background/closed app se bhi trigger hota hai)
    responseListener.current = Notifications.addNotificationResponseReceivedListener((response) => {
      const data = response.notification.request.content.data as Record<string, string>;

      // Backend se aane wale data ke hisaab se screen pe navigate karo
      if (data?.type === 'chat' && data?.matchId) {
        router.push({ pathname: '/singlechat', params: { matchId: data.matchId } });
      } else if (data?.type === 'match') {
        router.push('/(tabs)/match');
      } else if (data?.type === 'like') {
        router.push('/Allnewmatchusers');
      }
    });

    return () => {
      _isLoggedIn = false;
      notificationListener.current?.remove();
      responseListener.current?.remove();
    };
  }, [userId]);

  return { expoPushToken, notification };
}

export async function logoutAndClearToken(userId: string) {
  _isLoggedIn = false;
  await clearPushToken(userId);
}

/** Manually request push permission (e.g. "Enable notifications" button) – returns token if granted */
export async function requestPushPermissionAndSave(userId: string | null): Promise<{ granted: boolean; token?: string }> {
  if (!userId) return { granted: false };
  const token = await registerForPushNotificationsAsync();
  if (!token) return { granted: false };
  await savePushToken(userId, token);
  return { granted: true, token };
}

/** Check if push permission is granted (without requesting) */
export async function getPushPermissionStatus(): Promise<'granted' | 'denied' | 'undetermined'> {
  const { status } = await Notifications.getPermissionsAsync();
  return status;
}

async function registerForPushNotificationsAsync(): Promise<string | null> {
  if (!Device.isDevice) {
    if (__DEV__) console.warn('[Push] Token nahi: Device.isDevice false – real device pe chalao, emulator pe nahi');
    return null;
  }

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    if (__DEV__) console.log('[Push] Permission nahi thi, request kar rahe hain...');
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    if (__DEV__) console.warn('[Push] Token nahi: permission denied – Profile → Enable notifications try karo');
    return null;
  }

  // Production build mein kabhi kabhi expoConfig.extra.eas alag hota hai – multiple fallbacks
  const projectId =
    Constants.expoConfig?.extra?.eas?.projectId ??
    (Constants.expoConfig as any)?.projectId ??
    (Constants as any).projectId;
  if (!projectId) {
    if (__DEV__) console.error('[Push] Token nahi: app.json → extra.eas.projectId (ya projectId) missing');
    return null;
  }

  try {
    const tokenData = await Notifications.getExpoPushTokenAsync({ projectId });
    return tokenData?.data ?? null;
  } catch (e: any) {
    if (__DEV__) console.warn('[Push] getExpoPushTokenAsync error:', e?.message ?? e);
    return null;
  }
}
