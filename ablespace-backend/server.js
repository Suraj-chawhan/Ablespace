import express from 'express'
import multer from 'multer'
import fs from 'fs'
import Groq from 'groq-sdk'
import cors from 'cors'
import dotenv from 'dotenv'
import morgan from 'morgan'
import path from 'path'
import mongoose from 'mongoose'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'

dotenv.config()
const app = express()
app.use(cors())
app.use(morgan('dev'))
app.use(express.json())
const upload = multer({ dest: 'uploads/' })
const groq = new Groq({ apiKey: process.env.GROQ })

mongoose.connect(process.env.DB, { useNewUrlParser: true, useUnifiedTopology: true })
const userSchema = new mongoose.Schema({ name: String, email: { type: String, unique: true }, password: String })
const User = mongoose.model('User', userSchema)

app.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body
    const hashed = await bcrypt.hash(password, 10)
    const user = await User.create({ name, email, password: hashed })
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' })
    res.json({ token, user: { id: user._id, name: user.name, email: user.email } })
  } catch (err) {
    res.status(400).json({ message: err.message })
  }
})

app.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body
    const user = await User.findOne({ email })
    if (!user) return res.status(400).json({ message: 'Invalid credentials' })
    const match = await bcrypt.compare(password, user.password)
    if (!match) return res.status(400).json({ message: 'Invalid credentials' })
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' })
    res.json({ token, user: { id: user._id, name: user.name, email: user.email } })
  } catch (err) {
    res.status(400).json({ message: err.message })
  }
})

app.get('/ping', (req, res) => res.send('pong'))

app.post('/upload', upload.single('audio'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No audio file uploaded.' })
  const ext = path.extname(req.file.originalname) || '.m4a'
  const fixedPath = `${req.file.path}${ext}`
  fs.renameSync(req.file.path, fixedPath)
  try {
    const transcription = await groq.audio.transcriptions.create({
      file: fs.createReadStream(fixedPath),
      model: 'whisper-large-v3-turbo',
      response_format: 'json'
    })
    res.json({ transcription: transcription.text })
  } catch (err) {
    res.status(500).json({ error: err.message })
  } finally {
    if (fs.existsSync(fixedPath)) fs.unlinkSync(fixedPath)
  }
})

app.listen(3000, () => console.log('Server running on port 3000'))
