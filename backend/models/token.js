const mongoose = require('mongoose');
const {Schems} = mongoose;

const refreshTokenSchema = new mongoose.Schema({
    token: {type: String, required: true},
    userId: {type: mongoose.Schema.Types.ObjectId, ref: 'User'}
},
{timestamps: true}
)

module.exports = mongoose.model('RefreshToken', refreshTokenSchema, 'tokens')