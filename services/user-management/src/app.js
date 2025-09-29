import express from "express";
import authRoutes from "../api/auth.js";
import { verifyJWT } from "../middleware/jwt.js";

const app = express();
app.use(express.json());

// auth routes
app.use("/auth", authRoutes);

// protected route for testing JWT
app.get("/protected", verifyJWT, (req, res) => {
    res.json({ message: "Protected content", user: req.user });
});

export default app;
