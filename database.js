import pg from "pg";
import dotenv from "dotenv";

dotenv.config();

const {Pool} = pg;
const connection = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false
    }
  });

  // if(process.env.MODE === "PROD"){
  //   connection.ssl = {
  //     rejectUnauthorized: false
  //   }
  // }

export default connection;