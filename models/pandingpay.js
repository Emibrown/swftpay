var mongoose = require('mongoose');

var pandingpaySchema = mongoose.Schema(
    {	
    	name:{type: String, required: true, unique: true},
    	value:{type: String, equired: true},
		users: [{
		        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User'},
		        payAt: {type: Date},
		        depositorname:{type: String},
		        amount:{type: String},
		        stockAt: { type: Date, expires: 60 }
			 }]
    }
)
var Pandingpay = mongoose.model('Pandingpay', pandingpaySchema);

module.exports = Pandingpay;