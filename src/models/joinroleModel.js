const mongoose = require('mongoose');

let joinroleModel = new mongoose.Schema({
  Guild: {
    type: String,
  },
  RoleID: {
    type: String,
  },
  RoleName: {
    type: String,
  }
});

module.exports = mongoose.model("joinrole", joinroleModel);
