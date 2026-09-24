const userModel = require("../models/user.model")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
const crypto = require("crypto")
const tokenBlacklistModel = require("../models/blacklist.model")

const cookieOptions = {
    httpOnly: true,
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 24 * 60 * 60 * 1000
}

/**
 * @name registerUserController
 * @description register a new user, expects username, email and password in the request body
 * @access Public
 */
async function registerUserController(req, res) {

    const { username, email, password } = req.body || {}
    const normalizedUsername = username?.trim()
    const normalizedEmail = email?.trim().toLowerCase()

    if (!normalizedUsername || !normalizedEmail || !password) {
        return res.status(400).json({
            message: "Please provide username, email and password"
        })
    }

    const isUserAlreadyExists = await userModel.findOne({
        $or: [ { username: normalizedUsername }, { email: normalizedEmail } ]
    })

    if (isUserAlreadyExists) {
        return res.status(400).json({
            message: "Account already exists with this email address or username"
        })
    }

    const hash = await bcrypt.hash(password, 10)

    const user = await userModel.create({
        username: normalizedUsername,
        email: normalizedEmail,
        password: hash
    })

    const token = jwt.sign(
        { id: user._id, username: user.username },
        process.env.JWT_SECRET,
        { expiresIn: "1d" }
    )

    res.cookie("token", token, cookieOptions)


    res.status(201).json({
        message: "User registered successfully",
        token: token,
        user: {
            id: user._id,
            username: user.username,
            email: user.email
        }
    })

}


/**
 * @name loginUserController
 * @description login a user, expects email and password in the request body
 * @access Public
 */
async function loginUserController(req, res) {

    const { email, password } = req.body || {}
    const normalizedEmail = email?.trim().toLowerCase()

    if (!normalizedEmail || !password) {
        return res.status(400).json({ message: "Please provide email and password" })
    }

    const user = await userModel.findOne({ email: normalizedEmail })

    if (!user) {
        return res.status(400).json({
            message: "Invalid email or password"
        })
    }

    const isPasswordValid = await bcrypt.compare(password, user.password)

    if (!isPasswordValid) {
        return res.status(400).json({
            message: "Invalid email or password"
        })
    }

    const token = jwt.sign(
        { id: user._id, username: user.username },
        process.env.JWT_SECRET,
        { expiresIn: "1d" }
    )

    res.cookie("token", token, cookieOptions)
    res.status(200).json({
        message: "User loggedIn successfully.",
        token: token,
        user: {
            id: user._id,
            username: user.username,
            email: user.email
        }
    })
}


/**
 * @name logoutUserController
 * @description logout a user, expects token in the request header
 * @access Public
 */

async function logoutUserController(req,res){
    const token = req.cookies.token || req.headers.authorization?.split(" ")[1]

    if (token){
        let expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            if (decoded && decoded.exp) {
                expiresAt = new Date(decoded.exp * 1000);
            }
        } catch (e) {
            // Ignore error, fallback to 24h
        }
        await tokenBlacklistModel.create({
            tokenHash: crypto.createHash("sha256").update(token).digest("hex"),
            expiresAt
        })
    }

    res.clearCookie("token", cookieOptions)
    res.status(200).json({
        message: "User logged out successfully"
    })
}


/**
 * @name getMeController
 * @description get the logged in user details, expects token in the request header
 * @access Private
 */
async function getMeController(req,res){
    const user = await userModel.findById(req.user.id)

    if (!user) {
        return res.status(401).json({ message: "User account no longer exists" })
    }

    res.status(200).json({
        message: "User details fetched successfully",
        user: {
            id: user._id,
            username: user.username,
            email: user.email
        }
    })

}
 


module.exports = {
    registerUserController,
    loginUserController,
    logoutUserController,
    getMeController
}


