const Client = require("../models/Client");
const Geo = require("../utils/geocode");
module.exports = {
  getClients: async (req, res) => {
    console.log(req.user);
    try {
      const clients = await Client.find({ userId: req.user.id });
      const mondayClients = await Client.find({
        userId: req.user.id,
        day: "Monday",
      });

      const tuesdayClients = await Client.find({
        userId: req.user.id,
        day: "Tuesday",
      });
      const wednesdayClients = await Client.find({
        userId: req.user.id,
        day: "Wednesday",
      });
      const thursdayClients = await Client.find({
        userId: req.user.id,
        day: "Thursday",
      });
      const fridayClients = await Client.find({
        userId: req.user.id,
        day: "Friday",
      });
      const saturdayClients = await Client.find({
        userId: req.user.id,
        day: "Saturday",
      });
      const clientsLeft = await Client.countDocuments({
        userId: req.user.id,
        completed: false,
      });

      res.render("clients.ejs", {
        clients: clients,
        left: clientsLeft,
        mondayClients: mondayClients,
        tuesdayClients: tuesdayClients,
        wednesdayClients: wednesdayClients,
        thursdayClients: thursdayClients,
        fridayClients: fridayClients,
        saturdayClients: saturdayClients,
        user: req.user,
      });
    } catch (err) {
      console.error(err);
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
      req.flash(
        "error",
        "Could not geocode that address. Please check it and try again.",
      );
      console.error(err);
    }
  },

  deleteClient: async (req, res) => {
    try {
      await Client.findOneAndDelete({
        _id: req.body.clientIdFromJSFile,
      });
      console.log("Deleted Client");
      res.json("Deleted it"); // need to respond back with res, since we are doing a call back
    } catch (err) {
      console.error(err);
    }
  },
};
