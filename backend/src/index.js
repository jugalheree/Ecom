import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from backend folder regardless of cwd
dotenv.config({
    path: path.resolve(__dirname, "..", ".env"),
});

import connectDB from "./db/index.js";
import { app } from "./app.js";

connectDB()
.then(() => {
    app.on("error", (error) =>{
        console.log("Error: ", error);
        process.exit(1);
    })
    app.listen(process.env.PORT || 8000, () => {
        console.log(`Server is running on port ${process.env.PORT || 8000}`);
    })
})
.catch((error) => {
    console.log("MONGO db connection failed !!! ", error);
});