const mongoose = require('mongoose');


/**
 * - job Description Schema : String
 * - resume text : String
 * - Self Description : String
 * 
 * matchScore : Number
 * 
 * - Technical Questions : 
 *             [{
 *                question : String,
 *               answer : String,
 *               intention : String,
 *                  }]
 * 
 * - Behavioral Questions : [{
 *                question : String,
 *               answer : String,
 *               intention : String,
 *                  }]
 * - skill gaps : 
 *                [{
 *               skill : String,
 *               severity : String,
 *               type : String,
 *              enum: ['low', 'medium', 'high']
 *          }]
 * - preparation plan : [{
 *             day : Number,
 *            focus : String,
 *             task : [String]
 * }]
 */


const technicalQuestionSchema = new mongoose.Schema({
    question: {
        type: String,
        required: [true, 'Question is required']
    },
    answer: {
        type: String,
        required: [true, 'Answer is required']
    },
    intention: {
        type: String,
        required: [true, 'Intention is required']
    }
},{
    _id: false
});

const behavioralQuestionSchema = new mongoose.Schema({
    question: {
        type: String,
        required: [true, 'Question is required']
    },
    answer: {
        type: String,
        required: [true, 'Answer is required']
    },
    intention: {
        type: String,
        required: [true, 'Intention is required']
    },
},{
    _id: false
});

const skillGapSchema = new mongoose.Schema({
    skill: {
        type: String,
        required: [true, 'Skill is required']
    },
    severity: {
        type: String,
        required: [true, 'Severity is required'],
        enum: ['critical', 'low', 'medium', 'high']
    }
},{
    _id: false
});

const preparationPlanSchema = new mongoose.Schema({
    day: {
        type: Number,
        required: [true, 'Day is required']
    },
    focus: {
        type: String,
        required: [true, 'Focus is required']
    },
    tasks: {
        type: [String],
        required: [true, 'Tasks are required']
    }
},{
    _id: false
});

const interviewReportSchema = new mongoose.Schema({
    jobDescription: {
        type:String,
        required:[true, 'Job Description is required']
    },
    resumeText: {
        type:String,
        required:[true, 'Resume Text is required']
    },
    selfDescription: {
        type:String,
        required:[true, 'Self Description is required']
    },
    matchScore: {
        type:Number,
        required:[true, 'Match Score is required'],
        min: [0, 'Match Score must be at least 0'],
        max: [100, 'Match Score cannot exceed 100']
    },
    technicalQuestions: {
        type: [technicalQuestionSchema],
        required: [true, 'Technical Questions are required']
    },
    behavioralQuestions: {
        type: [behavioralQuestionSchema],
        required: [true, 'Behavioral Questions are required']
    },
    skillGaps: {
        type: [skillGapSchema],
        required: [true, 'Skill Gaps are required']
    },
    preparationPlan: {
        type: [preparationPlanSchema],
        required: [true, 'Preparation Plan is required']
    },
    user:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users',
        required: [true, 'User reference is required']
    },
    title: {
        type: String,
        default: 'Untitled Report',
        required: [true, 'Title is required']
    }
}, { timestamps: true })

interviewReportSchema.index({ user: 1, createdAt: -1 })

const InterviewReportModel = mongoose.model('InterviewReportModel', interviewReportSchema);

module.exports = InterviewReportModel;