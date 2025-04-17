import React, { useState } from "react";
import axios from "axios";

const App: React.FC = () => {
  const [meetId, setMeetId] = useState("");
  const [meetPassCode, setMeetPassCode] = useState("");
  const [joineeName, setJoineeName] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleJoin = async () => {
    if (!meetId || !meetPassCode || !joineeName) {
      setStatus("❗ Please fill out all fields.");
      return;
    }

    setLoading(true);
    setStatus("⏳ Joining meeting...");

    try {
      const res = await axios.post("http://localhost:5000/join-meeting", {
        meetId,
        meetPassCode,
        joineeName,
      });

      if (res.data.success) {
        setStatus("✅ Joined the meeting successfully!");
      } else {
        setStatus("❌ Failed to join meeting.");
      }
    } catch (err) {
      setStatus("❌ Error joining meeting.");
      console.error(err);
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-100 to-blue-300 p-4">
      <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full">
        <h1 className="text-2xl font-bold text-center mb-6 text-blue-800">Zoom Bot Joiner 🤖</h1>

        <div className="space-y-4">
          <input
            type="text"
            placeholder="Meeting ID"
            value={meetId}
            onChange={(e) => setMeetId(e.target.value)}
            className="w-full px-4 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-400"
          />

          <input
            type="text"
            placeholder="Passcode"
            value={meetPassCode}
            onChange={(e) => setMeetPassCode(e.target.value)}
            className="w-full px-4 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-400"
          />

          <input
            type="text"
            placeholder="Your Name"
            value={joineeName}
            onChange={(e) => setJoineeName(e.target.value)}
            className="w-full px-4 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-400"
          />

          <button
            onClick={handleJoin}
            disabled={loading}
            className={`w-full py-2 rounded-lg font-semibold text-white transition ${
              loading ? "bg-gray-400" : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {loading ? "Joining..." : "Join Zoom"}
          </button>

          {status && (
            <div className="text-center mt-4 text-sm text-gray-700">
              {status}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default App;
