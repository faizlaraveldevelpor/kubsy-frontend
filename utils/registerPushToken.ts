import * as Notifications from "expo-notifications";
import * as Device from "expo-device";

export async function getExpoPushToken() {
  if (!Device.isDevice) {
    console.log("Physical device required");
    return null;
  }

  // Permission check
  const { status: existingStatus } =
    await Notifications.getPermissionsAsync();

  let finalStatus = existingStatus;

  if (existingStatus !== "granted") {
    const { status } =
      await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== "granted") {
    console.log("Notification permission denied");
    return null;
  }

  // Get token
  const token = (await Notifications.getExpoPushTokenAsync()).data;
  return token;
}
