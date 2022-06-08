const jwt = require('jsonwebtoken');
const User = require('../models/user');


async function authenticateToken(req, res, next) {
    const token = req.headers['authorization']

    if (token == null) return res.sendStatus(401)

    jwt.verify(token, process.env.TOKEN_SECRET, async (err, data) => {
        if (err) return res.sendStatus(403)

        try {
            let user = await User.findById(data._id)
            req.user = user
            next()

        } catch (e) {
            return res.sendStatus(403)
        }
    })
}


module.exports = {authenticateToken}
