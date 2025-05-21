// cadUsu/ClienteRepository.js
const db = require('../bancoSqlite/db.js');

class ClienteRepository {
    async create({ username, cpf, email, senha }) {
        return new Promise((resolve, reject) => {
            db.run(
                'INSERT INTO clientes (username, cpf, email, senha) VALUES (?, ?, ?, ?)',
                [username, cpf, email, senha],
                function (err) {
                    if (err) reject(err);
                    resolve(this.lastID); // retorna o ID do novo cliente
                }
            );
        });
    }

    async findByCpf(cpf) {
        return new Promise((resolve, reject) => {
            db.get(
                'SELECT * FROM clientes WHERE cpf = ?',
                [cpf],
                (err, row) => {
                    if (err) reject(err);
                    resolve(row);
                }
            );
        });
    }

    async findById(id) {
        return new Promise((resolve, reject) => {
            db.get(
                'SELECT * FROM clientes WHERE id = ?',
                [id],
                (err, row) => {
                    if (err) reject(err);
                    resolve(row);
                }
            );
        });
    }

    async findByUsername(username) {
        return new Promise((resolve, reject) => {
            db.get(
                'SELECT * FROM clientes WHERE username = ?',
                [username],
                (err, row) => {
                    if (err) reject(err);
                    resolve(row);
                }
            );
        });
    }
}

module.exports = new ClienteRepository();
