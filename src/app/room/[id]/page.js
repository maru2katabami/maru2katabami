"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";

export default function RoomPage({ params }) {
  const roomId = params.id;
  const [peerConnection, setPeerConnection] = useState(null);
  const [dataChannel, setDataChannel] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [status, setStatus] = useState("idle");

  // データチャネルが open になったら状態を "connected" に更新
  useEffect(() => {
    if (dataChannel && dataChannel.readyState === "open") {
      setStatus("connected");
    }
  }, [dataChannel]);

  // ======== WebRTC 初期化 ========

  const initializeConnection = () => {
    const pc = new RTCPeerConnection({
      iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
    });

    pc.onicecandidate = async (event) => {
      if (event.candidate) {
        // ICE Candidate をシグナリングサーバーに送信
        await fetch(`/api/signaling/${roomId}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ type: "candidate", data: event.candidate }),
        });
      }
    };

    pc.ondatachannel = (event) => {
      const channel = event.channel;
      channel.onmessage = (e) => {
        setMessages((prev) => [...prev, `相手: ${e.data}`]);
      };
      setDataChannel(channel);
    };

    setPeerConnection(pc);
    return pc;
  };

  // ======== シグナリングヘルパー ========

  // ICE Candidates の取得・追加
  const getIceCandidates = async (pc) => {
    const res = await fetch(`/api/signaling/${roomId}?type=candidate`);
    if (res.status === 200) {
      const { data: candidates } = await res.json();
      if (Array.isArray(candidates)) {
        for (const candidate of candidates) {
          await pc.addIceCandidate(new RTCIceCandidate(candidate));
        }
      }
    }
  };

  // オファーをポーリングで取得
  const fetchOffer = async () => {
    while (true) {
      const res = await fetch(`/api/signaling/${roomId}?type=offer`);
      if (res.status === 200) {
        return await res.json();
      }
      // オファーがまだなければ 1 秒後に再試行
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  };

  // アンサーをポーリングで取得
  const pollAnswer = async () => {
    while (true) {
      try {
        const res = await fetch(`/api/signaling/${roomId}?type=answer`);
        if (res.status === 200) {
          const data = await res.json();
          return data;
        }
      } catch (error) {
        console.log("アンサーがまだ見つかりません。再試行中...");
      }
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  };

  // ======== 接続処理のエントリーポイント ========

  const connect = async () => {
    setStatus("connecting");

    const pc = initializeConnection();

    // まずはシグナリングサーバーからオファーを取得できるか試す
    const res = await fetch(`/api/signaling/${roomId}?type=offer`);

    if (res.status === 404) {
      // まだオファーが無い (= 自分がオファー側)
      const channel = pc.createDataChannel("chat");
      channel.onmessage = (e) => {
        setMessages((prev) => [...prev, `相手: ${e.data}`]);
      };
      setDataChannel(channel);

      // Offer を作成してローカルにセット
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      // シグナリングサーバーに送信
      await fetch(`/api/signaling/${roomId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "offer", data: offer }),
      });

      // 相手がアンサーを返すまで待機
      const { data: answer } = await pollAnswer();
      await pc.setRemoteDescription(new RTCSessionDescription(answer));

      // 相手が投げた ICE Candidates も取得して追加
      await getIceCandidates(pc);

      setStatus("connected");
    } else {
      // 既にオファーがある (= 自分がアンサー側)
      const { data: offer } = await fetchOffer();
      await pc.setRemoteDescription(new RTCSessionDescription(offer));

      // アンサーを作成
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);

      // シグナリングサーバーに送信
      await fetch(`/api/signaling/${roomId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "answer", data: answer }),
      });

      // 相手が投げた ICE Candidates も取得して追加
      await getIceCandidates(pc);

      setStatus("connected");
    }
  };

  // ======== メッセージ送信 ========

  const sendMessage = () => {
    if (dataChannel && dataChannel.readyState === "open") {
      dataChannel.send(newMessage);
      setMessages((prev) => [...prev, `自分: ${newMessage}`]);
      setNewMessage("");
    } else {
      alert("データチャネルが接続されていません");
    }
  };

  // ======== UI ========

  return (
    <div style={{ padding: "1rem" }}>
      <h1>Room ID: {roomId}</h1>
      <p>
        この URL を相手に共有すると、相手はこのページを開くだけで自動的に
        WebRTC 接続を始めます。
      </p>

      <button onClick={connect} disabled={status === "connecting" || status === "connected"}>
        {status === "connecting" ? "接続中..." : "接続開始"}
      </button>

      {status === "connected" && (
        <div style={{ marginTop: "1rem" }}>
          <h2>Chat</h2>
          <div
            style={{
              border: "1px solid #ccc",
              padding: "10px",
              height: "200px",
              overflowY: "auto",
              marginBottom: "1rem",
            }}
          >
            {messages.map((msg, index) => (
              <div key={index}>{msg}</div>
            ))}
          </div>
          <input
            type="text"
            placeholder="メッセージを入力"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
          />
          <button onClick={sendMessage}>送信</button>
        </div>
      )}
    </div>
  );
}
