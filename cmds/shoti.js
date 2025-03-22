const fs = require("fs");
const axios = require("axios");
const path = require("path");

module.exports = {
    name: "shoti",
    usePrefix: false,
    usage: "Automatically responds when 'shoti' is mentioned",
    version: "1.2",

    async execute(api, event, args) {
        const { threadID, messageID, body } = event;

        // Ensure message contains "shoti"
        if (!body.toLowerCase().includes("shoti")) return;

        try {
            // Set reaction to indicate processing
            api.setMessageReaction("🕥", messageID, () => {}, true);

            // Fetch video from API with User-Agent
            const response = await axios.get("https://testapi2-919t.onrender.com/shoti", {
                headers: {
                    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
                }
            });

            if (!response.data || !response.data.url) {
                api.setMessageReaction("❌", messageID, () => {}, true);
                return api.sendMessage("⚠️ No video URL received from API.", threadID, messageID);
            }

            const videoUrl = response.data.url;
            const filePath = path.join(__dirname, "shoti.mp4");

            // Download the video
            const writer = fs.createWriteStream(filePath);
            const videoResponse = await axios({
                url: videoUrl,
                method: "GET",
                responseType: "stream",
                headers: {
                    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
                }
            });

            videoResponse.data.pipe(writer);

            writer.on("finish", async () => {
                api.setMessageReaction("✅", messageID, () => {}, true);

                const msg = {
                    body: "☕ Here is your shoti video!\n",
                    attachment: fs.createReadStream(filePath),
                };

                api.sendMessage(msg, threadID, (err) => {
                    if (err) {
                        console.error("❌ Error sending video:", err);
                        return api.sendMessage("⚠️ Failed to send video.", threadID);
                    }

                    // Delete file after sending
                    fs.unlink(filePath, (unlinkErr) => {
                        if (unlinkErr) console.error("❌ Error deleting file:", unlinkErr);
                    });
                });
            });

            writer.on("error", (err) => {
                console.error("❌ Error downloading video:", err);
                api.setMessageReaction("❌", messageID, () => {}, true);
                api.sendMessage("⚠️ Failed to download video.", threadID, messageID);
            });

        } catch (error) {
            console.error("❌ Error fetching video:", error);
            api.setMessageReaction("❌", messageID, () => {}, true);
            api.sendMessage(`⚠️ Could not fetch the video. Error: ${error.message}`, threadID, messageID);
        }
    },
};
