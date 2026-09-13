const pdfParse = require('pdf-parse');
const mongoose = require('mongoose');
const generateInterviewReport = require('../services/ai.service');
const InterviewReportModel = require('../models/interviewReport.model');

function getFallbackReportTitle(jobDescription) {
    const firstLine = jobDescription?.split(/\r?\n/).find((line) => line.trim());
    if (!firstLine) return 'Interview preparation';

    const cleanedTitle = firstLine.replace(/^(job title|role|position)\s*:\s*/i, '').trim();
    return `${cleanedTitle.slice(0, 72)}${cleanedTitle.length > 72 ? '...' : ''} prep`;
}


async function generateInterviewReportController(req, res) {
    if (!req.file) {
        return res.status(400).json({ message: 'Please upload a PDF resume' });
    }

    const { selfDescription, jobDescription } = req.body || {};
    if (typeof selfDescription !== 'string' || typeof jobDescription !== 'string') {
        return res.status(400).json({
            message: 'Please provide jobDescription and selfDescription'
        });
    }

    const normalizedJobDescription = jobDescription.trim();
    const normalizedSelfDescription = selfDescription.trim();
    if (!normalizedJobDescription || !normalizedSelfDescription) {
        return res.status(400).json({
            message: 'Job description and self description cannot be empty'
        });
    }

    if (normalizedJobDescription.length > 20000 || normalizedSelfDescription.length > 10000) {
        return res.status(400).json({
            message: 'Interview descriptions are too long'
        });
    }

    if (req.file.buffer.toString('ascii', 0, 4) !== '%PDF') {
        return res.status(400).json({ message: 'The uploaded file is not a valid PDF' });
    }

    const resumeContent = await (new pdfParse.PDFParse(Uint8Array.from(req.file.buffer))).getText();
    if (!resumeContent.text || resumeContent.text.length > 100000) {
        return res.status(400).json({ message: 'The resume is empty or too large to process' });
    }

    const interviewReportByAi = await generateInterviewReport({
        resume: resumeContent.text,
        jobDescription: normalizedJobDescription,
        selfDescription: normalizedSelfDescription
    });

    const interviewReport = await InterviewReportModel.create({
        user: req.user.id,
        resumeText: resumeContent.text,
        jobDescription: normalizedJobDescription,
        selfDescription: normalizedSelfDescription,
        ...interviewReportByAi
    });

    const reportResponse = interviewReport.toObject();
    delete reportResponse.resumeText;
    delete reportResponse.jobDescription;
    delete reportResponse.selfDescription;

    res.status(201).json({
        message: 'Interview report generated successfully',
        data: reportResponse
    });




}


async function getInterviewReportController(req, res) {
    if (!mongoose.isValidObjectId(req.params.interviewId)) {
        return res.status(400).json({ message: 'Invalid interview report ID' });
    }

    const interviewReport = await InterviewReportModel.findOne({
        _id: req.params.interviewId,
        user: req.user.id
    }).select('-resumeText -jobDescription -selfDescription');

    if (!interviewReport) {
        return res.status(404).json({ message: 'Interview report not found' });
    }

    res.status(200).json({
        message: 'Interview report fetched successfully',
        data: interviewReport
    });
}

async function getInterviewReportsController(req, res) {
    const requestedLimit = Number(req.query.limit || 20);
    if (!Number.isInteger(requestedLimit) || requestedLimit < 1 || requestedLimit > 50) {
        return res.status(400).json({ message: 'Limit must be an integer between 1 and 50' });
    }

    const reports = await InterviewReportModel.find({ user: req.user.id })
        .select('_id title jobDescription matchScore createdAt technicalQuestions behavioralQuestions')
        .sort({ createdAt: -1, _id: -1 })
        .limit(requestedLimit)
        .lean();

    const items = reports.map((report) => ({
        _id: report._id,
        title: report.title && report.title !== 'Untitled Report'
            ? report.title
            : getFallbackReportTitle(report.jobDescription),
        matchScore: report.matchScore,
        createdAt: report.createdAt,
        technicalQuestionCount: report.technicalQuestions?.length || 0,
        behavioralQuestionCount: report.behavioralQuestions?.length || 0
    }));

    res.status(200).json({
        message: 'Interview reports fetched successfully',
        data: items
    });
}
module.exports = {
        generateInterviewReportController,
        getInterviewReportController,
        getInterviewReportsController
};