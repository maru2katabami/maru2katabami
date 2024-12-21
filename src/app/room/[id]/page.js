"use client";

import { useState, useEffect } from "react";

export default function RoomPage({ params }) {
  const roomId = params.id;
  const [peerConnection, setPeerConnection] = useState(null);
  const [dataChannel, setDataChannel] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [status, setStatus] = useState("idle");
  const [currentUrl, setCurrentUrl] = useState("");

  // URL を取得してステートに格納
  useEffect(() => {
    if (typeof window !== "undefined") {
      setCurrentUrl(window.location.href);
    }
  }, []);

  // ページ読み込み時に接続開始
  useEffect(() => {
    connect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

  // ======== URL をクリップボードにコピー ========
  const copyUrlToClipboard = () => {
    if (currentUrl) {
      navigator.clipboard.writeText(currentUrl);
      alert("URL をコピーしました！");
    }
  };

  // ======== UI ========
  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h1 className="text-2xl font-bold text-gray-800">Room ID: {roomId}</h1>
      <div className="my-4 p-4 bg-white rounded shadow">
        <p className="text-gray-700">
          この URL を相手に共有すると、相手はこのページにアクセスするだけで自動で接続が始まります。
        </p>
        <div className="flex items-center gap-2 mt-2">
          <span className="break-all text-sm text-blue-600">{currentUrl}</span>
          <button
            onClick={copyUrlToClipboard}
            className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            コピー
          </button>
        </div>
      </div>

      <hr className="my-6 border-gray-300" />

      <div>
        <h2 className="text-lg font-semibold text-gray-800">接続ステータス: {status}</h2>
        {status === "connected" && (
          <div className="mt-4">
            <h2 className="text-xl font-semibold text-gray-800">Chat</h2>
            <div className="border rounded p-4 h-52 overflow-y-auto bg-white shadow-inner">
              {messages.map((msg, index) => (
                <div key={index} className="text-gray-700">
                  {msg}
                </div>
              ))}
            </div>
            <div className="flex items-center gap-2 mt-4">
              <input
                type="text"
                placeholder="メッセージを入力"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                className="flex-1 p-2 border rounded bg-gray-50"
              />
              <button
                onClick={sendMessage}
                className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
              >
                送信
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
