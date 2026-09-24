const jwt = require("jsonwebtoken")
const crypto = require("crypto")
const tokenBlacklistModel = require("../models/blacklist.model")


async function authUser(req,res,next){
    let token = req.cookies.token
    if(!token && req.headers.authorization){
        if(req.headers.authorization.startsWith("Bearer ")){
            token = req.headers.authorization.split(" ")[1]
        }else{
            token = req.headers.authorization
        }
    }

    if(!token){
        return res.status(401).json({
            message: "Token not found, please login to access this resource"
        })
    }

    const tokenHash = crypto.createHash("sha256").update(token).digest("hex")
    const isTokenBlacklisted = await tokenBlacklistModel.findOne({ tokenHash })
    if(isTokenBlacklisted){
        return res.status(401).json({
            message: "Token is blacklisted, please login to access this resource"
        })
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if(err){
            return res.status(401).json({
                message: "Invalid token, please login to access this resource"
            })
        }

        req.user = decoded
        next()
    })

}

module.exports = { authUser }