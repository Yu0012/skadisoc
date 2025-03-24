const axios = require('axios');

// ✅ Scheduled Facebook Post
async function scheduleFacebookPost() {
    const url = `https://graph.facebook.com/v22.0/${868746506554059}/feed`;
    const params = {
        message: "Hello, Facebook!",
        published: false,
        scheduled_publish_time: 1742774400,
        access_token: EAAJTfZBBiJYMBO5Rv5Mkoa5oZBT8JjeJ7QBb0MgLdCJxKpGixGgtyV7t9b33WCAQqPQXE2fsysFXGvmrnYVLWb5daf9wRl8OdD3AMuOwFzhrrmb0ocgLoQh7PInfrx66U6oF37DtIo5ZBZChID4yitLS8yii78NDj7JDHneLG2Ld3yqydS7v6rc9
    };
  
    try {
        const response = await axios.post(url, params);
        console.log("✅ Post Scheduled Successfully:", response.data);
    } catch (error) {
        console.error("❌ Error scheduling post:", error.response.data);
    }
  }

  

  