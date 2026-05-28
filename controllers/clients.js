const Client = require("../models/Client");
module.exports = {
  getClients: async (req, res) => {
    console.log(req.user);
    try {
      const clients = await Client.find({ userId: req.user.id });
      const clientsLeft = await Client.countDocuments({
        userId: req.user.id,
        completed: false,
      });
      res.render("clients.ejs", {
        clients: clients,
        left: clientsLeft,
        user: req.user,
      });
    } catch (err) {
      console.error(err);
    }
  },

  createClient: async (req, res) => {
    try {
      await Client.create({
        name: req.body.name,
        phone: req.body.phone,
        address: req.body.address,
        completed: false,
      });
      console.log("new client has been added!");
      res.redirect("/clients");
    } catch (err) {
      console.error(err);
    }
  },
};
