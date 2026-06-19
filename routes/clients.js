const express = require("express");
const router = express.Router();
const clientsController = require("../controllers/clients");
const { ensureAuth } = require("../middleware/auth");

router.get("/", ensureAuth, clientsController.getClients);

router.get("/edit/:id", ensureAuth, clientsController.getEdit);

router.post("/createClient", clientsController.createClient);

router.put("/updateClient", clientsController.updateClient);

router.delete("/deleteClient", clientsController.deleteClient);

module.exports = router;
