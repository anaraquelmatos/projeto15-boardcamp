import express, { json } from "express";
import cors from "cors";
import dotenv from "dotenv";
import database from "./database.js";

const app = express();

app.use(json());
app.use(cors());
dotenv.config();

app.get('/categories', (req, res) => {
    try{
        const categories = database.query("SELECT * FROM categories");
        res.send(categories);
    }
    catch (e){
        res.sendStatus(500);
        console.log(e);
    }
})

app.post('/categories', (req, res) => {

    const {name} = req.body;

    try{
        if(name === "") return res.sendStatus(400);

        const categories = database.query("SELECT * FROM categories");

        const validation = categories.find(categorie => {
            categorie.name === name;
        })
        if(validation) return send.sendStatus(409);

        res.status(201);
    }
    catch (e){
        res.sendStatus(500);
        console.log(e);
    }
})

app.listen(4000, () => {
    console.log("Servidor conectado!");
})