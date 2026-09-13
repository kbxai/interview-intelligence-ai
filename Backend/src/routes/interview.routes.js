const express = require('express')
const { authUser } = require('../middlewares/auth.middleware')
const interviewController = require('../controllers/interview.controller')
const upload = require('../middlewares/file.middleware')

const interviewRouter = express.Router()

/**
 * @route POST /api/interview
 * @desc Generate an interview report based on the provided resume, job description, and self-description.
 * @access Private
 */

interviewRouter.post('/', authUser, upload.single("resume"), interviewController.generateInterviewReportController)

interviewRouter.get('/', authUser, interviewController.getInterviewReportsController)

/**
 * @route GET /api/interview/:interviewId
 * @desc Retrieve a specific interview report by its ID.
 * @access Private
 */
interviewRouter.get('/:interviewId', authUser, interviewController.getInterviewReportController)

module.exports = interviewRouter