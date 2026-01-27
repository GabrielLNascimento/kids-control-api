const mongoose = require("mongoose");

const criancaSchema = new mongoose.Schema(
    {
        nome: {
            type: String,
            required: true,
        },

        telefone: {
            type: String,
            required: true
        },

        responsavel: {
            type: String,
            required: true
        },

        dataNascimento: {
            type: Date,
            required: true
        },

        idade: {
            type: Number,
            required: true
        },

        rAlimentar: {
            type: Boolean,
            required: true
        },

        nEspecial: {
            type: Boolean,
            required: true
        }
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model("Crianca", criancaSchema);
