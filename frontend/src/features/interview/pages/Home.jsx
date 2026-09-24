import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '../../auth/hooks/useAuth';
import { generateInterviewReport } from '../services/interview.api';
import '../style/home.scss';

const PROGRESS_STAGES = [
    'Parsing your resume…',
    'Analyzing the job description…',
    'Matching skills to requirements…',
    'Generating interview questions…',
    'Building your preparation plan…'
];

const Home = () => {
    const navigate = useNavigate();
    const { handleLogout, user } = useAuth();
    const [resumeName, setResumeName] = useState('No PDF selected');
    const [jobLength, setJobLength] = useState(0);
    const [jobDescription, setJobDescription] = useState('');
    const [selfDescription, setSelfDescription] = useState('');
    const [resume, setResume] = useState(null);
    const [isDragging, setIsDragging] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [stageIndex, setStageIndex] = useState(0);

    useEffect(() => {
        if (!submitting) {
            setStageIndex(0);
            return;
        }
        const timer = setInterval(() => {
            setStageIndex(prev => prev < PROGRESS_STAGES.length - 1 ? prev + 1 : prev);
        }, 3000);
        return () => clearInterval(timer);
    }, [submitting]);

    function handleFileSelected(file) {
        if (!file) return;

        if (file.type !== 'application/pdf') {
            setError('Please upload a PDF file.');
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            setError('PDF resume must be smaller than 5 MB.');
            return;
        }

        setError('');
        setResume(file);
        setResumeName(file.name);
    }

    async function handleGenerateReport() {
        const trimmedJobDescription = jobDescription.trim();
        const trimmedSelfDescription = selfDescription.trim();

        if (!trimmedJobDescription || !trimmedSelfDescription || !resume) {
            setError('Add the job description, your self description, and a PDF resume to continue.');
            return;
        }

        if (trimmedJobDescription.length > 20000 || trimmedSelfDescription.length > 10000) {
            setError('Keep the job description under 20,000 characters and self description under 10,000.');
            return;
        }

        if (resume.type !== 'application/pdf' || resume.size > 5 * 1024 * 1024) {
            setError('Upload a PDF resume smaller than 5 MB.');
            return;
        }

        setSubmitting(true);
        setError('');
        const formData = new FormData();
        formData.append('jobDescription', trimmedJobDescription);
        formData.append('selfDescription', trimmedSelfDescription);
        formData.append('resume', resume);

        try {
            const response = await generateInterviewReport(formData);
            navigate(`/interview/${response.data._id}`);
        } catch (requestError) {
            setError(requestError.message);
        } finally {
            setSubmitting(false);
        }
    }

    async function handleLogoutClick() {
        await handleLogout();
        navigate('/login');
    }

    return (
        <main className="home">
            <a href="#main-content" className="skip-link">Skip to main content</a>
            <header className="home-header">
                <div>
                    <span className="eyebrow">Interview intelligence</span>
                    <h1>Build your interview edge.</h1>
                    <p>Share the role, your story, and your resume. We will turn them into a focused preparation plan.</p>
                </div>
                <div className="header-status" aria-label="Analysis status">
                    <span className="status-dot" />
                    <span>Ready to analyze</span>
                    {user?.username && <span>Account: <strong>{user.username}</strong></span>}
                    <button type="button" className="reports-link" onClick={() => navigate('/')}>Home</button>
                    <button type="button" className="reports-link" onClick={() => navigate('/reports')}>Reports</button>
                    <button type="button" className="logout-button" onClick={handleLogoutClick}>Log out</button>
                </div>
            </header>

            <div id="main-content" className="workspace-heading">
                <div>
                    <span className="step-label">01 / 02</span>
                    <h2>Tell us about the opportunity</h2>
                </div>
                <span className="secure-note">Your data stays private</span>
            </div>

            <div className="left panel">
                <div className="panel-heading">
                    <div>
                        <span className="field-kicker">Role context</span>
                        <label htmlFor="jobDescription">Job description</label>
                    </div>
                    <span className="field-meta">{jobLength} characters</span>
                </div>
                <textarea 
                    name="jobDescription" 
                    id="jobDescription" 
                    placeholder="Paste the job description, requirements, and anything the team values..." 
                    value={jobDescription} 
                    onChange={(event) => { setJobDescription(event.target.value); setJobLength(event.target.value.length); }} 
                />
                <p className="field-hint">Include the responsibilities and skills you want the interview to focus on.</p>
            </div>

            <div className="right panel">
                <div className="input-group">
                    <div className="panel-heading">
                        <div>
                            <span className="field-kicker">Your perspective</span>
                            <label htmlFor="selfDescription">Self description</label>
                        </div>
                    </div>
                    <textarea 
                        name="selfDescription" 
                        id="selfDescription" 
                        placeholder="What are you great at? What kind of role are you looking for?" 
                        value={selfDescription} 
                        onChange={(event) => setSelfDescription(event.target.value)} 
                    />
                </div>
                <div className="input-group">
                    <div className="panel-heading">
                        <div>
                            <span className="field-kicker">Proof of work</span>
                            <label htmlFor="resume">Your resume</label>
                        </div>
                        <span className="field-meta">PDF / 5 MB max</span>
                    </div>
                    <label 
                        className={isDragging ? 'upload-zone is-dragging' : 'upload-zone'} 
                        htmlFor="resume"
                        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                        onDragLeave={() => setIsDragging(false)}
                        onDrop={(e) => {
                            e.preventDefault();
                            setIsDragging(false);
                            const file = e.dataTransfer?.files?.[0];
                            if (file) handleFileSelected(file);
                        }}
                    >
                        <span className="upload-icon" aria-hidden="true">+</span>
                        <span>
                            <strong>{resumeName === 'No PDF selected' ? 'Choose or drop your resume' : resumeName}</strong>
                            <small>{resumeName === 'No PDF selected' ? 'PDF files only, max 5 MB' : 'Ready to upload'}</small>
                        </span>
                        <input 
                            type="file" 
                            name="resume" 
                            id="resume" 
                            accept=".pdf" 
                            onChange={(event) => handleFileSelected(event.target.files?.[0])} 
                        />
                    </label>
                </div>
                <button type="button" className="generate-button" onClick={handleGenerateReport} disabled={submitting} aria-busy={submitting}>
                    <span>{submitting ? PROGRESS_STAGES[stageIndex] : 'Generate interview report'}</span>
                    <span aria-hidden="true">-&gt;</span>
                </button>
                {error && <p className="form-error" role="alert">{error}</p>}
            </div>

            <div className={submitting ? 'ai-generated-content is-processing' : 'ai-generated-content'}>
                <div className="report-visual" aria-hidden="true">
                    <span className="report-orbit orbit-one" />
                    <span className="report-orbit orbit-two" />
                    <span className="report-core">AI</span>
                </div>
                <div className="report-copy">
                    <span className="field-kicker">Your tailored briefing</span>
                    <h2>{submitting ? 'Preparing your report…' : 'Your interview report will appear here.'}</h2>
                    <p>{submitting ? PROGRESS_STAGES[stageIndex] : 'We will map your strengths to the role, surface likely questions, and give you a practical plan for the days ahead.'}</p>
                </div>
                <span className="report-badge" role="status" aria-live="polite">{submitting ? `Step ${stageIndex + 1} of ${PROGRESS_STAGES.length}` : 'Awaiting input'}</span>
            </div>
        </main>
    );
};

export default Home;