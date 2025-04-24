const { Router } = require("express");

module.exports = function createApiRoutes(qbwcService) {
    const router = Router();

    router.post("/invoices/queue", (req, res) => {
        try {
            const invoice = req.body;

            if (!invoice.customerId || !invoice.invoiceNumber || !invoice.amount) {
                return res.status(400).json({
                    error: "Missing required fields: customerId, invoiceNumber, and amount are required"
                });
            }

            qbwcService.queueTransaction("invoice", invoice);
            res.json({ success: true });

        } catch (err) {
            console.error("Error queuing invoice:", err);
            res.status(500).json({ error: "server error" });
        }
    });

    router.post("/customers/queue", (req, res) => {
        try {
            const customer = req.body;

            if (!customer.name) {
                return res.status(400).json({
                    error: "Missing required fields: name is required"
                });
            }

            qbwcService.queueTransaction("customer", customer);
            res.json({ success: true });
        } catch (err) {
            console.error("Error queuing customer:", err);
            res.status(500).json({ error: "server error" });
        }
    });

    return router;
}