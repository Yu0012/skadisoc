// linkedin-test.js
const axios = require('axios');

// Replace these with your actual values
const ACCESS_TOKEN = 'AQXGnz6DFzCiuiIYbtos3rGDT3SbzbWA1r18MQCidATZewaFQH8jx61iYp2_DEiQqQhufkOR0FMi_7bMvU6AvaWyeSZn_6Cp78o77LJCDZA3NCzyT6_KQs047V-jK4BlvT4yviDiwtd2N2SZo3LmZxz5HgjH_CDV8dgmuQM0su6u_MEdGEd_YteIgz7qYTK5StB75ZVrpW-rHOkjpJHpo36uFwZNQa83t_iiYotHPHrG-kO4Zm2DtqsSgsWwbzIjLL8hVUH-u9kwaHvvhMb4WnaHqvp8QPpyE4FWhbp6xwfD_cRy0kuWMcMeuiCFqeQIZnJutmBORKSCPjssKOhJRMiaXUCQEg'; // Your active access token
const LINKEDIN_MEMBER_ID = '112a15266'; // The LinkedIn user ID you're posting as

// API Configuration
const API_BASE = 'https://api.linkedin.com/v2';
const headers = {
  'Authorization': `Bearer ${ACCESS_TOKEN}`,
  'Content-Type': 'application/json',
  'X-Restli-Protocol-Version': '2.0.0'
};

/**
 * Verify and format the author URN correctly
 */
function getAuthorUrn(memberId) {
  // Remove any non-numeric characters
  const numericId = memberId.replace(/\D/g, '');
  
  if (!numericId) {
    throw new Error('Invalid member ID - must contain numbers');
  }
  
  // Try both possible formats
  return `urn:li:person:${numericId}`; // Most common format
}

/**
 * Create a LinkedIn text post
 */
async function createPost(text) {
  try {
    const postData = {
      author: getAuthorUrn(LINKEDIN_MEMBER_ID),
      lifecycleState: "PUBLISHED",
      specificContent: {
        "com.linkedin.ugc.ShareContent": {
          shareCommentary: {
            text: text
          },
          shareMediaCategory: "NONE"
        }
      },
      visibility: {
        "com.linkedin.ugc.MemberNetworkVisibility": "PUBLIC"
      }
    };

    console.log('Creating post with data:', JSON.stringify(postData, null, 2));
    
    const response = await axios.post(`${API_BASE}/ugcPosts`, postData, { headers });
    
    console.log('✅ Post created successfully!');
    console.log('Post ID:', response.data.id);
    return response.data;
  } catch (error) {
    console.error('❌ Failed to create post:');
    
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Error Details:', JSON.stringify(error.response.data, null, 2));
      
      if (error.response.status === 403) {
        console.log('\nPossible solutions:');
        console.log('1. Verify your access token has the "w_member_social" scope');
        console.log('2. Ensure your member ID is correct (see instructions below)');
        console.log('3. Check if your token is expired (valid for 60 days)');
      }
    } else {
      console.error(error.message);
    }
    
    throw error;
  }
}

/**
 * Get your member ID from profile URL
 */
function howToFindMemberId() {
  console.log(`
How to find your correct LinkedIn Member ID:
1. Log in to LinkedIn in a web browser
2. Go to your profile page
3. Look at the URL in the address bar:
   Example: https://www.linkedin.com/in/johndoe-12345678/
4. The NUMERIC part at the end is your member ID (e.g., 12345678)

Important:
- Use ONLY the numbers (remove any letters/dashes)
- If your URL doesn't show numbers, try:
  a. Right-click your profile photo → "Copy image address"
  b. Look for a numeric ID in the image URL
  c. Or use the alternative method below

Alternative Method:
1. Go to https://www.linkedin.com/developers/tools/apitester
2. Select "Profile API" → "GET /me"
3. Execute the request
4. Look for the "id" field in the response (format: "urn:li:person:12345678")
`);
}

// Execute the test
(async () => {
  try {
    console.log('Starting LinkedIn post test...');
    
    // Simple test post
    const postText = 'Testing LinkedIn API integration from my app!';
    
    await createPost(postText);
    console.log('Test completed successfully!');
  } catch (error) {
    howToFindMemberId();
    console.log('\nStill having trouble? Try these steps:');
    console.log('1. Verify your token at https://jwt.io (check "scopes" include w_member_social)');
    console.log('2. Test your token manually:');
    console.log(`   curl -X POST ${API_BASE}/ugcPosts \\
      -H "Authorization: Bearer ${ACCESS_TOKEN.substring(0, 15)}..." \\
      -H "Content-Type: application/json" \\
      -d '${JSON.stringify({
        author: `urn:li:person:${LINKEDIN_MEMBER_ID}`,
        lifecycleState: "PUBLISHED",
        specificContent: {
          "com.linkedin.ugc.ShareContent": {
            shareCommentary: { text: "Test post" },
            shareMediaCategory: "NONE"
          }
        },
        visibility: {
          "com.linkedin.ugc.MemberNetworkVisibility": "PUBLIC"
        }
      })}'`);
  }
})();