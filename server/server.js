const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const cors = require('cors');
const multer = require('multer');
const path = require('path');

const app = express();
const SECRET = 'mysecret';
const USERS_FILE = './users.json';
const UPLOADS_DIR = './uploads';

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// create users.json if missing
if (!fs.existsSync(USERS_FILE)) fs.writeFileSync(USERS_FILE, JSON.stringify([]));
if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR);

// Auth middleware
function auth(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'No token' });
  try {
    req.user = jwt.verify(token, SECRET);
    next();
  } catch {
    res.status(401).json({ message: 'Invalid token' });
  }
}

// Setup multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const userDir = path.join(UPLOADS_DIR, req.user.username);
    if (!fs.existsSync(userDir)) fs.mkdirSync(userDir);
    cb(null, userDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, Date.now() + ext);
  },
});
const upload = multer({ storage });

// Signup route (unchanged)
app.post('/signup', async (req, res) => {
  const { username, password } = req.body;
  const users = JSON.parse(fs.readFileSync(USERS_FILE));

  if (users.find(u => u.username === username)) return res.status(400).json({ message: 'User exists' });

  const hashed = await bcrypt.hash(password, 10);
  users.push({ username, password: hashed });
  fs.writeFileSync(USERS_FILE, JSON.stringify(users));

  res.json({ message: 'User created' });
});

// Login route (unchanged)
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

// Get username (unchanged)
app.get('/me', auth, (req, res) => {
  res.json({ username: req.user.username });
});

// Upload photo
app.post('/upload', auth, upload.single('photo'), (req, res) => {
  res.json({ url: `/uploads/${req.user.username}/${req.file.filename}` });
});

// List photos
app.get('/photos', auth, (req, res) => {
  const userDir = path.join(UPLOADS_DIR, req.user.username);
  if (!fs.existsSync(userDir)) return res.json([]);
  const files = fs.readdirSync(userDir);
  const urls = files.map(f => `/uploads/${req.user.username}/${f}`);
  res.json(urls);
});

app.listen(5000, () => console.log('Server running on port 5000'));
