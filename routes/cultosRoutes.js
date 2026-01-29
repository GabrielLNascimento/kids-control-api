const express = require("express");
const router = express.Router();
const pool = require("../config/db.js");

// Buscar cultos geral
router.get("/cultos", async (req, res) => {
    try {
        const result = await pool.query(
            "SELECT * FROM cultos ORDER BY data DESC",
        );
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Buscar Culto por id
router.get("/culto/:id", async (req, res) => {
    try {
        const result = await pool.query("SELECT * FROM cultos WHERE id = $1", [
            req.params.id,
        ]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: "Culto não encontrado" });
        }

        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Criar Cultos novos
router.post("/createculto", async (req, res) => {
    try {
        const { nome, data, periodo } = req.body;

        const result = await pool.query(
            `
        INSERT INTO cultos (nome, data, periodo)
        VALUES ($1, $2, $3)
        RETURNING *
        `,
            [nome, data, periodo],
        );

        res.status(201).json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Deletar Culto
router.get("/deleteculto/:id", async (req, res) => {
    try {
        await pool.query("DELETE FROM cultos WHERE id = $1", [req.params.id]);
        res.json({ message: "Culto deletado com sucesso" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// adicionar criança no culto especifico
router.post("/:cultoId/adicionarcrianca", async (req, res) => {
    try {
        const { cultoId } = req.params;
        const { criancaId } = req.body;

        const cultoIdNum = parseInt(cultoId, 10);
        const criancaIdNum = parseInt(criancaId, 10);

        if (isNaN(cultoIdNum) || isNaN(criancaIdNum)) {
            return res.status(400).json({ error: "IDs inválidos" });
        }

        // verificar se já existe
        const existe = await pool.query(
            `SELECT id FROM culto_criancas WHERE culto_id = $1 AND crianca_id = $2`,
            [cultoIdNum, criancaIdNum],
        );

        if (existe.rows.length > 0) {
            return res.status(400).json({ error: "Criança já adicionada" });
        }

        // pegar último código
        const ultimoCodigoResult = await pool.query(
            `SELECT COALESCE(MAX(codigo), 0) AS ultimo FROM culto_criancas WHERE culto_id = $1`,
            [cultoIdNum],
        );

        const ultimo = ultimoCodigoResult.rows[0]?.ultimo ?? 0;
        const codigo = ultimo + 1;

        // Inserir
        const insertResult = await pool.query(
            `INSERT INTO culto_criancas (culto_id, crianca_id, codigo) VALUES ($1, $2, $3) RETURNING *`,
            [cultoIdNum, criancaIdNum, codigo],
        );

        res.json({
            message: "Criança adicionada com sucesso",
            data: insertResult.rows[0],
        });
    } catch (err) {
        console.error("Erro ao adicionar criança:", err);
        res.status(500).json({ error: err.message });
    }
});

// buscar as crianças de um culto especifico
router.get("/:cultoId/criancas", async (req, res) => {
    try {
        const { cultoId } = req.params;

        const result = await pool.query(
            `SELECT
                cc.id,
                cc.codigo,
                cc.is_checked,
                c.id AS crianca_id,
                c.nome,
                c.idade,
                c.responsavel,
                c.telefone,
                c.r_alimentar,
                c.n_especial,
                c.uso_imagem
            FROM culto_criancas cc
            JOIN criancas c ON c.id = cc.crianca_id
            WHERE cc.culto_id = $1
            ORDER BY cc.codigo`,
            [cultoId],
        );

        // DEBUG: Veja o que vem do banco
        console.log("Resultado do banco:", result.rows[0]);

        const criancas = result.rows.map((row) => ({
            id: row.id,
            codigo: row.codigo,
            isChecked: row.is_checked,
            crianca: {
                id: row.crianca_id,
                nome: row.nome,
                idade: row.idade,
                responsavel: row.responsavel,
                telefone: row.telefone,
                rAlimentar: row.r_alimentar,
                nEspecial: row.n_especial,
                usoImagem: row.uso_imagem,
            },
        }));

        // DEBUG: Veja o objeto mapeado
        console.log("Objeto mapeado:", criancas[0]);

        res.json(criancas);
    } catch (err) {
        console.error("Erro ao buscar crianças:", err);
        res.status(500).json({ error: err.message });
    }
});

// Deletar criança do Culto
router.get("/:cultoId/deletecrianca/:criancaId", async (req, res) => {
    try {
        const { cultoId, criancaId } = req.params;

        await pool.query(
            `
            DELETE FROM culto_criancas
            WHERE culto_id = $1 AND crianca_id = $2
            `,
            [cultoId, criancaId],
        );

        res.json({ message: "Criança removida com sucesso" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.patch("/:cultoId/crianca/:criancaId/check", async (req, res) => {
    try {
        const { cultoId, criancaId } = req.params;
        const { isChecked } = req.body;

        const result = await pool.query(
            `
            UPDATE culto_criancas
            SET is_checked = $1
            WHERE culto_id = $2 AND crianca_id = $3
            RETURNING *
            `,
            [isChecked, cultoId, criancaId],
        );

        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
