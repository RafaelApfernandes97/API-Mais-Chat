const axios = require('axios');
<<<<<<< HEAD
const { createClient } = require('redis');
const RequestQueue = require('../utils/requestQueue');

class MaisChatService {
  constructor() {
    const rawBaseUrl = process.env.MAIS_CHAT_API_URL || 'https://apimaischat.maischat.io/v2';
    this.baseUrl = rawBaseUrl.replace(/\/+$/, '');
    this.requestQueue = new RequestQueue({
      minTimeMs: parseInt(process.env.MAIS_CHAT_MIN_TIME_MS, 10) || 300,
      maxQueueSize: parseInt(process.env.MAIS_CHAT_MAX_QUEUE, 10) || 200
    });
    this.brokerCacheTtlMs = parseInt(process.env.MAIS_CHAT_BROKER_CACHE_TTL_MS, 10) || 60000;
    this.brokerCache = new Map();
    this.brokerInFlight = new Map();
    this.templateCacheTtlMs = parseInt(process.env.MAIS_CHAT_TEMPLATE_CACHE_TTL_MS, 10) || 60000;
    this.templateCache = new Map();
    this.templateInFlight = new Map();
    this.redisUrl = process.env.REDIS_URL || 'redis://default:redis@217.216.65.122:3049';
    this.redis = null;
    this.redisReady = false;
    this.redisLastError = null;
    this.redisRetryMs = parseInt(process.env.REDIS_RETRY_MS, 10) || 5000;
    this.redisRetryTimer = null;
    this.redisConnecting = false;
    this.redisInitPromise = this._initRedis();
=======

class MaisChatService {
  constructor() {
    this.baseUrl = process.env.MAIS_CHAT_API_URL || 'https://apimaischat.maischat.io/v2';
>>>>>>> 466e8ea1c1e35fdfb6cd3818c2e3f6c38b9c7c14
  }

  /**
   * Busca informações do broker usando o token do tenant
   * @param {string} tenantToken - Token JWT do tenant
   * @returns {Promise<Object>} - Dados do broker (appId, token, source number, etc)
   */
  async getBrokerInfo(tenantToken) {
    try {
<<<<<<< HEAD
      const cached = await this._getBrokerFromCache(tenantToken);
      if (cached) {
        return cached;
      }

      if (this.brokerInFlight.has(tenantToken)) {
        return await this.brokerInFlight.get(tenantToken);
      }

      const inFlightPromise = this._fetchAndCacheBroker(tenantToken);
      this.brokerInFlight.set(tenantToken, inFlightPromise);

      try {
        return await inFlightPromise;
      } finally {
        this.brokerInFlight.delete(tenantToken);
      }
    } catch (error) {
      console.error('Erro ao buscar informacoes do broker:', error.message);
      throw new Error(`Falha ao buscar broker: ${error.response?.data?.message || error.message}`);
    }
  }

  async _initRedis() {
    if (!this.redisUrl) {
      return;
    }
    if (this.redisConnecting) {
      return;
    }
    this.redisConnecting = true;
    try {
      if (!this.redis) {
        this.redis = createClient({ url: this.redisUrl });
        this.redis.on('error', (err) => {
          this.redisReady = false;
          this.redisLastError = err.message;
          console.error('Erro no Redis:', err.message);
          this._scheduleRedisRetry();
        });
      }

      if (!this.redis.isOpen) {
        await this.redis.connect();
      }

      this.redisReady = true;
      this.redisLastError = null;
    } catch (error) {
      this.redisReady = false;
      this.redisLastError = error.message;
      console.error('Falha ao conectar no Redis:', error.message);
      this._scheduleRedisRetry();
    } finally {
      this.redisConnecting = false;
    }
  }

  _scheduleRedisRetry() {
    if (this.redisRetryTimer || !this.redisRetryMs) {
      return;
    }
    this.redisRetryTimer = setTimeout(() => {
      this.redisRetryTimer = null;
      this._initRedis();
    }, this.redisRetryMs);
  }

  async _ensureRedis() {

    if (!this.redisInitPromise) {
      return;
    }
    await this.redisInitPromise;
  }

  async getRedisStatus() {
    await this._ensureRedis();
    return {
      ok: Boolean(this.redis && this.redisReady),
      error: this.redisLastError
    };
  }

  async _getBrokerFromCache(tenantToken) {
    const entry = this.brokerCache.get(tenantToken);
    if (entry) {
      if (Date.now() <= entry.expiresAt) {
        return entry.data;
      }
      this.brokerCache.delete(tenantToken);
    }

    await this._ensureRedis();
    if (!this.redis || !this.redisReady) {
      return null;
    }

    const cached = await this.redis.get(`broker:${tenantToken}`);
    if (!cached) {
      return null;
    }

    const data = JSON.parse(cached);
    this.brokerCache.set(tenantToken, {
      data,
      expiresAt: Date.now() + this.brokerCacheTtlMs
    });

    return data;
  }

  async _fetchAndCacheBroker(tenantToken) {
    const response = await this.requestQueue.enqueue(tenantToken, () =>
      axios.get(`${this.baseUrl}/msg/brokers`, {
=======
      const response = await axios.get(`${this.baseUrl}/msg/brokers`, {
>>>>>>> 466e8ea1c1e35fdfb6cd3818c2e3f6c38b9c7c14
        headers: {
          'authorization': `bearer ${tenantToken}`,
          'Content-Type': 'application/json'
        }
<<<<<<< HEAD
      })
    );

    if (!response.data.status || !response.data.data || response.data.data.length === 0) {
      throw new Error('Nenhum broker encontrado para este tenant');
    }

    // Retorna o primeiro broker encontrado
    const broker = response.data.data[0];

    const data = {
      broker: broker.broker,
      appId: broker.appId,
      token: broker.token,
      wabaId: broker.wabaId,
      defaultSource: broker.number
    };

    this.brokerCache.set(tenantToken, {
      data,
      expiresAt: Date.now() + this.brokerCacheTtlMs
    });

    await this._ensureRedis();
    if (this.redis && this.redisReady) {
      const ttlSeconds = Math.max(1, Math.floor(this.brokerCacheTtlMs / 1000));
      await this.redis.setEx(`broker:${tenantToken}`, ttlSeconds, JSON.stringify(data));
    }

    return data;
  }


=======
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

>>>>>>> 466e8ea1c1e35fdfb6cd3818c2e3f6c38b9c7c14
  /**
   * Busca templates disponíveis para o tenant
   * @param {string} tenantToken - Token JWT do tenant
   * @param {string} appId - ID da aplicação
   * @returns {Promise<Array>} - Lista de templates disponíveis
   */
  async getTemplates(tenantToken, appId) {
    try {
<<<<<<< HEAD
      const cacheKey = `${tenantToken}:${appId}`;
      const cached = await this._getTemplatesFromCache(cacheKey);
      if (cached) {
        return cached;
      }

      if (this.templateInFlight.has(cacheKey)) {
        return await this.templateInFlight.get(cacheKey);
      }

      const inFlightPromise = this._fetchAndCacheTemplates(tenantToken, appId, cacheKey);
      this.templateInFlight.set(cacheKey, inFlightPromise);

      try {
        return await inFlightPromise;
      } finally {
        this.templateInFlight.delete(cacheKey);
      }
    } catch (error) {
      console.error('Erro ao buscar templates:', error.message);
      throw new Error(`Falha ao buscar templates: ${error.response?.data?.message || error.message}`);
    }
  }

  async _getTemplatesFromCache(cacheKey) {
    const entry = this.templateCache.get(cacheKey);
    if (entry) {
      if (Date.now() <= entry.expiresAt) {
        return entry.data;
      }
      this.templateCache.delete(cacheKey);
    }

    await this._ensureRedis();
    if (!this.redis || !this.redisReady) {
      return null;
    }

    const cached = await this.redis.get(`templates:${cacheKey}`);
    if (!cached) {
      return null;
    }

    const data = JSON.parse(cached);
    this.templateCache.set(cacheKey, {
      data,
      expiresAt: Date.now() + this.templateCacheTtlMs
    });

    return data;
  }

  async _fetchAndCacheTemplates(tenantToken, appId, cacheKey) {
    const response = await this.requestQueue.enqueue(tenantToken, () =>
      axios.get(
=======
      const response = await axios.get(
>>>>>>> 466e8ea1c1e35fdfb6cd3818c2e3f6c38b9c7c14
        `${this.baseUrl}/msg/template/wppCloudAPI?appId=${appId}`,
        {
          headers: {
            'authorization': `bearer ${tenantToken}`,
            'Content-Type': 'application/json'
          }
        }
<<<<<<< HEAD
      )
    );

    if (!response.data.status) {
      throw new Error('Erro ao buscar templates');
    }

    const data = response.data.data;

    this.templateCache.set(cacheKey, {
      data,
      expiresAt: Date.now() + this.templateCacheTtlMs
    });

    await this._ensureRedis();
    if (this.redis && this.redisReady) {
      const ttlSeconds = Math.max(1, Math.floor(this.templateCacheTtlMs / 1000));
      await this.redis.setEx(`templates:${cacheKey}`, ttlSeconds, JSON.stringify(data));
    }

    return data;
=======
      );

      if (!response.data.status) {
        throw new Error('Erro ao buscar templates');
      }

      return response.data.data;
    } catch (error) {
      console.error('Erro ao buscar templates:', error.message);
      throw new Error(`Falha ao buscar templates: ${error.response?.data?.message || error.message}`);
    }
>>>>>>> 466e8ea1c1e35fdfb6cd3818c2e3f6c38b9c7c14
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

<<<<<<< HEAD
      const response = await this.requestQueue.enqueue(tenantToken, () =>
        axios.post(
          `${this.baseUrl}/msg/template/wppCloudAPI`,
          payload,
          {
            headers: {
              'authorization': `bearer ${tenantToken}`,
              'Content-Type': 'application/json'
            }
          }
        )
=======
      const response = await axios.post(
        `${this.baseUrl}/msg/template/wppCloudAPI`,
        payload,
        {
          headers: {
            'authorization': `bearer ${tenantToken}`,
            'Content-Type': 'application/json'
          }
        }
>>>>>>> 466e8ea1c1e35fdfb6cd3818c2e3f6c38b9c7c14
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
