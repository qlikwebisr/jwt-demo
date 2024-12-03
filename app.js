//main script
import express from "express";
import cors from "cors";
import fs from "fs/promises";
import path from "path";
import bodyParser from "body-parser";
import fetch from "node-fetch";
import dotenv from "dotenv";
import { fileURLToPath } from "url";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const port = process.env.PORT || 3000;
//const CLIENT_SECRET = process.env.CLIENT_SECRET;
//const CLIENT_ID = process.env.CLIENT_ID;
const tenant = process.env.TENANT;

console.log(port, tenant);

//Express
const app = express();
app.use(cors());

/**
 * body-parser module is used to read HTTP POST data
 */
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

//files
import model from "./models/model.js";
import jwtidp from "./models/jwtidp.js";

// Serve static files from the "public" directory
app.use(express.static(path.join(__dirname, "public")));

//routes
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname + "/index.html"));
});

app.get("/jwt", async (req, res) => {

    //create JWT IDP
    const jwt_response = await jwtidp.createJwtIdp(tenant);

    //write to JSON
    //const jsn = { jwt: `Bearer test test` };
    //await model.writeToJson(jsn, "../files/jwt.json"); 

    //read fro JSON
    //const jwt =  await model.readFromJson("../files/jwt.json");   
    //console.log(jwt.jwt);
    
    res.json(jwt_response);
});

//server 
app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
 });
