export default function Drawer() {
  return (
    <div className="absolute top-[calc(100%-20px)] w-full h-40 rounded-t-3xl bg-black">
      <div className="absolute top-0 w-full h-5 flex justify-center items-center cursor-pointer group">
        <div className="w-40 group-hover:w-60 h-2 rounded bg-white duration-500"/>
      </div>
    </div>
  )
}