"use client"

import { usePathname, useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Web3 } from "./web3"

export const Dashboard = () => {

  const path = usePathname()
  const router = useRouter()

  const [isOpen, setIsOpen] = useState(false)
  
  const handleClick = e => {
    if (e.target.closest("#dashboard")) {
      setIsOpen(true)
    } else {
      setIsOpen(false)
    }
  }

  return (
    <div className={`absolute top-0 z-20 size-full ${ isOpen ? "bg-white/80": "pointer-events-none"} duration-500`} onClick={ handleClick }>
      <div className="absolute top-3 right-3 rounded-3xl bg-white border-4 pointer-events-auto overflow-hidden" id="dashboard">
        <div className="flex items-center">
          <Web3 isOpen={ isOpen }/>
          <div className={`size-10 bg-[url(/m2kInner.png)] bg-[size:100%] ${ isOpen ? "rotate-360": "rotate-0"} duration-500`}/>
        </div>
        <div className={`${ isOpen ? "p-1 space-x-2 w-80 h-10": "w-0 h-0 opacity-0"} font-black font-stretch-50% flex items-center duration-500`}>
          {["/2048", "/M2K"].map((item, index) => (
          <div className={`px-2 rounded-3xl border-2 ${ item === path && "text-green-500"}`} onClick={() => router.push(item)} key={ index }>{ item.slice(1)}</div>
          ))}
        </div>
      </div>
    </div>
  )
}