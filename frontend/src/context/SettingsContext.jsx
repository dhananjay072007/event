import { createContext, useContext, useState, useEffect } from 'react';
import { settingsAPI } from '../services/api';

const SettingsContext = createContext({});

export const SettingsProvider = ({ children }) => {
    const [settings, setSettings] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        settingsAPI.get()
            .then(res => setSettings(res.data.data))
            .catch(() => { })
            .finally(() => setLoading(false));
    }, []);

    const refetch = () => {
        settingsAPI.get()
            .then(res => setSettings(res.data.data))
            .catch(() => { });
    };

    return (
        <SettingsContext.Provider value={{ settings, loading, refetch }}>
            {children}
        </SettingsContext.Provider>
    );
};

export const useSettings = () => useContext(SettingsContext);
