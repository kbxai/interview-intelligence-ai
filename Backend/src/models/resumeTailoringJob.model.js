const mongoose = require('mongoose');

const resumeTailoringJobSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users',
        required: true,
        index: true
    },
    sourceReport: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'InterviewReportModel',
        required: true
    },
    template: {
        type: String,
        enum: ['classic', 'modern', 'compact'],
        required: true
    },
    status: {
        type: String,
        enum: ['queued', 'processing', 'completed', 'failed', 'expired'],
        default: 'queued',
        index: true
    },
    stage: {
        type: String,
        enum: ['queued', 'generating_resume', 'validating_resume', 'rendering_pdf', 'completed', 'failed'],
        default: 'queued'
    },
    result: {
        type: mongoose.Schema.Types.Mixed,
        default: null
    },
    sourceMarkdown: {
        type: String,
        default: null,
        maxlength: 50000
    },
    markdownRevision: {
        type: Number,
        default: 1,
        min: 1
    },
    markdownUpdatedAt: {
        type: Date,
        default: null
    },
    atsScore: {
        type: Number,
        min: 0,
        max: 100,
        default: null
    },
    atsMetrics: {
        type: mongoose.Schema.Types.Mixed,
        default: null
    },
    pdfData: {
        type: Buffer,
        select: false,
        default: null
    },
    errorCode: {
        type: String,
        default: null
    },
    expiresAt: {
        type: Date,
        required: true,
        expires: 0
    }
}, { timestamps: true });

resumeTailoringJobSchema.index({ user: 1, createdAt: -1 });

module.exports = mongoose.model('ResumeTailoringJob', resumeTailoringJobSchema);
