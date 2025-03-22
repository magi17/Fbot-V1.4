const axios = require("axios");

module.exports = {
    name: "tikadd",
    usePrefix: false,
    usage: "tikadd <tiktok_url>",
    version: "1.2",

    async execute(api, event, args) {
        const { threadID, messageID } = event;

        if (args.length === 0) {
            return api.sendMessage("⚠️ Please provide a TikTok URL.\nUsage: tikadd <tiktok_url>", threadID, messageID);
        }

        const tiktokUrl = args[0];

        try {
            // Send request to API
            const response = await axios.get(`https://apis-i26b.onrender.com/tikadd?url=${encodeURIComponent(tiktokUrl)}`);

            // Extract response data
            const { success, message, totalUrls } = response.data;

            // Format bot response
            const resultMessage = 
                `✅ *TikTok URL Added!*\n\n` +
                `📌 *Message:* ${message}\n` +
                `📊 *Total URLs Stored:* ${totalUrls}`;

            api.sendMessage(resultMessage, threadID, messageID);
        } catch (error) {
            console.error("❌ Error adding TikTok URL:", error);
            api.sendMessage(`⚠️ Failed to add TikTok URL.\n🛠️ *Error:* ${error.message}`, threadID, messageID);
        }
    },
};
