"use client";

import { useRouter } from "next/navigation";

export default function Page() {
  const router = useRouter();

  const createRoom = () => router.push(`/room/${crypto.randomUUID()}`);

  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <div className="p-6 bg-white rounded shadow-md w-11/12 max-w-md">
        <h1 className="text-2xl font-bold text-gray-800 text-center mb-4">
          WebRTC Auto Connect
        </h1>
        <p className="text-gray-700 text-center mb-6">
          ボタンを押して新規ルームを作成し、URL を相手に共有してください。
        </p>
        <button
          onClick={createRoom}
          className="w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
        >
          新規ルームを作成
        </button>
      </div>
    </main>
  );
}
