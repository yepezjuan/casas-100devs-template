const express = require("express");
const router = express.Router();
const listsController = require("../controllers/lists");
const { ensureAuth } = require("../middleware/auth");

router.get("/", ensureAuth, listsController.getLists);

router.post("/create", ensureAuth, listsController.createList);

router.get("/:id", ensureAuth, listsController.getListDetail);

router.put("/:id/clients", ensureAuth, listsController.setListClients);

router.delete("/:id", ensureAuth, listsController.deleteList);

module.exports = router;
