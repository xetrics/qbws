const { Router } = require("express");
const path = require("path");
const fs = require("fs");

const router = Router();

router.get("/", (req, res) => {
    res.send("QBWC Testing Server");
})

router.get("/wsdl", (req, res) => {
    const baseWsdl = fs.readFileSync(path.resolve(__dirname, "../../resources/qbwc-soap-base.wsdl"), "utf-8");
    const wsdlContent = baseWsdl.replaceAll("{{baseUrl}}", "https://home.nayte.dev");

    res.setHeader("Content-Type", "text/xml");
    res.send(wsdlContent);
});

router.get("/download-qwc", (req, res) => {
    const baseQwc = fs.readFileSync(path.resolve(__dirname, "../../resources/app-base.qwc"), "utf-8");
    const qwcContent = baseQwc.replaceAll("{{baseUrl}}", "https://home.nayte.dev");

    res.setHeader("Content-Type", "application/xml");
    res.setHeader("Content-Disposition", 'attachment; filename="cmp-qbwc.qwc"');
    res.send(qwcContent);
});

module.exports = router;