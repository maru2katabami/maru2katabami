// hooks/useWebRTC.js
import { useState, useEffect, useCallback } from "react";

const useWebRTC = (encrypt, decrypt) => {
  const [peer, setPeer] = useState(null);
  const [localSDP, setLocalSDP] = useState("");
  const [inviteURL, setInviteURL] = useState("");
  const [isAnswer, setIsAnswer] = useState(false);
  const [loading, setLoading] = useState(false);
  const [channel, setChannel] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const [msgs, setMsgs] = useState([]);

  useEffect(() => {
    const pc = new RTCPeerConnection({
      iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
    });

    pc.onicecandidate = (e) => {
      if (!e.candidate && pc.localDescription) {
        setLocalSDP(encrypt(pc.localDescription.sdp));
      }
    };

    pc.ondatachannel = (e) => {
      setupDataChannel(e.channel);
    };

    setPeer(pc);

    const params = new URLSearchParams(window.location.search);
    const sdp = params.get("sdp");
    if (sdp) {
      handleIncomingOffer(pc, decrypt(sdp));
    } else {
      createOffer(pc);
    }

    return () => pc.close();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const setupDataChannel = useCallback((dc) => {
    setChannel(dc);
    dc.onopen = () => setIsOpen(true);
    dc.onmessage = (e) => setMsgs((prev) => [...prev, `Anonymous: ${e.data}`]);
  }, []);

  const createOffer = useCallback(async (pc) => {
    const dc = pc.createDataChannel("chat");
    setupDataChannel(dc);
    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);
    const encryptedSDP = encrypt(offer.sdp);
    const url = `${window.location.origin}/?sdp=${encodeURIComponent(encryptedSDP)}`;
    setInviteURL(url);
  }, [encrypt, setupDataChannel]);

  const handleIncomingOffer = useCallback(async (pc, sdp) => {
    setIsAnswer(true);
    await pc.setRemoteDescription(new RTCSessionDescription({ type: "offer", sdp }));
    const answer = await pc.createAnswer();
    await pc.setLocalDescription(answer);
    setLocalSDP(encrypt(answer.sdp));
  }, [encrypt]);

  const setRemoteSDP = useCallback(async (sdp) => {
    if (peer) {
      await peer.setRemoteDescription(new RTCSessionDescription({ type: "answer", sdp }));
    }
  }, [peer]);

  return {
    peer,
    localSDP,
    inviteURL,
    isAnswer,
    loading,
    setLoading,
    channel,
    isOpen,
    msgs,
    setRemoteSDP,
  };
};

export default useWebRTC;
