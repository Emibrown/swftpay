var mongoose = require('mongoose');

var confirmpaySchema = mongoose.Schema(
    {	
    	name:{type: String, required: true, unique: true},
    	value:{type: String, equired: true},
		users: [{
		        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User'},
		        confirmAt: {type: Date, default: Date.now},
		        depositorname:{type: String},
		        amount:{type: String},
		        status: {type: Boolean,default: false},
			 }]
    }
)
var Confirmpay = mongoose.model('Confirmpay', confirmpaySchema);

module.exports = Confirmpay;