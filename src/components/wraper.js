"use client"

export const Wraper = ({children}) => {
  return (
    <div
      className="relative size-full pointer-events-none">
      <div
        className="absolute top-1/2 left-1/2 -translate-1/2 size-[calc(100%-40px)] rounded-xl shadow-2xl shadow-black">
        {children}
        <div
          className="absolute top-0 w-full h-12 bg-black/5 flex justify-between items-center shrink-0">
          <div
            className="space-x-2 w-24 h-full flex justify-center items-center">
            <div
              className="size-4 rounded-lg bg-red-400 border border-black/10"/>
            <div
              className="size-4 rounded-lg bg-yellow-400 border border-black/10"/>
            <div
              className="size-4 rounded-lg bg-green-400 border border-black/10"/>
          </div>
          <div
            className="flex-1 h-full font-semibold flex justify-center items-center">
            maru2katabami
          </div>
          <div
            className="w-24 h-full flex justify-around items-center shrink-0">
            <div
              className="size-6 bg-[url(/svg/github.svg)] bg-no-repeat bg-center bg-[size:100%]"/>
            <div
              className="size-6 bg-[url(/svg/setting.svg)] bg-no-repeat bg-center bg-[size:100%]"/>
          </div>
        </div>
      </div>
    </div>
  )
}