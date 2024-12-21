"use client";

import { useState, useEffect } from "react"
import QRCode from "react-qr-code"

export default function WebRTCPage() {
  const [isAnswer, setIsAnswer] = useState(false);
  const [loading, setLoading] = useState( false )
  const [isOpen, setIsOpen] = useState(false);
  const [localSDP, setLocalSDP] = useState("");
  const [remoteSDP, setRemoteSDP] = useState("")
  const [peer, setPeer] = useState(null);
  const [inviteURL, setInviteURL] = useState("");
  const [channel, setChannel] = useState(null);
  const [msg, setMsg] = useState("");
  const [msgs, setMsgs] = useState([]);

  useEffect(() => {
    const pc = new RTCPeerConnection({ iceServers: [{ urls: "stun:stun.l.google.com:19302" }] });

    pc.onicecandidate = (event) => {
      if (!event.candidate) {
        setLocalSDP(pc.localDescription?.sdp || "");
      }
    };

    pc.ondatachannel = (event) => {
      const dataChannel = event.channel;
      handleSetupChannel(dataChannel);
    };

    setPeer(pc);

    const query = new URLSearchParams(window.location.search);
    const remoteSDPFromURL = query.get("sdp");
    remoteSDPFromURL ? handleIncomingOffer(pc, remoteSDPFromURL) : handleCreateOffer(pc);

    return () => pc.close();
  }, []);

  const handleSetupChannel = (dataChannel) => {
    setChannel(dataChannel);
    dataChannel.onopen = () => setIsOpen(true);
    dataChannel.onmessage = (e) => setMsgs((prev) => [...prev, `Anonymous: ${e.data}`]);
  };

  const handleCreateOffer = async (pc) => {
    const dataChannel = pc.createDataChannel("chat");
    handleSetupChannel(dataChannel);
    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);
    setInviteURL(`${window.location.origin}/?sdp=${encodeURIComponent(offer.sdp)}`);
  };

  const handleIncomingOffer = async (pc, sdp) => {
    setIsAnswer(true);
    const remoteDesc = new RTCSessionDescription({ type: "offer", sdp });
    await pc.setRemoteDescription(remoteDesc);
    const answer = await pc.createAnswer();
    await pc.setLocalDescription(answer);
    setLocalSDP(answer.sdp);
  };

  const handleRemoteSDP = async event => {
    event.preventDefault()
    if ( !peer ) return;
    const sdp = event.target[0].value;
    const remoteDesc = new RTCSessionDescription({ type: "answer", sdp });
    await peer.setRemoteDescription(remoteDesc);
  };

  const handleCopyToClipboard = async (text) => {
    await navigator.clipboard.writeText(text);
    alert("Copied to clipboard");
  };

  const handlePasteToClipboard = async event => {
    const conf = confirm("Clipboardを使用してペーストしますか？")
    conf ? event.target.value = await navigator.clipboard.readText(): null
  }


  const handleSendMessage = () => {
    if (channel?.readyState === "open") {
      channel.send(msg);
      setMsgs((prev) => [...prev, `You: ${msg}`]);
      setMsg("");
    } else {
      alert("Data channel is not open.");
    }
  };

  return (
    <main className="min-h-screen bg-black text-white flex items-center justify-center">
  <div className="relative w-full h-full flex items-center justify-center">
    {!isOpen ? (
      isAnswer ? (
        loading ? (
          <div className="w-20 h-20 rounded-full border-t-4 border-b-4 border-cyan-300 animate-spin" />
        ) : (
          <div className="flex flex-col items-center space-y-6 p-8 bg-gradient-to-br from-transparent to-gray-900 backdrop-blur-md border border-cyan-400/50 rounded-2xl shadow-[0_0_30px_10px_rgba(0,255,255,0.7)]">
            <h1 className="text-4xl font-extrabold tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-blue-400 to-purple-500 animate-pulse">
              Copy Your SDP
            </h1>
            <button
              className="px-8 py-3 text-lg bg-gradient-to-r from-cyan-300 to-purple-500 hover:from-purple-500 hover:to-cyan-300 rounded-lg transition-transform transform hover:scale-110 shadow-[0_0_20px_rgba(0,255,255,0.7)]"
              onClick={() => {
                handleCopyToClipboard(localSDP);
                setLoading(true);
              }}
            >
              Copy Remote SDP
            </button>
          </div>
        )
      ) : (
        <div className="flex flex-col items-center space-y-6 p-8 bg-gradient-to-br from-transparent to-gray-900 backdrop-blur-lg border border-cyan-400/50 rounded-2xl shadow-[0_0_30px_10px_rgba(0,255,255,0.7)]">
          {inviteURL && (
            <div
              className="cursor-pointer group"
              onClick={() => handleCopyToClipboard(inviteURL)}
            >
              <QRCode
                value={inviteURL}
                className="shadow-[0_0_20px_rgba(0,255,255,0.7)] group-hover:scale-110 transition-transform duration-300"
              />
              <div className="mt-2 p-2 w-64 text-center truncate px-4 rounded-lg border border-gray-600 bg-gray-800 text-gray-300 group-hover:text-white transition">
                {inviteURL}
              </div>
            </div>
          )}
          <form
            onSubmit={handleRemoteSDP}
            className="flex flex-col items-center space-y-4 w-full max-w-md"
          >
            <textarea
              placeholder="Paste Remote SDP"
              className="w-full px-4 py-2 border border-gray-600 bg-gray-800 text-gray-300 rounded-lg focus:ring focus:ring-cyan-300/70 resize-none"
              rows={3}
              onClick={handlePasteToClipboard}
              onChange={(e) => setRemoteSDP(e.target.value)}
              value={remoteSDP}
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
          {msgs.map((message, index) => (
            <div key={index} className="text-sm text-gray-400">
              {message}
            </div>
          ))}
        </div>
        <div className="flex items-center space-x-4">
          <input
            type="text"
            value={msg}
            onChange={(e) => setMsg(e.target.value)}
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
