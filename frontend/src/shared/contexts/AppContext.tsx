import React, { createContext, useState, useCallback, ReactNode } from 'react';

export interface AppContextValue {
    sidebarCollapsed: boolean;
    setSidebarCollapsed: (v: boolean) => void;
    toggleSidebar: () => void;
    globalLoading: boolean;
    setGlobalLoading: (v: boolean) => void;
    theme: 'light';
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [globalLoading, setGlobalLoading] = useState(false);

    const toggleSidebar = useCallback(() => {
        setSidebarCollapsed(prev => !prev);
    }, []);

    return (
        <AppContext.Provider value={{
            sidebarCollapsed,
            setSidebarCollapsed,
            toggleSidebar,
            globalLoading,
            setGlobalLoading,
            theme: 'light',
        }}>
            {children}
        </AppContext.Provider>
    );
}

export default AppContext;
