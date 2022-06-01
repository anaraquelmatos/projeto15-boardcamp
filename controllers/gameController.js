import connection from "../database.js";

export async function getGames(req, res) {

    const { name } = req.query;

    try {
        if (name) {
            const nameGames = await connection.query(`SELECT games.*, categories.name as "categoryName" FROM games
            JOIN categories ON categories.id = games."categoryId"
            WHERE UPPER(games.name) LIKE UPPER($1)`, [name + "%"]);
            res.send(nameGames.rows);
        } else {
            const games = await connection.query(`SELECT games.*, categories.name as "categoryName" FROM games
            JOIN categories ON categories.id = games."categoryId"`);
            res.send(games.rows);
        }
    }
    catch (e) {
        res.sendStatus(500);
        console.log(e);
    }
}

export async function postGames(req, res) {

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
}