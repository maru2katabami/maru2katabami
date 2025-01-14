import { useEffect, useRef, useMemo } from "react"
import { Zustand } from "@/utils/zustand"
import { useFrame } from "@react-three/fiber"
import { useGLTF } from "@react-three/drei"
import { CanvasTexture } from "three"

export default function Texture() {

  const tickerDataRef = useRef([])
  const xOffsetRow = useRef( 0 )

  const { map } = Zustand()

  const { materials } = useGLTF("/m2k.glb")

  useEffect(() => {
    fetch("https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=100&page=1&sparkline=true&locale=en")
      .then(( res ) => res.json())
      .then(( data ) => {
        tickerDataRef.current = data.map(( item ) => ({
          symbol: item.symbol,
          price: item.current_price,
          change: Number( item.price_change_percentage_24h ).toFixed( 2 ),
          chart24: item.sparkline_in_7d.price.slice( -24 ),
        }))
      })
      .catch( console.error )
  }, [])

  const { canvas, context, texture } = useMemo(() => {
    const canvas = document.createElement("canvas")
    const context = canvas.getContext("2d")
    const texture = new CanvasTexture( canvas )
    const dpr = window.devicePixelRatio || 1
    canvas.width = 3000 * dpr
    canvas.height = 300 * dpr
    context.scale( dpr, dpr )
    return { canvas, context, texture }
  }, [])

  const drawRow = ( context, xOffset, yStart, tickerData ) => {
    const fullData = [ ...tickerData, ...tickerData ]
    fullData.forEach(( data, i ) => {
      const x = xOffset + i * 200 + 10
      const y = yStart
      const chartWidth = 150
      const chartHeight = 50
      const chartData = data.chart24
      const minPrice = Math.min( ...chartData ) * 0.998
      const maxPrice = Math.max( ...chartData ) * 1.002
      context.beginPath()
      chartData.forEach(( price, j ) => {
        const px = x + ( j / ( chartData.length - 1 )) * chartWidth
        const py = y + chartHeight - (( price - minPrice ) / ( maxPrice - minPrice || 1 )) * chartHeight
        j === 0 ? context.moveTo( px, py ): context.lineTo( px, py )
      })
      context.strokeStyle = parseFloat( data.change ) >= 0 ? "rgba(0,255,0,0.9)": "rgba(255,0,0,0.9)"
      context.lineWidth = 1
      context.stroke()

      const gradient = context.createLinearGradient( x, y, x, y + chartHeight )
      if ( parseFloat( data.change ) >= 0 ) {
        gradient.addColorStop( 0, "rgba(0, 255, 0, 0.9)")
        gradient.addColorStop( 1, "rgba(0, 255, 0, 0.0)")
      } else {
        gradient.addColorStop( 0, "rgba(255, 0, 0, 0.9)")
        gradient.addColorStop( 1, "rgba(255, 0, 0, 0.0)")
      }
      context.fillStyle = gradient
      context.beginPath()
      chartData.forEach(( price, j ) => {
        const px = x + ( j / (chartData.length - 1 )) * chartWidth
        const py = y + chartHeight - (( price - minPrice ) / ( maxPrice - minPrice || 1 )) * chartHeight
        j === 0 ? context.moveTo( px, py ): context.lineTo( px, py )
      })
      context.lineTo( x + chartWidth, y + chartHeight )
      context.lineTo( x, y + chartHeight )
      context.closePath()
      context.fill()
      context.fillStyle = "black"
      context.textAlign = "center"
      context.font = "20px Arial"
      context.fillText( data.symbol.toUpperCase(), x + chartWidth / 2, y + 25 )
      context.font = "10px Arial"
      context.fillText(`$${ data.price }`, x + chartWidth / 2, y + 40 )
      context.font = "10px Arial"
      context.fillStyle = parseFloat( data.change ) >= 0 ? "green": "red"
      context.fillText(`${parseFloat( data.change ) >= 0 ? "▲": "▼"} ${ data.change }%`, x + chartWidth / 2, y + 55 )
    })
  }

  useFrame(() => {
    if ( map !== "ticker") return
    context.clearRect( 0, 0, canvas.width, canvas.height )
    const rows = [
      { yStart: 0, offset: 0 },
      { yStart: 60, offset: 100 },
      { yStart: 120, offset: 200 },
      { yStart: 180, offset: 300 },
      { yStart: 240, offset: 400 },
    ]
    const rowData = [
      tickerDataRef.current.filter(( _, index ) => index % 5 === 0 ),
      tickerDataRef.current.filter(( _, index ) => index % 5 === 1 ),
      tickerDataRef.current.filter(( _, index ) => index % 5 === 2 ),
      tickerDataRef.current.filter(( _, index ) => index % 5 === 3 ),
      tickerDataRef.current.filter(( _, index ) => index % 5 === 4 ),
    ]
    rows.forEach(( row, i ) => drawRow( context, xOffsetRow.current + row.offset, row.yStart, rowData[i] ))
    xOffsetRow.current -= 0.5
    if ( xOffsetRow.current <= -200 * rowData[0].length ) xOffsetRow.current = 0
    texture.needsUpdate = true
  })
  

  useEffect(() => {
    if ( map === "ticker") {
      materials.ticker.map = texture
      materials.ticker.needsUpdate = true
      materials.ticker.opacity = 1
    } else {
      materials.ticker.map = null
      materials.ticker.opacity = 0
    }
  }, [ map, materials, texture ])
}
