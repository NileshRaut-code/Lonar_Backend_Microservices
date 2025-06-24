import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();

app.use(cors({
    origin: [process.env.CORS_ORIGIN, process.env.CORS_ORIGINN],
    credentials: true
}));

app.use(express.json({limit: "16kb"}));
app.use(express.urlencoded({extended: true, limit: "16kb"}));
app.use(express.static("public"));
app.use(cookieParser());

//routes import
import sellerRouter from './routes/seller.routes.js';

//routes declaration
app.use("/", sellerRouter);

export { app };
