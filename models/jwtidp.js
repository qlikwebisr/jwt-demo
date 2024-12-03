//file for JWT idp creation
import fs from "fs/promises";
import path from "path";
import fetch from "node-fetch";
import crypto from "crypto";

//files
import model from "./model.js";

const jwtidp = {
  //create ssh key pair
  //https://nodejs.org/api/crypto.html#cryptogeneratekeypairsynctype-options
  //https://www.geeksforgeeks.org/node-js-crypto-generatekeypairsync-method/?ref=lbp
  //https://gist.github.com/kishstats/604f35b27186b5a011ebac49766ff113
  genKeyPair: () => {
    return new Promise(async (resolve, reject) => {
      // Generates an object where the keys are stored in properties `privateKey` and `publicKey`
      //'rsa', 'rsa-pss'
      //https://nodejs.org/api/crypto.html#cryptogeneratekeypairsynctype-options
      const keyPair = crypto.generateKeyPairSync("rsa", {
        modulusLength: 4096, // bits - standard for RSA keys - 4096
        publicKeyEncoding: {
          type: "spki", // "Public Key Cryptography Standards 1" //Must be one of 'pkcs1' (RSA only) or 'spki'.
          format: "pem", // Most common formatting choice //Must be 'pem', 'der', or 'jwk'.
        },
        privateKeyEncoding: {
          type: "pkcs8", // "Public-Key Cryptography Standards 8" //Must be one of 'pkcs1' (RSA only), 'pkcs8' (unencrypted), or 'sec1' (for keys with ECC curves).
          format: "pem",
        },
      });

      resolve(keyPair);
    });
  },

  /**
   * Create JWT Identity Provider
   * https://qlik.dev/apis/rest/identity-providers/##/entries/v1/identity-providers-post
   * @returns
   */
  createJwtIdp: (tenant_domain) => {
    return new Promise(async (resolve, reject) => {

      //get ACCESS_TOKEN
      const access_token = await model.get_access_token(tenant_domain);

      //create CSP rule
      //const host = "localhost:3000";
      //const csp = await model.addCSPrule(tenant_domain, host, access_token);

      //set parameters for JWT IDP: keyID, issuer, publicKeyForIdp, privateKey
      const keyID = `${tenant_domain}_${Math.floor(Math.random() * 1000)}_kid`;

      const issuer = tenant_domain;

      /*
      //Read from file
      //const publicKeyForIdp = settings.publicKey;
      const privateKey = fs.readFileSync(
        "./server/certs/privatekey.pem",
        "utf8"
      );
      const publicKey = fs.readFileSync("./server/certs/publickey.pem", "utf8");
      const publicKeyForIdp = publicKey.replace(/\r/g, "\n"); */

      //New version: read from keyPair
      const keyPair = await jwtidp.genKeyPair();

      // Prints  key pair before encoding
    //   console.log("The public key is: ", keyPair.publicKey);
    //   // console.log("=====================================================");
    //   console.log("tThe private key is: ", keyPair.privateKey);

      const privateKey = Buffer.from(keyPair.privateKey, "utf8").toString(
        "base64"
      );
      const publicKey = Buffer.from(keyPair.publicKey, "utf8").toString(
        "base64"
      );

    //   console.log(`The 64 public key is: ${publicKey}`);
    //   console.log("=====================================================");
    //   console.log(`The 64 private key is: ${privateKey}`);

      //save JWT details to file
      const jwt = {
        keyID: keyID,
        issuer: issuer,
        publicKey: publicKey,
        privateKey: privateKey,
      };

      await model.writeToJson(jwt, "../files/jwt.json");

      //remove \r from public key, for the request
      const publicKeyForIdp = keyPair.publicKey.replace(/\r/g, "\n");

      const tenantId = await model.getTenantId(tenant_domain, access_token);

      const url = `https://${tenant_domain}/api/v1/identity-providers`;

      //Send request to create JWT IDP
      const body = {
        protocol: "jwtAuth",
        provider: "external",
        description: "JWT Identity Provider",
        tenantIds: [tenantId],
        clockToleranceSec: 50,
        options: {
          issuer: issuer, //The JWT issuer.
          jwtLoginEnabled: true,
          staticKeys: [
            {
              kid: keyID, //Key ID used to sign the JWTs.
              pem: publicKeyForIdp, //The public key used to sign the JWTs.
            },
          ],
        },
      };

      //console.log("body", body);

      const options = {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: "Bearer " + access_token,
        },
        body: JSON.stringify(body),
      };

      //send request
      await fetch(url, options)
        .then((response) => {
          if (!response.ok) {
            throw new Error(
              `HTTP error! Status: ${response.status}, Status text: ${response.statusText}`
            );
          }
          return response.json();
        })
        .catch((err) => {
          console.log("Identity-providers creation error:", err);
          reject(err);
        })
        .then((json_identity_providers) => {

          console.log("identity-providers response", json_identity_providers);
          resolve(json_identity_providers);

        }); 


    });
  },
};

export default jwtidp;
