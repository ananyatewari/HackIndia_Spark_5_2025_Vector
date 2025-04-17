const express = require("express");
const cors = require("cors");
const joinZoomMeeting = require("./zoomBot");

const app = express();
app.use(cors());
app.use(express.json());

app.post("/join-meeting", async (req, res) => {
  const { meetId, meetPassCode, joineeName } = req.body;

  if (!meetId || !meetPassCode || !joineeName) {
    return res.status(400).json({
      success: false,
      message: "Missing required fields: meetId, meetPassCode, or joineeName",
    });
  }

  try {
    console.log("🤖 Joining Zoom meeting with:", { meetId, meetPassCode, joineeName });
    await joinZoomMeeting({ meetId, meetPassCode, joineeName });

    res.json({ success: true, message: "✅ Bot joined the meeting successfully!" });
  } catch (err) {
    console.error("❌ Error joining meeting:", err.message);
    res.status(500).json({ success: false, message: "Failed to join meeting." });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Backend running at http://localhost:${PORT}`);
});
