/**
 * Middleware de autenticação
 * Valida se o token do tenant foi enviado no header
 */
const authMiddleware = (req, res, next) => {
  try {
    // Extrai o token do header Authorization
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({
        success: false,
        error: 'Token de autenticação não fornecido',
        message: 'É necessário enviar o header "Authorization" com o token do tenant'
      });
    }

    // Valida formato do token (bearer token)
    const parts = authHeader.split(' ');

    if (parts.length !== 2) {
      return res.status(401).json({
        success: false,
        error: 'Formato de token inválido',
        message: 'O token deve estar no formato: "Bearer {token}" ou "bearer {token}"'
      });
    }

    const [scheme, token] = parts;

    if (!/^Bearer$/i.test(scheme)) {
      return res.status(401).json({
        success: false,
        error: 'Formato de token inválido',
        message: 'O esquema de autenticação deve ser "Bearer"'
      });
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'Token não fornecido',
        message: 'Token do tenant está vazio'
      });
    }

    // Adiciona o token ao objeto req para uso nos controllers
    req.tenantToken = token;

    next();
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: 'Erro ao processar autenticação',
      message: error.message
    });
  }
};

module.exports = authMiddleware;
