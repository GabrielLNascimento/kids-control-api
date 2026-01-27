const { Pool } = require("pg");
require("dotenv").config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false,
    },
});

// Teste de conexão ao iniciar o servidor
async function conectarBanco() {
    try {
        const res = await pool.query("SELECT NOW()");
        console.log("✅ Conectado ao Neon com sucesso!");
        console.log("🕒 Horário do banco:", res.rows[0].now);
    } catch (error) {
        console.error("❌ Erro ao conectar no Neon:", error.message);
        process.exit(1);
    }
}

conectarBanco();

module.exports = pool;
