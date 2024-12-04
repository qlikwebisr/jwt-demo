# Demo for JWT on Qlik Sense Saas
Based on Node.js

## Steps
- Creates JWT IDp and saves login details
- Generates JWT token and opens qlik sense application in iframe

## Settings
In the .env file

```
# OAUTH2 DATA
CLIENT_ID=<oauth client id>
CLIENT_SECRET=<oauth client secret>
# TENANT DATA
TENANT=<domain>.<region>.qlikcloud.com
WEBID=Hq...aj
# APP DATA
APPID=9d....e248
SHEETID=497....49
# USER DATA
USER_NAME=<user name>
USER_EMAIL=<user email>
# PORT
PORT=3000
```

### Installation and activation
```
npm install

node app.js
or
npm start
```

### Documentation
https://qlik.dev/authenticate/jwt/implement-jwt-authorization/
https://glitch.com/edit/#!/qlik-cloud-jwt?path=src%2FconnectQlikApp.js%3A1%3A0
https://github.com/apamo/JWT-with-NodeJS-on-Qlik-Sense-SaaS
