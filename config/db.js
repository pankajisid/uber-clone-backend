import pkg from "pg"
import dotenv from "dotenv"

dotenv.config();

// Postgresql client setup 
const { Pool } = pkg;

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
});

// Create table sql statement (inside the query function)
const createTableSQL = `
create table if not exists users(
    id serial primary key,
    name varchar(100) not null,
    email varchar(100) unique not null,
    password varchar(255) not null,
    is_verified boolean default false,
    verification_code varchar(6),
    reset_code varchar(6),
    reset_code_expires timestamp,
    created_at timestamp default current_timestamp
);`;

// Function to create the table 

const createTable = async () => {
    try {
        const client = await pool.connect();
        await client.query(createTableSQL);
        console.log("Table 'users' created successfully");
        client.release(); // release the connection back to the pool
    }
    catch (error) {
        console.error("Error creating table:", error)
    }
};

// Call the function to create the table 
createTable();


export default pool