import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const port = 5000;
const app = express();
app.use(express.json());
app.use(cors({ origin: true }));

const url = "mongodb+srv://mentesairam:sairam3373@cluster0.v9vulyz.mongodb.net/?retryWrites=true";

const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true }
});

const Text = mongoose.model('text', userSchema);

mongoose.connect(url, {
    dbName: "Full_Stack_Project"
}).then(() => {
    console.log("Connected to the database");
}).catch(err => {
    console.error(err);
});

app.post('/signup', async (req, res) => {
    const { username, password, repassword } = req.body;

    try {
        const existingUser = await Text.findOne({ username });
        if (existingUser) {
            return res.status(400).json({ error: "Username already exists" });
        }

        if (password !== repassword) {
            return res.status(400).json({ error: "Passwords do not match" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = new Text({ username, password: hashedPassword });
        await user.save();
        return res.status(201).json({ message: "User created successfully", user });
    } catch (e) {
        return res.status(500).json({ error: e.message });
    }
});


app.post('/login', async (req, res) => {
    const { username, password } = req.body;

    try {
        const user = await Text.findOne({ username });
        if (!user) {
            return res.status(401).json({ success: false, message: 'Invalid username' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ success: false, message: 'Invalid  password' });
        }

        const token = jwt.sign({ id: user._id, username: user.username }, 'your_jwt_secret', { expiresIn: '1h' });
        return res.json({ success: true, token });
    } catch (error) {
        return res.status(500).json({ success: false, message: 'Server error' });
    }
});

app.listen(port, () => {
    console.log(`Listening on port ${port}`);
});
