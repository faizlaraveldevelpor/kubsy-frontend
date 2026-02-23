const API_URL = "https://vps.kubsy.app/api/v1";
export const fetchPaymentSheetParams = async () => {
    // 1. Backend se clientSecret mangwayein
    const response = await fetch(`${API_URL}/create-payment-intent`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        amount: 2000, // $20.00 (cents mein)
        userId: 'user_123_test', // Supabase user ID yahan pass karein
      }),
    });
    const { clientSecret } = await response.json();
    return { clientSecret };
  };

