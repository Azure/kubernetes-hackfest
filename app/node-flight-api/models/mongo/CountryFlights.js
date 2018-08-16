
var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var countrySchema = new Schema({
    Country: String,
    Timestamp: String,
    Year: Number,
    Month: Number,
    Day: Number,
    Hour: Number,
    Minute: Number,
    FeatureCollection: mongoose.Schema.Types.Mixed
});

mongoose.model('CountryFlight', countrySchema, 'CountryFlights');