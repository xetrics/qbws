const express = require("express");
const http = require("http");
const https = require("https");
const path = require("path");
const fs = require("fs");
const morgan = require("morgan");
const soap = require("soap");
const QBWebConnectorService = require("./qbwc-service");
const createApiRoutes = require("./routes/api-routes");

const app = express();

// app.use(express.json());
app.use(morgan("dev"));

const qbwcService = new QBWebConnectorService();
qbwcService.queueTransaction("customer", { name: "Tester McTester" });

app.use("/api", createApiRoutes(qbwcService));
app.use("/", require("./routes/base-routes"));

const credentials = {
    key: fs.readFileSync(path.join(__dirname, "../certs/privkey.pem"), "utf-8"),
    cert: fs.readFileSync(path.join(__dirname, "../certs/cert.pem"), "utf-8"),
    ca: fs.readFileSync(path.join(__dirname, "../certs/chain.pem"), "utf-8"),
}

const httpServer = http.createServer(app);
const httpsServer = https.createServer(credentials, app);
const soapServer = soap.listen(app, "/wsdl", qbwcService.getSoapService(), qbwcService.getWSDL(), () => console.log("SOAP Server running"));

httpServer.listen(80, () => console.log("HTTP Server running on port 80"));
httpsServer.listen(443, () => console.log("HTTPS Server running on port 443"));

// soapServer.log = (type, data, req) => {
//     if(type === "replied") {
//         console.log(`Got SOAP request of type: ${type}. Data: ${data}`);
//     }
// };