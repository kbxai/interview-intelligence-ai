const requiredVariables = [
    "MONGO_URI",
    "JWT_SECRET",
    "GOOGLE_GENAI_API_KEY"
]

function validateEnvironment() {
    const missingVariables = requiredVariables.filter((name) => !process.env[name])

    if (missingVariables.length > 0) {
        throw new Error(`Missing environment variables: ${missingVariables.join(", ")}`)
    }

    if (process.env.JWT_SECRET.length < 32) {
        throw new Error("JWT_SECRET must be at least 32 characters long")
    }
}

module.exports = validateEnvironment
