// hooks/useChat.js
import { useState, useCallback } from "react";

const useChat = (channel) => {
  const [msg, setMsg] = useState("");
  const [msgs, setMsgs] = useState([]);

  const sendMessage = useCallback(() => {
    if (channel?.readyState === "open" && msg.trim() !== "") {
      channel.send(msg);
      setMsgs((prev) => [...prev, `You: ${msg}`]);
      setMsg("");
    } else {
      alert("Data channel is not open or message is empty.");
    }
  }, [channel, msg]);

  return { msg, setMsg, msgs, sendMessage };
};

export default useChat;
