require("dotenv").config()
const validateEnvironment = require("./src/config/env")
validateEnvironment()
const app = require("./src/app")
const connectToDB = require("./src/config/database")
const mongoose = require("mongoose")
const { closeBrowser } = require("./src/services/pdf.service")
const { recoverOrphanedJobs } = require("./src/services/resume.service")

const port = Number(process.env.PORT || 5000)
let httpServer

async function startServer() {
    await connectToDB()
    await recoverOrphanedJobs()

    httpServer = app.listen(port, () => {
        console.log(`Server is running on port ${port}`)
    })
}

async function shutdown(signal) {
    console.log(`Received ${signal}, shutting down`)
    if (httpServer) {
        await new Promise((resolve) => httpServer.close(resolve))
    }
    await closeBrowser()
    await mongoose.connection.close()
    process.exit(0)
}

process.once("SIGINT", () => shutdown("SIGINT"))
process.once("SIGTERM", () => shutdown("SIGTERM"))

startServer().catch((error) => {
    console.error("Server startup failed:", error.message)
    process.exitCode = 1
})
