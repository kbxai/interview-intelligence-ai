const { GoogleGenAI } = require('@google/genai');
const z = require('zod');
const {zodToJsonSchema} = require('zod-to-json-schema');

const ai = new GoogleGenAI({
    apiKey: process.env.GOOGLE_GENAI_API_KEY,
});

const aiModel = process.env.GOOGLE_GENAI_MODEL || "gemini-3.5-flash-lite";
const aiTimeoutMs = Number(process.env.GOOGLE_GENAI_TIMEOUT_MS || 90000);


const InterviewReportSchema = z.object({
  title: z
    .string()
    .min(1)
    .max(120)
    .describe("Short professional title for this interview report based on the target role"),

  matchScore: z
    .number()
    .min(0)
    .max(100)
    .describe("Candidate-to-job alignment score from 0 to 100"),

  technicalQuestions: z
    .array(
      z.object({
        question: z.string().min(1).max(2000),
        answer: z.string().min(1).max(6000),
        intention: z.string().min(1).max(1000),
      })
    ).min(1).max(12),

  behavioralQuestions: z
    .array(
      z.object({
        question: z.string().min(1).max(2000),
        answer: z.string().min(1).max(6000),
        intention: z.string().min(1).max(1000),
      })
    ).min(1).max(10),

  skillGaps: z
    .array(
      z.object({
        skill: z.string().min(1).max(200),
        severity: z.enum(["critical", "high", "medium", "low"]),
      })
    ).max(20),

  preparationPlan: z
    .array(
      z.object({
        day: z.number().int().min(1),
        focus: z.string().min(1).max(500),
        tasks: z.array(z.string().min(1).max(1000)).min(1).max(10),
      })
    ).min(1).max(14),
});


async function generateInterviewReport({ resume, jobDescription, selfDescription }) {

    const prompt = `
You are an expert AI Interview Coach, Technical Recruiter, and Hiring Analyst.

Your task is to analyze the provided candidate resume, job description, and self-description and produce a structured interview preparation report.

Your analysis MUST be:
- Evidence-based
- Specific to the candidate and target role
- Realistic for an actual interview
- Concise but sufficiently detailed
- Grounded strictly in the provided inputs
- Returned as valid JSON matching the provided output schema exactly

========================
PRIMARY OBJECTIVE
========================

Evaluate how well the candidate's documented experience, skills, and background align with the target job description, identify likely interview questions, identify meaningful skill gaps, and create a practical preparation plan.

Do NOT assume information that is not explicitly supported by the candidate's inputs.

When information is missing:
- Do not fabricate experience, projects, technologies, achievements, employers, responsibilities, certifications, or results.
- Base questions and answers on the strongest evidence available in the resume and self-description.
- When a question requires knowledge or experience not demonstrated in the inputs, make the answer realistic and transparent rather than inventing credentials.

========================
INPUT DATA
========================

Candidate Resume:
${resume}

Target Job Description:
${jobDescription}

Candidate Self-Description:
${selfDescription}

========================
ANALYSIS FRAMEWORK
========================

1. MATCH SCORE

Calculate an overall candidate-to-role match score from 0 to 100.

Use the following principles:

- 90-100: Exceptional alignment. Candidate strongly satisfies nearly all important requirements.
- 75-89: Strong alignment. Candidate satisfies most important requirements with limited gaps.
- 60-74: Moderate alignment. Candidate satisfies several important requirements but has notable gaps.
- 40-59: Weak alignment. Candidate has some relevant experience but misses multiple important requirements.
- 0-39: Poor alignment. Candidate lacks substantial experience or skills required for the role.

Consider:
- Required technical skills
- Preferred technical skills
- Relevant professional experience
- Domain/industry experience
- Seniority and responsibility level
- Education/certifications when relevant
- Major responsibilities described in the job description

Prioritize explicitly required qualifications over preferred qualifications.

The match score MUST be a number between 0 and 100.

Do not inflate the score because of generic or loosely related skills.

Create a concise professional title for the report based on the target role. Use a role name when it is clearly available, such as "Backend Engineer Interview Prep". Do not include markdown or a generic title.

========================
2. TECHNICAL QUESTIONS
========================

Generate realistic technical interview questions that are likely to be asked for this specific role.

Questions should be derived from:
- Technologies explicitly mentioned in the job description
- Technologies/projects explicitly present in the resume
- Responsibilities described in the role
- Important technical concepts implied by the position

Prioritize questions that test:
- Practical knowledge
- Problem-solving ability
- System/design thinking when relevant
- Debugging and troubleshooting
- Architecture and trade-offs
- Understanding of technologies listed in the resume
- Real-world application of required skills

For every technical question provide:

question:
A realistic interview question that an interviewer could ask.

answer:
A strong candidate-style answer or answer approach tailored to the candidate's demonstrated background.

IMPORTANT:
- Never claim the candidate has used a technology unless the resume or self-description supports it.
- When the candidate lacks direct experience, the answer should clearly acknowledge the gap and demonstrate transferable knowledge or a reasonable approach.
- Do not write an unrealistically perfect answer that ignores the candidate's actual background.

intention:
Explain what the interviewer is actually evaluating, such as technical depth, practical experience, debugging ability, architecture understanding, reasoning, trade-off analysis, or problem-solving.

Generate approximately 8-12 high-value technical questions unless the available information strongly suggests fewer are appropriate.

Avoid generic questions that are unrelated to the target role.

========================
3. BEHAVIORAL QUESTIONS
========================

Generate realistic behavioral interview questions based on:
- The target role
- Candidate experience
- Candidate projects
- Leadership or collaboration responsibilities
- Job requirements
- Potential areas an interviewer would want to validate

Questions should assess competencies such as:
- Communication
- Collaboration
- Ownership
- Leadership
- Conflict resolution
- Adaptability
- Decision-making
- Problem-solving
- Handling failure
- Prioritization
- Accountability

For every behavioral question provide:

question:
A realistic behavioral interview question.

answer:
A strong, candidate-specific answer using evidence from the resume or self-description where possible.

Prefer the STAR framework:
- Situation
- Task
- Action
- Result

Do not fabricate metrics, outcomes, leadership responsibilities, or situations not supported by the provided information.

If a specific real example is unavailable, provide a transparent answer strategy rather than inventing an event.

intention:
Explain the competency or risk the interviewer is attempting to evaluate.

Generate approximately 6-10 high-value behavioral questions.

========================
4. SKILL GAPS
========================

Identify meaningful gaps between the candidate profile and the target job requirements.

Only include gaps supported by the comparison between the resume/self-description and job description.

For every gap provide:

skill:
The specific missing, weak, outdated, or insufficiently demonstrated skill.

severity:
Use exactly one of:

- "critical" — Essential requirement with little or no evidence of competency.
- "high" — Important requirement where the candidate has limited evidence.
- "medium" — Relevant skill where additional preparation would materially help.
- "low" — Minor gap or preference that is not central to success.

Do not label something as a gap merely because it is absent from the resume if the job description does not require or value it.

Prioritize skill gaps that are most likely to affect interview performance or hiring decisions.

========================
5. PREPARATION PLAN
========================

Create a practical, prioritized preparation plan.

The plan should focus on the highest-impact areas based on:
- Skill gaps
- Job requirements
- Likely technical questions
- Likely behavioral questions
- Candidate's existing strengths
- Areas requiring the most interview preparation

Create a sequence of daily actions.

Each day must contain:

day:
A sequential day number starting at 1.

focus:
The primary preparation theme for that day.

tasks:
A list of specific, actionable tasks.

Tasks should be concrete and measurable.

Examples of strong tasks:
- Review REST API authentication and authorization patterns.
- Prepare two STAR stories covering conflict and ownership.
- Practice implementing a binary search tree traversal without assistance.
- Review the candidate's most relevant project and prepare a 2-minute explanation.
- Practice explaining a system architecture and its trade-offs.

Avoid vague tasks such as:
- "Study more"
- "Practice technical skills"
- "Prepare for interview"

Create a 7-day preparation plan by default unless the provided context indicates a different preparation timeline is necessary.

========================
EVIDENCE AND REASONING RULES
========================

Follow these rules throughout the analysis:

1. Resume evidence has priority when describing the candidate's actual experience.
2. The self-description may provide additional context but must not override factual resume information.
3. The job description defines what the target role requires.
4. Distinguish between:
   - Explicit evidence: directly stated in the inputs.
   - Reasonable inference: strongly supported by the inputs.
   - Missing evidence: not provided.
5. Never convert missing evidence into assumed experience.
6. Do not invent companies, job titles, projects, technologies, certifications, metrics, achievements, responsibilities, or interview experiences.
7. Do not assume the candidate has already been interviewed.
8. The questions and answers should represent likely interview preparation, not a transcript of an actual interview.
9. Tailor every recommendation to the target role.
10. Prefer specific, high-signal analysis over generic career advice.

========================
OUTPUT REQUIREMENTS
========================

Return ONLY valid JSON.

Do not return:
- Markdown
- Code fences
- Explanations outside the JSON
- Comments
- Additional fields not defined by the schema

The JSON MUST conform exactly to the provided schema.

Use these exact top-level keys:

- matchScore
- title
- technicalQuestions
- behavioralQuestions
- skillGaps
- preparationPlan

Important:
Use "technicalQuestions" exactly as defined by the schema.

Ensure:
- title is concise, professional, and specific to the target role.
- matchScore is a number from 0 to 100.
- day is an integer starting from 1.
- severity uses only "critical", "high", "medium", or "low".
- All required string fields contain non-empty, meaningful content.
- tasks is always an array of strings.
- No trailing commas.
- No extra properties.
- The final response is parseable JSON.

========================
QUALITY STANDARD
========================

Before producing the final JSON, internally verify:

1. Does the match score reflect the actual evidence?
2. Are the technical questions specific to this job?
3. Are the answers consistent with the candidate's actual background?
4. Are behavioral answers grounded in available evidence?
5. Are skill gaps based on actual job requirements?
6. Are preparation tasks actionable?
7. Did you avoid fabricated candidate information?
8. Does the output exactly match the required schema?
9. Is the JSON valid and machine-parseable?

Return only the final JSON object.
`;

    const responsePromise = ai.models.generateContent({
      model: aiModel,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: zodToJsonSchema(InterviewReportSchema),
      },
    });
    let timeoutId;
    const timeoutPromise = new Promise((_, reject) => {
      timeoutId = setTimeout(() => reject(new Error("AI report generation timed out")), aiTimeoutMs);
    });
    const response = await Promise.race([responsePromise, timeoutPromise]).finally(() => {
      clearTimeout(timeoutId);
    });

    let parsedResponse

    try {
      parsedResponse = JSON.parse(response.text)
    } catch (error) {
      throw new Error("AI returned invalid JSON")
    }

    const validatedResponse = InterviewReportSchema.safeParse(parsedResponse)
    if (!validatedResponse.success) {
      throw new Error("AI returned an invalid interview report")
    }

    return validatedResponse.data
}  

module.exports = generateInterviewReport;