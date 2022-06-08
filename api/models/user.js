const mongoose = require('mongoose')
const jwt = require('jsonwebtoken');
const res = require('express/lib/response');


const userSchema = new mongoose.Schema({
    name: {
        type: String
    },
    email: {
        type: String,
        required: true,
    },
    phone: {
        type: Number,
        unique: true,
    },
    password: {
        type: String,
        required: true
    },
    gender: {
        type: String,
        enum: ["Male", "Female", "Not Specified"],
        default: "Not Specified"
    },
    date: {
        type: Date,
        default: Date.now,
    },
    userImage: {
        type: String
    },
    token: {
        type: String,
        required: true
    },
})


userSchema.methods.generateToken = async function () {
    try {
        const token = jwt.sign({_id: this._id.toString()}, process.env.TOKEN_SECRET);
        return token.toString();
    } catch (error) {
        res.send(error);
        console.log(error);
    }
}

module.exports = mongoose.model('User', userSchema)