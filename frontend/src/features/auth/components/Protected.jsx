import {useAuth} from '../hooks/useAuth.js';
import {Navigate} from 'react-router';
import ServerWaitNote from '../../../components/ServerWaitNote.jsx';

const Protected = ({children}) => {
    const {user,loading} = useAuth()
    if(loading){
        return (
            <main className="auth-page">
                <div className="auth-loading-card">
                    <span className="auth-spinner" />
                    <span>Loading your session...</span>
                    <ServerWaitNote />
                </div>
            </main>
        )
    }
    if(!user){
        return <Navigate to={'/login'} />
    }

    return children
}

export default Protected