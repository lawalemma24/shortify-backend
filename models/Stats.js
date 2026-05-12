const mongoose = require('mongoose');

const statSchema = new mongoose.Schema({
  urlPath: {
    type: String,
    required: true,
  },
  ipAddress: String,
  userAgent: String,
  referrer: String,
  timestamp: {
    type: Date,
    default: Date.now,
  },
  
},
{ timestamps: true });



module.exports = mongoose.model('Stat', statSchema);