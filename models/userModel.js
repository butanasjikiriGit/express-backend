const mongoose = require('mongoose');


const userSchema = new mongoose.Schema({

	firstName: {
		type: String,
		required: [true, 'First name is required']
	},
	lastName: {
		type: String,
		required: [true, 'Last name is required']
	},
	email: {
		type: String,
		required: [true, 'Email is required']
	},
	password: {
		type: String,
		required: [true, 'Password is required']
	},
	mobileNum: {
		type: String,
		required: [true, 'Mobile number is required']
	},
	isAdmin: {
		type: Boolean,
		default: false
	},
	role: {
		type: String,
		enum: ['operator', 'renter']
	},
	status: {
		type: String,
		enum: ['approved', 'rejected', 'pending'],
		default: 'pending'
	},
	isBlackListed: {
		type: Boolean,
		default: false
	},
	dateCreated: {
		type: Date,
		default: Date.now
	}

});


module.exports = mongoose.model('User', userSchema);