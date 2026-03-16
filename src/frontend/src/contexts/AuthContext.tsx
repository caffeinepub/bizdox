import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import type { UserProfile } from "../backend";
import { useActor } from "../hooks/useActor";
import { useInternetIdentity } from "../hooks/useInternetIdentity";

interface AuthContextType {
  isAuthenticated: boolean;
  userProfile: UserProfile | null;
  isAdmin: boolean;
  loading: boolean;
  refreshProfile: () => Promise<void>;
  login: () => void;
  logout: () => void;
  principal: string | null;
}

const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  userProfile: null,
  isAdmin: false,
  loading: true,
  refreshProfile: async () => {},
  login: () => {},
  logout: () => {},
  principal: null,
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { identity, login, clear, isInitializing } = useInternetIdentity();
  const { actor, isFetching } = useActor();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileLoaded, setProfileLoaded] = useState(false);

  const isAuthenticated = !!identity && !identity.getPrincipal().isAnonymous();
  const principal = isAuthenticated
    ? identity!.getPrincipal().toString()
    : null;

  const refreshProfile = useCallback(async () => {
    if (!actor || !isAuthenticated) return;
    setProfileLoading(true);
    try {
      const [profile, admin] = await Promise.all([
        actor.getCallerUserProfile(),
        actor.isCallerAdmin(),
      ]);
      setUserProfile(profile);
      setIsAdmin(admin);
      setProfileLoaded(true);
    } catch (e) {
      console.error("Failed to load profile:", e);
      setProfileLoaded(true);
    } finally {
      setProfileLoading(false);
    }
  }, [actor, isAuthenticated]);

  useEffect(() => {
    if (actor && !isFetching && isAuthenticated) {
      setProfileLoaded(false);
      refreshProfile();
    } else if (!isAuthenticated) {
      setUserProfile(null);
      setIsAdmin(false);
      setProfileLoaded(false);
    }
  }, [actor, isFetching, isAuthenticated, refreshProfile]);

  const loading =
    isInitializing || (isAuthenticated && isFetching) || profileLoading;
  const notReadyYet = isAuthenticated && !profileLoaded && !profileLoading;
  const effectiveLoading = loading || notReadyYet;

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        userProfile,
        isAdmin,
        loading: effectiveLoading,
        refreshProfile,
        login,
        logout: clear,
        principal,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext(): AuthContextType {
  return useContext(AuthContext);
}
