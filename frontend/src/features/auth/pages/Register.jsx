import React, { useState } from 'react'
import '../auth.form.scss'
import { Link, useNavigate } from 'react-router'
import { useAuth } from '../hooks/useAuth.js'

const Register = () => {
    const navigate = useNavigate()
    const [username, setUsername] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const [isSubmitting, setIsSubmitting] = useState(false)

    const { handleRegister } = useAuth()

    const handleSubmit = async(e) => {
        e.preventDefault()
        setError('')

        const cleanUsername = username.trim()
        const cleanEmail = email.trim()

        if (cleanUsername.length < 3) {
            setError('Username must be at least 3 characters long')
            return
        }

        if (password.length < 6) {
            setError('Password must be at least 6 characters long')
            return
        }

        setIsSubmitting(true)

        try {
            await handleRegister({ username: cleanUsername, email: cleanEmail, password })
            navigate('/app')
        } catch (requestError) {
            setError(requestError.message)
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <main className="auth-page">
            <div className="form-container">
                <div>
                    <span className="auth-brand">Interview Intelligence</span>
                    <h1>Create account</h1>
                    <p className="auth-lead">Get evidence-based interview preparation tailored to your target role.</p>
                </div>

                <form onSubmit={handleSubmit}>
                    {error && <p className="form-error" role="alert">{error}</p>}
                    
                    <div className="input-group">
                        <label htmlFor="username">Username</label>
                        <input
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            type="text"
                            id="username"
                            name="username"
                            placeholder="Choose a username"
                            required
                            autoComplete="username"
                        />
                    </div>

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
                        <label htmlFor="password">Password (min 6 characters)</label>
                        <input
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            type="password"
                            id="password"
                            name="password"
                            placeholder="Create a password"
                            required
                            autoComplete="new-password"
                        />
                    </div>

                    <button className="button primary-button" type="submit" disabled={isSubmitting}>
                        {isSubmitting ? 'Creating account...' : 'Create account'}
                    </button>
                </form>
                <p className="form-meta">Already have an account? <Link to="/login">Sign in</Link></p>
            </div>
        </main>
    )
}

export default Register