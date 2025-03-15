import express from "express"
import cors from "cors"
import dotenv from "dotenv"
import router from "./routes/authRoutes.js";


dotenv.config();


const app = express();


//Middleware
app.use(cors());
app.use(express.json()) // Parse incoming JSON data
app.use(express.urlencoded({ extended: true })) // for form-data parsing

// Routes
app.use("/api/auth", router)

const PORT = process.env.PORT || "4000"

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server listening at http://0.0.0.0:${PORT}`)
})