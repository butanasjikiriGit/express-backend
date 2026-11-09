const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');

// Routes
const userRouter = require('./routes/userRoute.js');


dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

mongoose.connect(process.env.DB_STRING)
.then(() => {
	console.log('Successfully establish connection from database');
})
.catch((err) => {
	console.log('Failed to establish connection in database', err);
});


app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());




app.use('/users', userRouter);



app.listen(PORT, () => {
	console.log(`Server is running at port: ${PORT}`);
})