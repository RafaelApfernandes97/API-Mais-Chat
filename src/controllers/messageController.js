const maisChatService = require('../services/maisChatService');

class MessageController {
  /**
   * Envia mensagem usando template
   * Endpoint: POST /api/v1/messages/send-template
   */
  async sendTemplate(req, res) {
    try {
      const { source, destination, template } = req.body;
      const tenantToken = req.tenantToken; // Vem do middleware de auth

      // Validações básicas
      if (!source || !destination || !template) {
        return res.status(400).json({
          success: false,
          error: 'Parâmetros obrigatórios ausentes',
          message: 'É necessário enviar: source, destination e template',
          details: {
            source: source ? 'OK' : 'FALTANDO',
            destination: destination ? 'OK' : 'FALTANDO',
            template: template ? 'OK' : 'FALTANDO'
          }
        });
      }

      // Valida estrutura do template
      if (!template.name || !template.language) {
        return res.status(400).json({
          success: false,
          error: 'Estrutura do template inválida',
          message: 'O template deve conter: name e language',
          example: {
            name: 'nome_do_template',
            language: 'pt_BR',
            components: []
          }
        });
      }

      // Busca informações do broker usando o token do tenant
      const brokerInfo = await maisChatService.getBrokerInfo(tenantToken);

      // Envia a mensagem
      const result = await maisChatService.sendTemplateMessage({
        tenantToken,
        source,
        destination,
        template,
        brokerInfo
      });

      return res.status(200).json({
        success: true,
        data: {
          messageId: result.messageId,
          timestamp: result.timestamp,
          source,
          destination,
          templateName: template.name,
          maisChatResponse: result.maisChatResponse // Retorno completo da API Mais Chat
        }
      });

    } catch (error) {
      console.error('Erro no controller sendTemplate:', error.message);

      return res.status(500).json({
        success: false,
        error: 'Erro ao enviar mensagem',
        message: error.message
      });
    }
  }

  /**
   * Lista templates disponíveis para o tenant
   * Endpoint: GET /api/v1/messages/templates
   */
  async listTemplates(req, res) {
    try {
      const tenantToken = req.tenantToken;

      // Busca informações do broker
      const brokerInfo = await maisChatService.getBrokerInfo(tenantToken);

      // Busca templates disponíveis
      const templates = await maisChatService.getTemplates(tenantToken, brokerInfo.appId);

      // Retorna templates de forma simplificada (sem expor credenciais)
      const simplifiedTemplates = templates.map(template => ({
        name: template.name,
        language: template.language,
        status: template.status,
        category: template.category,
        components: template.components
      }));

      return res.status(200).json({
        success: true,
        count: simplifiedTemplates.length,
        data: simplifiedTemplates
      });

    } catch (error) {
      console.error('Erro no controller listTemplates:', error.message);

      return res.status(500).json({
        success: false,
        error: 'Erro ao buscar templates',
        message: error.message
      });
    }
  }

  /**
   * Health check da API
   * Endpoint: GET /api/v1/health
   */
  async healthCheck(req, res) {
    return res.status(200).json({
      success: true,
      message: 'API funcionando corretamente',
      timestamp: new Date().toISOString(),
      version: '1.0.0'
    });
  }
}

module.exports = new MessageController();
