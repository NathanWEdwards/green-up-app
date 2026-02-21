import { auth } from '@/services/firebase';
import { FirebaseAuthTypes, createUserWithEmailAndPassword, onAuthStateChanged, signInWithEmailAndPassword } from '@react-native-firebase/auth';
import { createContext, useContext, useEffect, useState, type PropsWithChildren } from 'react';

export interface AuthContextType {
    session: FirebaseAuthTypes.User | null;
    isLoading: boolean;
    newUser: (email: string, password: string) => Promise<FirebaseAuthTypes.UserCredential>;
    signIn: (email: string, password: string) => Promise<FirebaseAuthTypes.UserCredential>;
    signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useSession() {
    const value = useContext(AuthContext);
    if (!value) {
        throw new Error('useSession must be used within a <SessionProvider />');
    }
    return value;
}

export function SessionProvider({ children }: PropsWithChildren) {
    const [session, setSession] = useState<FirebaseAuthTypes.User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            setSession(user);
            setIsLoading(false);
        });
        return unsubscribe;
    }, []);

    const newUser = async (email: string, password: string) => {
        return await createUserWithEmailAndPassword(auth, email, password);
    }

    const signIn = async (email: string, password: string) => {
        return await signInWithEmailAndPassword(auth, email, password);
    };

    const signOut = async () => {
        return auth.signOut();
    };

    return (
        <AuthContext.Provider
            value={{
                session,
                isLoading,
                newUser,
                signIn,
                signOut
            }}>
            {children}
        </AuthContext.Provider>
    );
}