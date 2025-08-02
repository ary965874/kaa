module.exports = (req, res) => {
    res.json({
        message: "Welcome to HDHub4u API 👋",
        routes: {
            home: "/api/home",
            post: "/api/post?url=POST_URL"
        }
    });
};
