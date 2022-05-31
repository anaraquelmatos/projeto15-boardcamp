import express, { json } from "express";
import cors from "cors";
import dotenv from "dotenv";
import connection from "./database.js";

const app = express();

app.use(json());
app.use(cors());
dotenv.config();

app.get('/categories', async (req, res) => {
    try {
        const categories = await connection.query("SELECT * FROM categories");
        res.send(categories.rows);
    }
    catch (e) {
        res.sendStatus(500);
        console.log(e);
    }
})

app.post('/categories', async (req, res) => {

    const { name } = req.body;

    try {
        if (!name) return res.sendStatus(400);

        const categories = await connection.query(`SELECT * FROM categories WHERE name=$1`, [name]);

        if (categories.rows.length !== 0) return res.sendStatus(409);

        await connection.query(`INSERT INTO categories (name) VALUES ($1)`, [name]);

        res.sendStatus(201);
    }
    catch (e) {
        res.sendStatus(500);
        console.log(e);
    }
})

app.get('/games', async (req, res) => {

    const { name } = req.query;

    try {
        const games = await connection.query(`SELECT * FROM games WHERE UPPER(name) LIKE UPPER($1)`, [name + "%"]);
        res.send(games.rows);
    }
    catch (e) {
        res.sendStatus(500);
        console.log(e);
    }
})

app.post('/games', async (req, res) => {

    const { name, image, stockTotal, categoryId, pricePerDay } = req.body;

    try {
        if (!name) return res.sendStatus(400);

        const categories = await connection.query(`SELECT * FROM categories WHERE id=$1`, [categoryId]);

        if (categories.rows.length === 0 || stockTotal <= 0 || pricePerDay <= 0) {
            return res.sendStatus(400);
        }

        const nameGame = await connection.query(`SELECT * FROM games WHERE name=$1`, [name]);

        if (nameGame.rows.length !== 0) return res.sendStatus(409);

        await connection.query(`INSERT INTO games (name, image, "stockTotal", "categoryId", "pricePerDay") 
        VALUES ($1, $2, $3, $4, $5)`, [name, image, stockTotal, categoryId, pricePerDay]);

        res.sendStatus(201);
    }
    catch (e) {
        res.sendStatus(500);
        console.log(e);
    }
})


const port = process.env.PORT || 4000;

app.listen(port, () => {
    console.log("Servidor conectado!");
})