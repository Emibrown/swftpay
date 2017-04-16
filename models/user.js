var mongoose = require('mongoose');

var userSchema = mongoose.Schema(
    {
        fullname: {type: String, required: true},
        email: {type: String, required: true, unique: true},
        country: {type: String, required: true},
        gender: {type: String, required: true},
        contact: {type: String, required: true,},
        contact2: {type: String,},
        username: {type: String, required: true, unique: true},
        password: {type: String, required: true},
        accountnum:{type: String},
        accountname:{type: String},
        bank:{type: String},
        stockAt: { type: Date, expires: 60 },
        createdAt: {type: Date, default: Date.now}
    }
)
var User = mongoose.model('User', userSchema);

module.exports = User;