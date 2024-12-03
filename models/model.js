import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

//main model object for secondary functions
const model = {

    test: () => {

        console.log("test");
        return "test";
    },

    //get access token for API requests
    getTenantId: async (tenant_domain, access_token) => {

        return new Promise(async (resolve, reject) => {

            const url = `https://${tenant_domain}/api/v1/tenants/me`;
      
            //resolve(body);
            const options = {
                method: "GET",
                headers: {
                  "Content-Type": "application/json",
                  "Accept": "application/json",
                  'Authorization': 'Bearer ' + access_token
                }
              };

              await fetch(url, options)
              .then((response) => {
                //console.log("options", options);
                
                if (!response.ok) {
                  throw new Error(
                    `HTTP error! Status: ${response.status}, Status text: ${response.statusText}`
                  );
                }
                return response.json();

                }).catch((err) => {
                    console.log('fetch tenant_data error:', err);
                    reject(err)
                })
                .then((tenant_data) => {
                    //console.log('tenant data', tenant_data);
                    resolve(tenant_data.id);
                });
      
        });

    },

    //add CSP rule for the host
    addCSPrule: async (tenant_domain, host, access_token) => {

        return new Promise(async (resolve, reject) => {

            const url = `https://${tenant_domain}/api/v1/csp-origins`;

            const body = {
                name: host,
                origin: host,
                frameSrc: true,
                frameAncestors: true,
            };
      
            const options = {
                method: "POST", //"POST" - CREATE NEW CSP RULE, "PATCH" - UPDATE EXISTING
                headers: {
                  "Content-Type": "application/json",
                  "Accept": "application/json",
                  'Authorization': 'Bearer ' + access_token
                },
                body: JSON.stringify(body)
              };

              await fetch(url, options)
              .then((response) => {
                
                if (!response.ok) {
                  throw new Error(
                    `HTTP error! Status: ${response.status}, Status text: ${response.statusText}`
                  );
                }
                //in the case of PATCH 
                //resolve(response.status);  //204 - OK, 404 - NOT FOUND
                return response.json();

                }).catch((err) => {
                    console.log('fetch CSP error:', err);
                    reject(err)
                })
                .then((scp_data) => {
                    resolve(scp_data);
                });
      
        });

    },



    //get access token for API requests
    get_access_token: async (tenant_domain) => {

        return new Promise(async (resolve, reject) => {

            const url = `https://${tenant_domain}/oauth/token`;
      
            const body = {
              client_id: process.env.CLIENT_ID,
              client_secret: process.env.CLIENT_SECRET,
              grant_type: "client_credentials",
            };

            const options = {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  "Accept": "application/json"
                },
                body: JSON.stringify(body),
              };

              await fetch(url, options)
              .then((response) => {
                //console.log("options", options);
                
                if (!response.ok) {
                  throw new Error(
                    `HTTP error! Status: ${response.status}, Status text: ${response.statusText}`
                  );
                }

                return response.json();

                }).catch((err) => {
                    console.log('fetch access token error:', err);
                    reject(err)
                })
                .then((json) => {
                    console.log('access token', json);
                    
                    resolve(json.access_token);
                });
      
        });

    },


   //JSON read and write
    writeToJson: async (data, fileName) => {
        try {
            await fs.writeFile(path.join(__dirname, fileName), JSON.stringify(data));
        } catch (error) {
            console.error("Error writing to file: ", error);
        }
    },
    readFromJson: async (fileName) => {
        try {
            const data = await fs.readFile(path.join(__dirname, fileName), "utf8");
            return JSON.parse(data);
        } catch (error) {
            console.error("Error reading from file: ", error);
        }
    },
        



}

export default model;