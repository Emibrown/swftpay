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
        refferBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User'},
        refferals:[{ type: mongoose.Schema.Types.ObjectId, ref: 'User'}],
        accountnum:{type: String},
        accountname:{type: String},
        bank:{type: String},
        messages: [{
                    title:{type: String, required: true},
                    sendAt:{type: Date, default: Date.now},
                    message:{type: String},
                    read:{type: Boolean, default: false},
                 }],
        stockAt: { type: Date},
        createdAt: {type: Date, default: Date.now}
    }
)

userSchema.index({ "stockAt": 1 }, { expireAfterSeconds: 0 });

var User = mongoose.model('User', userSchema);

module.exports = User;