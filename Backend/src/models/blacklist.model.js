const mongoose = require("mongoose")

const blacklistTokenSchema = new mongoose.Schema({
    tokenHash: {
        type: String,
        required: [true, "token hash is required"],
        unique: true,
        index: true
    },
    expiresAt: {
        type: Date,
        required: true,
        expires: 0
    }
},
{
    timestamps: true
})


const tokenBlacklistModel = mongoose.model("blacklistTokens", blacklistTokenSchema)

module.exports = tokenBlacklistModel