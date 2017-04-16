var mongoose = require('mongoose');

var levelthreeSchema = mongoose.Schema(
    {
         users: [{ type: Schema.Types.ObjectId, ref: 'User' }]
    }
)
var Levelthree = mongoose.model('Levelthree', levelthreeSchema);

module.exports = Levelthree;