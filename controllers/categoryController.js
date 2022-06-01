import connection from "../database.js";

export async function getCategories(req, res) {
    try {
        const categories = await connection.query("SELECT * FROM categories");
        res.send(categories.rows);
    }
    catch (e) {
        res.sendStatus(500);
        console.log(e);
    }
}

export async function postCategories(req, res) {

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
}