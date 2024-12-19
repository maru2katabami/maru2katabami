export default async function handler(req, res) {
  const { method, body } = req;

  const cache = {}; // Temporary in-memory storage (consider using a database for production)

  if (method === "POST") {
    const { id, data } = body;
    if (!id || !data) {
      return res.status(400).json({ error: "Missing id or data" });
    }
    cache[id] = data;
    return res.status(200).json({ message: "Data stored successfully" });
  }

  if (method === "GET") {
    const { id } = req.query;
    if (!id || !cache[id]) {
      return res.status(404).json({ error: "Data not found" });
    }
    const data = cache[id];
    delete cache[id]; // Remove data after retrieval
    return res.status(200).json({ data });
  }

  return res.status(405).json({ error: "Method not allowed" });
}