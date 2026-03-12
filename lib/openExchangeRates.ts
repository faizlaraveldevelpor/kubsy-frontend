import AsyncStorage from "@react-native-async-storage/async-storage";

const OPENEX_API_URL = "https://openexchangerates.org/api/latest.json";
const APP_ID = "48be64d11f754a1cb2ba2d3f6ad762b4";
const CACHE_KEY = "openex_sle_cache";
const MAX_CALLS_PER_DAY = 5;

/** SLE = Sierra Leone Leone; API returns SLL */
const CURRENCY_CODE = "SLL";

type CacheEntry = {
  date: string; // YYYY-MM-DD
  count: number;
  rate: number;
};

function todayStr(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

async function getCache(): Promise<CacheEntry | null> {
  try {
    const raw = await AsyncStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as CacheEntry;
  } catch {
    return null;
  }
}

async function setCache(entry: CacheEntry): Promise<void> {
  try {
    await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(entry));
  } catch {}
}

/**
 * Fetches USD to SLE (SLL) rate from Open Exchange Rates.
 * Cached per day; API is called at most MAX_CALLS_PER_DAY (5) times per day.
 */
export async function getSLERate(): Promise<number> {
  const today = todayStr();
  const cache = await getCache();

  if (cache?.date === today && cache.count >= MAX_CALLS_PER_DAY && cache.rate > 0) {
    return cache.rate;
  }
  if (cache?.date === today && cache.rate > 0) {
    return cache.rate;
  }

  const shouldFetch = !cache || cache.date !== today || cache.rate <= 0;
  const countForToday = cache?.date === today ? cache.count : 0;
  if (shouldFetch && countForToday < MAX_CALLS_PER_DAY) {
    try {
      const url = `${OPENEX_API_URL}?app_id=${APP_ID}&symbols=${CURRENCY_CODE}`;
      const res = await fetch(url);
      const data = await res.json();
      const rate = data?.rates?.[CURRENCY_CODE];
      if (typeof rate === "number" && rate > 0) {
        await setCache({
          date: today,
          count: countForToday + 1,
          rate,
        });
        return rate;
      }
    } catch (e) {
      if (__DEV__) console.warn("[OpenEx] fetch error:", e);
    }
  }

  if (cache?.rate && cache.rate > 0) {
    return cache.rate;
  }
  return 0;
}
