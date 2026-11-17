import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { useAuth } from '../../auth/hooks/useAuth.js';
import { wakeServer } from '../../../lib/wakeServer.js';
import '../style/landing.scss';

const Landing = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [menuOpen, setMenuOpen] = useState(false);

    // The API runs on a free plan that sleeps; start waking it while the visitor reads.
    useEffect(() => { wakeServer(); }, []);

    return (
        <main className="landing-page">
            <a href="#main-content" className="skip-link">Skip to main content</a>
            <header className="landing-nav">
                <Link to="/" className="brand-link">
                    Interview Intelligence
                    <span className="brand-badge">Studio</span>
                </Link>

                <button className="nav-toggle" aria-label="Toggle menu" aria-expanded={menuOpen} onClick={() => setMenuOpen(!menuOpen)}>
                    <span className="toggle-bar" />
                    <span className="toggle-bar" />
                    <span className="toggle-bar" />
                </button>

                <nav className={menuOpen ? 'nav-links nav-open' : 'nav-links'} aria-label="Landing Navigation">
                    <a href="#how-it-works" onClick={() => setMenuOpen(false)}>How it works</a>
                    <a href="#features" onClick={() => setMenuOpen(false)}>Features</a>
                    <a href="#preview" onClick={() => setMenuOpen(false)}>Preview</a>
                    <a href="#faq" onClick={() => setMenuOpen(false)}>FAQ</a>
                </nav>

                <div className="nav-actions">
                    {user ? (
                        <Link to="/app" className="btn-primary">Go to app</Link>
                    ) : (
                        <>
                            <Link to="/login" className="btn-link">Sign in</Link>
                            <Link to="/register" className="btn-primary">Get started</Link>
                        </>
                    )}
                </div>
            </header>

            <section id="main-content" className="hero-section">
                <h1>Turn job descriptions and your resume into a targeted preparation plan.</h1>
                <p className="hero-lead">
                    No generic advice or fabricated experience. We analyze your actual background against role requirements to produce technical questions, behavioral strategies, and an ATS-tailored resume.
                </p>
                <div className="hero-ctas">
                    {user ? (
                        <Link to="/app" className="cta-primary">Open your workspace</Link>
                    ) : (
                        <Link to="/register" className="cta-primary">Try it free</Link>
                    )}
                    <a href="#preview" className="cta-secondary">See an example</a>
                </div>

                <p className="hero-built-with">
                    Built with React, Express, MongoDB and Gemini. Every report must match a fixed JSON schema before it is saved.
                </p>
            </section>

            <section id="preview" className="preview-card-wrap" aria-label="Sample Analysis Preview">
                <div className="preview-card">
                    <div className="preview-top">
                        <div className="preview-title-group">
                            <h3>Example role: Full Stack Engineer</h3>
                            <span className="preview-sub">An illustration of how a report is laid out. The values here are made up for the example.</span>
                        </div>
                        <div className="preview-score-box">
                            <span>Role Match</span>
                            <strong>88<small className="score-denominator">/100</small></strong>
                        </div>
                    </div>

                    <div className="preview-grid">
                        <div className="sample-box">
                            <h4>Targeted Technical Question</h4>
                            <p>"How do you design database schema indexing to prevent slow queries under high write volume?"</p>
                            <div className="sample-intent">
                                <strong>Assessing:</strong> System scalability, query planning awareness, and understanding of index write overhead.
                            </div>
                        </div>

                        <div className="sample-box">
                            <h4>Identified Skill Priorities</h4>
                            <p>Direct comparison between requirements and candidate background.</p>
                            <div className="gap-tags">
                                <span className="gap-badge critical">Distributed Caching · Critical</span>
                                <span className="gap-badge medium">GraphQL Schemas · Moderate</span>
                                <span className="gap-badge">Docker & K8s · Low</span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <section id="how-it-works" className="steps-section">
                <div className="section-header">
                    <h2>How it works</h2>
                </div>

                <div className="steps-grid">
                    <div className="step-card">
                        <span className="step-num">01</span>
                        <h3>Input your context</h3>
                        <p>Paste the full job description, write a brief self-description of your goals, and upload your current PDF resume.</p>
                    </div>

                    <div className="step-card">
                        <span className="step-num">02</span>
                        <h3>Evidence-based extraction</h3>
                        <p>Gemini reads your inputs. The prompt tells it to use only the skills and experience they show, and to say so when you have no evidence for something.</p>
                    </div>

                    <div className="step-card">
                        <span className="step-num">03</span>
                        <h3>Plan and tailor</h3>
                        <p>Receive technical and behavioral question lists, a structured day-by-day roadmap, and export an ATS-optimized PDF resume.</p>
                    </div>
                </div>
            </section>

            <section id="features" className="features-section">
                <div className="features-grid">
                    <div className="feature-card">
                        <span className="feature-tag">Interview Questions</span>
                        <h3>Technical & Behavioral Depth</h3>
                        <p>Get realistic interview questions categorized by technical and behavioral focus, complete with suggested answers grounded in your real projects.</p>
                    </div>

                    <div className="feature-card">
                        <span className="feature-tag">Gap Analysis</span>
                        <h3>Clear Skill Prioritization</h3>
                        <p>Identify missing skills prioritized by severity (critical, high, medium, low) so you know exactly where to focus study time before your interview.</p>
                    </div>

                    <div className="feature-card">
                        <span className="feature-tag">Preparation Roadmap</span>
                        <h3>Day-by-Day Action Plan</h3>
                        <p>Structured daily milestones with concrete study tasks, review topics, and practice questions to guide your preparation timeline.</p>
                    </div>

                    <div className="feature-card">
                        <span className="feature-tag">Resume Studio</span>
                        <h3>ATS Resume Generator</h3>
                        <p>Generate clean, parseable Markdown resumes using Classic, Modern, or Compact layouts. Edit text directly in the live editor and download a polished PDF.</p>
                    </div>
                </div>
            </section>

            <section id="faq" className="faq-section">
                <div className="section-header">
                    <h2>Questions</h2>
                </div>

                <div className="faq-item">
                    <h3>Does the AI make up jobs or skills I haven't done?</h3>
                    <p>It is told not to. The prompt asks for answers built only on what your resume shows, and when a question touches an area you haven't demonstrated, the suggested answer says so plainly. Language models can still be wrong, so read every answer before you rely on it.</p>
                </div>

                <div className="faq-item">
                    <h3>How are ATS resumes generated?</h3>
                    <p>Resumes are structured in semantic Markdown following clean, standard layouts (Classic, Modern, and Compact). Headless Chromium renders them into print-ready A4 PDFs with parseable text layers.</p>
                </div>

                <div className="faq-item">
                    <h3>Can I edit the generated resume before downloading?</h3>
                    <p>Yes. The Resume Studio includes a live dual-column Markdown editor where you can adjust bullet points, add details, and immediately re-render your PDF.</p>
                </div>

                <div className="faq-item">
                    <h3>What happens to my resume?</h3>
                    <p>The text of your resume is sent to Google's Gemini API to write the report, and it is stored with the report so you can open it again. Reports are visible only to your account. There is no delete button yet, so upload a version you are comfortable storing.</p>
                </div>
            </section>

            <section className="final-cta-section">
                <div className="cta-card">
                    <h2>Try it with your own resume</h2>
                    <p>A free account is all you need. The server runs on a free plan, so the first request can take up to a minute while it starts.</p>
                    {user ? (
                        <button type="button" className="btn-accent" onClick={() => navigate('/app')}>
                            Go to workspace
                        </button>
                    ) : (
                        <button type="button" className="btn-accent" onClick={() => navigate('/register')}>
                            Create a free account
                        </button>
                    )}
                </div>
            </section>

            <footer className="landing-footer">
                <div className="footer-content">
                    <div className="footer-brand">
                        <Link to="/" className="brand-link">
                            Interview Intelligence
                            <span className="brand-badge">Studio</span>
                        </Link>
                        <p className="footer-tagline">
                            Evidence-based interview coaching and clean ATS-tailored resume generation.
                        </p>
                    </div>

                    <div className="footer-nav">
                        <div className="footer-col">
                            <span className="footer-col-title">Platform</span>
                            <a href="#how-it-works">How it works</a>
                            <a href="#features">Features</a>
                            <a href="#preview">Preview</a>
                            <a href="#faq">FAQ</a>
                        </div>
                        <div className="footer-col">
                            <span className="footer-col-title">Account</span>
                            <Link to="/login">Sign in</Link>
                            <Link to="/register">Create account</Link>
                        </div>
                    </div>
                </div>

                <div className="footer-bottom">
                    <p>
                        A project by <a href="https://kbxai.github.io">Kartik Bajaj</a>.
                        Source on <a href="https://github.com/kbxai/interview-intelligence-ai">GitHub</a>.
                    </p>
                </div>
            </footer>
        </main>
    );
};

export default Landing;
