import express from 'express';
import cors from 'cors';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Serve perguntas
app.get('/api/questions', (req, res) => {
  try {
    const questions = JSON.parse(fs.readFileSync(join(__dirname, 'questions.json'), 'utf8'));
    res.json(questions);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao carregar perguntas' });
  }
});

// Salva estatísticas
app.post('/api/stats', (req, res) => {
  const { playerId, score, correctAnswers, prize } = req.body;
  // Aqui você salvaria no banco de dados
  console.log('Estatísticas recebidas:', { playerId, score, correctAnswers, prize });
  res.json({ success: true, message: 'Estatísticas salvas' });
});

app.listen(PORT, () => {
  console.log(`🚀 Backend rodando na porta ${PORT}`);
});