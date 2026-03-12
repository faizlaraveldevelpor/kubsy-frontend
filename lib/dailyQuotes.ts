import { supabase } from "@/lib/supabase";

/**
 * Fallback quotes when Supabase fails or returns empty (Quote of the Day – 6 AM / 5 PM notifications).
 */
export const MOTIVATIONAL_QUOTES: string[] = [
"Stop swiping in your dreams, your real match is here! 😉",
"Are you still single? Because we just found your perfect 'Tea Partner'. ☕",
"Warning: Your inbox might get flooded after this... ⚡",
"One 'Hi' can change everything. Who will you say it to today? 💖",
"Your future date is waiting for a message. Don't be shy! 🤳",
"Stop scrolling through Instagram, your real crush is waiting on Kubsy! 😉",
"Warning: Your smile might get wider after checking your matches today. ✨",
"We found someone who's exactly your type. Don't let them be 'the one' that got away! 🏃‍♂️💨",
"Is it hot in here, or is it just your new matches? 🔥",
"If you were a triangle, you'd be acute one. Come see who thinks so! 📐",
];

const QUOTE_NOTIFICATION_ID = "quote-of-the-day";

/**
 * Fetches quotes from Supabase table "quets", column "content" (text array).
 * Supports content as array of strings or stringified JSON array. Falls back to MOTIVATIONAL_QUOTES on error or empty.
 */
export async function fetchQuotes(): Promise<string[]> {
  try {
    const { data, error } = await supabase.from("quets").select("content");

    if (error) return MOTIVATIONAL_QUOTES;
    if (!data || data.length === 0) return MOTIVATIONAL_QUOTES;

    const first = data[0] as { content?: unknown };
    const content = first?.content;

    if (Array.isArray(content)) {
      const list = content.filter((q): q is string => typeof q === "string");
      return list.length > 0 ? list : MOTIVATIONAL_QUOTES;
    }
    if (typeof content === "string") {
      try {
        const parsed = JSON.parse(content) as unknown;
        if (Array.isArray(parsed)) {
          const list = parsed.filter((q): q is string => typeof q === "string");
          if (list.length > 0) return list;
        }
      } catch {
        // not JSON, use as single quote
      }
      return [content];
    }

    const list: string[] = [];
    for (const row of data as { content?: unknown }[]) {
      const c = row?.content;
      if (typeof c === "string") list.push(c);
      else if (Array.isArray(c)) list.push(...c.filter((q): q is string => typeof q === "string"));
    }
    return list.length > 0 ? list : MOTIVATIONAL_QUOTES;
  } catch {
    return MOTIVATIONAL_QUOTES;
  }
}

/**
 * Returns one quote for the day from the given list (or fallback list).
 */
export function getQuoteOfTheDay(quotes?: string[]): string {
  const list = quotes?.length ? quotes : MOTIVATIONAL_QUOTES;
  const start = new Date(new Date().getFullYear(), 0, 0);
  const diff = Date.now() - start.getTime();
  const dayOfYear = Math.floor(diff / (1000 * 60 * 60 * 24));
  return list[dayOfYear % list.length];
}

export { QUOTE_NOTIFICATION_ID };
