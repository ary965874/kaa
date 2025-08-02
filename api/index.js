export default async function handler(req, res) {
  return res.status(200).json({
    success: true,
    message: "Welcome to HDHub4u API 👋",
    endpoints: {
      home: "/api/home",
      post: "/api/post?url=<encoded_url>"
    }
  });
}
