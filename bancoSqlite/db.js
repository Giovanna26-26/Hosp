// bancoSqlite/db.js
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Caminho absoluto para o arquivo do banco
const DB_PATH = path.join(__dirname, 'database.db');

// Conexão única com o banco de dados
const db = new sqlite3.Database(DB_PATH, (err) => {
    if (err) {
        console.error('Erro ao conectar ao SQLite:', err.message);
    } else {
        console.log('Conectado ao SQLite com sucesso!');
    }
});

// Criação das tabelas
db.serialize(() => {
    // Tabela de clientes
    db.run(`
        CREATE TABLE IF NOT EXISTS clientes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE,
            cpf TEXT UNIQUE,
            email TEXT UNIQUE,
            senha TEXT
        )
    `);

    // Tabela de carros
    db.run(`
        CREATE TABLE IF NOT EXISTS carros (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            placa TEXT UNIQUE,
            chassi TEXT UNIQUE,
            marca TEXT,
            modelo TEXT,
            cor TEXT,
            cliente_id INTEGER,
            FOREIGN KEY(cliente_id) REFERENCES clientes(id)
        )
    `);
});

module.exports = db; // Exportação única