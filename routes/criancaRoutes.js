const express = require("express");
const router = express.Router();
const pool = require("../config/db.js");

const calcularIdade = require("../utils/calcularIdade.js");

router.post("/createcrianca", async (req, res) => {
    try {
        const {
            nome,
            telefone,
            responsavel,
            dataNascimento,
            rAlimentar,
            nEspecial,
            usoImagem
        } = req.body;

        const idade = calcularIdade(dataNascimento);

        const result = await pool.query(
            `
            INSERT INTO criancas
            (nome, telefone, responsavel, data_nascimento, idade, r_alimentar, n_especial, uso_imagem)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
            RETURNING *
            `,
            [
                nome,
                telefone,
                responsavel,
                dataNascimento,
                idade,
                rAlimentar,
                nEspecial,
                usoImagem
            ]
        );

        res.status(201).json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.get("/criancas", async (req, res) => {
    try {
        const result = await pool.query(
            "SELECT * FROM criancas ORDER BY created_at DESC"
        );

        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.get("/deletecrianca/:id", async (req, res) => {
    try {
        await pool.query("DELETE FROM criancas WHERE id = $1", [req.params.id]);

        res.json({ message: "Criança deletada com sucesso" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
