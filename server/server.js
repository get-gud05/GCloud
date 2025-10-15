const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const cors = require('cors');

const app = express();
const SECRET = 'mysecret';
const USERS_FILE = './users.json';

app.use(cors());
app.use(express.json());

// create users.json if it doesn't exist
if (!fs.existsSync(USERS_FILE)) fs.writeFileSync(USERS_FILE, JSON.stringify([]));

// Signup
app.post('/signup', async (req, res) => {
  const { username, password } = req.body;
  const users = JSON.parse(fs.readFileSync(USERS_FILE));

  if (users.find(u => u.username === username)) {
    return res.status(400).json({ message: 'User already exists' });
  }

  const hashed = await bcrypt.hash(password, 10);
  users.push({ username, password: hashed });
  fs.writeFileSync(USERS_FILE, JSON.stringify(users));

  res.json({ message: 'User created' });
});

// Login
app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  const users = JSON.parse(fs.readFileSync(USERS_FILE));
  const user = users.find(u => u.username === username);
  if (!user) return res.status(400).json({ message: 'User not found' });

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) return res.status(400).json({ message: 'Invalid password' });

  const token = jwt.sign({ username }, SECRET);
  res.json({ token });
});

// Get username
app.get('/me', (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'No token' });

  try {
    const decoded = jwt.verify(token, SECRET);
    res.json({ username: decoded.username });
  } catch {
    res.status(401).json({ message: 'Invalid token' });
  }
});

app.listen(5000, () => console.log('Server running on port 5000'));
