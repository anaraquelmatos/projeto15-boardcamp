import express, { json } from "express";
import cors from "cors";
import dotenv from "dotenv";
import database from "./database.js";

const app = express();

app.use(json());
app.use(cors());
dotenv.config();


app.listen(4000, () => {
    console.log("Servidor conectado!");
})