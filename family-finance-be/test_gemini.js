const { GoogleGenerativeAI } = require("@google/generative-ai");
require("dotenv").config({ path: ".env" });

async function listModels() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error("❌ Không tìm thấy GEMINI_API_KEY trong file .env");
    return;
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  
  try {
    console.log("--- Đang thử gọi mô hình 'gemini-2.5-flash' ---");
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    const result = await model.generateContent("Chào bạn, bạn là Gemini 2.5 đúng không?");
    const response = await result.response;
    console.log("✅ KẾT QUẢ: " + response.text());
    console.log("\n🎉 CHÚC MỪNG: Mô hình 'gemini-3.1-flash' đã hoạt động với API Key của bạn!");
  } catch (error) {
    console.error("❌ Lỗi khi gọi 'gemini-3.1-flash':", error.message);
    console.log("\n💡 Gợi ý: Nếu vẫn lỗi 404, hãy thử đổi tên mô hình thành 'gemini-1.5-flash-latest' hoặc kiểm tra lại quyền của Key.");
  }
}

listModels();
