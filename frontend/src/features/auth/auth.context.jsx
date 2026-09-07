import { useEffect, useState } from 'react';
import { getMe } from './services/auth.api.js';
import { AuthContext } from './authContext.js';

export const AuthProvider = ({children}) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const getAndSetUser = async () => {
            try {
                const data = await getMe();
                setUser(data.user);
            } catch (error) {
                if (error.statusCode !== 401) {
                    console.error(error.message);
                }
            } finally {
                setLoading(false);
            }
        };

        getAndSetUser();
    }, []);

    return (
        <AuthContext.Provider value={{user, setUser,loading, setLoading}}>
            {children}
        </AuthContext.Provider>
    )
}