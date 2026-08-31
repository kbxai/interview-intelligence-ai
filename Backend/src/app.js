const express = require("express")
const cookieParser = require("cookie-parser")
const cors = require("cors")

const app = express()

app.use(express.json({ limit: "100kb" }))
app.use(cookieParser())
app.use(cors({
    origin: process.env.FRONTEND_ORIGIN || "http://localhost:5173",
    credentials: true
}))

app.get("/health", (req, res) => {
    res.status(200).json({ status: "ok" })
})

const rateLimit = require("express-rate-limit")

const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 50,
    standardHeaders: true,
    legacyHeaders: false,
    message: { message: "Too many requests from this IP, please try again after 15 minutes" }
})

const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 100,
    standardHeaders: true,
    legacyHeaders: false,
    message: { message: "Too many requests, please slow down" }
})

const authRouter = require("./routes/auth.routes")
const interviewRouter = require("./routes/interview.routes")
const resumeRouter = require("./routes/resume.routes")

app.use("/api/auth", authLimiter, authRouter)
app.use("/api/interview", apiLimiter, interviewRouter)
app.use("/api/resume", apiLimiter, resumeRouter)

app.use((error, req, res, next) => {
    console.error(error)

    if (res.headersSent) {
        return next(error)
    }

    if (error.code === "LIMIT_FILE_SIZE" || error.code === "LIMIT_UNEXPECTED_FILE") {
        return res.status(400).json({ message: "Please upload one PDF resume smaller than 5 MB" })
    }

    if (error.name === "ValidationError" || error.code === 11000) {
        return res.status(400).json({ message: "The submitted data is invalid" })
    }

    res.status(error.statusCode || 500).json({
        message: error.statusCode ? error.message : "Internal server error"
    })
})


module.exports = app