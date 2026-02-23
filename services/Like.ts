import axios from "axios";

export const createaction = async (actionData) => {
  // IP ko variable mein rakhna theek hai, lekin body mein data sahi bhejna zaroori hai
  const url = "https://vps.kubsy.app/api/v1/createaction";
  console.log(actionData);
  

  try {
    console.log("Sending Action for Login User ID:", actionData?.loginUserId);

    // ✅ FIX: { data } ki bajaye direct actionData bhejain
    // Agar aap {data} bhejte hain to backend ko req.body.data.type likhna parta hai
    // Direct actionData bhejne se backend req.body.type par data pakar lega
    const response = await axios.post(url, actionData, {
      headers: {
        'Content-Type': 'application/json',
      }
    });

    console.log('✅ API Success Response:', response.data); 
    return response.data;

  } catch (error) {
    // Error handling ko mazeed behtar kiya gaya hai
    if (error.response) {
      console.log('❌ Backend Error:', error.response.data);
    } else if (error.request) {
      console.log('❌ Network Error (Server not reachable):', error.message);
    } else {
      console.log('❌ Request Error:', error.message);
    }
    return null;
  }
};


// Ab ye function userId ke sath page aur limit bhi lega
export const fetchWhoLikedMe = async (currentUserId, page = 1, limit = 10) => {
  try {
    const response = await axios.post('https://vps.kubsy.app/api/v1/wholike', {
      userId: currentUserId, // Login user ki ID
      page: page,            // Kaunsa page load karna hai
      limit: limit           // Ek baar mein kitni profiles chahiye
    });

    // Logging for debugging
    console.log(`Page ${response.data.metadata.current_page} loaded`);
    console.log("Total Records in DB:", response.data.metadata.total_records);

    // Hum pura response return kar rahe hain taake frontend 
    // metadata (total_pages, has_more) ko use kar sake
    return response.data; 
    
  } catch (error) {
    console.error("Error fetching likes:", error.response?.data || error.message);
    throw error; // Error throw karna behtar hai taake component mein catch ho sake
  }
};