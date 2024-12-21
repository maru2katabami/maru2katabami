"use client";
import { useState, useEffect } from "react";
import QRCode from "react-qr-code";
import crypto from "crypto";

export default function Page() {
  const [isAnswering, setIsAnswering] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isChannelOpen, setIsChannelOpen] = useState(false);
  const [localSdp, setLocalSdp] = useState("");
  const [remoteSdp, setRemoteSdp] = useState("");
  const [peerConnection, setPeerConnection] = useState(null);
  const [inviteUrl, setInviteUrl] = useState("");
  const [dataChannel, setDataChannel] = useState(null);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const SECRET_KEY = process.env.NEXT_PUBLIC_SECRET_KEY;

  const handleEncrypt = (text) => {
    const cipher = crypto.createCipher("aes-256-cbc", SECRET_KEY);
    let encryptedData = cipher.update(text, "utf8", "hex");
    encryptedData += cipher.final("hex");
    return encryptedData;
  };

  const handleDecrypt = (text) => {
    const decipher = crypto.createDecipher("aes-256-cbc", SECRET_KEY);
    let decryptedData = decipher.update(text, "hex", "utf8");
    decryptedData += decipher.final("utf8");
    return decryptedData;
  };

  useEffect(() => {
    const pc = new RTCPeerConnection({
      iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
    });

    pc.onicecandidate = (e) => {
      if (!e.candidate) {
        setLocalSdp(handleEncrypt(pc.localDescription?.sdp || ""));
      }
    };
    pc.ondatachannel = (e) => handleSetupDataChannel(e.channel);

    setPeerConnection(pc);

    const query = new URLSearchParams(window.location.search);
    const sdpFromQuery = query.get("sdp");
    sdpFromQuery
      ? handleReceiveOffer(pc, handleDecrypt(sdpFromQuery))
      : handleCreateOffer(pc);

    return () => pc.close();
  }, []);

  const handleSetupDataChannel = (dc) => {
    setDataChannel(dc);
    dc.onopen = () => setIsChannelOpen(true);
    dc.onmessage = (e) =>
      setMessages((prev) => [...prev, `Anonymous: ${e.data}`]);
  };

  const handleCreateOffer = async (pc) => {
    const dc = pc.createDataChannel("chat");
    handleSetupDataChannel(dc);
    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);

    const encryptedSdp = handleEncrypt(offer.sdp);
    const url = `${window.location.origin}/?sdp=${encodeURIComponent(
      encryptedSdp
    )}`;
    setInviteUrl(url);
  };

  const handleReceiveOffer = async (pc, decryptedSdp) => {
    setIsAnswering(true);
    await pc.setRemoteDescription(
      new RTCSessionDescription({ type: "offer", sdp: decryptedSdp })
    );
    const answer = await pc.createAnswer();
    await pc.setLocalDescription(answer);
    setLocalSdp(handleEncrypt(answer.sdp));
  };

  const handleRemoteSdpSubmit = async (e) => {
    e.preventDefault();
    if (!peerConnection) return;
    const decryptedSdp = handleDecrypt(e.target[0].value);
    await peerConnection.setRemoteDescription(
      new RTCSessionDescription({ type: "answer", sdp: decryptedSdp })
    );
  };

  const handleCopyToClipboard = async (text) => {
    await navigator.clipboard.writeText(text);
    alert("Copied to clipboard");
  };

  const handlePasteFromClipboard = async (e) => {
    if (confirm("Clipboardを使用してペーストしますか？")) {
      e.target.value = await navigator.clipboard.readText();
    }
  };

  const handleSendMessage = () => {
    if (dataChannel?.readyState === "open") {
      dataChannel.send(message);
      setMessages((prev) => [...prev, `You: ${message}`]);
      setMessage("");
    } else {
      alert("Data channel is not open.");
    }
  };

  return (
    <main className="min-h-screen bg-black text-white flex items-center justify-center">
      <div className="relative w-full h-full flex items-center justify-center">
        {!isChannelOpen ? (
          isAnswering ? (
            isLoading ? (
              <div className="w-20 h-20 rounded-full border-t-4 border-b-4 border-cyan-300 animate-spin" />
            ) : (
              <div className="flex flex-col items-center space-y-6 p-8 bg-gradient-to-br from-transparent to-gray-900 backdrop-blur-md border border-cyan-400/50 rounded-2xl shadow-[0_0_30px_10px_rgba(0,255,255,0.7)]">
                <h1 className="text-4xl font-extrabold tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-blue-400 to-purple-500 animate-pulse">
                  Copy Your SDP
                </h1>
                <button
                  className="px-8 py-3 text-lg bg-gradient-to-r from-cyan-300 to-purple-500 hover:from-purple-500 hover:to-cyan-300 rounded-lg transition-transform transform hover:scale-110 shadow-[0_0_20px_rgba(0,255,255,0.7)]"
                  onClick={() => {
                    handleCopyToClipboard(localSdp);
                    setIsLoading(true);
                  }}
                >
                  Copy Remote SDP
                </button>
              </div>
            )
          ) : (
            <div className="flex flex-col items-center space-y-6 p-8 bg-gradient-to-br from-transparent to-gray-900 backdrop-blur-lg border border-cyan-400/50 rounded-2xl shadow-[0_0_30px_10px_rgba(0,255,255,0.7)]">
              {inviteUrl && (
                <div
                  className="cursor-pointer group"
                  onClick={() => handleCopyToClipboard(inviteUrl)}
                >
                  <QRCode
                    value={inviteUrl}
                    className="shadow-[0_0_20px_rgba(0,255,255,0.7)] group-hover:scale-110 transition-transform duration-300"
                  />
                  <div className="mt-2 p-2 w-64 text-center truncate px-4 rounded-lg border border-gray-600 bg-gray-800 text-gray-300 group-hover:text-white transition">
                    {inviteUrl}
                  </div>
                </div>
              )}
              <form
                onSubmit={handleRemoteSdpSubmit}
                className="flex flex-col items-center space-y-4 w-full max-w-md"
              >
                <textarea
                  placeholder="Paste Remote SDP"
                  className="w-full px-4 py-2 border border-gray-600 bg-gray-800 text-gray-300 rounded-lg focus:ring focus:ring-cyan-300/70 resize-none"
                  rows={3}
                  onClick={handlePasteFromClipboard}
                  onChange={(e) => setRemoteSdp(e.target.value)}
                  value={remoteSdp}
                />
                <button
                  type="submit"
                  className="w-full px-4 py-2 bg-gradient-to-r from-green-300 to-teal-500 hover:from-teal-500 hover:to-green-300 rounded-lg transition-transform transform hover:scale-110 shadow-[0_0_20px_rgba(0,255,255,0.7)]"
                >
                  Set Remote SDP
                </button>
              </form>
            </div>
          )
        ) : (
          <div className="max-w-md w-full bg-gradient-to-br from-transparent to-gray-900 p-6 rounded-2xl backdrop-blur-lg border border-cyan-400/50 shadow-[0_0_30px_10px_rgba(0,255,255,0.7)]">
            <h2 className="text-3xl font-bold mb-4 text-center text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-blue-400 to-purple-500 animate-pulse">
              Chat
            </h2>
            <div className="border border-gray-600 p-4 h-40 overflow-y-scroll rounded-lg mb-4 bg-gray-800 shadow-inner">
              {messages.map((m, i) => (
                <div key={i} className="text-sm text-gray-400">
                  {m}
                </div>
              ))}
            </div>
            <div className="flex items-center space-x-4">
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type a message"
                className="flex-1 px-4 py-2 border border-gray-600 bg-gray-800 text-white rounded-lg focus:ring focus:ring-cyan-300/70"
              />
              <button
                onClick={handleSendMessage}
                className="px-6 py-3 bg-gradient-to-r from-cyan-300 to-purple-500 hover:from-purple-500 hover:to-cyan-300 rounded-lg transition-transform transform hover:scale-110 shadow-[0_0_20px_rgba(0,255,255,0.7)]"
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
