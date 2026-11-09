const User = require('../models/userModel.js');
const bcrypt = require('bcrypt');
const { errorHandler, createAccessToken } = require('../auth.js');



// Controller for user registration
module.exports.registerUser = (req, res) => {

	const { firstName, lastName, email, password, mobileNum, role } = req.body;
	const nameRegex = /^[a-zA-ZÀ-ÿ\s'-]+$/;
	const numberRegex = /^\d+$/;

	if (!firstName || !lastName || !email || !password || !mobileNum || !role){
		return res.status(422).send({
			message: 'Please make sure to fill out all field'
		});
	} else if (!nameRegex.test(firstName) || !nameRegex.test(lastName)) {
		return res.status(422).send({
			message: 'Firstname and lastname should not contain numbers'
		})
	} else if (!email.includes('@') || !email.endsWith('.com')){
		return res.status(422).send({
			message: 'Invalid email format'
		})
	} else if (password.length <= 8){
		return res.status(422).send({
			message: 'Password must be more that 8 characters'
		})
	} else if (!numberRegex.test(mobileNum)){
		return res.status(422).send({
			message: 'Mobile number should contain numbers only'
		})
	} else if (!mobileNum.startsWith('09')) {
		return res.status(422).send({
			message: 'Invalid mobile number format'
		})
	} else if (mobileNum.length !== 11){
		return res.status(422).send({
			message: 'Mobile number should contain 11 digits only'
		})
	} else if (!role) {
		return res.status(422).send({
			message: 'Please choose role [operator, renter]'
		})
	} else {

		return User.findOne({ email: email })
		.then((existing) => {
			if (existing){
				return res.status(409).send({
					message: `Email already existed, Please choose another email`
				})
			} else {

				let newUser = new User({
					firstName: firstName,
					lastName: lastName,
					email: email,
					mobileNum: mobileNum,
					role: role,
					password: bcrypt.hashSync(password, 10)
				});

				return newUser.save()
				.then((register) => {
					if (!register){
						return res.status(400).send({
							message: 'Failed to register'
						})
					} else {
						return res.status(201).send({
							message: 'Register successfully'
						})
					}
				})
				.catch((err) => errorHandler(err, req, res));

			}
		})
		.catch((err) => errorHandler(err, req, res));

	}

}





// Controller for user login
module.exports.loginUser = (req, res) => {

	const { email, password } = req.body;

	if (!email.includes('@') || !email.endsWith('.com')){
		return res.status(422).send({
			message: 'Invalid email format'
		})
	} else {

		return User.findOne({ email: email })
		.then((result) => {
			if (!result){
				return res.status(404).send({
					message: 'No user found'
				})
			} else {
				const isPasswordCorrect = bcrypt.compareSync(password, result.password);

				if (isPasswordCorrect){
					return res.status(200).send({
						message: 'Logged In successfully',
						access: createAccessToken(result)
					})
				} else {
					return res.status(401).send({
						message: 'Incorrect email and password'
					})
				}
			}
		})
		.catch((err) => errorHandler(err, req, res));

	}

}





// Controller for getting user details
module.exports.userDetails = (req, res) => {

	const userId = req.user.id

	return User.findById(userId)
	.select('-password')
	.then((result) => {
		if (!result) {
			return res.status(404).send({
				message: 'No data found'
			})
		} else {
			return res.status(200).send(result);
		}
	})
	.catch((err) => {
		return res.status(500).send({
			message: `Server error ${err}`
		})
	})

}






// Controller for updating user profile
module.exports.updateUserProfile = (req, res) => {

	const userId = req.user.id;
	const { firstName, lastName, mobileNum, email } = req.body;
	const updateDetails = {
		firstName: firstName,
		lastName: lastName,
		email: email,
		mobileNum: mobileNum
	}

	const nameRegex = /^[a-zA-ZÀ-ÿ\s'-]+$/;
	const numberRegex = /^\d+$/;

	return User.findById(userId)
	.then((result) => {

		if (result.firstName === firstName && result.lastName === lastName && result.email === email && result.mobileNum === mobileNum){
			return res.status(200).send({
				message: 'No update was made, everything is up to date'
			})
		} else if (!nameRegex.test(firstName) || !nameRegex.test(lastName)){
			return res.status(422).send({
				message: 'Firstname and lastname should not contain numbers'
			})
		} else if (!numberRegex.test(mobileNum)){
			return res.status(422).send({
				message: 'Mobile number must contain numbers only'
			})
		} else if (!mobileNum.startsWith('09')){
			return res.status(422).send({
				message: 'Invalid mobile number format'
			})
		} else if (mobileNum.length !== 11){
			return res.status(422).send({
				message: 'Mobile should contain 11 digits only'
			})
		} else {

			return User.findByIdAndUpdate(userId, updateDetails, { new: true })
			.then((result) => {
				if (!result) {
					return res.status(422).send({
						message: 'Failed to update profile'
					})
				} else {
					return res.status(200).send({
						message: 'Profile updated successfully'
					})
				}
			})
			.catch((err) => {
				return res.status(500).send({
					message: `Server error ${err}`
				})
			})

		}

	})

}





// Controller for changing password
module.exports.changePassword = (req, res) => {

	const userId = req.user.id;
	const { newPassword } = req.body;
	const updatePassword = {
		password: bcrypt.hashSync(newPassword, 10)
	}

	if (newPassword.length <= 8) {
		return res.status(422).send({
			message: 'Password should be greater that 8 characters'
		})
	} else {

		return User.findById(userId)
		.then((result) => {
			if (!result){
				return res.status(404).send({
					message: 'User does not exist'
				})
			} else {
				return User.findByIdAndUpdate(userId, updatePassword, { new: true })
				.then((result) => {
					if (!result){
						return res.status(400).json({
							message: 'Failed to update password'
						})
					} else {
						return res.status(200).send({
							message: 'Password updated successfully'
						})
					}
				})
				.catch((err) => {
					return res.status(500).send({
						message: 'Internal server error'
					})
				})
			}
		})
		.catch((err) => {
			return res.status(500).send({
				message: 'Internal server error'
			})
		})

	}

}





// Controller for blacklisting a user (Admin only)
module.exports.toBlackList = (req, res) => {

	const userId = req.params.userId;
	const updateDetails = {
		isBlackListed: true
	}

	return User.findById(userId)
	.then((result) => {
		if (!result) {
			return res.status(400).send({
				message: 'No user found'
			})
		} else if (result.isBlackListed === true){
			return res.status(200).send({
				message: 'This renter is already blacklisted'
			})
		} else {
			return User.findByIdAndUpdate(userId, updateDetails, { new: true })
			.then((result) => {
				if (!result){
					return res.status(400).send({
						message: 'Failed to blacklist the user'
					})
				} else {
					return res.status(200).send({
						message: `${result.firstName} has been added to blacklist`
					})
				}
			})
			.catch((err) => {
				return res.status(500).send({
					message: 'Internal server error'
				})
			})
		}
	})
	.catch((err) => {
		return res.status(500).send({
			message: 'Internal server error'
		})
	})

}





// Controller or removing user from blacklisted (Admin only)
module.exports.removeBlackList = (req, res) => {

	const userId = req.params.userId;
	const updateDetails = {
		isBlackListed: false
	}

	return User.findById(userId)
	.then((result) => {
		if (!result) {
			return res.status(400).send({
				message: 'No user found'
			})
		} else if (result.isBlackListed === false){
			return res.status(200).send({
				message: 'This renter is not in blacklist'
			})
		} else {
			return User.findByIdAndUpdate(userId, updateDetails, { new: true })
			.then((result) => {
				if (!result){
					return res.status(400).send({
						message: 'Failed to blacklist the user'
					})
				} else {
					return res.status(200).send({
						message: `${result.firstName} has been removed from blacklist`
					})
				}
			})
			.catch((err) => {
				return res.status(500).send({
					message: 'Internal server error'
				})
			})
		}
	})
	.catch((err) => {
		return res.status(500).send({
			message: 'Internal server error'
		})
	})

}






// Controller for getting all blacklisted users (Admin only)
module.exports.allBlacklisted = function(req, res) {
	return User.find({ isBlackListed: true })
	.select('-password')
	.then((result) => {
		if (!result){
			return res.status(200).send({
				message: 'No blacklisted user'
			})
		} else {
			return res.status(200).send({
				blacklisted: result
			})
		}
	})
}






// Controller to fetch all user (Admin only)
module.exports.getAllUser = (req, res) => {
	return User.find({ isAdmin: false})
	.select('-password')
	.then((result) => {
		if (result.length === 0){
			return res.status(200).send({
				message: 'No user available'
			})
		} else {
			return res.status(200).send({
				users: result
			})
		}
	})
	.catch((err) => {
		return res.status(500).send({
			message: 'Internal server error'
		})
	})
}






// Controller for changing user status (Admin only)
module.exports.updateUserStatus = (req, res) => {

	const userId = req.params.userId;
	const { status } = req.body;
	const updateStatus = {
		status: status
	}

	const statusRegex = /^[a-zA-ZÀ-ÿ\s'-]+$/;

	if (!status || status === ""){
		return res.status(422).send({
			message: 'Status must not be empty'
		})
	} else if (!statusRegex.test(status)){
		return res.status(422).send({
			message: 'Status must not contain numbers'
		})
	} else if (!['pending', 'approved', 'rejected'].includes(status)){
		return res.status(422).send({
			message: 'Status must only be approved/rejected/pending'
		})
	} else {

		return User.findById(userId)
		.then((result) => {
			if (!result){
				return res.status(404).send({
					message: 'User does not exist'
				})
			} else if (result.status === status){
				return res.status(200).send({
					message: `User status is already ${status}`
				})
			} else {
				return User.findByIdAndUpdate(userId, updateStatus, { new: true })
				.then((result) => {
					if (!result){
						return res.status(400).send({
							message: 'Failed to update status'
						})
					} else {
						return res.status(200).send({
							message: 'Status updated'
						})
					}
				})
				.catch((err) => {
					return res.status(500).send({
						message: 'Internal server error'
					})
				})
			}
		})
		.catch((err) => errorHandler(err, req, res));

	}

}








// Controller for getting pending/rejected/approves status (Admin only)
module.exports.userPendingStatus = (req, res) => {

	return User.find({ status: 'pending', isAdmin: false })
	.select('-password')
	.then((result) => {
		if (!result){
			return res.status(200).send({
				message: 'No pending user'
			})
		} else {
			return res.status(200).send({
				pending_User: result
			})
		}
	})
	.catch((err) => errorHandler(err, req, res));
}

module.exports.userRejectedStatus = (req, res) => {

	return User.find({ status: 'rejected', isAdmin: false })
	.select('-password')
	.then((result) => {
		if (!result){
			return res.status(200).send({
				message: 'No rejected user'
			})
		} else {
			return res.status(200).send({
				rejected_User: result
			})
		}
	})
	.catch((err) => errorHandler(err, req, res));
}

module.exports.userApprovedStatus = (req, res) => {

	return User.find({ status: 'approved', isAdmin: false })
	.select('-password')
	.then((result) => {
		if (!result){
			return res.status(200).send({
				message: 'No approved user'
			})
		} else {
			return res.status(200).send({
				approved_User: result
			})
		}
	})
	.catch((err) => errorHandler(err, req, res));
}
