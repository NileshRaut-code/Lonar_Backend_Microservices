import dotenv from "dotenv";

dotenv.config({
    path: './.env'
});

import connectDB from "./db/index.js";
import { app } from './app.js';

connectDB()
.then(() => {
    app.listen(process.env.PORT || 8004, () => {
        console.log(`⚙️ Admin-Service is running at port : ${process.env.PORT || 8004}`);
    });
})
.catch((err) => {
    console.log("MONGO db connection failed !!! ", err);
});
