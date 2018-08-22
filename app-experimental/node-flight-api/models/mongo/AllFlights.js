
var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var allFlightSchema = new Schema({
    Timestamp: String,
    Year: Number,
    Month: Number,
    Day: Number,
    Hour: Number,
    Minute: Number,
    FeatureCollection: mongoose.Schema.Types.Mixed
});

mongoose.model('AllFlight', allFlightSchema, 'AllFlights');