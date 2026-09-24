const mongoose = require('mongoose');
const ResumeTailoringJob = require('../models/resumeTailoringJob.model');
const { createResumeJob, renderResumeHtml } = require('../services/resume.service');
const { sanitizeResumeMarkdown, structuredResumeToMarkdown } = require('../services/markdown.service');
const { generateResumePdf } = require('../services/pdf.service');

async function createResumeController(req, res) {
    const { template = 'classic' } = req.body || {};
    if (!mongoose.isValidObjectId(req.params.interviewId)) {
        return res.status(400).json({ message: 'Invalid interview report ID' });
    }

    const job = await createResumeJob({
        userId: req.user.id,
        reportId: req.params.interviewId,
        template
    });

    res.status(202).json({
        message: 'Resume generation started',
        data: { id: job._id, status: job.status, template: job.template, createdAt: job.createdAt }
    });
}

async function getResumeStatusController(req, res) {
    if (!mongoose.isValidObjectId(req.params.jobId)) {
        return res.status(400).json({ message: 'Invalid resume job ID' });
    }

    const job = await ResumeTailoringJob.findOne({ _id: req.params.jobId, user: req.user.id }).select('-user -sourceReport');
    if (!job) return res.status(404).json({ message: 'Resume generation job not found' });
    if (job.expiresAt <= new Date()) {
        if (job.status !== 'expired') {
            await ResumeTailoringJob.updateOne({ _id: job._id }, { status: 'expired', stage: 'failed' });
        }
        return res.status(410).json({ message: 'Resume generation job has expired' });
    }

    const jobResponse = job.toObject();
    jobResponse.id = jobResponse._id;
    delete jobResponse._id;

    res.status(200).json({ message: 'Resume status fetched successfully', data: jobResponse });
}

async function downloadResumeController(req, res) {
    if (!mongoose.isValidObjectId(req.params.jobId)) {
        return res.status(400).json({ message: 'Invalid resume job ID' });
    }

    const job = await ResumeTailoringJob.findOne({ _id: req.params.jobId, user: req.user.id }).select('+pdfData');
    if (!job) return res.status(404).json({ message: 'Resume generation job not found' });
    if (job.expiresAt <= new Date()) return res.status(410).json({ message: 'Resume generation job has expired' });
    if (job.status !== 'completed' || !job.result) return res.status(409).json({ message: 'Resume PDF is not ready' });

    const markdown = job.sourceMarkdown || (job.result ? structuredResumeToMarkdown(job.result) : '');
    const pdf = job.pdfData || await generateResumePdf(renderResumeHtml(markdown, job.template));
    res.set({
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="modified-resume-${job._id}.pdf"`,
        'Content-Length': pdf.length
    });
    res.send(pdf);
}

async function updateResumeSourceController(req, res) {
    if (!mongoose.isValidObjectId(req.params.jobId)) {
        return res.status(400).json({ message: 'Invalid resume job ID' });
    }

    const { markdown, revision, template } = req.body || {};
    if (typeof markdown !== 'string' || !Number.isInteger(revision)) {
        return res.status(400).json({ message: 'Markdown and revision are required' });
    }
    if (template && !['classic', 'modern', 'compact'].includes(template)) {
        return res.status(400).json({ message: 'Unsupported resume template' });
    }

    const cleanMarkdown = sanitizeResumeMarkdown(markdown);
    const job = await ResumeTailoringJob.findOne({ _id: req.params.jobId, user: req.user.id });
    if (!job) return res.status(404).json({ message: 'Resume generation job not found' });
    if (job.expiresAt <= new Date()) return res.status(410).json({ message: 'Resume generation job has expired' });
    if (job.status !== 'completed') return res.status(409).json({ message: 'Resume is not ready to edit' });
    if (job.markdownRevision !== revision) return res.status(409).json({ message: 'Resume changed elsewhere. Reload the latest version.' });

    job.sourceMarkdown = cleanMarkdown;
    job.markdownRevision += 1;
    job.markdownUpdatedAt = new Date();
    job.template = template || job.template;
    job.pdfData = null;
    await job.save();

    res.status(200).json({
        message: 'Resume changes saved',
        data: { id: job._id, sourceMarkdown: job.sourceMarkdown, markdownRevision: job.markdownRevision, template: job.template }
    });
}

module.exports = { createResumeController, getResumeStatusController, downloadResumeController, updateResumeSourceController };
