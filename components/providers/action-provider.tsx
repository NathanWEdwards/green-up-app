import { createContext, useContext, useState } from "react";

export interface ActionContextType {
    action: string | null;
    setAction: (action: string | null) => void;
}

const ActionContext = createContext<ActionContextType>({
    action: null,
    setAction: (action: string | null) => {}
});

export function useAction() {
    const value = useContext(ActionContext);
    if (!value) {
        throw new Error('useAction must be used within a <ActionProvider />');
    }
    return value;
}

export function ActionProvider({ children }: { children: React.ReactNode }) {
    const [action, setAction] = useState<string | null>(null);

    return (
        <ActionContext.Provider value={{ action, setAction }}>
            {children}
        </ActionContext.Provider>
    );
}