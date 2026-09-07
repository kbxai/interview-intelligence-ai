import React, { useState } from 'react'
import '../auth.form.scss'
import { Link, useNavigate } from 'react-router'
import { useAuth } from '../hooks/useAuth.js'

const Login = () => {
    const { handleLogin, loading } = useAuth()
    const navigate = useNavigate()
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const [isSubmitting, setIsSubmitting] = useState(false)

    const handleSubmit = async(e) => {
        e.preventDefault()
        setError('')
        setIsSubmitting(true)

        try {
            await handleLogin({ email, password })
            navigate('/app')
        } catch (requestError) {
            setError(requestError.message)
        } finally {
            setIsSubmitting(false)
        }
    }

    if (loading) {
        return (
            <main className="auth-page">
                <div className="auth-loading-card">
                    <span className="auth-spinner" />
                    <span>Loading your session...</span>
                </div>
            </main>
        )
    }

    return (
        <main className="auth-page">
            <div className="form-container">
                <div>
                    <span className="auth-brand">Interview Intelligence</span>
                    <h1>Welcome back</h1>
                    <p className="auth-lead">Sign in to access your interview briefings and tailored resumes.</p>
                </div>

                <form onSubmit={handleSubmit}>
                    {error && <p className="form-error" role="alert">{error}</p>}
                    <div className="input-group">
                        <label htmlFor="email">Email address</label>
                        <input 
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            type="email"
                            id="email"
                            name="email"
                            placeholder="you@example.com"
                            required
                            autoComplete="email"
                            inputMode="email"
                        />
                    </div>
                    <div className="input-group">
                        <label htmlFor="password">Password</label>
                        <input
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            type="password"
                            id="password"
                            name="password"
                            placeholder="Enter your password"
                            required
                            autoComplete="current-password"
                        />
                    </div>

                    <button className="button primary-button" type="submit" disabled={isSubmitting}>
                        {isSubmitting ? 'Signing in...' : 'Sign in'}
                    </button>
                </form>
                <p className="form-meta">Don't have an account? <Link to="/register">Create an account</Link></p>
            </div>
        </main>
    )
}

export default Login