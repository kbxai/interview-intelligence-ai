import { useEffect, useState } from 'react';

// Mount this only while a request is pending. It appears after a few seconds, which on the
// free hosting plan usually means the server is starting after a quiet period.
export default function ServerWaitNote({ delayMs = 4000 }) {
    const [show, setShow] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => setShow(true), delayMs);
        return () => clearTimeout(timer);
    }, [delayMs]);

    if (!show) return null;
    return (
        <p className="server-wait-note" role="status">
            The server is starting after a quiet period. This can take up to a minute on the free plan.
        </p>
    );
}
