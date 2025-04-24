const fs = require("fs");
const path = require("path");
const qbXML = require("./qb-xml");

class QBWebConnectorService {
    constructor() {
        this.sessions = new Map();
        this.transactionQueue = [];
    }

    queueTransaction(type, data) {
        this.transactionQueue.push({ type, data });
        console.log(`Queued ${type} for next QBWC session:`, data);
    }

    getSoapService() {
        return {
            QBWebConnectorSvc: {
                QBWebConnectorSvcSoap: {
                    serverVersion: () => ({ serverVersionResult: "1.0.0" }),
                    clientVersion: () => ({ clientVersionResult: "" }),
                    authenticate: (args) => {
                        console.log("Authenticate request from QBWC");

                        const ticket = Date.now().toString();

                        const session = {
                            ticket,
                            currentRequest: 0,
                            totalRequests: 0,
                            requests: [],
                            transactions: []
                        };

                        this.processQueue(session);

                        this.sessions.set(ticket, session);

                        return { authenticateResult: { string: [ticket, "", "", 0] } };
                    },
                    sendRequestXML: (args) => {
                        const { ticket } = args;
                        console.log(`Send request for ticket: ${ticket}`);

                        const session = this.sessions.get(ticket);
                        if(!session) return { sendRequestXMLResult: "" };

                        if(session.currentRequest < session.requests.length) {
                            const requestXML = session.requests[session.currentRequest];
                            console.log(`Sending request #${session.currentRequest + 1} of ${session.totalRequests}`);
                            return { sendRequestXMLResult: requestXML };
                        } else {
                            return { sendRequestXMLResult: "" };
                        }
                    },
                    receiveResponseXML: (args) => {
                        const { ticket, response, hresult, message } = args;
                        console.log(`Recieved response for ticket: ${ticket}`);

                        const session = this.sessions.get(ticket);
                        if (!session) return { receiveResponseXMLResult: 100 };

                        if(hresult) {
                            console.error(`Error from QB: ${hresult} - ${message}`);
                            session.lastError = `${hresult} - ${message}`;
                        } else {
                            console.log(`Processing response for request #${session.currentRequest + 1}`);
                            console.log(`Response: ${response}`);
                            // TODO: parse XML response
                        }

                        session.currentRequest++;
                        const percentDone = Math.min(100, Math.round((session.currentRequest / session.totalRequests) * 100));
                        return { receiveResponseXMLResult: percentDone };
                    },
                    getLastError: (args) => {
                        const { ticket } = args;
                        console.log(`getLastError for ticket: ${ticket}`);

                        const session = this.sessions.get(ticket);
                        const lastError = session ? session.lastError || "No error" : "Invalid ticket";

                        return { getLastErrorResult: lastError };
                    },
                    closeConnection: (args) => {
                        const { ticket } = args;
                        console.log(`Close connection for ticket: ${ticket}`);

                        this.sessions.delete(ticket);

                        return { closeConnectionResult: "Connection closed successfully" };
                    },
                    connectionError: (args) => {
                        console.log(`Connection error!`);
                    }
                }
            }
        }
    }

    processQueue(session) {
        for(const transaction of this.transactionQueue) {
            let requestXML = "";

            if(transaction.type === "invoice") {
                requestXML = qbXML.createInvoiceAdd(transaction.data);
            } else if(transaction.type === "customer") {
                requestXML = qbXML.createCustomerAdd(transaction.data);
            }

            if(requestXML) {
                session.requests.push(requestXML);
                session.transactions.push(transaction);
            }
        }

        this.transactionQueue = [];
        session.totalRequests = session.requests.length;
        console.log(`Processed queue: ${session.totalRequests} requests ready`);
    }

    getWSDL() {
        const baseWsdl = fs.readFileSync(path.resolve(__dirname, "../resources/qbwc-soap-base.wsdl"), "utf-8");
        const wsdlContent = baseWsdl.replaceAll("{{baseUrl}}", "https://home.nayte.dev");
        return wsdlContent;
    }
}

module.exports = QBWebConnectorService;