const jwt = require('jsonwebtoken')
const Users = require('../models/Users')

const isAuthenticated = (req, res, next) => {
    const token = req.headers.authorization
    if (!token) {
        return res.sendStatus(403)
    }
    jwt.verify(token, process.env.SECRET_KEY, (err, decoded) => {
        const { _id } = decoded
        Users.findOne({ _id }).exec()
        .then(user => {
            req.user = user
            next()
        })
    })
}

const hasRoles = roles => (req, res, next) => {
    if (roles.indexOf(req.user.role) > -1) {
        return next()
    }
    res.sendStatus(403)
}
//En caso que tengan mas de 1 role
/* const hasRole = role => (req, res, next) => {
    if (req.user.role === role) {
        return next()
    }
    res.sendStatus(403)
} */

module.exports = {
    isAuthenticated,
    hasRoles,
}