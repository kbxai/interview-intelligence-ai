const express = require('express');
const { authUser } = require('../middlewares/auth.middleware');
const resumeController = require('../controllers/resume.controller');

const resumeRouter = express.Router();

resumeRouter.post('/from-report/:interviewId', authUser, resumeController.createResumeController);
resumeRouter.put('/:jobId/source', authUser, resumeController.updateResumeSourceController);
resumeRouter.get('/:jobId/pdf', authUser, resumeController.downloadResumeController);
resumeRouter.get('/:jobId', authUser, resumeController.getResumeStatusController);

module.exports = resumeRouter;
