const express = require("express");
const router = express.Router();
const clientsController = require("../controllers/clients");
const { ensureAuth } = require("../middleware/auth");

router.get("/", ensureAuth, clientsController.getClients);
