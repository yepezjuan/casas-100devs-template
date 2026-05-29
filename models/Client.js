const mongoose = require("mongoose");

const ClientSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  phone: {
    type: String,
    required: true,
  },
  address: {
    type: String,
    required: true,
  },
  completed: {
    type: Boolean,
    required: true,
  },

  userId: {
    type: String,
    required: true,
  },
});

module.exports = mongoose.model("Client", ClientSchema);
