// cadCar/CarroRepository.js
const db = require('../bancoSqlite/db');

class CarroRepository {
    async create(carroData) {
        return new Promise((resolve, reject) => {
            try {
                // Validações obrigatórias
                if (!carroData.placa || !carroData.chassi || !carroData.cliente_id) {
                    throw new Error('Placa, chassi e ID do cliente são obrigatórios');
                }

                // Verifica existência do cliente
                this.verificarClienteExistente(carroData.cliente_id)
                    .then(clienteExists => {
                        if (!clienteExists) throw new Error('Cliente não encontrado');
                        
                        // Verifica placa duplicada
                        return this.verificarPlacaExistente(carroData.placa);
                    })
                    .then(placaExistente => {
                        if (placaExistente) throw new Error('Placa já cadastrada');

                        // Insere o carro
                        const query = `
                            INSERT INTO carros 
                            (placa, chassi, marca, modelo, cor, cliente_id) 
                            VALUES (?, ?, ?, ?, ?, ?)
                        `;
                        
                        db.run(query, [
                            carroData.placa,
                            carroData.chassi,
                            carroData.marca,
                            carroData.modelo,
                            carroData.cor,
                            carroData.cliente_id
                        ], function(err) {
                            if (err) reject(err);
                            resolve(this.lastID);
                        });
                    })
                    .catch(error => reject(error));

            } catch (error) {
                reject(error);
            }
        });
    }

    async verificarClienteExistente(clienteId) {
        return new Promise((resolve, reject) => {
            db.get(
                'SELECT id FROM clientes WHERE id = ?',
                [clienteId],
                (err, row) => {
                    if (err) reject(err);
                    resolve(!!row);
                }
            );
        });
    }

    async verificarPlacaExistente(placa) {
        return new Promise((resolve, reject) => {
            db.get(
                'SELECT id FROM carros WHERE placa = ?',
                [placa],
                (err, row) => {
                    if (err) reject(err);
                    resolve(!!row); // Retorna true se a placa já existir
                }
            );
        });
    }

    async findByCliente(clienteId) {
        return new Promise((resolve, reject) => {
            db.all(
                `SELECT id, placa, chassi, marca, modelo, cor 
                FROM carros 
                WHERE cliente_id = ?`,
                [clienteId],
                (err, rows) => {
                    if (err) reject(err);
                    resolve(rows || []);
                }
            );
        });
    }

    async findByPlaca(placa) {
        return new Promise((resolve, reject) => {
            db.get(
                'SELECT * FROM carros WHERE placa = ?',
                [placa],
                (err, row) => {
                    if (err) reject(err);
                    resolve(row);
                }
            );
        });
    }
}

module.exports = new CarroRepository();