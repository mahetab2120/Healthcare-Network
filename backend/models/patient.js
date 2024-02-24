const mongoose = require('mongoose');

const {Schema} = mongoose;

const patientSchema = new Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  name: { type: String, required: true },
  age: { type: Number, required: true },
});

module.exports = mongoose.model('Patient', patientSchema,'patient');