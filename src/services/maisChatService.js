const axios = require('axios');

class MaisChatService {
  constructor() {
    this.baseUrl = process.env.MAIS_CHAT_API_URL || 'https://apimaischat.maischat.io/v2';
  }

  /**
   * Busca informações do broker usando o token do tenant
   * @param {string} tenantToken - Token JWT do tenant
   * @returns {Promise<Object>} - Dados do broker (appId, token, source number, etc)
   */
  async getBrokerInfo(tenantToken) {
    try {
      const response = await axios.get(`${this.baseUrl}/msg/brokers`, {
        headers: {
          'authorization': `bearer ${tenantToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.data.status || !response.data.data || response.data.data.length === 0) {
        throw new Error('Nenhum broker encontrado para este tenant');
      }

      // Retorna o primeiro broker encontrado
      const broker = response.data.data[0];

      return {
        broker: broker.broker,
        appId: broker.appId,
        token: broker.token,
        wabaId: broker.wabaId,
        defaultSource: broker.number
      };
    } catch (error) {
      console.error('Erro ao buscar informações do broker:', error.message);
      throw new Error(`Falha ao buscar broker: ${error.response?.data?.message || error.message}`);
    }
  }

  /**
   * Busca templates disponíveis para o tenant
   * @param {string} tenantToken - Token JWT do tenant
   * @param {string} appId - ID da aplicação
   * @returns {Promise<Array>} - Lista de templates disponíveis
   */
  async getTemplates(tenantToken, appId) {
    try {
      const response = await axios.get(
        `${this.baseUrl}/msg/template/wppCloudAPI?appId=${appId}`,
        {
          headers: {
            'authorization': `bearer ${tenantToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (!response.data.status) {
        throw new Error('Erro ao buscar templates');
      }

      return response.data.data;
    } catch (error) {
      console.error('Erro ao buscar templates:', error.message);
      throw new Error(`Falha ao buscar templates: ${error.response?.data?.message || error.message}`);
    }
  }

  /**
   * Envia mensagem usando template
   * @param {Object} params - Parâmetros para envio
   * @param {string} params.tenantToken - Token do tenant
   * @param {string} params.source - Número de origem
   * @param {string} params.destination - Número de destino
   * @param {Object} params.template - Dados do template
   * @param {Object} params.brokerInfo - Informações do broker (appId, token, etc)
   * @returns {Promise<Object>} - Resultado do envio
   */
  async sendTemplateMessage({ tenantToken, source, destination, template, brokerInfo }) {
    try {
      const payload = {
        type: 'apiTemplate',
        broker: brokerInfo.broker || 'wppCloudAPI',
        appId: brokerInfo.appId,
        source: source,
        destination: destination,
        token: brokerInfo.token,
        template: template
      };

      const response = await axios.post(
        `${this.baseUrl}/msg/template/wppCloudAPI`,
        payload,
        {
          headers: {
            'authorization': `bearer ${tenantToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (!response.data.status) {
        throw new Error('Erro ao enviar mensagem');
      }

      // Retorna a resposta completa da API Mais Chat + dados adicionais
      return {
        success: true,
        messageId: response.data.messageId,
        timestamp: new Date().toISOString(),
        maisChatResponse: response.data // Resposta completa da API Mais Chat
      };
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error.message);
      throw new Error(`Falha ao enviar mensagem: ${error.response?.data?.message || error.message}`);
    }
  }
}

module.exports = new MaisChatService();
