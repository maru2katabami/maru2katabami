import { useEffect, useState } from "react"

export const Web3 = ({ isOpen }) => {

  const [account, setAccount] = useState(null)

  const Symbols = {
    "0x1": "ETH",       // Ethereum Mainnet
    "0x89": "POL",      // Polygon Mainnet
    "0x38": "BNB",      // BNB Smart Chain Mainnet
    "0xa86a": "AVAX",   // Avalanche C-Chain
    "0xa4b1": "ETH",    // Arbitrum One
    "0x2105": "ETH",    // Base Mainnet
    "0x5": "ETH",       // Goerli Testnet
    "0xaa36a7": "ETH",  // Sepolia Testnet
    "0x279f": "MON"     // Monad Testnet
  }

  const handleConnect = async () => {
    if (!window.ethereum || account) return
    const chainId = await window.ethereum.request({ method: "eth_chainId"})
    const [address] = await window.ethereum.request({ method: "eth_requestAccounts"})
    const balance = Number(await window.ethereum.request({ method: "eth_getBalance", params: [address]})) / 10 ** 18
    const name = `${ address.slice(0, 5)}...${ address.slice(-4)}`
    const symbol = Symbols[chainId] || "undefined"
    setAccount({ chainId, address, balance, name, symbol })
  }

  useEffect(() => {
    window.ethereum.on("chainChanged", handleConnect) 
  }, [])

  return (
    <div className={`${ isOpen ? "p-1 space-x-2 w-70 h-10": "w-0 h-0 opacity-0 pointer-events-none"} flex items-center duration-500`}>
      <div className="p-1 h-8 rounded-3xl border-2 flex items-center" onClick={ handleConnect }>
        <div className="size-6 rounded-3xl" style={{ background: `url(/${ account ? account.chainId: "metamask"}.png) center /100%`}}/>
        <div className="p-1 text-xl font-bold font-stretch-50%">{ account ? account.name: "Connect Metamask"}</div>
      </div>
      <div className={`space-x-1 font-black font-stretch-[25%] flex items-start ${ account ? "": "hidden"}`}>
        <div className="text-2xl">{ account?.balance.toFixed(4)}</div>
        <div className="text-xs">{ account?.symbol }</div>
      </div>
    </div>
  )
}