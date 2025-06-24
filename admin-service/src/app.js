import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import path from "path";
const app = express();

app.use(
  cors({
     origin:[process.env.CORS_ORIGIN,process.env.CORS_ORIGINN,process.env.CORS_ORIGINNN],
    credentials: true,
  })
);

app.get("/",(req,res)=>{res.send("hellow from admin")})
app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static(path.resolve("./public")));
app.use(cookieParser());

import adminRouter from "./routes/admin.routes.js";

app.use("/", adminRouter);

export { app };
