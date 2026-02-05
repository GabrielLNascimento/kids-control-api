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
            usoImagem,
            tFralda
        } = req.body;

        const idade = calcularIdade(dataNascimento);

        const result = await pool.query(
            `
            INSERT INTO criancas
            (nome, telefone, responsavel, data_nascimento, idade, r_alimentar, n_especial, uso_imagem, t_fralda)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
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
                usoImagem,
                tFralda
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

router.get("/crianca/:id", async (req, res) => {
    try {
        
        const result = await pool.query(
            "SELECT * FROM criancas WHERE id = $1",
            [req.params.id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: "Criança não encontrada" });
        }

        res.json(result.rows[0]);
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

router.put("/editcrianca/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const {
            nome,
            telefone,
            responsavel,
            dataNascimento,
            rAlimentar,
            nEspecial,
            usoImagem,
            tFralda
        } = req.body;

        const idade = dataNascimento ? calcularIdade(dataNascimento) : null;

        const updates = [];
        const values = [];
        let paramCount = 1;

        if (nome !== undefined) {
            updates.push(`nome = $${paramCount}`);
            values.push(nome);
            paramCount++;
        }
        if (telefone !== undefined) {
            updates.push(`telefone = $${paramCount}`);
            values.push(telefone);
            paramCount++;
        }
        if (responsavel !== undefined) {
            updates.push(`responsavel = $${paramCount}`);
            values.push(responsavel);
            paramCount++;
        }
        if (dataNascimento !== undefined) {
            updates.push(`data_nascimento = $${paramCount}`);
            values.push(dataNascimento);
            paramCount++;
            updates.push(`idade = $${paramCount}`);
            values.push(idade);
            paramCount++;
        }
        if (rAlimentar !== undefined) {
            updates.push(`r_alimentar = $${paramCount}`);
            values.push(rAlimentar);
            paramCount++;
        }
        if (nEspecial !== undefined) {
            updates.push(`n_especial = $${paramCount}`);
            values.push(nEspecial);
            paramCount++;
        }
        if (usoImagem !== undefined) {
            updates.push(`uso_imagem = $${paramCount}`);
            values.push(usoImagem);
            paramCount++;
        }
        if (tFralda !== undefined) {
            updates.push(`t_fralda = $${paramCount}`);
            values.push(tFralda);
            paramCount++;
        }

        if (updates.length === 0) {
            return res.status(400).json({ error: "Nenhum campo para atualizar" });
        }

        // Adiciona o ID como último parâmetro
        values.push(id);

        const result = await pool.query(
            `
            UPDATE criancas
            SET ${updates.join(", ")}
            WHERE id = $${paramCount}
            RETURNING *
            `,
            values
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: "Criança não encontrada" });
        }

        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
