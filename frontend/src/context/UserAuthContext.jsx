import { createContext, useContext, useState, useEffect } from 'react';
import { userAuthAPI } from '../services/api';

const UserAuthContext = createContext(null);

export const UserAuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem('userToken');
        if (token) {
            userAuthAPI.getProfile()
                .then(res => setUser(res.data.data))
                .catch(() => { localStorage.removeItem('userToken'); })
                .finally(() => setLoading(false));
        } else {
            setLoading(false);
        }
    }, []);

    const login = async (email, password) => {
        const res = await userAuthAPI.login({ email, password });
        const { token, user: userData } = res.data.data;
        localStorage.setItem('userToken', token);
        setUser(userData);
        return userData;
    };

    const register = async (data) => {
        const res = await userAuthAPI.register(data);
        const { token, user: userData } = res.data.data;
        localStorage.setItem('userToken', token);
        setUser(userData);
        return userData;
    };

    const logout = () => {
        localStorage.removeItem('userToken');
        setUser(null);
    };

    const updateProfile = async (data) => {
        const res = await userAuthAPI.updateProfile(data);
        setUser(res.data.data);
        return res.data.data;
    };

    return (
        <UserAuthContext.Provider value={{ user, loading, login, register, logout, updateProfile, isLoggedIn: !!user }}>
            {children}
        </UserAuthContext.Provider>
    );
};

export const useUserAuth = () => {
    const ctx = useContext(UserAuthContext);
    if (!ctx) throw new Error('useUserAuth must be used within UserAuthProvider');
    return ctx;
};
