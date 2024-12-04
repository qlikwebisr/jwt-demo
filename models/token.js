//file to generate a jwt token
import jsonWebToken from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";
import dotenv from "dotenv";

dotenv.config();

//files
import model from "./model.js";

const token = {

  generate: async function () {
    return new Promise(async (resolve, reject) => {
      //get jwt parameters from jwt.json
      const jwt = await model.readFromJson("../files/jwt.json");
      //console.log('jwt', jwt);

      //get private key from jwt.json - key in base64
      const privateKey64 = jwt.privateKey;

      //64bit key
      //const convertedPrivateKey = Buffer.from(privateKey64, "base64").toString("utf8");
      //console.log('convertedPrivateKey', convertedPrivateKey);

      if (!privateKey64) {
        throw new Error("privateKey64 is undefined or empty");
      }

      try {
        const convertedPrivateKey = Buffer.from(
          privateKey64,
          "base64"
        ).toString("utf8");
        // use convertedPrivateKey here

        const subject = await model.getUserSubject(
          process.env.TENANT,
          process.env.USER_EMAIL
        );
        //const subject = "auth0|a08D00000191QfBIAU";

        const signingOptions = {
          keyid: jwt.keyID,
          algorithm: "RS256",
          issuer: jwt.issuer,
          expiresIn: "30s",
          notBefore: "-30s",
          audience: "qlik.api/login/jwt-session",
        };

        const payload = {
          jti: uuidv4().toString(),
          sub: subject,
          subType: "user",
          name: process.env.USER_NAME,
          email: process.env.USER_EMAIL,
          email_verified: true,
          groups: [],
        };

        //from base64
        const token = jsonWebToken.sign(
          payload,
          convertedPrivateKey,
          signingOptions
        );
        //console.log("token", token);

        resolve(token);

      } catch (error) {
        console.error("Error converting private key:", error);
        reject(error);
      }
    });
  },
};

export default token;
