"use client"

import { useState, useEffect } from "react"
import { CreateWebWorkerMLCEngine } from "@mlc-ai/web-llm"

const WebLLM = () => {

  const [ engine, setEngine ] = useState( null )
  const [ status, setStatus ] = useState()

  const handleInit = async ( modelID ) => {
    const start = Date.now()
    const newEngine = await CreateWebWorkerMLCEngine(
      new Worker( new URL("./worker.js", import.meta.url ), { type: "module"}),
      modelID,
      { initProgressCallback: report => {
        const match = report.text.match(/\[(\d+)\/(\d+)\]/)
        if ( match !== null ) {
          const elapsed = ( Date.now() - start ) / 1000
          const progress = match[1] / match[2]
          const estimate = ( elapsed / progress ) * ( 1 - progress )
          setStatus({ elapsed, progress, estimate })
        }
      }}
    )
    setEngine( newEngine )
  }

  const handleSubmit = event => {
    event.preventDefault()
  }

  useEffect(() => {
    const CacheCheck = async () => {
      const cache = await caches.open("webllm/model")
      const result = await cache.keys()
      result.length ? handleInit( result[0].url.match(/mlc-ai\/([^/]+)\//)[1]): setStatus( null )
    }
    CacheCheck()
  }, [])

  return { status, handleInit, handleSubmit }
}

export default WebLLM