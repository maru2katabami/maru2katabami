"use client";

import { useState, useEffect } from "react";
import QRCode from "react-qr-code";

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

  const handleRemoteSDP = async () => {
    if (!peer) return;
    const sdp = await navigator.clipboard.readText();
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
    <main className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
      {!isOpen ? (
        isAnswer ? (
          loading ? (
            <div className="size-80 bg-[url(./favicon.ico)] bg-center bg-[size-100%] bg-no-repeat animate-spin"/>
          ): (
          <div className="flex flex-col items-center space-y-4">
            <h1 className="text-2xl font-bold">Copy Your SDP</h1>
            <button
              onClick={() => {
                handleCopyToClipboard(localSDP)
                setLoading( true )
              }}
              className="px-4 py-2 bg-blue-500 rounded hover:bg-blue-600">
              Copy SDP
            </button>
          </div>
        )) : (
          <div className="flex flex-col items-center space-y-6">
            {inviteURL && (
              <div className="text-center space-y-4">
                <QRCode
                  value={inviteURL}
                  className="shadow-lg cursor-pointer"
                  onClick={() => handleCopyToClipboard(inviteURL)}
                />
                <div
                  className="w-64 h-8 truncate px-4 py-2 bg-gray-800 rounded-lg cursor-pointer text-sm"
                  onClick={() => handleCopyToClipboard(inviteURL)}
                >
                  {inviteURL}
                </div>
              </div>
            )}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleRemoteSDP();
              }}
              className="flex flex-col items-center"
            >
              <input
                placeholder="Paste the remote SDP here"
                className="px-4 w-64 h-10 border border-b-0 border-gray-700 rounded-t-lg truncate text-white text-center"
                onClick={ handlePasteToClipboard }
                onChange={(e) => setRemoteSDP(e.target.value)}
                value={ remoteSDP }
              />
              <button
                type="submit"
                className="w-64 px-4 py-2 bg-green-500 rounded-b-lg hover:bg-green-600"
              >
                Set Remote SDP
              </button>
            </form>
          </div>
        )
      ) : (
        <div className="max-w-md w-full bg-gray-800 p-6 rounded-lg shadow-lg">
          <h2 className="text-xl font-bold mb-4">Chat</h2>
          <div className="border border-gray-700 p-4 h-40 overflow-y-scroll rounded-lg mb-4 bg-gray-900">
            {msgs.map((message, index) => (
              <div key={index} className="text-sm text-gray-300">
                {message}
              </div>
            ))}
          </div>
          <div className="flex items-center space-x-2">
            <input
              type="text"
              value={msg}
              onChange={(e) => setMsg(e.target.value)}
              placeholder="Type a message"
              className="flex-1 px-4 py-2 border border-gray-700 rounded bg-gray-900 text-white"
            />
            <button
              onClick={handleSendMessage}
              className="px-4 py-2 bg-blue-500 rounded hover:bg-blue-600"
            >
              Send
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
