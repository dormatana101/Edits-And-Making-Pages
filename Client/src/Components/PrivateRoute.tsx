import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import axios from 'axios';

function PrivateRoute({ children }: { children: React.ReactNode }) {
    const [loading, setLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    
    useEffect(() => {
        axios.get('/auth/login').then((res:any) => {0
        setIsAuthenticated(res.data.isAuthenticated);
        setLoading(false);
        });
    }, []);
    
    if (loading) {
        return <div>Loading...</div>;
    }
    
    if (!isAuthenticated) {
        return <Navigate to="/" />;
    }
    
    return <>{children}</>;
}

export default PrivateRoute;