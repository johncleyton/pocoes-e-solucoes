const express = require('express');
const cors = require('cors');
const crypto = require('crypto');
const { Sequelize, DataTypes } = require('sequelize');
const path = require('path');

// Cria conexão com banco em memória
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: ':memory:',
  logging: false,
});

// ==================== MODELS ====================

// Modelo de Poção
const Pocao = sequelize.define('Pocao', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  nome: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  descricao: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  imagem: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  preco: {
    type: DataTypes.FLOAT,
    allowNull: false,
  },
});

// Modelo de Admin
const Admin = sequelize.define('Admin', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  usuario: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  senha: {
    type: DataTypes.STRING,
    allowNull: false,
  },
});

// ==================== AUTH ====================

// Armazenar tokens de sessão em memória
const activeSessions = new Map();

function generateToken() {
  return crypto.randomBytes(32).toString('hex');
}

function hashPassword(password) {
  return crypto.createHash('sha256').update(password).digest('hex');
}

// Middleware de autenticação para rotas de admin
function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Token de autenticação necessário.' });
  }

  const token = authHeader.split(' ')[1];
  const session = activeSessions.get(token);

  if (!session) {
    return res.status(401).json({ error: 'Token inválido ou expirado.' });
  }

  // Verificar expiração (24 horas)
  if (Date.now() - session.createdAt > 24 * 60 * 60 * 1000) {
    activeSessions.delete(token);
    return res.status(401).json({ error: 'Sessão expirada. Faça login novamente.' });
  }

  req.admin = session;
  next();
}

// ==================== APP ====================

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// ==================== AUTH ROUTES ====================

// Login do admin
app.post('/api/admin/login', async (req, res) => {
  try {
    const { usuario, senha } = req.body;

    if (!usuario || !senha) {
      return res.status(400).json({ error: 'Usuário e senha são obrigatórios.' });
    }

    const admin = await Admin.findOne({ where: { usuario } });
    if (!admin || admin.senha !== hashPassword(senha)) {
      return res.status(401).json({ error: 'Usuário ou senha incorretos.' });
    }

    const token = generateToken();
    activeSessions.set(token, {
      adminId: admin.id,
      usuario: admin.usuario,
      createdAt: Date.now(),
    });

    res.json({ token, usuario: admin.usuario });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Logout do admin
app.post('/api/admin/logout', requireAuth, (req, res) => {
  const token = req.headers.authorization.split(' ')[1];
  activeSessions.delete(token);
  res.json({ message: 'Logout realizado com sucesso.' });
});

// Verificar se o token é válido
app.get('/api/admin/verify', requireAuth, (req, res) => {
  res.json({ valid: true, usuario: req.admin.usuario });
});

// ==================== PUBLIC API ROUTES ====================

// Listar todas as poções (público)
app.get('/api/pocoes', async (req, res) => {
  try {
    const pocoes = await Pocao.findAll();
    res.json(pocoes);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Buscar uma poção por ID (público)
app.get('/api/pocoes/:id', async (req, res) => {
  try {
    const pocao = await Pocao.findByPk(req.params.id);
    if (!pocao) return res.status(404).json({ error: 'Poção não encontrada' });
    res.json(pocao);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==================== PROTECTED API ROUTES (ADMIN) ====================

// Cadastrar nova poção (requer auth)
app.post('/api/pocoes', requireAuth, async (req, res) => {
  try {
    const { nome, descricao, imagem, preco } = req.body;
    if (!nome || !descricao || preco === undefined) {
      return res.status(400).json({ error: 'Nome, descrição e preço são obrigatórios.' });
    }
    const pocao = await Pocao.create({ nome, descricao, imagem, preco });
    res.status(201).json(pocao);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Remover poção (requer auth)
app.delete('/api/pocoes/:id', requireAuth, async (req, res) => {
  try {
    const pocao = await Pocao.findByPk(req.params.id);
    if (!pocao) return res.status(404).json({ error: 'Poção não encontrada' });
    await pocao.destroy();
    res.json({ message: 'Poção removida com sucesso' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==================== SEED DATA ====================

async function seedDatabase() {
  // Criar admin padrão (usuario: merigold, senha: pocoes123)
  await Admin.create({
    usuario: 'merigold',
    senha: hashPassword('pocoes123'),
  });
  console.log('[Admin] Criado: usuario=merigold / senha=pocoes123');

  const pocoes = [
    {
      nome: 'Poção Blue Sky',
      descricao: 'Essa poção provê um surto de inspiração de 24 horas. Foi utilizada por John Lennon quando escreveu Lucy in the Sky with Diamonds.',
      imagem: 'https://i.ibb.co/ZzS7xb2/rsz-sky.png',
      preco: 300,
    },
    {
      nome: 'Poção do Perfume Misterioso',
      descricao: 'Essa poção faz com que você fique cheirando lilás e groselha por 24 dias. Essência muito admirada pelos bruxos.',
      imagem: 'https://i.ibb.co/pyhZJXf/rsz-lilas.png',
      preco: 200,
    },
    {
      nome: 'Poção de Pinus',
      descricao: 'Essa poção faz com que você fique 10 cm mais alto! Observação: efeitos colaterais desconhecidos.',
      imagem: 'https://i.ibb.co/DkzdL1q/rsz-pinus.png',
      preco: 3000,
    },
    {
      nome: 'Poção da Beleza Eterna',
      descricao: 'Veneno que mata rápido.',
      imagem: 'https://i.ibb.co/9p872NK/rsz-1beleza.png',
      preco: 100,
    },
    {
      nome: 'Poção do Arco Íris',
      descricao: 'Traz felicidade momentânea. Pode durar de 10 minutos a 2 dias.',
      imagem: 'https://i.ibb.co/PrC09MP/rsz-2unicornio.png',
      preco: 120,
    },
    {
      nome: 'Caldeirão das Verdades Secretas',
      descricao: 'As pessoas lhe dirão apenas verdades por 1 hora. É necessário beber os 5L.',
      imagem: 'https://i.ibb.co/s9Lyvj8/rsz-verdades.png',
      preco: 150,
    },
  ];

  for (const p of pocoes) {
    await Pocao.create(p);
  }
  console.log('[Seed] Banco de dados populado com pocoes iniciais!');
}

// ==================== START SERVER ====================

const PORT = process.env.PORT || 3000;

sequelize.sync().then(async () => {
  await seedDatabase();
  app.listen(PORT, () => {
    console.log(`[Server] Loja de Pocoes rodando em http://localhost:${PORT}`);
  });
});
