import { useWebLLM } from "@/hooks"
import Installer from "./install"

export default function WebLLM() {

  const { status, handleInit, handleSubmit } = useWebLLM()

  return (
    <div className="absolute bottom-0 p-1 w-full rounded-t-3xl bg-gray-500 flex flex-wrap">
    { status ? status.progress === 1 ?
      <div>

      </div>:
      <div className="p-1 space-x-2 w-full h-10 flex justify-between items-center">
        <div className="p-2 rounded-3xl bg-white">{`past ${ Number( status.elapsed ).toFixed( 2 )} sec`}</div>
        <div className="p-2 rounded-3xl bg-white">{`progress ${ Number( status.progress * 100 ).toFixed( 0 )} % `}</div>
        <div className="p-2 rounded-3xl bg-white">{`left ${ Number( status.estimate ).toFixed(0)} sec`}</div>
      </div>: status !== null ?
      <div className="p-1 space-x-2 w-full h-10"/>:
      <Installer handleInit={ handleInit }/>
    }
    </div>
  )
} 