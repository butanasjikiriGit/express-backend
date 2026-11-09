const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController.js');
const { verify, verifyAdmin } = require('../auth.js');


// Router for user registration
router.post('/register', userController.registerUser);

// Router for user login
router.post('/login', userController.loginUser);

// Router for getting user details
router.get('/details', verify, userController.userDetails);

// Router for updating user details
router.patch('/update-details', verify, userController.updateUserProfile);

// Router for changing password
router.patch('/change-password', verify, userController.changePassword);

// Router for blacklisting
router.patch('/to-bl/:userId', verify, verifyAdmin, userController.toBlackList);

// Router for removing from blacklisted
router.patch('/remove-bl/:userId', verify, verifyAdmin, userController.removeBlackList);

// Router for getting all blacklisted users
router.get('/all-bl', verify, userController.allBlacklisted);

// Router for change user status
router.patch('/status/:userId', verify, verifyAdmin, userController.updateUserStatus);

// Router for getting all pending/rejected/approved status
router.get('/status/pending', verify, verifyAdmin, userController.userPendingStatus);
router.get('/status/rejected', verify, verifyAdmin, userController.userRejectedStatus);
router.get('/status/approved', verify, verifyAdmin, userController.userApprovedStatus);

// Router to get all users
router.get('/all-users', verify, verifyAdmin, userController.getAllUser);






module.exports = router;