const mongoose = require('mongoose');
mongoose.Promise = global.Promise;
const slug = require('slugs');

const storeSchema = new mongoose.Schema({
	name : {
		type: String,
		trim: true,
		required: 'PLease enter a store name'
	},
	slug: String,
	description: {
		type: String,
		trim: true
	},
	tags: [String]

});


storeSchema.pre('save', function(next) {
	if(!this.isModified('name')) {
		next(); //skip it
		return; // stop this function from running
	}
	this.slug = slug(this.name);
	next();
	// Todo make slugs unique
})

module.exports = mongoose.model('Store', storeSchema);