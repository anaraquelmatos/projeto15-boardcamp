import express, { json } from "express";
import cors from "cors";
import dotenv from "dotenv";
import joi from "joi";
import DateExtension from "@joi/date";
import dayjs from "dayjs";
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

    if (!name) return res.sendStatus(400);

    try {

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
        if (name) {
            const nameGames = await connection.query(`SELECT * FROM games WHERE UPPER(name) LIKE UPPER($1)`, [name + "%"]);
            res.send(nameGames.rows);
        } else {
            const games = await connection.query(`SELECT * FROM games`);
            res.send(games.rows);
        }
    }
    catch (e) {
        res.sendStatus(500);
        console.log(e);
    }
})

app.post('/games', async (req, res) => {

    const { name, image, stockTotal, categoryId, pricePerDay } = req.body;

    if (!name) return res.sendStatus(400);

    try {

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

app.get('/customers', async (req, res) => {

    const { cpf } = req.query;

    try {
        if (cpf) {
            const customersSearch = await connection.query(`SELECT * FROM customers WHERE cpf LIKE $1`, [cpfCustomer + "%"]);
            res.send(customersSearch.rows);
        } else {
            const customers = await connection.query(`SELECT * FROM customers`);
            res.send(customers.rows);
        }
    }
    catch (e) {
        res.sendStatus(500);
        console.log(e);
    }
})

app.get('/customers/:id', async (req, res) => {

    const { id } = req.params;

    try {
        const customers = await connection.query(`SELECT * FROM customers WHERE id = $1`, [id]);

        if (customers.rows.length !== 0) {

            res.send(customers.rows);

        } else {
            res.sendStatus(404);
        }

    }
    catch (e) {
        res.sendStatus(500);
        console.log(e);
    }
})

app.post('/customers', async (req, res) => {

    const { name, phone, cpf, birthday } = req.body;

    const customerData = {
        name,
        phone,
        cpf,
        birthday
    }

    const Joi = joi.extend(DateExtension);

    const customerSchema = joi.object({
        name: joi.string().required(),
        phone: joi.string().required().pattern(/^[0-9]{10}$|^[0-9]{11}$/),
        cpf: joi.string().pattern(/^[0-9]{11}$/).required(),
        birthday: Joi.date().format('YYYY-MM-DD').required()
    });

    const { error } = customerSchema.validateAsync(customerData, { abortEarly: false });

    if (error) {
        res.status(400).send(error.details.map(detail => detail.message));
        return;
    }

    try {

        const cpfCustomer = await connection.query(`SELECT * FROM customers WHERE cpf=$1`, [cpf]);

        if (cpfCustomer.rows.length) return res.sendStatus(409);

        await connection.query(`INSERT INTO customers (name, phone, cpf, birthday) 
        VALUES ($1, $2, $3, $4)`, [name, phone, cpf, birthday]);

        res.sendStatus(201);
    }
    catch (e) {
        res.sendStatus(500);
        console.log(e);
    }
})

app.put('/customers/:id', async (req, res) => {
    const { id } = req.params;
    const { name, phone, cpf, birthday } = req.body;

    const customerData = {
        name,
        phone,
        cpf,
        birthday
    }

    const Joi = joi.extend(DateExtension);

    const customerSchema = joi.object({
        name: joi.string().required(),
        phone: joi.string().required().pattern(/^[0-9]{10}$|^[0-9]{11}$/),
        cpf: joi.string().pattern(/^[0-9]{11}$/).required(),
        birthday: Joi.date().format('YYYY-MM-DD').required()
    });

    const { error } = customerSchema.validateAsync(customerData, { abortEarly: false });

    if (error) {
        res.status(400).send(error.details.map(detail => detail.message));
        return;
    }

    try {

        const cpfCustomer = await connection.query(`SELECT * FROM customers WHERE cpf=$1`, [cpf]);

        if (cpfCustomer.rows.length) return res.sendStatus(409);

        await connection.query(`UPDATE customers SET name=$1, phone=$2, cpf=$3, birthday=$4 WHERE id=$5`,
            [name, phone, cpf, birthday, id]);

        res.sendStatus(200);
    }
    catch (e) {
        res.sendStatus(500);
        console.log(e);
    }
})

app.post('/rentals', async (req, res) => {

    const { customerId, gameId, daysRented } = req.body;

    const rentDate = dayjs().format('YYYY-MM-DD');

    const originalPrice = daysRented * 3;

    const returnDate = null;

    const delayFee = null;

    try {

        const customer = await connection.query(`SELECT * FROM customers WHERE id=$1`, [customerId]);

        if (customer.rows.length === 0) return sendStatus(400);

        const game = await connection.query(`SELECT * FROM games WHERE id=$1`, [gameId]);

        if (game.rows.length === 0) return sendStatus(400);

        await connection.query(`INSERT INTO rentals ("customerId", "gameId", "daysRented", "rentDate", "originalPrice",
        "delayFee","returnDate") 
        VALUES ($1,$2, $3, $4, $5, $6, $7)`, [customerId, gameId, daysRented, rentDate, originalPrice, delayFee, returnDate]);

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