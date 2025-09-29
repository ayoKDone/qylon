import express from "express";
import supabase from "../supabaseClient.js";

const router = express.Router();

// Register
router.post("/register", async (req, res) => {
    const { email, password } = req.body;

    try {
        const { data, error } = await supabase.auth.signUp({ email, password });
        if (error) return res.status(400).json({ error: error.message });

        res.status(201).json({ message: "User registered", user: data.user });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Login
router.post("/login", async (req, res) => {
    const { email, password } = req.body;

    try {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) {
            return res.status(401).json({ error: error.message });
        }

        const token = data.session.access_token;

        res.json({
            message: "Login successful",
            token,
            user: data.user,
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Logout
router.post("/logout", async (req, res) => {
    try {

        const { error } = await supabase.auth.signOut();
        if (error) return res.status(400).json({ error: error.message });

        res.json({ message: "Logged out successfully" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

export default router;
