const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

const app = express();
app.use(express.json());
app.use(cors());

app.use(express.static(path.join(__dirname, '/')));

// Database Pipeline Configuration
const mongoURI = process.env.MONGO_URI || "mongodb://localhost:27017/sharpie_connect";
mongoose.connect(mongoURI)
    .then(() => console.log("🔒 Secured MongoDB Atlas Cluster Engaged!"))
    .catch(err => console.error("❌ Link connection error:", err));

// Complete Account Profile Data Schema Ledger
const UserSchema = new mongoose.Schema({
    telegramId: { type: String, required: true, unique: true },
    username: String,
    coinBalance: { type: Number, default: 0.00 },
    walletStars: { type: Number, default: 0 },
    escrowStars: { type: Number, default: 0 },
    isProvider: { type: Boolean, default: false },
    profilePrice: { type: Number, default: 300 }
});
const User = mongoose.model('User', UserSchema);

// SEED DATA GENERATOR PIPELINE
async function seedProviderGridData() {
    try {
        const count = await User.countDocuments({ isProvider: true });
        if (count === 0) {
            await User.create([
                { telegramId: "prov_1", username: "Jessica_Connect", walletStars: 0, escrowStars: 0, isProvider: true, profilePrice: 300 },
                { telegramId: "prov_2", username: "Blessing_LagosHub", walletStars: 0, escrowStars: 0, isProvider: true, profilePrice: 400 },
                { telegramId: "prov_3", username: "Chioma_AbujaX", walletStars: 0, escrowStars: 0, isProvider: true, profilePrice: 500 }
            ]);
            console.log("💎 Operational Match Grid seeded successfully into cloud folders!");
        }
    } catch(e) { console.log(e); }
}
seedProviderGridData();

// 1. Sync or Create User Metric Profiles
app.post('/api/user/sync', async (req, res) => {
    const { telegramId, username, coinBalance } = req.body;
    try {
        let user = await User.findOne({ telegramId });
        if (!user) {
            user = new User({ telegramId, username });
            await user.save();
        } else if (coinBalance !== undefined) {
            user.coinBalance = coinBalance;
            await user.save();
        }
        res.json({ success: true, data: user });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// 2. Fetch Active Providers Scrolling List Grid
app.get('/api/providers/list', async (req, res) => {
    try {
        const list = await User.find({ isProvider: true });
        res.json({ success: true, data: list });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// 3. Deposit Stars to User Balance
app.post('/api/wallet/deposit', async (req, res) => {
    const { telegramId, amount } = req.body;
    try {
        let user = await User.findOne({ telegramId });
        if (!user) return res.status(404).json({ success: false, message: "Account profile missing." });
        
        user.walletStars += amount;
        await user.save();
        
        res.json({ success: true, data: user });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// 4. Engage Anti-Scam Protection Escrow Funds Vault Lock
app.post('/api/escrow/book', async (req, res) => {
    const { telegramId, cost } = req.body;
    try {
        let user = await User.findOne({ telegramId });
        if (!user || user.walletStars < cost) {
            return res.status(400).json({ success: false, message: "Insufficient wallet deposit balance parameters." });
        }
        
        user.walletStars -= cost;
        user.escrowStars += cost;
        await user.save();
        
        res.json({ success: true, data: user });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// 5. Release or Refund Escrow States
app.post('/api/escrow/resolve', async (req, res) => {
    const { telegramId, action, cost } = req.body;
    try {
        let user = await User.findOne({ telegramId });
        if (!user || user.escrowStars < cost) {
            return res.status(400).json({ success: false, message: "No active escrow transaction found." });
        }
        
        user.escrowStars -= cost;
        if (action === 'refund') {
            user.walletStars += cost;
        }
        await user.save();
        
        res.json({ success: true, data: user });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Sharpie Connect Engine listening on network port ${PORT}`));
           
