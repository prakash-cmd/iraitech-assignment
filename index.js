const express = require('express');
const userRoute = require('./api/route/user');
const mongoose = require('mongoose');
const cors = require('cors');
const app = express();

require('dotenv').config();
app.use(cors());

const filesystem = require('fs');
const dir = './uploads/images';

if (!filesystem.existsSync(dir)) {
    filesystem.mkdirSync(dir, {recursive: true});
} else {
    console.log("Directory already exist");
}


app.use('/api', userRoute);


mongoose.connect(
    `mongodb+srv://${process.env.MONGOUSER}:${process.env.MONGOPASS}@cluster0.lfrek.mongodb.net/${process.env.MONGODB}?retryWrites=true&w=majority`,
    {
        useNewUrlParser: true,
        useUnifiedTopology: true
    },
    (error) => {
        if (error) console.log("error while connecting mongodb: ", error)
        else console.log("Database connected")
    }
)


app.listen(process.env.PORT, () => {
    console.log(`Now listening on port ${process.env.PORT}`);
})