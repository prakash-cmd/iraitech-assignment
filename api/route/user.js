const express = require('express');
const bodyParser = require('body-parser');
const User = require('../models/user');
const router = express.Router();
const bcrypt = require('bcrypt');
const path = require('path');
const multer = require('multer');
const {authenticateToken} = require("../middleware/authenticate");



const fileStorage = multer.diskStorage({
    destination: (req, file, callback) => {
        callback(null, './uploads/images')
    },
    filename: (req, file, callback) => {
        callback(null, `${Date.now()}${path.extname(file.originalname)}`)
    }
})

const upload = multer({storage: fileStorage})

router.use(bodyParser.json())


router.post('/login', async (req, res) => {

    if (!req.body.email && !req.body.password) {
        return res.status(400).json({
            error: true,
            success: false,
            message: "Email and password is required for login"
        })
    }

    try {

        let userFound = await User.findOne({email: req.body.email})
        if (!userFound) {
            return res.status(400).json({
                error: true,
                success: false,
                msg: "User does not exist"
            })
        }

        let isPasswordSame = await bcrypt.compare(req.body.password, userFound.password)
        if (isPasswordSame)
            return res.status(200).send(userFound.token)

        return res.status(401).json({
            message: "password is wrong"
        })
    } catch (e) {
        return res.status(500).json({
            message: "Something went wrong"
        });
    }
})




router.post('/signup', upload.single('image'), async (req, res) => {

    if (!req.body.email || !req.body.phone) {
        return res.status(400).json({
            error: true,
            success: false,
            message: "Email and password is required for signup"
        })
    }

    try {

        let userFound = await User.findOne({ email: req.body.email})

        if (userFound) {
            return res.status(400).json({
                error: false,
                status: true,
                msg: "User already exist"
            })
        }

        let hashedPassword = await hashPassword(req.body.password, 10)

        const user = new User({
            name: req.body.name || "",
            phone: req.body.phone,
            password: hashedPassword,
            email: req.body.email,
            gender: req.body.gender,
            userImage: req.file && req.file.filename || '',
        })

        let token = await user.generateToken()
        user.token = token
        let savedUser = await user.save()

        return res.status(200).json(savedUser)

    } catch (e) {
        console.error(e)
        return res.status(500).json({
            error: true,
            success: false,
            message: "Something went wrong"
        });
    }

})

router.get('/users',async (req, res) => {

    let users = User.find({}, {"_id": 0, "name": 1})
    if (users)
        return res.status(200).json(users);

    return res.status(500).json({
        error: true,
        success: false,
        message: "Something went wrong"
    });

})


router.post('/updateUser', authenticateToken, upload.single('image'), async (req, res) => {

    try {

        let updatedUser = await User.findOneAndUpdate({'_id': req.user._id}, {
            name: req.body.name,
            email: req.body.email,
            phone: req.body.phone,
            gender: req.body.gender,
            userImage: req.file && req.file.filename,
        }, {new: true})


        if (updatedUser)
            return res.status(200).json(updatedUser)

        return res.status(404).json({
            error: true,
            success: false,
            message: "id is null or given id is not valid to update user"
        })

    } catch (e) {
        console.error(e)
        return res.status(500).json({
            error: true,
            success: false,
            message: "Something went wrong"
        });
    }
})

let hashPassword = (password, salt) => {
    return new Promise((resolve, reject) => {
        bcrypt.hash(password, salt, (err, hash) => {
            if (err) reject(err)
            resolve(hash)
        })
    })
}


module.exports = router;

