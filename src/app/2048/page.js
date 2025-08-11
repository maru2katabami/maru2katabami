"use client"

import { useReducer, useEffect, useCallback, useRef } from "react"
import { motion } from "framer-motion"

const SIZE = 4, SWIPE = 30
const COLORS = {
  2: "#eee4da",
  4: "#ede0c8",
  8: "#f2b179",
  16: "#f59563",
  32: "#f67c5f",
  64: "#f65e3b",
  128: "#edcf72",
  256: "#edcc61",
  512: "#edc850",
  1024: "#edc53f",
  2048: "#edc22e",
}

const key = (x, y)=>`${ x },${ y }`
const sig = a => a.map(t=>`${ t.x }:${ t.y }:${ t.value }`).sort().join("|")

const genTile = (tiles, nextId)=>{
  const occ = new Set(tiles.map(t=>key(t.x, t.y)))
  const empty=[]
  for (let y = 0; y < SIZE; y++) for (let x = 0; x < SIZE; x++) if(!occ.has(key(x, y))) empty.push({ x, y })
  if(!empty.length) return null
  const { x, y } =empty[(Math.random()*empty.length)|0]
  return { id: nextId, x, y, value: Math.random() < 0.9 ? 2: 4, merged: false }
}

const canMove = (tiles)=>{
  const g = Array.from({ length: SIZE }, () => Array(SIZE).fill(null))
  for (const t of tiles) g[t.y][t.x] = t.value
  for (let y = 0; y < SIZE; y++) for (let x = 0; x < SIZE; x++) {
    const v = g[y][x]; if(v == null) return true
    if( x + 1 < SIZE && g[y][x+1] === v) return true
    if( y + 1 < SIZE && g[y+1][x] === v) return true
  }
  return false
}

const scan = (dir, i, j) => dir === "left" ? { x: j, y: i }: dir === "right" ? { x: SIZE - 1 - j, y: i }: dir === "up" ? { x: i, y: j }: { x: i, y: SIZE - 1 - j }
const place= (dir, i, k) => dir === "left" ? { x: k, y: i }: dir === "right" ? { x: SIZE - 1 - k, y: i }: dir === "up" ? { x: i, y: k }: { x: i, y: SIZE - 1 - k }

const moveTiles = (state, dir) => {
  const g = Array.from({ length: SIZE }, () => Array(SIZE).fill(null))
  state.tiles.forEach(t => g[t.y][t.x] = { ...t, merged: false })

  let nextId = state.nextId, scoreGain = 0
  const out = []

  for (let i = 0; i < SIZE; i++) {
    const line = []
    for (let j = 0; j < SIZE; j++) { const { x, y } = scan(dir, i, j); g[y][x] && line.push(g[y][x]) }
    for (let k = 0; k < line.length - 1; k++){
      if (!line[k].merged && line[k].value === line[k + 1].value) {
        line[k].value *= 2; line[k].merged = true; scoreGain += line[k].value; line.splice(k + 1, 1)
      }
    }

    line.forEach((t, k) => { const { x ,y } = place(dir, i, k); out.push({ id: t.merged ? nextId++: t.id, x, y, value: t.value, merged: t.merged })})
  }
  return { tiles: out, scoreGain, nextId }
}

const initState=()=>({
  tiles: [{ id: 0, x: 0, y: 0, value: 2, merged: false }, { id: 1, x: 1, y: 0, value: 2, merged: false }],
  score: 0, nextId: 2, gameOver: false
})

function reducer(state, action){
  if (action.type === "RESET") return initState()
  if (action.type !== "MOVE" || state.gameOver) return state

  const { tiles, scoreGain, nextId } = moveTiles(state, action.dir)
  if (sig(state.tiles) === sig(tiles)) return { ...state,gameOver: !canMove(state.tiles)}

  const spawned = genTile(tiles, nextId)
  const newTiles = spawned ? [...tiles, spawned]: tiles
  return { ...state, tiles: newTiles, score: state.score + scoreGain, nextId: spawned? nextId + 1: nextId, gameOver: !canMove(newTiles)}
}

function useGame(){
  const [state, dispatch] = useReducer(reducer, undefined, initState)
  const move = useCallback(dir => dispatch({ type: "MOVE", dir}),[])
  const reset = useCallback(() => dispatch({ type: "RESET"}),[])
  const start = useRef({ x: 0, y: 0 })

  useEffect(()=>{
    const onKey = e => {
      if (!e.key.startsWith("Arrow")) return
      e.preventDefault()
      move(e.key.slice(5).toLowerCase())
    }
    const onStart = e => { const t = e.touches?.[0]; if (t) start.current={ x: t.clientX, y: t.clientY }}
    const onEnd = e => {
      const t = e.changedTouches?.[0]; if (!t) return
      const dx = t.clientX - start.current.x, dy = t.clientY - start.current.y
      const ax = Math.abs(dx), ay = Math.abs(dy)
      if (ax > ay) { if (dx > SWIPE) move("right"); else if (dx < -SWIPE) move("left") }
      else { if (dy > SWIPE) move("down"); else if (dy < -SWIPE) move("up") }
    }
    window.addEventListener("keydown",onKey, { passive: false })
    window.addEventListener("touchstart",onStart, { passive: true })
    window.addEventListener("touchend",onEnd, { passive: true })
    return ()=>{
      window.removeEventListener("keydown", onKey)
      window.removeEventListener("touchstart", onStart)
      window.removeEventListener("touchend", onEnd)
    }
  },[move])

  return { state, reset }
}

export default function Page() {

  const { state: { tiles, score, gameOver }, reset } = useGame()

  return (
    <main onContextMenu={e => e.preventDefault()}>
      <div className="mx-auto p-5 space-y-5 w-full max-w-sm">
        <div className="w-full flex justify-between items-center">
          <div className="text-3xl font-black font-stretch-[25%]">SCORE: { score }</div>
        </div>

        <div className="relative">
          <div className="grid grid-cols-4 grid-rows-4 gap-2 p-2 bg-black rounded-xl aspect-square">
            { Array.from({ length: SIZE * SIZE }).map((_, i)=>(
            <div key={ i } className="bg-white rounded-lg" style={{ gridColumnStart: (i % SIZE) + 1, gridRowStart: (i / SIZE | 0) + 1 }}/>
            ))}
            { tiles.map(t=>(
              <motion.div
                layout key={ t.id } initial={{ scale: 0.1 }}
                animate={ t.merged ? { scale: [1.3, 1]}: { scale: 1 }}
                transition={{ type: "spring", stiffness: 500, damping:30 }}
                style={{ backgroundColor: COLORS[t.value] ?? "#ccc", gridColumnStart: t.x + 1, gridRowStart: t.y + 1 }}
                className="rounded-lg flex items-center justify-center text-4xl font-black font-stretch-[25%] overflow-visible">
                { t.value }
              </motion.div>
            ))}
          </div>

          { gameOver &&
          <div className="absolute z-10 inset-0 rounded-xl bg-red-200/80 flex justify-center items-center">
            <div className="p-6 space-y-5 text-center">
              <div className="text-5xl font-black font-stretch-[25%] tracking-wide">Game Over</div>
              <div onClick={ reset } className="px-4 py-2 rounded-lg bg-black text-white font-black">
                Restart
              </div>
            </div>
          </div>
          }
        </div>
      </div>
    </main>
  )
}