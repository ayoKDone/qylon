import { useEffect, useState } from "react";

export function useAuth() {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        
        setTimeout(() => {
            
            setUser(null); 
            setLoading(false);
        }, 1000);
    }, []);
    return { user, loading };
}
