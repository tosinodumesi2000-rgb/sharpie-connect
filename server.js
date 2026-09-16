const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

const app = express();
app.use(express.json());
app.use(cors());

// 1. serve front-end files seamlessly
app.use(express.static(path.join(__dirname, '/')));

// 2. Connect to database cluster network
// (We will replace this example link with your real MongoDB Atlas connection key later!)
const mongoURI = process.env.MONGO_URI || "mongodb://localhost:27017/sharpie_connect";
mongoose.connect(mongoURI)
    .then(() => console.log("🔒 Secured Database Ledger Grid Connected Successfully!"))
    .catch(err => console.error("❌ Database link error:", err));

// 3. Define how user account data is stored permanently
const UserSchema = new mongoose.Schema({
    telegramId: { type: String, required: true, unique: true },
    username: String,
    coinBalance: { type: Number, default: 0.00 },
    walletStars: { type: Number, default: 1000 },
    escrowStars: { type: Number, default: 0 },
    lastMiningTime: { type: Date, default: null },
    isProvider: { type: Boolean, default: false },
    profilePrice: { type: Number, default: 300 }
});
const User = mongoose.model('User', UserSchema);

// 4. API Endpoint: Fetch or create a user account profile dashboard metrics
app.post('/api/user/sync', async (req, res) => {
    const { telegramId, username } = req.body;
    try {
        let user = await User.findOne({ telegramId });
        if (!user) {
            user = new User({ telegramId, username });
            await user.save();
        }
        res.json({ success: true, data: user });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// 5. API Endpoint: Initialize Anti-Scam Protection Escrow holding lock state
app.post('/api/escrow/book', async (req, res) => {
    const { telegramId, bookingType, cost } = req.body;
    try {
        let user = await User.findOne({ telegramId });
        if (!user || user.walletStars < cost) {
            return res.status(400).json({ success: false, message: "Insufficient account balance metrics!" });
        }
        
        // Lock funds safely inside app transaction vault layers
        user.walletStars -= cost;
        user.escrowStars += cost;
        await user.save();
        
        res.json({ success: true, message: `${bookingType} secured in App Escrow vault.`, data: user });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// 6. API Endpoint: Complete meetup validation or refund transaction layers
app.post('/api/escrow/resolve', async (req, res) => {
    const { telegramId, action, cost } = req.body;
    try {
        let user = await User.findOne({ telegramId });
        if (!user || user.escrowStars < cost) {
            return res.status(400).json({ success: false, message: "No active escrow transaction found." });
        }
        
        user.escrowStars -= cost;
        if (action === 'refund') {
            user.walletStars += cost; // Send money safely straight back to guy balance account
        }
        await user.save();
        
        res.json({ success: true, message: `Transaction resolved with state: ${action}`, data: user });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// Start the core deployment server listener pipes
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Sharpie Connect Engine listening live on network port ${PORT}`));
