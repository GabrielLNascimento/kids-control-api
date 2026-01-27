const mongoose = require("mongoose");

const cultoSchema = new mongoose.Schema(
    {
        nome: {
            type: String,
            required: true,
        },

        data: {
            type: Date,
            required: true,
        },

        periodo: {
            type: String,
            required: true,
        },

        criancas: [
            {
                crianca: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "Crianca",
                    required: true,
                },

                codigo: {
                    type: Number,
                    required: true,
                },

                isChecked: {
                    type: Boolean,
                    default: false,
                },
            },
        ],
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model("Culto", cultoSchema);
