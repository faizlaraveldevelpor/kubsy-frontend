// import { initPaymentSheet } from "@stripe/stripe-react-native";
// import { Alert } from "react-native";

// const API_URL = "http://10.52.183.58:3001/api/v1"; 

// export const paymentApi=(setLoading,presentPaymentSheet,initPaymentSheet)=>{
//  const initializePaymentSheet = async () => {
//     try {
//       setLoading(true);

//       // 1. Fetch Client Secret
//       const response = await fetch(`${API_URL}/create-payment-intent`, {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({
//           amount: 2000,
//           userId: 'user_123_test',
//         }),
//       });

//       const data = await response.json();
      
//       if (!data.clientSecret) {
//         throw new Error("Backend se clientSecret nahi mila. Check Express Logs.");
//       }

//       // 2. Initialize (Yahan error handling bahut zaruri hai)
//       const { error: initError } = await initPaymentSheet({
//         paymentIntentClientSecret: data.clientSecret,
//         merchantDisplayName: 'My Awesome App',
//         allowsDelayedPaymentMethods: true,
//         // Apple/Google Pay enable karne ke liye niche wale fields zaruri hote hain agar crash bachana hai
//         applePay: false, 
//         googlePay: false,
//       });

//       if (initError) {
//         setLoading(false);
//         Alert.alert('Initialization Error', initError.message);
//         return;
//       }

//       // 3. UI ko pehle settle hone dein, phir sheet kholein
//       setLoading(false); 
      
//       // Chota sa delay crash bacha leta hai (Native bridge settle ho jata hai)
//       setTimeout(async () => {
//         await openPaymentSheet();
//       }, 500);

//     } catch (err) {
//       setLoading(false);
//       Alert.alert("Critical Error", err.message);
//     }
//   };

//   const openPaymentSheet = async () => {
    
//     const { error } = await presentPaymentSheet();

//     if (error) {
//       // Agar user cancel karega toh crash nahi hoga
//       if (error.code === 'Canceled') {
//          console.log("User ne payment cancel ki");
//       } else {
//          Alert.alert(`Error ${error.code}`, error.message);
//       }
//     } else {
//       Alert.alert('Success', 'Payment Successful!');
//     }
//   };
// }

const API_URL = "https://vps.kubsy.app/api/v1";

export const cancelSubscription = async (userId: string) => {
  try {
    const response = await fetch(`${API_URL}/cancel-subscription`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId }),
    });
    const text = await response.text();
    let data: any;
    try {
      data = text ? JSON.parse(text) : {};
    } catch {
      throw new Error(
        !response.ok
          ? `Server error (${response.status}). Backend reachable nahi ya /cancel-subscription route check karein.`
          : "Invalid response from server"
      );
    }
    if (!response.ok) throw new Error(data?.error || `Failed to cancel subscription (${response.status})`);
    return data;
  } catch (err: any) {
    console.error("Cancel subscription error:", err);
    throw err;
  }
};
