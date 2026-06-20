const Client = require("../models/Client");
const Geo = require("../utils/geocode");
const Routing = require("../utils/routing");

const VALID_DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

module.exports = {
  getClients: async (req, res) => {
    console.log(req.user);
    try {
      const clients = await Client.find({ userId: req.user.id });
      const mondayClients = await Client.find({ userId: req.user.id, day: "Monday" });
      const tuesdayClients = await Client.find({ userId: req.user.id, day: "Tuesday" });
      const wednesdayClients = await Client.find({ userId: req.user.id, day: "Wednesday" });
      const thursdayClients = await Client.find({ userId: req.user.id, day: "Thursday" });
      const fridayClients = await Client.find({ userId: req.user.id, day: "Friday" });
      const saturdayClients = await Client.find({ userId: req.user.id, day: "Saturday" });
      const clientsLeft = await Client.countDocuments({ userId: req.user.id, completed: false });

      res.render("clients.ejs", {
        clients,
        left: clientsLeft,
        mondayClients,
        tuesdayClients,
        wednesdayClients,
        thursdayClients,
        fridayClients,
        saturdayClients,
        user: req.user,
      });
    } catch (err) {
      console.error(err);
      res.status(500).send("Server error");
    }
  },

  getEdit: async (req, res) => {
    try {
      const client = await Client.findOne({ _id: req.params.id });
      res.render("edit.ejs", { client, user: req.user });
    } catch (err) {
      console.error(err);
      res.status(500).send("Server error");
    }
  },

  createClient: async (req, res) => {
    const { clientName, clientPhone, clientAddress, clientDay } = req.body;
    try {
      const { lat, lng } = await Geo.geocodeAddress(clientAddress);
      await Client.create({
        name: clientName,
        phone: clientPhone,
        address: clientAddress,
        completed: false,
        userId: req.user.id,
        day: clientDay,
        lat,
        lng,
      });
      console.log("new client has been added!");
      res.redirect("/clients");
    } catch (err) {
      console.error("Geocoding failed:", err.message);
      res.redirect("/clients");
    }
  },

  updateClient: async (req, res) => {
    const { clientId, clientName, clientPhone, clientAddress, clientDay } = req.body;
    try {
      const { lat, lng } = await Geo.geocodeAddress(clientAddress);
      await Client.findOneAndUpdate(
        { _id: clientId, userId: req.user.id },
        { name: clientName, phone: clientPhone, address: clientAddress, day: clientDay, lat, lng }
      );
      console.log("Client has been updated!");
      res.json("Updated it");
    } catch (err) {
      console.error("Update failed:", err.message);
      res.status(500).json({ error: "Could not update client." });
    }
  },

  deleteClient: async (req, res) => {
    try {
      await Client.findOneAndDelete({ _id: req.body.clientIdFromJSFile, userId: req.user.id });
      console.log("Deleted Client");
      res.json("Deleted it");
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Could not delete client." });
    }
  },

  getRoute: async (req, res) => {
    const { day } = req.params;
    if (!VALID_DAYS.includes(day)) {
      return res.status(400).json({ error: "Invalid day." });
    }
    try {
      const result = await Routing.getRouteForDay(day, req.user.id);
      res.json(result);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },
};
