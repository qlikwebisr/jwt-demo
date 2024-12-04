//main script
import express from "express";
import cors from "cors";
import fs from "fs/promises";
import path from "path";
import bodyParser from "body-parser";
import https from "https";
import dotenv from "dotenv";
import { fileURLToPath } from "url";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const port = process.env.PORT || 3000;

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
import token from "./models/token.js";

// Serve static files from the "public" directory
app.use(express.static(path.join(__dirname, "public")));

//routes
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname + "/index.html"));
});

app.get("/test", async (req, res) => {
  //token.generate();
  // const user_sub = await model.getUserSubject(process.env.TENANT, "agranov.paka@gmail.com");
  // console.log("user_sub", user_sub);
  // res.json({user_sub: user_sub});

  res.json({test: "test"});
});

//return config data
app.get("/config", (req, res) => {

  //tenantDomain, qlikWebIntegrationId, appId, objId, currentLoginType, loginTypes

  const loginTypes = {
    INTERACTIVE_LOGIN: 'interactive-login',
    JWT_LOGIN: 'jwt-login'
  }

  const config = {
    tenantDomain: tenant,
    qlikWebIntegrationId: process.env.WEBID,
    appId: process.env.APPID,
    sheetId: process.env.SHEETID,
    currentLoginType: loginTypes.JWT_LOGIN,
    loginTypes,currentLoginType: loginTypes.JWT_LOGIN,   
  };

  res.json(config);

});

app.get("/jwt", async (req, res) => {
  //create JWT IDP
  const jwt_response = await jwtidp.createJwtIdp(tenant);
  res.json(jwt_response);
});

app.get("/token", async (req, res) => {

  const gen_token =  await token.generate();
  console.log("token", gen_token);

  res.json({ token: gen_token });
});

//iframe page
app.get("/iframe", (req, res) => {
    
    res.sendFile(path.join(__dirname + "/public/iframe.html"));
});

//server http
//app.listen(port, () => {
//   console.log(`Example app listening on port ${port}`);
//});

(async () => {
  try {
    const key = await fs.readFile("./certs/server.key");
    const cert = await fs.readFile("./certs/server.crt");

    https
      .createServer(
        {
          key: key,
          cert: cert,
        },
        app
      )
      .listen(port, "localhost", function () {
        console.log(
          `Https Server listening on port 3000! Go to https://localhost:${port}`
        );
      });
  } catch (err) {
    console.error("Error reading certificate files:", err);
  }
})();
