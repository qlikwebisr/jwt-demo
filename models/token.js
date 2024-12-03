//file to generate a jwt token
import jsonWebToken from "jsonwebtoken";
import fs from "fs";
import config from "../config/config";
import { v4 as uuidv4 } from "uuid";


//const privateKey = fs.readFileSync("./data/privatekey_fox.pem", "utf8");
//const publicKey = fs.readFileSync("./data/publickey_new.pem", "utf8");

 //console.log('privateKey', privateKey);
// console.log("==================================================");
// console.log('publicKey', publicKey);

// const privateKey64 = Buffer.from(privateKey, "utf8").toString("base64");
// const publicKey64 = Buffer.from(publicKey, "utf8").toString("base64");


const privateKey64 = config.privateKey64;
// console.log('privateKey64', privateKey64);
// console.log("==================================================");
// console.log('publicKey64', publicKey64);
//64bit key
const convertedPrivateKey = Buffer.from(privateKey64, "base64").toString("utf8");

//console.log('convertedPrivateKey', convertedPrivateKey);

const methods = {

    generate: async function (sub, name, email, groups = []) {

        console.log('generate', sub, name, email, config.keyid, config.issuer);

        const signingOptions = {
            "keyid": config.keyid,
            "algorithm": "RS256",
            "issuer": config.issuer,
            "expiresIn": "30s",
            "notBefore": "-30s",
            "audience": "qlik.api/login/jwt-session"
        };

        // let key = `-----BEGIN PRIVATE KEY-----
        // MIIEvgIBADANBgkqhkiG......ywYZUYfle
        // xEHReKWitvoKDDPp8l0jpPsw
        // -----END PRIVATE KEY-----`;

       // const key = privateKey.replace("/\n/g", "\n");

        //console.log('key', key);

        const payload = {
            jti: uuidv4().toString(),
            sub: sub,
            subType: "user",
            name: name,
            email: email,
            email_verified: true,
            groups: groups
        };

        //from file
       // const token = jsonWebToken.sign(payload, privateKey, signingOptions);
        
        //from base64
        const token = jsonWebToken.sign(payload, convertedPrivateKey, signingOptions);
        //console.log('token', token);

        return token;
    }
};


module.exports = methods;
