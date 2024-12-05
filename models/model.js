import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

//main model object for secondary functions
const model = {
  //get tenant tedails, incl. ID
  //https://qlik.dev/apis/rest/tenants/#get-v1-tenants-me
  getTenantId: async (tenant_domain, access_token) => {
    return new Promise(async (resolve, reject) => {
      const url = `https://${tenant_domain}/api/v1/tenants/me`;

      //resolve(body);
      const options = {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: "Bearer " + access_token,
        },
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
        })
        .catch((err) => {
          console.log("fetch tenant_data error:", err);
          reject(err);
        })
        .then((tenant_data) => {
          //console.log('tenant data', tenant_data);
          resolve(tenant_data.id);
        });
    });
  },

  //https://qlik.dev/apis/rest/web-integrations/#post-v1-web-integrations
  /**
   * Create web Integration
   * @param {*} tenant_domain
   * @param {*} web_integration_name - name of the web integration
   * @param {*} origins - array of the origins ["https://example.com","https://localhost:3000"]
   * @returns
   */
  createWebIntegration: async (
    tenant_domain,
    web_integration_name,
    origins
  ) => {
    return new Promise(async (resolve, reject) => {
      const url = `https://${tenant_domain}/api/v1/web-integrations`;

      const body = {
        name: web_integration_name,
        validOrigins: origins,
      };

      const options = {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: "Bearer " + access_token,
        },
        body: JSON.stringify(body),
      };

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
          console.log("createWebIntegration error:", err);
          reject(err);
        })
        .then((webIntData) => {
          resolve(webIntData);
        });
    });
  },

  //CSP ORIGINS - create new CSP rule for origins
  //https://qlik.dev/apis/rest/csp-origins/#post-v1-csp-origins
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
          Accept: "application/json",
          Authorization: "Bearer " + access_token,
        },
        body: JSON.stringify(body),
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
        })
        .catch((err) => {
          console.log("fetch CSP error:", err);
          reject(err);
        })
        .then((scp_data) => {
          resolve(scp_data);
        });
    });
  },

  //Retrieve OAuth token for API requests
  //https://qlik.dev/apis/rest/oauth/#post-oauth-token
  getAccessToken: async (tenant_domain) => {
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
          Accept: "application/json",
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
        })
        .catch((err) => {
          console.log("fetch access token error:", err);
          reject(err);
        })
        .then((json) => {
          console.log("access token", json);

          resolve(json.access_token);
        });
    });
  },

  //Get user subject
  //https://qlik.dev/apis/rest/users/#post-v1-users-actions-filter
  getUserSubject: (tenant_domain, user_email) => {
    return new Promise(async (resolve, reject) => {
      const url = `https://${tenant_domain}/api/v1/users/actions/filter`;

      const access_token = await model.getAccessToken(tenant_domain);

      const body = { filter: 'email eq "' + user_email + '"' };

      const options = {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: "Bearer " + access_token,
        },
        body: JSON.stringify(body),
      };

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
          console.log("fetch access token error:", err);
          reject(err);
        })
        .then((user_data) => {
          //console.log('user_subject', user_data);
          //console.log('user_data.data.length', user_data.data.length);

          if (user_data.data.length === 0) {
            const randomString = Math.random().toString(36).substring(2, 15);
            const new_subject = `${user_email}_${randomString}`;

            console.log("new_subject", new_subject);

            resolve(new_subject);
          } else {
            resolve(user_data.data[0].subject);
          }
        });
    });
  },

  /**
   * Add view role to Everyone grope in space
   * https://qlik.dev/apis/rest/spaces/##/entries/v1/spaces/-spaceId/assignments-post
   * @returns
   */
  addAssigmentToSpace: (tenant_domain, access_token) => {
    return new Promise(async (resolve, reject) => {
      //find space id
      const spaces = await fetch(`https://${tenant_domain}/api/v1/spaces`, {
        headers: { Authorization: `Bearer ${access_token}` },
      }).then((res) => res.json());

      //onsole.log('spaces', spaces);

      //find space id of first space with type "managed"
      const space_id = spaces.data.find((space) => space.type === "managed").id;

      //add assignment everyone to space
      const body = {
        type: "group",
        roles: ["basicconsumer"], //customer, basicconsumer - limited view - for basic users
        assigneeId: "000000000000000000000001", //everyone group id
      };

      const options = {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${access_token}`,
        },
        body: JSON.stringify(body),
      };

      await fetch(
        `https://${tenant_domain}/api/v1/spaces/${space_id}/assignments`,
        options
      )
        .then((response) => {
          if (!response.ok) {
            throw new Error(
              `HTTP error! Status: ${response.status}, Status text: ${response.statusText}`
            );
          }
          return response.json();
        })
        .catch((err) => {
          console.log("addAssigmentToSpace error:r:", err);
          reject(err);
        })
        .then((space_response) => {
          console.log("space_response", space_response);
          resolve(space_response);
        });
    });
  },

  //Remove auto assign properties for the users
  removeAutoAssignProperties: (tenant_domain, tenant_id, access_token) => {
    return new Promise(async (resolve, reject) => {
      //add assignment everyone to space
      const body = [
        {
          op: "replace",
          path: "/autoAssignCreateSharedSpacesRoleToProfessionals",
          value: false
        },
        {
          op: "replace",
          path: "/autoAssignPrivateAnalyticsContentCreatorRoleToProfessionals",
          value: false
        },
        {
          op: "replace",
          path: "/autoAssignDataServicesContributorRoleToProfessionals",
          value: false
        }
      ];

      const options = {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${access_token}`,
        },
        body: JSON.stringify(body),
      };

      await fetch(
        `https://${tenant_domain}/api/v1/tenants/${tenant_id}`,
        options
      )
        .then((response) => {
          if (!response.ok) {
            throw new Error(
              `HTTP error! Status: ${response.status}, Status text: ${response.statusText}`
            );
          }
          console.log("response.status", response.status);
          
          resolve(response.status);
        })
        .catch((err) => {
          console.log("addAssigmentToSpace error:r:", err);
          reject(err);
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
};

export default model;
