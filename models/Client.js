const { request } = require("express");
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
  },
  completed: {
    type: Boolean,
    required: true,
  },
});

module.exports = mongoose.model("Client", ClientSchema);
