const ClientList = require("../models/ClientList");
const Client = require("../models/Client");

module.exports = {
  getLists: async (req, res) => {
    try {
      const lists = await ClientList.find({ userId: req.user.id });
      res.render("lists.ejs", { lists, user: req.user });
    } catch (err) {
      console.error(err);
      res.status(500).send("Server error");
    }
  },

  createList: async (req, res) => {
    const { listName } = req.body;
    try {
      await ClientList.create({
        name: listName,
        userId: req.user.id,
        clientIds: [],
      });
      console.log("new list has been added!");
      res.redirect("/lists");
    } catch (err) {
      console.error("Create list failed:", err.message);
      res.redirect("/lists");
    }
  },

  getListDetail: async (req, res) => {
    try {
      const list = await ClientList.findOne({ _id: req.params.id, userId: req.user.id });
      if (!list) {
        return res.status(404).send("List not found");
      }
      const clients = await Client.find({ userId: req.user.id });
      const memberIds = list.clientIds.map((id) => id.toString());
      res.render("list-detail.ejs", { list, clients, memberIds, user: req.user });
    } catch (err) {
      console.error(err);
      res.status(500).send("Server error");
    }
  },

  setListClients: async (req, res) => {
    const { clientIds } = req.body;
    try {
      const updated = await ClientList.findOneAndUpdate(
        { _id: req.params.id, userId: req.user.id },
        { clientIds: clientIds || [] },
        { new: true }
      );
      if (!updated) {
        return res.status(404).json({ error: "List not found." });
      }
      console.log("List clients updated!");
      res.json("Updated it");
    } catch (err) {
      console.error("Update list clients failed:", err.message);
      res.status(500).json({ error: "Could not update list." });
    }
  },

  deleteList: async (req, res) => {
    try {
      await ClientList.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
      console.log("Deleted list");
      res.json("Deleted it");
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Could not delete list." });
    }
  },
};
