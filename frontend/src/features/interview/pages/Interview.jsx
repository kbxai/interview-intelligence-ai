import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { getInterviewReport } from '../services/interview.api';
import '../style/interview.scss';

const Interview = () => {
    const { interviewId } = useParams();
    const navigate = useNavigate();
    const [report, setReport] = useState(null);
    const [activeSection, setActiveSection] = useState('technicalQuestions');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [errorStatus, setErrorStatus] = useState(null);
    const [retryToken, setRetryToken] = useState(0);

    useEffect(() => {
        let active = true;

        async function loadReport() {
            setLoading(true);
            setError('');
            setErrorStatus(null);

            try {
                const response = await getInterviewReport(interviewId);
                if (active) {
                    setReport(response.data);
                }
            } catch (requestError) {
                if (active) {
                    setError(requestError.message);
                    setErrorStatus(requestError.statusCode || null);
                    if (requestError.statusCode === 401) {
                        navigate('/login', { replace: true });
                    }
                }
            } finally {
                if (active) {
                    setLoading(false);
                }
            }
        }

        if (interviewId) {
            loadReport();
        }

        return () => {
            active = false;
        };
    }, [interviewId, navigate, retryToken]);

    if (loading) {
        return <main className="interview-page interview-state" role="status" aria-live="polite"><span className="loading-spinner" />Loading your interview report...</main>;
    }

    if (error || !report) {
        const canRetry = !errorStatus || errorStatus >= 500;
        return (
            <main className="interview-page interview-state">
                <div className="state-card">
                    <span className="state-kicker">Report unavailable</span>
                    <h1>We could not load this report.</h1>
                    <p>{error || 'This interview report does not exist or is no longer available.'}</p>
                    <div className="state-actions">
                        {canRetry && <button type="button" onClick={() => setRetryToken((token) => token + 1)}>Try again</button>}
                        <button type="button" onClick={() => navigate('/reports')}>View reports</button>
                    </div>
                </div>
            </main>
        );
    }

    const navigationItems = [
        { id: 'technicalQuestions', label: 'Technical questions', count: report.technicalQuestions?.length ?? 0 },
        { id: 'behavioralQuestions', label: 'Behavioral questions', count: report.behavioralQuestions?.length ?? 0 },
        { id: 'preparationPlan', label: 'Road map', count: report.preparationPlan?.length ?? 0 },
    ];

    const activeLabel = navigationItems.find((item) => item.id === activeSection)?.label;

    return (
        <main className="interview-page">
            <a href="#main-content" className="skip-link">Skip to main content</a>
            <header className="report-header">
                <div>
                    <span className="report-kicker">Interview intelligence / Report</span>
                    <h1>Your preparation room</h1>
                </div>
                <div className="report-actions">
                    <button type="button" onClick={() => navigate('/reports')}>Reports</button>
                    <button type="button" onClick={() => navigate(`/interview/${interviewId}/resume`)}>Create ATS resume</button>
                    <button type="button" onClick={() => navigate('/app')}>New report</button>
                    <div className="score-summary">
                        <span>Role match</span>
                        <strong>{Math.round(report.matchScore)}<small>/100</small></strong>
                    </div>
                </div>
            </header>

            <div className="report-shell">
                <nav className="report-nav" aria-label="Report sections" role="tablist">
                    <span className="nav-heading">Explore report</span>
                    {navigationItems.map((item) => (
                            <button id={`${item.id}-tab`} className={activeSection === item.id ? 'nav-item is-active' : 'nav-item'} key={item.id} type="button" role="tab" aria-controls="main-content" aria-selected={activeSection === item.id} onClick={() => setActiveSection(item.id)}>
                            <span>{item.label}</span>
                            <small>{item.count}</small>
                        </button>
                    ))}
                    <div className="nav-divider" />
                    <span className="nav-heading">Report signal</span>
                    <div className="nav-signal">
                        <span className="signal-dot" />
                        <span>Analysis complete</span>
                    </div>
                </nav>

                <section id="main-content" className="report-content" role="tabpanel" aria-labelledby={`${activeSection}-tab`} aria-live="polite">
                    <div className="content-heading">
                        <div>
                            <span className="report-kicker">Focused review</span>
                            <h2>{activeLabel}</h2>
                        </div>
                        <span className="content-count">{navigationItems.find((item) => item.id === activeSection)?.count ?? 0} items</span>
                    </div>

                    {activeSection === 'technicalQuestions' && <QuestionList items={report.technicalQuestions} type="Technical" />}
                    {activeSection === 'behavioralQuestions' && <QuestionList items={report.behavioralQuestions} type="Behavioral" />}
                    {activeSection === 'preparationPlan' && <Roadmap items={report.preparationPlan} />}
                </section>

                <aside className="skill-panel">
                    <span className="report-kicker">Skill gaps</span>
                    <h2>What to sharpen</h2>
                    <p>Prioritized from the role requirements and your profile.</p>
                    <div className="skill-list">
                        {(report.skillGaps ?? []).length > 0 ? report.skillGaps.map((gap) => (
                            <div className={`skill-chip severity-${gap.severity}`} key={`${gap.skill}-${gap.severity}`}>
                                <span>{gap.skill}</span>
                                <small>{gap.severity}</small>
                            </div>
                        )) : <p className="skill-empty">No material skill gaps were identified.</p>}
                    </div>
                </aside>
            </div>
        </main>
    );
}

function QuestionList({ items = [], type }) {
    if (!items.length) {
        return <EmptySection label={`${type} questions will appear here once the report has enough signal.`} />;
    }

    return (
        <div className="question-list">
            {items.map((item, index) => (
                <article className="question-card" key={`${item.question}-${index}`}>
                    <div className="question-number">{String(index + 1).padStart(2, '0')}</div>
                    <div className="question-body">
                        <h3>{item.question}</h3>
                        <div className="answer-block">
                            <span>Suggested answer</span>
                            <p>{item.answer}</p>
                        </div>
                        <div className="intention-block">
                            <span>What they are assessing</span>
                            <p>{item.intention}</p>
                        </div>
                    </div>
                </article>
            ))}
        </div>
    );
}

function Roadmap({ items = [] }) {
    if (!items.length) {
        return <EmptySection label="Your preparation roadmap will appear here once the report is generated." />;
    }

    return (
        <div className="roadmap-list">
            {items.map((item) => (
                <article className="roadmap-row" key={item.day}>
                    <span className="day-number">{String(item.day).padStart(2, '0')}</span>
                    <div>
                        <span className="day-label">Day {item.day}</span>
                        <h3>{item.focus}</h3>
                        <ul>{(item.tasks ?? []).map((task) => <li key={task}>{task}</li>)}</ul>
                    </div>
                </article>
            ))}
        </div>
    );
}

function EmptySection({ label }) {
    return <div className="empty-section"><span className="empty-mark">--</span><p>{label}</p></div>;
}

export default Interview;