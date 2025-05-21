//server.js
const express = require('express');
const ClienteRepository = require('./cadUsu/ClienteRepository');
const CarroRepository = require('./cadCar/CarroRepository');
const fs = require('fs');
const path = require('path');
const app = express();
app.use(express.static(__dirname));
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const port = 3000;

// Middleware para interpretar JSON e formulários
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir arquivos estáticos de todas as subpastas
app.use(express.static(__dirname));

// Rota raiz opcional
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'cadUsu', 'index.html'));
});

// Iniciar o servidor
app.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}`);
});

// ======================================
// Configurações Iniciais
// ======================================
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname, 'cadUsu'))); 
app.use('/cadCar', express.static(path.join(__dirname, 'cadCar')));
app.use(cors());
// ======================================
// Middlewares
// ======================================
app.use((err, req, res, next) => {
    console.error(`Erro: ${err.stack}`);
    res.status(500).json({ 
        status: 'error',
        message: 'Erro interno do servidor' 
    });
});

// CORS
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    next();
});

// ======================================
// Rotas de Páginas
// ======================================
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'cadUsu', 'index.html'));
});

app.get('/cadastro-carro', (req, res) => {
    if (!req.query.cliente_id) return res.redirect('/');
    
    const caminho = path.join(__dirname, 'cadCar', 'carrosCadastro.html');
    
    if (fs.existsSync(caminho)) {
        res.sendFile(caminho);
    } else {
        console.error('Arquivo não encontrado:', caminho);
        res.status(404).send('Página de cadastro de veículos não encontrada');
    }
}); // <- Faltava este fechamento

// ======================================
// Rotas de API - Clientes
// ======================================
app.post('/api/clientes', async (req, res) => {
    try {
        const { username, cpf, email, senha } = req.body;
        
        if (!/^\d{11}$/.test(cpf)) {
            return res.status(400).json({
                status: 'error',
                message: 'CPF deve conter exatamente 11 dígitos numéricos'
            });
        }

        const clienteExistente = await ClienteRepository.findByCpf(cpf);
        if (clienteExistente) {
            return res.status(409).json({
                status: 'error',
                message: 'CPF já cadastrado'
            });
        }

        const clienteId = await ClienteRepository.create({ username, cpf, email, senha });
        
        res.status(201).json({
            status: 'success',
            data: {
                cliente_id: clienteId,
                redirect: `/cadastro-carro?cliente_id=${clienteId}`
            }
        });

    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: error.message
        });
    }
});

// ======================================
// Rotas de API - Carros
// ======================================
app.post('/api/carros', async (req, res) => {
    try {
        const { placa, chassi, marca, modelo, cor, cliente_id } = req.body;

        if (!placa || !chassi || !cliente_id) {
            return res.status(400).json({
                status: 'error',
                message: 'Placa, chassi e ID do cliente são obrigatórios'
            });

      const placaRegex = /^[A-Z]{3}\d{1}[A-Z]\d{2}$/i; 
      if (!placaRegex.test(placa)) {
      return res.status(400).json({ error: "Formato de placa inválido" });
      }
        }

        const carroId = await CarroRepository.create({ 
            placa, 
            chassi, 
            marca, 
            modelo, 
            cor, 
            cliente_id 
        });

        res.status(201).json({
            status: 'success',
            data: {
                carro_id: carroId,
                cliente_id,
                details: 'Veículo cadastrado com sucesso'
            }
        });

    } catch (error) {
        const statusCode = error.message.includes('já cadastrada') ? 409 : 
                         error.message.includes('não encontrado') ? 404 : 500;
        
        res.status(statusCode).json({
            status: 'error',
            message: error.message
        });
    }
});

// ======================================
// Rotas de Consulta
// ======================================
app.get('/api/clientes/:id', async (req, res) => {
    try {
        const cliente = await ClienteRepository.findById(req.params.id);
        if (!cliente) {
            return res.status(404).json({
                status: 'error',
                message: 'Cliente não encontrado'
            });
        }
        res.json({ status: 'success', data: cliente });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: error.message
        });
    }
});

app.get('/api/carros/:placa', async (req, res) => {
    try {
        const carro = await CarroRepository.findByPlaca(req.params.placa);
        if (!carro) {
            return res.status(404).json({
                status: 'error',
                message: 'Veículo não encontrado'
            });
        }
        res.json({ status: 'success', data: carro });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: error.message
        });
    }
});
// Rota para cadastrar carro (POST)
app.post('/cadastrar-carro', async (req, res) => {
    try {
        const carroId = await CarroRepository.create(req.body);
        res.status(201).json({ id: carroId });
    } catch (error) {
        res.status(400).json({ error: error.message }); // Retorna erro específico
    }
});
// login
app.post('/api/login', async (req, res) => {
    try {
        const { username, senha } = req.body;
        const usuario = await ClienteRepository.findByUsername(username);

        if (!usuario || usuario.senha !== senha) {
            return res.status(401).json({ status: 'error', message: 'Credenciais inválidas' });
        }

        res.json({ 
            status: 'success', 
            nome: usuario.username // Ou campo específico como "primeiro_nome"
        });

    } catch (error) {
        res.status(500).json({ status: 'error', message: error.message });
    }
 
});
// Conexão com o banco de dados
const dbPath = path.join(__dirname, 'bancoSqlite', 'database.db');
const db = new sqlite3.Database(dbPath);

// Rota para o login (POST)
app.post('/login', (req, res) => {
    const { username, password } = req.body;

    // Consulta ao banco de dados
    db.get(
        'SELECT * FROM usuarios WHERE username = ? AND password = ?',
        [username, password],
        (err, row) => {
            if (err) {
                console.error(err);
                return res.status(500).send('Erro na comunicação com o servidor');
            }

            if (row) {
                // Login bem-sucedido: redireciona para menu.html
                res.redirect('/cadUsu/menu.html');
            } else {
                // Credenciais inválidas
                res.status(401).send('Nome de usuário ou senha incorretos');
            }
        }
    );
});


// Rota para o menu
app.get('/menu.html', (req, res) => {
    app.get('/api/ping', (req, res) => res.send('pong'));
    res.sendFile(path.join(__dirname, 'cadUsu/menu.html'));
});



app.get('/api/carros', (req, res) => {
    const sql = 'SELECT modelo, marca, placa, cor, marca FROM carros';

    db.all(sql, [], (err, rows) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Erro ao buscar carros' });
        }

        res.json(rows);
    });
});
//SERVIÇOS
app.get('/api/servicos', (req, res) => {
    const { q, status } = req.query;

    let query = `SELECT * FROM servicos WHERE 1=1`;
    const params = [];

    if (q) {
        query += ` AND (placa LIKE ? OR modelo LIKE ? OR cliente LIKE ? OR inicio LIKE ? OR fim LIKE ?)`;
        const searchTerm = `%${q}%`;
        params.push(searchTerm, searchTerm, searchTerm, searchTerm, searchTerm);
    }

    if (status) {
        query += ` AND status = ?`;
        params.push(status);
    }

    db.all(query, params, (err, rows) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Erro ao buscar serviços' });
        }

        res.json(rows);
    });
});

// Ver mais

// ======================================
// Inicialização do Servidor
// ======================================
app.listen(port, () => {
    console.log(`Servidor rodando em http://localhost:${port}`);
    console.log(`Versão: 2.0.0`);
    console.log(`Banco de dados: ${path.join(__dirname, 'bancoSqlite', 'database.db')}`);
});
