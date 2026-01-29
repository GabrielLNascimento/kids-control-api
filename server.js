require("dotenv").config();
const express = require("express");
const app = express();
const cors = require("cors");
const pool = require("./config/db.js");

// rotas
const routesCulto = require("./routes/cultosRoutes.js");
const routesCrianca = require("./routes/criancaRoutes.js");

app.use(
    cors({
        origin: "*",
        methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    }),
);
app.use(express.json());

app.use("/", routesCulto);
app.use("/", routesCrianca);

const port = process.env.PORT;
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
