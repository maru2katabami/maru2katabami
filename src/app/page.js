// pages/index.js or pages/Page.js
"use client";
import { useState } from "react";
import QRCode from "react-qr-code";
import useEncryption from "../hooks/useEncryption";
import useWebRTC from "../hooks/useWebRTC";
import useClipboard from "../hooks/useClipboard";
import useChat from "../hooks/useChat";

export default function Page() {
  const SECRET_KEY = process.env.NEXT_PUBLIC_SECRET_KEY;
  const { encrypt, decrypt } = useEncryption(SECRET_KEY);
  const {
    localSDP,
    inviteURL,
    isAnswer,
    loading,
    setLoading,
    channel,
    isOpen,
    msgs: webrtcMsgs,
    setRemoteSDP: setWebRTCRemoteSDP,
  } = useWebRTC(encrypt, decrypt);
  const { copyToClipboard, pasteFromClipboard } = useClipboard();
  const { msg, setMsg, msgs: chatMsgs, sendMessage } = useChat(channel);

  // Define remoteSDP state
  const [remoteSDP, setRemoteSDP] = useState("");

  const handleRemoteSDPSubmit = async (e) => {
    e.preventDefault();
    if (remoteSDP.trim()) {
      const decryptedSDP = decrypt(remoteSDP);
      setWebRTCRemoteSDP(decryptedSDP);
    } else {
      alert("Please provide a valid SDP.");
    }
  };

  const handlePaste = async () => {
    if (confirm("Do you want to paste from the clipboard?")) {
      const text = await pasteFromClipboard();
      setRemoteSDP(text);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-950 via-black to-gray-900 text-white flex items-center justify-center">
      <div className="relative w-full h-full flex items-center justify-center p-8">
        {!isOpen ? (
          isAnswer ? (
            loading ? (
              <div className="w-16 h-16 rounded-full border-t-4 border-b-4 border-cyan-400 animate-spin" />
            ) : (
              <div className="flex flex-col items-center space-y-8 p-10 bg-gradient-to-br from-gray-800 via-gray-900 to-black/80 backdrop-blur-xl border border-cyan-500/60 rounded-3xl shadow-2xl">
                <h1 className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-500 to-purple-600 animate-pulse">
                  Copy Your SDP
                </h1>
                <button
                  className="px-10 py-3 text-lg font-medium bg-gradient-to-r from-cyan-500 to-purple-700 hover:from-purple-700 hover:to-cyan-500 rounded-full transition-transform transform hover:scale-105 shadow-lg"
                  onClick={() => {
                    copyToClipboard(localSDP);
                    setLoading(true);
                  }}
                >
                  Copy Remote SDP
                </button>
              </div>
            )
          ) : (
            <div className="flex flex-col items-center space-y-8 p-10 bg-gradient-to-br from-gray-800 via-gray-900 to-black/80 backdrop-blur-xl border border-cyan-500/60 rounded-3xl shadow-2xl">
              {inviteURL && (
                <div
                  className="cursor-pointer group"
                  onClick={() => copyToClipboard(inviteURL)}
                >
                  <QRCode
                    value={inviteURL}
                    className="shadow-xl group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="mt-4 p-3 w-64 text-center truncate rounded-lg border border-gray-700 bg-gray-900 text-gray-300 group-hover:text-white transition">
                    {inviteURL}
                  </div>
                </div>
              )}
              <form
                onSubmit={handleRemoteSDPSubmit}
                className="flex flex-col items-center space-y-6 w-full max-w-lg"
              >
                <textarea
                  name="sdp"
                  placeholder="Paste Remote SDP"
                  className="w-full px-6 py-4 border border-gray-700 bg-gray-800 text-gray-300 rounded-xl focus:ring-4 focus:ring-cyan-500/50 resize-none shadow-inner"
                  rows={4}
                  onClick={handlePaste}
                  value={remoteSDP} // Correctly bound to remoteSDP
                  onChange={(e) => setRemoteSDP(e.target.value)} // Updates remoteSDP state
                />
                <button
                  type="submit"
                  className="w-full px-6 py-3 bg-gradient-to-r from-teal-500 to-blue-700 hover:from-blue-700 hover:to-teal-500 rounded-full transition-transform transform hover:scale-105 shadow-lg"
                >
                  Set Remote SDP
                </button>
              </form>
            </div>
          )
        ) : (
          <div className="max-w-lg w-full bg-gradient-to-br from-gray-800 via-gray-900 to-black/80 p-8 rounded-3xl backdrop-blur-xl border border-cyan-500/60 shadow-2xl">
            <h2 className="text-4xl font-bold mb-6 text-center text-transparent bg-clip-text bg-gradient-to-r from-cyan-500 to-purple-600 animate-pulse">
              Chat
            </h2>
            <div className="border border-gray-700 p-6 h-48 overflow-y-scroll rounded-lg mb-6 bg-gray-900 shadow-inner">
              {[...webrtcMsgs, ...chatMsgs].map((m, i) => (
                <div key={i} className="text-sm text-gray-400">
                  {m}
                </div>
              ))}
            </div>
            <div className="flex items-center space-x-4">
              <input
                type="text"
                value={msg}
                onChange={(e) => setMsg(e.target.value)}
                placeholder="Type a message"
                className="flex-1 px-6 py-3 border border-gray-700 bg-gray-900 text-white rounded-xl focus:ring-4 focus:ring-cyan-500/50 shadow-inner"
              />
              <button
                type="button"
                onClick={sendMessage}
                className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-purple-700 hover:from-purple-700 hover:to-cyan-500 rounded-full transition-transform transform hover:scale-105 shadow-lg"
              >
                Send
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
