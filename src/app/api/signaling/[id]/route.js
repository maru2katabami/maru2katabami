let signalStore = {};

/**
 * POST メソッド: WebRTC のシグナリング情報を保存する
 * @example
 *  body = {
 *    type: 'offer' | 'answer' | 'candidate',
 *    data: { ... }   // offer/answer RTCSessionDescription or ICE Candidate
 *  }
 */
export async function POST(req, { params }) {
  const headers = { "Access-Control-Allow-Origin": "*" }
  const { id } = params;
  const body = await req.json();

  // ID に対応するオブジェクトがまだなければ作成
  if (!signalStore[id]) {
    signalStore[id] = {};
  }

  // candidate の場合は配列に追加、それ以外の場合は一つのキーとして保持
  if (body.type === "candidate") {
    if (!signalStore[id].candidates) {
      signalStore[id].candidates = [];
    }
    signalStore[id].candidates.push(body.data);
  } else {
    signalStore[id][body.type] = body.data;
  }

  return new Response(JSON.stringify({ success: true }), { status: 200, headers });
}

/**
 * GET メソッド: WebRTC のシグナリング情報を取得する
 * @example
 *   /api/signaling/ROOM_ID?type=offer
 *   /api/signaling/ROOM_ID?type=answer
 *   /api/signaling/ROOM_ID?type=candidate
 */
export async function GET(req, { params }) {
  const { id } = params;
  const { searchParams } = new URL(req.url);
  const type = searchParams.get("type");

  if (!signalStore[id]) {
    return new Response(JSON.stringify({ error: "No data found" }), { status: 404 });
  }

  if (type === "candidate") {
    const candidates = signalStore[id].candidates || [];
    return new Response(JSON.stringify({ data: candidates }), { status: 200 });
  }

  const data = signalStore[id][type];
  if (!data) {
    return new Response(JSON.stringify({ error: "No data found" }), { status: 404 });
  }

  return new Response(JSON.stringify({ data }), { status: 200 });
}
