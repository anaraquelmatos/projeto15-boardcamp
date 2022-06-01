import dayjs from "dayjs";
import connection from "../database.js";

export async function getRentals(req, res) {

    const { customerId, gameId } = req.query;

    let rentals;

    try {
        if (customerId) {
            rentals = await connection.query(`    
            SELECT rentals.*, customers.name as "customersName", games.name as "gameName", games."categoryId",
            categories.name as "categoryName"
            FROM rentals
            JOIN customers ON customers.id = rentals."customerId" 
            JOIN games ON games.id = rentals."gameId" 
            JOIN categories ON categories.id = games."categoryId" 
            WHERE rentals."customerId" = $1`, [customerId]);
        } else if (gameId) {
            rentals = await connection.query(`    
            SELECT rentals.*, customers.name as "customersName", games.name as "gameName", games."categoryId",
            categories.name as "categoryName"
            FROM rentals
            JOIN customers ON customers.id = rentals."customerId" 
            JOIN games ON games.id = rentals."gameId" 
            JOIN categories ON categories.id = games."categoryId" 
            WHERE rentals."gameId" = $1`, [gameId]);
        } else {
            rentals = await connection.query(`    
            SELECT rentals.*, customers.name as "customersName", games.name as "gameName", games."categoryId",
            categories.name as "categoryName"
            FROM rentals
            JOIN customers ON customers.id = rentals."customerId" 
            JOIN games ON games.id = rentals."gameId" 
            JOIN categories ON categories.id = games."categoryId"`);
        }

        let allInfos = rentals.rows;
        const array = [];

        for (let allInfo of allInfos) {
            allInfo = {
                ...allInfo,
                customers: {
                    id: allInfo.customerId,
                    name: allInfo.customersName
                },
                games: {
                    id: allInfo.gameId,
                    name: allInfo.gameName,
                    categoryId: allInfo.categoryId,
                    categoryName: allInfo.categoryName
                }
            }

            delete allInfo.customersName;
            delete allInfo.gameName;
            delete allInfo.categoryId;
            delete allInfo.categoryName;

            array.push(allInfo);
        }

        res.status(200).send(array);
    }
    catch (e) {
        res.sendStatus(500);
        console.log(e);
    }
}

export async function postRentals(req, res){

    const { customerId, gameId, daysRented } = req.body;

    const rentDate = dayjs().format('YYYY-MM-DD');

    const returnDate = null;

    const delayFee = null;

    try {

        const customer = await connection.query(`SELECT * FROM customers WHERE id=$1`, [customerId]);

        if (customer.rows.length === 0) return sendStatus(400);

        const game = await connection.query(`SELECT * FROM games WHERE id=$1`, [gameId]);

        if (game.rows.length === 0) return sendStatus(400);

        const rentals = await connection.query(`SELECT "returnDate" FROM rentals WHERE id=$1 AND "returnDate" IS NULL`, [gameId]);

        if (rentals.rows.length >= game.rows[0].stockTotal) {
            return res.sendStatus(400);
        }

        const originalPrice = daysRented * game.rows[0].pricePerDay;

        if (daysRented <= 0) return sendStatus(400);

        await connection.query(`INSERT INTO rentals ("customerId", "gameId", "daysRented", "rentDate", "originalPrice",
        "delayFee","returnDate") 
        VALUES ($1,$2, $3, $4, $5, $6, $7)`, [customerId, gameId, daysRented, rentDate, originalPrice, delayFee, returnDate]);

        res.sendStatus(201);
    }
    catch (e) {
        res.sendStatus(500);
        console.log(e);
    }
}

export async function postRentalId(req, res) {

    const { id } = req.params;
    const returnDate = dayjs().format('YYYY-MM-DD');


    try {
        const idRental = await connection.query(`SELECT * FROM rentals WHERE id=$1`, [id]);

        if (idRental.rows.length === 0) {
            res.sendStatus(404);
            return;
        }
        if (idRental.rows[0].returnDate !== null) {
            res.sendStatus(400);
            return;
        }

        const { rentDate, daysRented, gameId } = idRental.rows[0];
        const dataRentDate = new Date(rentDate);
        const sumDate = new Date(dataRentDate.setDate(dataRentDate.getDate() + parseInt(daysRented)));
        const delay = null;

        if (sumDate > dataRentDate) {
            const total = Math.abs(dataRentDate - sumDate);
            delay = parseInt(total / (1000 * 3600 * 24));
        }

        const idGame = await connection.query(`SELECT * FROM games WHERE id=$1`, [gameId]);

        const { pricePerDay } = idGame.rows[0];

        const delayFee = pricePerDay * delay;

        await connection.query(`UPDATE rentals SET "returnDate"=$1, "delayFee"=$2 WHERE id=$3`,
            [returnDate, delayFee, id]);

        res.sendStatus(200);
    }
    catch (e) {
        res.sendStatus(500);
        console.log(e);
    }
}

export async function deleteRental(req, res) {
    const { id } = req.params;

    try {
        const idRental = await connection.query(`SELECT * FROM rentals WHERE id=$1`, [id]);

        if (idRental.rows.length === 0) {
            res.sendStatus(404);
            return;
        }
        if (idRental.rows[0].returnDate === null) {
            res.sendStatus(400);
            return;
        }

        await connection.query(`DELETE FROM rentals WHERE id=$1`, [id]);

        res.sendStatus(200);

    } catch (e) {
        console.log(e);
    }
}