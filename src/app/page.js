"use client"

import { useState, useEffect } from "react";
import QRCode from "react-qr-code";

export default function WebRTCPage() {
  const [isAnswerSide, setIsAnswerSide] = useState(false);
  const [opened, setOpened] = useState(false);
  const [localSDP, setLocalSDP] = useState("");
  const [remoteSDP, setRemoteSDP] = useState("");
  const [peerConnection, setPeerConnection] = useState(null);
  const [inviteURL, setInviteURL] = useState("");
  const [dataChannel, setDataChannel] = useState(null);
  const [message, setMessage] = useState("");
  const [receivedMessages, setReceivedMessages] = useState([]);

  useEffect(() => {
    const pc = new RTCPeerConnection({ iceServers: [{ urls: "stun:stun.l.google.com:19302" }]})

    pc.onicecandidate = event => {
      if ( event.candidate ) {
      } else {
        setLocalSDP(pc.localDescription?.sdp || "")
      }
    }

    pc.ondatachannel = event => {
      const channel = event.channel
      setDataChannel( channel )
      channel.onopen = () => setOpened( true )
      channel.onmessage = (e) => setReceivedMessages( prev => [ ...prev, `anonymos ${ e.data }`])
    }

    setPeerConnection( pc )

    const query = new URLSearchParams( window.location.search )
    const remoteSDPFromURL = query.get("sdp")
    remoteSDPFromURL ? handleIncomingOffer( pc, remoteSDPFromURL ): createOffer( pc )
    return () => pc.close()
  }, [])

  const createOffer = async ( pc ) => {
    const channel = pc.createDataChannel("chat")
    setDataChannel( channel )
    channel.onopen = () => setOpened( true )
    channel.onmessage = e => setReceivedMessages( prev => [ ...prev, e.data ])
    const offer = await pc.createOffer()
    await pc.setLocalDescription( offer )
    setInviteURL(`${ window.location.origin }/?sdp=${ encodeURIComponent( offer.sdp )}`)
  }

  const handleIncomingOffer = async ( pc, sdp ) => {
    setIsAnswerSide( true )
    const remoteDesc = new RTCSessionDescription({ type: "offer", sdp })
    await pc.setRemoteDescription( remoteDesc )
    const answer = await pc.createAnswer()
    await pc.setLocalDescription( answer )
    setLocalSDP( answer.sdp )
  }

  const handleRemoteSDP = async () => {
    if ( !peerConnection ) return
    const sdp = await navigator.clipboard.readText()
    const remoteDesc = new RTCSessionDescription({ type: "answer", sdp })
    await peerConnection.setRemoteDescription( remoteDesc )
  }

  const handleCopy = async ( text ) => {
    await navigator.clipboard.writeText( text )
    alert("Copied to clipboard")
  }

  const sendMessage = () => {
    if ( dataChannel?.readyState === "open") {
      dataChannel.send( message )
      setReceivedMessages( prev => [ ...prev, `You: ${ message }`])
      setMessage("")
    } else {
      alert("Data channel is not open.")
    }
  }

  return (
    <main className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
      { !opened ? (
        isAnswerSide ? (
          <div className="flex flex-col items-center justify-center space-y-4">
            <h1 className="text-2xl font-bold">Copy Your SDP</h1>
            <button
              onClick={() => handleCopy(localSDP)}
              className="px-4 py-2 bg-blue-500 rounded hover:bg-blue-600">
              Copy SDP
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center space-y-6">
            {inviteURL && (
              <div className="text-center space-y-4">
                <div
                  className="w-64 h-8 truncate px-4 py-2 bg-gray-800 rounded-lg cursor-pointer text-sm"
                  onClick={() => handleCopy( inviteURL )}>
                  { inviteURL }
                </div>
                <QRCode value={ inviteURL } className="shadow-lg cursor-pointer" onClick={() => handleCopy( inviteURL )}/>
              </div>
            )}
            <button
              onClick={ handleRemoteSDP }
              className="px-4 py-2 bg-green-500 rounded hover:bg-green-600">
              Set Remote SDP
            </button>
          </div>
        )
      ) : (
        <div className="max-w-md w-full bg-gray-800 p-6 rounded-lg shadow-lg">
          <h2 className="text-xl font-bold mb-4">Chat</h2>
          <div className="border border-gray-700 p-4 h-40 overflow-y-scroll rounded-lg mb-4 bg-gray-900">
            { receivedMessages.map(( msg, index ) => (
              <div key={ index } className="text-sm text-gray-300">
                { msg }
              </div>
            ))}
          </div>
          <div className="flex items-center space-x-2">
            <input
              type="text"
              value={ message }
              onChange={ e => setMessage( e.target.value )}
              placeholder="Type a message"
              className="flex-1 px-4 py-2 border border-gray-700 rounded bg-gray-900 text-white"/>
            <button
              onClick={ sendMessage }
              className="px-4 py-2 bg-blue-500 rounded hover:bg-blue-600">
              Send
            </button>
          </div>
        </div>
      )}
    </main>
  )
}