import React from "react";
import SplashView from "@/components/SplashView";

/**
 * Expo Router ka default "Not Found" screen replace karta hai.
 * Agar kabhi unknown route (jaise deep link path mismatch) aaye to
 * user ko sirf Splash dikhai dega, error text nahi.
 */
export default function NotFoundScreen() {
  return <SplashView />;
}

