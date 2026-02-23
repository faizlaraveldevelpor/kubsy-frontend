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
  handleNotification: async () => ({
    shouldShowAlert: _isLoggedIn,
    shouldPlaySound: _isLoggedIn,
    shouldSetBadge: _isLoggedIn,
    shouldShowBanner: _isLoggedIn,
    shouldShowList: _isLoggedIn,
  }),
});

export function usePushNotifications(userId: string | null) {
  const [expoPushToken, setExpoPushToken] = useState<string | null>(null);
  const [notification, setNotification] = useState<Notifications.Notification | null>(null);

  const notificationListener = useRef<Notifications.EventSubscription | null>(null);
  const responseListener = useRef<Notifications.EventSubscription | null>(null);

  useEffect(() => {
    if (!userId) {
      _isLoggedIn = false;
      return;
    }

    _isLoggedIn = true;

    registerForPushNotificationsAsync().then(async (token) => {
      if (token) {
        setExpoPushToken(token);
        await savePushToken(userId, token);
        // Test ke liye: Expo Push Tool (expo.dev/notifications) mein ye token paste karein
        if (__DEV__) console.log('[Push] Expo token:', token);
      }
    });

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

async function registerForPushNotificationsAsync(): Promise<string | null> {
  if (!Device.isDevice) {
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
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    console.warn('Push notification permission nahi mili');
    return null;
  }

  const projectId = Constants.expoConfig?.extra?.eas?.projectId;
  if (!projectId) {
    console.error('EAS projectId app.json mein nahi mila');
    return null;
  }

  const tokenData = await Notifications.getExpoPushTokenAsync({ projectId });
  return tokenData.data;
}
