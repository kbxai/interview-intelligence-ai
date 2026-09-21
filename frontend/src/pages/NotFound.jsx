import { Link } from 'react-router';
import './not-found.scss';

export default function NotFound() {
    return (
        <main className="not-found-page">
            <div className="not-found-card">
                <span className="not-found-code" aria-hidden="true">404</span>
                <h1>Page not found</h1>
                <p>The page you are looking for does not exist or has been moved.</p>
                <Link to="/" className="not-found-link">Back to home</Link>
            </div>
        </main>
    );
}
