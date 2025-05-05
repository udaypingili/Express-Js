const express = require('express');
const mongoose = require('mongoose');
const fs = require('fs');

const app = express();
const PORT = 8000;

// Middleware to parse JSON and URL-encoded data
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Logging middleware (before routes)
app.use((req, res, next) => {
  fs.appendFile(
    'log.txt',
    `${Date.now()} - Request: ${req.method} ${req.url}\n`,
    err => {
      if (err) throw err;
      next();
    }
  );
});

// MongoDB connection
mongoose
  .connect('mongodb://127.0.0.1:27017/crud')
  .then(() => console.log('✅ MongoDB Connected'))
  .catch(err => console.log('❌ MongoDB Connection Failed:', err));

// User Schema
const userSchema = new mongoose.Schema({
  first_name: { type: String, required: true },
  last_name: { type: String },
  email: { type: String, required: true, unique: true },
  job_title: { type: String, required: true }
});

const User = mongoose.model('User', userSchema);

// Routes

// GET all users
app.get('/users', async (req, res) => {
  try {
    const users = await User.find({});
    res.status(200).json(users);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch users', error: err.message });
  }
});

// GET user by ID
app.get('/users/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.status(200).json(user);
  } catch (err) {
    res.status(400).json({ message: 'Invalid user ID' });
  }
});

// POST - Create new user
app.post('/api/users', async (req, res) => {
  const { first_name, last_name, email, job_title } = req.body;

  if (!first_name || !email || !job_title) {
    return res.status(400).json({ message: 'Missing required fields: first_name, email, job_title' });
  }

  try {
    const newUser = new User({ first_name, last_name, email, job_title });
    await newUser.save();
    res.status(201).json({ status: 'Created', data: newUser });
  } catch (err) {
    if (err.code === 11000) {
      res.status(409).json({ message: 'Email already exists' });
    } else {
      res.status(500).json({ message: 'Error creating user', error: err.message });
    }
  }
});

// DELETE user by ID
app.delete('/users/:id', async (req, res) => {
  try {
    const result = await User.findByIdAndDelete(req.params.id);
    if (!result) return res.status(404).json({ message: 'User not found' });
    res.status(204).send(); // No content
  } catch (err) {
    res.status(400).json({ message: 'Invalid ID' });
  }
});

// Server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
