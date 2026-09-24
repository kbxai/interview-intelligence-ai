import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '../../auth/hooks/useAuth';
import { getInterviewReports } from '../services/interview.api';
import '../style/reports.scss';

const Reports = () => {
    const navigate = useNavigate();
    const { user, handleLogout } = useAuth();
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [retryToken, setRetryToken] = useState(0);

    async function onLogout() {
        await handleLogout();
        navigate('/login');
    }

    useEffect(() => {
        let active = true;

        async function loadReports() {
            setLoading(true);
            setError('');

            try {
                const response = await getInterviewReports();
                if (active) {
                    setReports(response.data || []);
                }
            } catch (requestError) {
                if (active) {
                    setError(requestError.message);
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

        loadReports();

        return () => {
            active = false;
        };
    }, [navigate, retryToken]);

    return (
        <main className="reports-page">
            <a href="#main-content" className="skip-link">Skip to main content</a>
            <header className="reports-header">
                <div>
                    <span className="reports-kicker">Interview intelligence</span>
                    <h1>Recent reports</h1>
                    <p>Return to your preparation whenever you need a sharper next step.</p>
                    {user?.username && (
                        <p style={{ marginTop: '0.25rem', fontSize: '0.875rem', opacity: 0.85 }}>
                            Account: <strong>{user.username}</strong>
                        </p>
                    )}
                </div>
                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                    <button className="reports-primary-action" type="button" onClick={() => navigate('/app')}>New report <span aria-hidden="true">-&gt;</span></button>
                    <button type="button" style={{ background: 'transparent', border: '1px solid currentColor', padding: '0.5rem 1rem', borderRadius: '4px', cursor: 'pointer' }} onClick={onLogout}>Log out</button>
                </div>
            </header>

            {loading && <ReportsLoading />}

            {!loading && error && (
                <section id="main-content" className="reports-state" role="alert">
                    <span className="state-mark">!</span>
                    <h2>Reports could not load.</h2>
                    <p>{error}</p>
                    <button type="button" onClick={() => setRetryToken((prev) => prev + 1)}>Try again</button>
                </section>
            )}

            {!loading && !error && reports.length === 0 && (
                <section id="main-content" className="reports-state">
                    <span className="state-mark">--</span>
                    <h2>Your report library is empty.</h2>
                    <p>Generate your first tailored interview briefing to start building your preparation history.</p>
                    <button type="button" onClick={() => navigate('/app')}>Create your first report</button>
                </section>
            )}

            {!loading && !error && reports.length > 0 && (
                <section id="main-content" className="reports-list" aria-label="Recent interview reports">
                    <div className="reports-list-heading">
                        <span>{reports.length} saved {reports.length === 1 ? 'report' : 'reports'}</span>
                        <span>Newest first</span>
                    </div>
                    {reports.map((report, index) => (
                        <article className="report-row" key={report._id}>
                            <div className="report-row-index" aria-hidden="true">{String(index + 1).padStart(2, '0')}</div>
                            <div className="report-row-copy">
                                <span className="report-row-date">{formatDate(report.createdAt)}</span>
                                <h2>{report.title || 'Untitled report'}</h2>
                                <p>{report.technicalQuestionCount} technical questions <span aria-hidden="true">·</span> {report.behavioralQuestionCount} behavioral questions</p>
                            </div>
                            <div className="report-row-score">
                                <span>Role match</span>
                                <strong>{Math.round(report.matchScore)}<small>/100</small></strong>
                            </div>
                            <button className="report-open-action" type="button" aria-label={`Open ${report.title || 'untitled report'}`} onClick={() => navigate(`/interview/${report._id}`)}>Open <span aria-hidden="true">-&gt;</span></button>
                        </article>
                    ))}
                </section>
            )}
        </main>
    );
};

function ReportsLoading() {
    return (
        <section id="main-content" className="reports-list reports-loading" aria-live="polite" aria-busy="true">
            <span className="loading-label">Loading your reports...</span>
            {[1, 2, 3].map((item) => <div className="report-skeleton" key={item} />)}
        </section>
    );
}

function formatDate(value) {
    if (!value) return 'Date unavailable';

    return new Intl.DateTimeFormat(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
    }).format(new Date(value));
}

export default Reports;
