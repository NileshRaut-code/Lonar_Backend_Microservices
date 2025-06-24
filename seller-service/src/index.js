import dotenv from "dotenv";

dotenv.config({
    path: './.env'
});

import connectDB from "./db/index.js";
import { app } from './app.js';

connectDB()
.then(() => {
    app.listen(process.env.PORT || 8003, () => {
        console.log(`⚙️ Seller-Service is running at port : ${process.env.PORT || 8003}`);
    });
})
.catch((err) => {
    console.log("MONGO db connection failed !!! ", err);
});
