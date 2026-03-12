import { useEffect, useRef } from "react";
import * as Notifications from "expo-notifications";
import { AppState, Platform } from "react-native";
import { fetchQuotes, getQuoteOfTheDay } from "@/lib/dailyQuotes";

const QUOTE_CHANNEL_ID = "quote-of-the-day";
const QUOTE_ID_6AM = "quote-of-the-day-6am";
const QUOTE_ID_5PM = "quote-of-the-day-5pm";

/**
 * Permission check karta hai; agar granted ho to har roz 6 AM aur 5 PM par Quote of the Day local notification schedule karta hai.
 * App ke main layout mein call karo.
 */
export function useDailyQuoteNotification() {
  const hasScheduled = useRef(false);

  useEffect(() => {
    let cancelled = false;

    const setup = async () => {
      try {
        const { status: existing } = await Notifications.getPermissionsAsync();
        let finalStatus = existing;
        if (existing !== "granted") {
          const { status } = await Notifications.requestPermissionsAsync();
          finalStatus = status;
        }
        if (finalStatus !== "granted" || cancelled) return;

        if (Platform.OS === "android") {
          await Notifications.setNotificationChannelAsync(QUOTE_CHANNEL_ID, {
            name: "Quote of the Day",
            importance: Notifications.AndroidImportance.HIGH,
            sound: true,
            enableVibrate: true,
          });
        }

        await Notifications.cancelScheduledNotificationAsync(QUOTE_ID_6AM);
        await Notifications.cancelScheduledNotificationAsync(QUOTE_ID_5PM);

        const quotes = await fetchQuotes();
        const quote = getQuoteOfTheDay(quotes) || "Start your day with a smile! 💖";
        const baseContent = {
          body: quote,
          data: { type: "quote" as const },
          sound: true,
        };
        const androidChannel = Platform.OS === "android" ? { channelId: QUOTE_CHANNEL_ID } : {};

        await Notifications.scheduleNotificationAsync({
          identifier: QUOTE_ID_6AM,
          content: { ...baseContent, title: "Quote of the Day" },
          trigger: {
            type: Notifications.SchedulableTriggerInputTypes.DAILY,
            hour: 6,
            minute: 0,
            ...androidChannel,
          },
        });

        await Notifications.scheduleNotificationAsync({
          identifier: QUOTE_ID_5PM,
          content: { ...baseContent, title: "Quote of the Day" },
          trigger: {
            type: Notifications.SchedulableTriggerInputTypes.DAILY,
            hour: 17,
            minute: 0,
            ...androidChannel,
          },
        });

        if (!cancelled) hasScheduled.current = true;
      } catch (e) {
        if (__DEV__) console.warn("[Quote] schedule error:", e);
      }
    };

    setup();

    // Re-run when app comes to foreground only if not scheduled yet (e.g. permission granted later)
    const sub = AppState.addEventListener("change", (state) => {
      if (state === "active" && !hasScheduled.current) setup();
    });
    return () => {
      cancelled = true;
      sub.remove();
    };
  }, []);
}
