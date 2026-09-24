import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { useAuth } from '../../auth/hooks/useAuth.js';
import '../style/landing.scss';

const Landing = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [menuOpen, setMenuOpen] = useState(false);

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
                        <Link to="/app" className="btn-primary">Go to app &rarr;</Link>
                    ) : (
                        <>
                            <Link to="/login" className="btn-link">Sign in</Link>
                            <Link to="/register" className="btn-primary">Get started</Link>
                        </>
                    )}
                </div>
            </header>

            <section id="main-content" className="hero-section">
                <span className="eyebrow">Evidence-based interview coaching</span>
                <h1>Turn job descriptions and your resume into a targeted preparation plan.</h1>
                <p className="hero-lead">
                    No generic advice or fabricated experience. We analyze your actual background against role requirements to produce technical questions, behavioral strategies, and an ATS-tailored resume.
                </p>
                <div className="hero-ctas">
                    {user ? (
                        <Link to="/app" className="cta-primary">Open your workspace &rarr;</Link>
                    ) : (
                        <Link to="/register" className="cta-primary">Start your preparation &rarr;</Link>
                    )}
                    <a href="#preview" className="cta-secondary">See sample report</a>
                </div>
            </section>

            <section id="preview" className="preview-card-wrap" aria-label="Sample Analysis Preview">
                <div className="preview-card">
                    <div className="preview-top">
                        <div className="preview-title-group">
                            <span className="eyebrow">Simulated Demo Example</span>
                            <h3>Example Role: Full Stack Engineer</h3>
                            <span className="preview-sub">Illustrative sample showing how our AI organizes interview questions and skill gaps</span>
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
                    <span className="section-kicker">Simple 3-step process</span>
                    <h2>How Interview Intelligence works</h2>
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
                        <p>Our AI analyzes only documented skills and experience from your inputs without hallucinating fake credentials.</p>
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
                    <span className="eyebrow">Got questions?</span>
                    <h2>Frequently asked questions</h2>
                </div>

                <div className="faq-item">
                    <h3>Does the AI make up jobs or skills I haven't done?</h3>
                    <p>No. Our prompts and schema strictly enforce evidence-based generation. When a question touches on an area you haven't demonstrated, suggested answers advise transparent acknowledgment rather than inventing credentials.</p>
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
                    <h3>Is my uploaded resume saved or shared publicly?</h3>
                    <p>No. Your resume is parsed strictly for report generation and your tailored briefings are private to your authenticated account.</p>
                </div>
            </section>

            <section className="final-cta-section">
                <div className="cta-card">
                    <h2>Ready to build your interview edge?</h2>
                    <p>Start preparing with targeted questions, clear roadmap milestones, and a tailored resume built for your next role.</p>
                    {user ? (
                        <button type="button" className="btn-accent" onClick={() => navigate('/app')}>
                            Go to workspace &rarr;
                        </button>
                    ) : (
                        <button type="button" className="btn-accent" onClick={() => navigate('/register')}>
                            Create your free account &rarr;
                        </button>
                    )}
                </div>
            </section>

            <footer className="landing-footer">
                <p>&copy; {new Date().getFullYear()} Interview Intelligence. Evidence-based interview coaching and resume studio.</p>
            </footer>
        </main>
    );
};

export default Landing;
