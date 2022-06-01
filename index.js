import express, { json } from "express";
import cors from "cors";
import dotenv from "dotenv";
import { getCategories, postCategories } from "./controllers/categoryController.js";
import { getGames, postGames } from "./controllers/gameController.js";
import { getCustomerId, getCustomers, postCustomers, updateCustomer } from "./controllers/customerController.js";
import { deleteRental, getRentals, postRentalId, postRentals } from "./controllers/rentalController.js";


const app = express();

app.use(json());
app.use(cors());
dotenv.config();

app.get('/categories', getCategories);

app.post('/categories', postCategories)

app.get('/games', getGames);

app.post('/games', postGames);

app.get('/customers', getCustomers);

app.get('/customers/:id', getCustomerId);

app.post('/customers', postCustomers);

app.put('/customers/:id', updateCustomer);

app.get('/rentals', getRentals);

app.post('/rentals', postRentals);

app.post('/rentals/:id/return', postRentalId);

app.delete('/rentals/:id', deleteRental);

const port = process.env.PORT || 4000;

app.listen(port, () => {
    console.log("Servidor conectado!");
})