// The API is hosted on a free plan that sleeps after inactivity and needs up to a minute to start.
// Calling /health early (once per page load) starts that wake-up before the visitor submits a form.
const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
let pending = null;

export function wakeServer() {
    if (!pending) {
        pending = fetch(`${apiUrl}/health`, { cache: 'no-store' }).catch(() => null);
    }
    return pending;
}
