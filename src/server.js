require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const messageRoutes = require('./routes/messageRoutes');
const maisChatService = require('./services/maisChatService');

const app = express();
const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || '0.0.0.0';

// Middlewares de segurança
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rate limiting - previne abuso da API
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 60000, // 1 minuto
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100, // 100 requisições
  message: {
    success: false,
    error: 'Muitas requisições',
    message: 'Você excedeu o limite de requisições. Tente novamente em alguns instantes.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(limiter);

// Rotas
app.use('/api/v1', messageRoutes);

// Middleware de erro 404
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Rota não encontrada',
    message: `A rota ${req.method} ${req.path} não existe nesta API`
  });
});

// Middleware de tratamento de erros global
app.use((err, req, res, next) => {
  console.error('Erro não tratado:', err);
  res.status(500).json({
    success: false,
    error: 'Erro interno do servidor',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Ocorreu um erro inesperado'
  });
});

// Inicia o servidor
app.listen(PORT, HOST, async () => {
  const redisStatus = await maisChatService.getRedisStatus();
  const redisLabel = redisStatus.ok ? 'OK' : 'OFF';
  const redisError = redisStatus.error;
  console.log(`
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║        API Mais Chat Wrapper - Servidor Iniciado         ║
║                                                           ║
╠═══════════════════════════════════════════════════════════╣
║                                                           ║
║  Porta: ${PORT.toString().padEnd(50)} ║
║  Host: ${HOST.padEnd(51)} ║
║  Redis: ${redisLabel.padEnd(50)} ║
║  Ambiente: ${(process.env.NODE_ENV || 'development').padEnd(46)} ║
║  URL Local: http://localhost:${PORT.toString().padEnd(29)} ║
║                                                           ║
╠═══════════════════════════════════════════════════════════╣
║                                                           ║
║  Endpoints Disponíveis:                                  ║
║                                                           ║
║  • GET  /api/v1/health          - Health check            ║
║  • GET  /api/v1/templates       - Listar templates        ║
║  • POST /api/v1/send-template   - Enviar mensagem         ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
  `);
  if (!redisStatus.ok && redisError) {
    console.log(`Redis error: ${redisError}`);
  }
});

module.exports = app;
