import connection from "../database.js";
import joi from "joi";
import DateExtension from "@joi/date";


export async function getCustomers(req, res) {

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
}

export async function getCustomerId(req, res) {

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
}

export async function postCustomers(req, res) {

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
}

export async function updateCustomer(req, res) {
    const { id } = req.params;
    const { name, phone, cpf, birthday } = req.body;

    const customerData = {
        name,
        phone,
        cpf,
        birthday
    }

    const Joi = joi.extend(DateExtension);

    try {

        const customerSchema = joi.object({
            name: joi.string().required(),
            phone: joi.string().pattern(/^[0-9]{10}$|^[0-9]{11}$/).required(),
            cpf: joi.string().pattern(/^[0-9]{11}$/).required(),
            birthday: Joi.date().format('YYYY-MM-DD').required()
        });
    
        const { error } = customerSchema.validateAsync(customerData, { abortEarly: false });
    
        if (error) {
            res.status(400).send(error.details.map(detail => detail.message));
            return;
        }
        const cpfCustomer = await connection.query(`SELECT * FROM customers WHERE cpf=$1`, [cpf]);

        if (cpfCustomer.rows.length !== 0) return res.sendStatus(409);

        await connection.query(`UPDATE customers SET name=$1, phone=$2, cpf=$3, birthday=$4 WHERE id=$5`,
            [name, phone, cpf, birthday, id]);

        res.sendStatus(200);
    }
    catch (e) {
        res.sendStatus(500);
        console.log(e);
    }
}