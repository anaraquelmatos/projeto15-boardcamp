import express, { json } from "express";
import cors from "cors";
import dotenv from "dotenv";
import database from "./database.js";

const app = express();

app.use(json());
app.use(cors());
dotenv.config();

app.get('/categories', async (req, res) => {
    try {
        const categories = await database.query("SELECT * FROM categories");
        res.send(categories.rows);
    }
    catch (e) {
        console.log(e);
    }
})

app.post('/categories', async (req, res) => {

    const { name } = req.body;

    try {
        if (name === "") return res.sendStatus(400);

        const categories = await database.query(`SELECT * FROM categories WHERE name=$1`, [name]);

        if (categories.rows.length !== 0) return send.sendStatus(409);

        await database.query(`INSERT INTO categories (name) VALUES ($1)`, [name]);

        res.sendStatus(201);
    }
    catch (e) {
        console.log(e);
    }
})

app.get('/games', async (req, res) => {

    const {name} = req.query;

    try {
        const games = await database.query(`SELECT * FROM games WHERE UPPER(name) LIKE UPPER($1)`, [name + "%"]);
        res.send(games.rows);
    }
    catch (e) {
        console.log(e);
    }
})



const port = process.env.PORT || 4000;

app.listen(port, () => {
    console.log("Servidor conectado!");
})