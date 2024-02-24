const mongoose = require('mongoose');

const {Schema} = mongoose;

const doctorSchema = new Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    name: { type: String, required: true },
    specialty: { type: String, required: true },
});

module.exports = mongoose.model('Doctor', doctorSchema,'doctor');