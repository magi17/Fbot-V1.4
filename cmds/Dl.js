const fs = require("fs");
const axios = require("axios");
const path = require("path");

module.exports = {
    name: "dl",
    usePrefix: true,
    usage: "dl <video_url>",
    version: "1.1",
    
    async execute(api, event, args) {
        const { threadID, messageID, body } = event;

        // Extract URL from message
        const urlMatch = body.match(/(https?:\/\/[^\s]+)/);
        if (!urlMatch) {
            return api.sendMessage("⚠️ Please provide a valid video URL.", threadID, messageID);
        }

        const videoUrl = urlMatch[0];

        try {
            api.setMessageReaction("⏳", messageID, () => {}, true);

            // Fetch video details from the new API
            const apiUrl = `https://apis-i26b.onrender.com/download?url=${encodeURIComponent(videoUrl)}`;
            const response = await axios.get(apiUrl);

            console.log("API Response:", response.data); // Debugging: Log API response

            const downloadUrl = response.data?.data?.url;
            
            if (!downloadUrl) {
                return api.sendMessage("⚠️ Error fetching video. The download link is missing.", threadID, messageID);
            }

            api.setMessageReaction("✅", messageID, () => {}, true);

            const msg = {
                body: `🎬 Here is your video:`,
                attachment: await getStreamFromURL(downloadUrl)
            };

            api.sendMessage(msg, threadID, messageID);

        } catch (error) {
            console.error("Error fetching video:", error.response?.data || error.message);
            api.sendMessage("⚠️ Error fetching video. Try again later.", threadID, messageID);
        }
    },
};

// Function to download video as a stream
async function getStreamFromURL(url) {
    try {
        const response = await axios({
            url,
            method: "GET",
            responseType: "stream"
        });

        const filePath = path.join(__dirname, "temp.mp4");
        const writer = fs.createWriteStream(filePath);

        response.data.pipe(writer);

        return new Promise((resolve, reject) => {
            writer.on("finish", () => resolve(fs.createReadStream(filePath)));
            writer.on("error", reject);
        });

    } catch (error) {
        console.error("Error downloading video:", error.message);
        throw new Error("⚠️ Failed to download the video.");
    }
}
