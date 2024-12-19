"use client"

import { useState, useEffect } from "react";
import QRCode from "react-qr-code";

export default function WebRTCPage() {
  const [localSDP, setLocalSDP] = useState("");
  const [remoteSDP, setRemoteSDP] = useState("");
  const [peerConnection, setPeerConnection] = useState(null);
  const [inviteURL, setInviteURL] = useState("");
  const [dataChannel, setDataChannel] = useState(null);
  const [message, setMessage] = useState("");
  const [receivedMessages, setReceivedMessages] = useState([]);

  useEffect(() => {
    const pc = new RTCPeerConnection({
      iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
    });

    pc.onicecandidate = (event) =>
      event.candidate
        ? console.log("New ICE candidate:", event.candidate)
        : setLocalSDP(pc.localDescription?.sdp || "");

    pc.onconnectionstatechange = () =>
      console.log("Connection State:", pc.connectionState);

    pc.oniceconnectionstatechange = () =>
      console.log("ICE Connection State:", pc.iceConnectionState);

    pc.ondatachannel = (event) => {
      setDataChannel(event.channel);
      event.channel.onopen = () => console.log("Data channel is open!");
      event.channel.onmessage = (e) => {
        console.log("Message received:", e.data);
        setReceivedMessages((prev) => [...prev, e.data]);
      };
    };

    setPeerConnection(pc);
    return () => pc.close();
  }, []);

  const createOffer = async () => {
    if (!peerConnection) return;
    const channel = peerConnection.createDataChannel("chat");
    setDataChannel(channel);
    channel.onopen = () => console.log("Data channel is open!");
    channel.onmessage = (e) => setReceivedMessages((prev) => [...prev, e.data]);

    const offer = await peerConnection.createOffer();
    await peerConnection.setLocalDescription(offer);
    const inviteURL = `${window.location.origin}/?sdp=${encodeURIComponent(offer.sdp)}`;
    setInviteURL(inviteURL);
  };

  const handleRemoteSDP = async () => {
    if (!peerConnection || !remoteSDP) return;
    const remoteDesc = new RTCSessionDescription({ type: "answer", sdp: remoteSDP });
    await peerConnection.setRemoteDescription(remoteDesc);
  };

  const sendMessage = () => {
    if (dataChannel && dataChannel.readyState === "open") {
      dataChannel.send(message);
      setReceivedMessages((prev) => [...prev, `You: ${message}`]);
      setMessage("");
    } else {
      console.log("Data channel is not open.");
    }
  };

  useEffect(() => {
    const query = new URLSearchParams(window.location.search);
    const remoteSDPFromURL = query.get("sdp");
    if (remoteSDPFromURL && peerConnection) {
      const remoteDesc = new RTCSessionDescription({ type: "offer", sdp: remoteSDPFromURL });
      peerConnection.setRemoteDescription(remoteDesc);
      peerConnection.createAnswer().then((answer) => {
        peerConnection.setLocalDescription(answer);
        setLocalSDP(answer.sdp);
        alert("SDP received: \n" + answer.sdp);
        navigator.clipboard.writeText(answer.sdp).then(() => {
          console.log("SDP copied to clipboard");
        });
      });
    }
  }, [peerConnection]);

  return (
    <div className="overflow-y-scroll">
      <h1>WebRTC Connection</h1>
      <button onClick={createOffer}>Create Invite</button>
      {inviteURL && (
        <div>
          <p>Share this URL:</p>
          <textarea
            readOnly
            value={inviteURL}
            style={{ width: "100%", height: "100px" }}
          />
          <p>Or scan this QR code:</p>
          <QRCode value={inviteURL} />
        </div>
      )}

      <div>
        <h2>Set Remote SDP</h2>
        <textarea
          value={remoteSDP}
          onChange={(e) => setRemoteSDP(e.target.value)}
          placeholder="Paste remote SDP here"
          style={{ width: "100%", height: "100px" }}
        />
        <button onClick={handleRemoteSDP}>Set Remote SDP</button>
      </div>

      <div>
        <h2>Local SDP</h2>
        <textarea
          readOnly
          value={localSDP}
          style={{ width: "100%", height: "100px" }}
        />
      </div>

      <div>
        <h2>Chat</h2>
        <div
          style={{
            border: "1px solid #ccc",
            padding: "10px",
            height: "150px",
            overflowY: "scroll",
          }}
        >
          {receivedMessages.map((msg, index) => (
            <div key={index}>{msg}</div>
          ))}
        </div>
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type a message"
          style={{ width: "80%" }}
        />
        <button onClick={sendMessage} style={{ width: "20%" }}>
          Send
        </button>
      </div>
    </div>
  );
}
