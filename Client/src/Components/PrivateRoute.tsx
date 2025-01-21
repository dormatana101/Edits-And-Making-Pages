import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { fetchProtectedData } from '../Services/authService';

function PrivateRoute({ children }: { children: React.ReactNode }) {
    const [loading, setLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    useEffect(() => {
        const checkAuth = async () => {
            const res = await fetchProtectedData();
            if (res.success) {
                setIsAuthenticated(true);
            }
            setLoading(false);
        };

        checkAuth();
    }, []);

    if (loading) {
        return <div>Loading...</div>;
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" />;
    }

    return <>{children}</>;
}

export default PrivateRoute;