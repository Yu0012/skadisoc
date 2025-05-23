const { GoogleGenerativeAI } = require("@google/generative-ai");

const getAIResponse = async (userMessage) => {
  if (!userMessage) throw new Error("Message is required");

  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "models/gemini-pro" });

    const result = await model.generateContent(userMessage);
    const response = await result.response;
    const text = response.text();

    return text;
  } catch (err) {
    console.error("⚠️ Gemini API error:", err.message || err);
    return "⚠️ Sorry, Gemini is currently unavailable. Please try again later.";
  }
};

module.exports = { getAIResponse };
