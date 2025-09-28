// server.js
import express from 'express';
import multer from 'multer';
import fs from 'fs';
import Groq from 'groq-sdk';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(cors());

const upload = multer({ dest: 'uploads/' });
const groq = new Groq({ apiKey: process.env.GROQ });

// Upload and transcribe audio
app.post('/upload', upload.single('audio'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No audio file uploaded.' });
  }

  try {
    const transcription = await groq.audio.transcriptions.create({
      file: fs.createReadStream(req.file.path),
      model: 'whisper-large-v3-turbo',
      response_format: 'verbose_json',
    });
    res.json({ transcription: transcription.text });
  } catch (err) {
    console.error('Transcription error:', err);
    res.status(500).json({ error: err.message });
  } finally {
    // Safe delete
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
  }
});

app.listen(3000, () => console.log('Server running on port 3000'));

