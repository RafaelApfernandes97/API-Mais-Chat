const express = require('express');
const router = express.Router();
const messageController = require('../controllers/messageController');
const authMiddleware = require('../middlewares/authMiddleware');

/**
 * Todas as rotas abaixo requerem autenticação via Bearer Token
 */

// Health check - verifica se a API está funcionando
router.get('/health', messageController.healthCheck);

// Lista templates disponíveis para o tenant
router.get('/templates', authMiddleware, messageController.listTemplates);

// Envia mensagem usando template
router.post('/send-template', authMiddleware, messageController.sendTemplate);

module.exports = router;
