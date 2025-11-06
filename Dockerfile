# Use Node.js LTS (Long Term Support) como base
FROM node:20-alpine

# Define o diretório de trabalho dentro do container
WORKDIR /app

# Copia os arquivos de dependências primeiro (melhor cache de layers)
COPY package*.json ./

# Instala apenas as dependências de produção
RUN npm ci --only=production && \
    npm cache clean --force

# Copia o código fonte da aplicação
COPY . .

# Cria um usuário não-root para executar a aplicação (segurança)
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001 && \
    chown -R nodejs:nodejs /app

# Muda para o usuário não-root
USER nodejs

# Expõe a porta que a aplicação irá utilizar
EXPOSE 3000

# Define variáveis de ambiente padrão
ENV NODE_ENV=production \
    PORT=3000

# Health check para verificar se a aplicação está rodando
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD node -e "require('http').get('http://localhost:3000/api/v1/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Comando para iniciar a aplicação
CMD ["node", "src/server.js"]
