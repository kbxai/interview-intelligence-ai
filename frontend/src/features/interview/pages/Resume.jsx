import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { createResumeJob, downloadResume, getResumeJob, saveResumeSource } from '../services/resume.api';
import '../style/resume.scss';

const templates = [
    { id: 'classic', label: 'Classic', description: 'Traditional and highly parsable.' },
    { id: 'modern', label: 'Modern', description: 'Clean hierarchy with a subtle accent.' },
    { id: 'compact', label: 'Compact', description: 'Tighter spacing for fuller resumes.' }
];

const Resume = () => {
    const { interviewId } = useParams();
    const navigate = useNavigate();
    const [template, setTemplate] = useState('classic');
    const [job, setJob] = useState(null);
    const [loading, setLoading] = useState(false);
    const [downloading, setDownloading] = useState(false);
    const [error, setError] = useState('');
    const [markdown, setMarkdown] = useState('');
    const [revision, setRevision] = useState(1);
    const [saveState, setSaveState] = useState('saved');
    const pollingActive = useRef(true);

    useEffect(() => {
        pollingActive.current = true;

        return () => {
            pollingActive.current = false;
        };
    }, []);

    async function handleGenerate() {
        pollingActive.current = true;
        setLoading(true);
        setError('');

        try {
            const created = await createResumeJob(interviewId, template);
            let currentJob = created.data;
            setJob(currentJob);

            let attempts = 0;
            const deadline = Date.now() + 180000;
            while (pollingActive.current && (currentJob.status === 'queued' || currentJob.status === 'processing') && attempts < 150 && Date.now() < deadline) {
                attempts += 1;
                await new Promise((resolve) => setTimeout(resolve, 1200));
                if (!pollingActive.current) return;
                const statusResponse = await getResumeJob(currentJob.id);
                currentJob = statusResponse.data;
                setJob(currentJob);
                if (currentJob.sourceMarkdown) {
                    setMarkdown(currentJob.sourceMarkdown);
                    setRevision(currentJob.markdownRevision || 1);
                }
            }

            if (!pollingActive.current) return;
            if (currentJob.status === 'queued' || currentJob.status === 'processing') {
                throw new Error('Resume generation is taking too long. Please try again.');
            }
            if (currentJob.status === 'expired') {
                throw new Error('This resume generation job expired. Please generate a new resume.');
            }
            if (currentJob.status !== 'completed' && currentJob.status !== 'failed') {
                throw new Error('Resume generation ended in an unknown state. Please try again.');
            }

            if (currentJob.status === 'failed') {
                const failureMessage = currentJob.errorCode === 'PDF_GENERATION_FAILED'
                    ? 'The PDF renderer could not build the resume. Check that Chromium is installed, then try again.'
                    : 'The AI could not create a valid resume from this report. Try again or check the source report.';
                throw new Error(failureMessage);
            }
        } catch (requestError) {
            if (requestError.statusCode === 401) {
                navigate('/login', { replace: true });
                return;
            }
            setError(requestError.message);
        } finally {
            setLoading(false);
        }
    }

    function handleMarkdownChange(event) {
        setMarkdown(event.target.value);
        setSaveState('unsaved');
        setJob((currentJob) => currentJob ? { ...currentJob, pdfData: null } : currentJob);
    }

    async function handleSave() {
        if (!job?.id || !markdown.trim() || saveState === 'saving') return;
        setSaveState('saving');
        setError('');

        try {
            const response = await saveResumeSource(job.id, { markdown, revision, template });
            setMarkdown(response.data.sourceMarkdown);
            setRevision(response.data.markdownRevision);
            setTemplate(response.data.template);
            setJob((currentJob) => ({ ...currentJob, status: 'completed', pdfData: null }));
            setSaveState('saved');
        } catch (requestError) {
            if (requestError.statusCode === 401) {
                navigate('/login', { replace: true });
                return;
            }
            setSaveState('conflict');
            setError(requestError.message);
        }
    }

    async function handleDownload() {
        if (!job?.id || job.status !== 'completed') return;
        setDownloading(true);
        setError('');

        try {
            const blob = await downloadResume(job.id);
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = 'modified-resume.pdf';
            document.body.appendChild(link);
            link.click();
            link.remove();
            setTimeout(() => URL.revokeObjectURL(url), 1000);
        } catch (requestError) {
            if (requestError.statusCode === 401) {
                navigate('/login', { replace: true });
                return;
            }
            setError(requestError.message);
        } finally {
            setDownloading(false);
        }
    }

    const resume = job?.result;
    const metrics = job?.atsMetrics;

    return (
        <main className="resume-page">
            <a href="#main-content" className="skip-link">Skip to main content</a>
            <header className="resume-header">
                <div>
                    <span className="resume-kicker">Resume studio</span>
                    <h1>Tailor your resume.</h1>
                    <p>Build an evidence-based resume aligned to the role. No unsupported claims, no decorative ATS traps.</p>
                </div>
                <button type="button" onClick={() => navigate(`/interview/${interviewId}`)}>Back to report</button>
            </header>

            <div id="main-content" className="resume-workspace">
                <section className="resume-controls">
                    <div className="section-heading">
                        <span className="resume-kicker">01 / 03</span>
                        <h2>Choose a template</h2>
                    </div>
                    <div className="template-picker" role="radiogroup" aria-label="Resume template">
                        {templates.map((item) => (
                            <label className={template === item.id ? 'template-option is-selected' : 'template-option'} key={item.id}>
                                <input type="radio" name="template" value={item.id} checked={template === item.id} onChange={() => setTemplate(item.id)} disabled={loading} />
                                <span className="template-swatch" aria-hidden="true" />
                                <span><strong>{item.label}</strong><small>{item.description}</small></span>
                            </label>
                        ))}
                    </div>

                    <div className="ats-note">
                        <span className="resume-kicker">Evidence-first</span>
                        <p>The generator only uses facts from your uploaded resume and interview context. ATS readiness is an estimate, not a hiring guarantee.</p>
                    </div>

                    {job?.status === 'completed' && <button className="resume-save" type="button" onClick={handleSave} disabled={saveState === 'saving' || saveState === 'saved'}>{saveState === 'saving' ? 'Saving...' : saveState === 'saved' ? 'Saved' : 'Save changes'}</button>}
                    <button className="resume-generate" type="button" onClick={handleGenerate} disabled={loading} aria-busy={loading}>
                        {loading ? `Building resume${job?.stage ? ` · ${job.stage.replaceAll('_', ' ')}` : '...'}` : job?.status === 'completed' ? 'Regenerate resume' : 'Generate modified resume'}
                        <span aria-hidden="true">-&gt;</span>
                    </button>
                    {error && <p className="resume-error" role="alert">{error}</p>}
                </section>

                <section className="resume-editor-area" aria-label="Markdown resume editor">
                    <div className="editor-heading"><span>Live Markdown</span><small>{saveState === 'unsaved' ? 'Unsaved changes' : saveState === 'saving' ? 'Saving...' : saveState === 'conflict' ? 'Save conflict' : 'Saved'}</small></div>
                    <textarea value={markdown} onChange={handleMarkdownChange} disabled={!job?.result || loading} placeholder="Generate a resume to edit its Markdown..." spellCheck="false" />
                </section>

                <section className="resume-preview-area" aria-live="polite">
                    {!resume && <div className="resume-empty"><span className="resume-empty-mark">+</span><h2>Your resume preview will appear here.</h2><p>Select a template and generate an evidence-based version tailored to your target role.</p></div>}
                    {resume && <MarkdownPreview markdown={markdown} template={job.template} />}
                </section>

                {job?.status === 'completed' && (
                    <aside className="resume-score">
                        <span className="resume-kicker">Estimated ATS readiness</span>
                        <strong>{job.atsScore}<small>/100</small></strong>
                        <p>Measured from keyword coverage, section parseability, and evidence quality. This is not a universal ATS score.</p>
                        <div className="metric-list">
                            <span>Keyword coverage <b>{Math.round((metrics?.requiredKeywordCoverage || 0) * 100)}%</b></span>
                            <span>Section parseability <b>{Math.round((metrics?.sectionParseability || 0) * 100)}%</b></span>
                            <span>Unsupported claims <b>{metrics?.unsupportedClaimCount || 0}</b></span>
                        </div>
                        <button className="resume-download" type="button" onClick={handleDownload} disabled={downloading}>{downloading ? 'Preparing PDF...' : 'Download PDF'}</button>
                    </aside>
                )}
            </div>
        </main>
    );
};

function MarkdownPreview({ markdown, template }) {
    return (
        <article className={`resume-paper resume-paper-${template}`} aria-label={`${template} resume preview`}>
            <MarkdownDocument markdown={markdown} />
        </article>
    );
}

function MarkdownDocument({ markdown }) {
    const lines = markdown.split(/\r?\n/);
    return <div className="markdown-document">{lines.map((line, index) => {
        const trimmed = line.trim();
        if (!trimmed) return <span className="markdown-space" key={index} />;
        if (trimmed.startsWith('### ')) return <h3 key={index}>{trimmed.slice(4)}</h3>;
        if (trimmed.startsWith('## ')) return <h2 key={index}>{trimmed.slice(3)}</h2>;
        if (trimmed.startsWith('# ')) return <h1 key={index}>{trimmed.slice(2)}</h1>;
        if (trimmed.startsWith('- ')) return <li key={index}>{trimmed.slice(2)}</li>;
        return <p key={index}>{trimmed}</p>;
    })}</div>;
}

export default Resume;
