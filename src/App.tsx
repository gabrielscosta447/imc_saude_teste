import { useState, useEffect } from 'react';
import { Screen, Measurement, UserProfile } from './types';
import { LoginScreen } from './components/LoginScreen';
import { RegisterScreen } from './components/RegisterScreen';
import { AppHeader } from './components/AppHeader';
import { DashboardScreen } from './components/DashboardScreen';
import { NewMeasurementScreen } from './components/NewMeasurementScreen';
import { AppFooter } from './components/AppFooter';
import { DEMO_MEASUREMENTS } from './utils/bmi';
import {
  auth,
  googleProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  formatAuthError,
} from './firebase';
import {
  subscribeToUserMeasurements,
  addFirestoreMeasurement,
  updateFirestoreMeasurement,
  deleteFirestoreMeasurement,
  clearAllFirestoreMeasurements,
  saveUserProfileToFirestore,
  syncAllMeasurementsToFirestore,
  testFirestoreAccess,
} from './services/firestore';

export default function App() {
  // Screen state: Starts on 'login' as explicitly requested
  const [currentScreen, setCurrentScreen] = useState<Screen>('login');

  // Theme state: defaults to dark or light
  const [isDark, setIsDark] = useState<boolean>(() => {
    const saved = localStorage.getItem('imc_saude_theme');
    if (saved !== null) {
      return saved === 'dark';
    }
    return true; // default dark as seen in the mockup
  });

  // User state
  const [user, setUser] = useState<UserProfile>(() => {
    const saved = localStorage.getItem('imc_saude_user');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // fallback
      }
    }
    return {
      name: '',
      email: '',
      height: 1.77,
      isLoggedIn: false,
    };
  });

  // Measurements state: clean initial environment as requested
  const [measurements, setMeasurements] = useState<Measurement[]>(() => {
    const saved = localStorage.getItem('imc_saude_measurements');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // fallback
      }
    }
    return [];
  });

  // Firebase Auth State Listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        const displayName =
          firebaseUser.displayName ||
          (firebaseUser.email ? firebaseUser.email.split('@')[0] : 'Usuário');
        const formattedName = displayName.charAt(0).toUpperCase() + displayName.slice(1);

        setUser((prev) => ({
          ...prev,
          uid: firebaseUser.uid,
          name: formattedName,
          email: firebaseUser.email || '',
          photoURL: firebaseUser.photoURL || undefined,
          isLoggedIn: true,
        }));

        // Load cached user-specific measurements if available initially
        const userKey = `imc_saude_measurements_${firebaseUser.uid}`;
        const savedUserMeasurements = localStorage.getItem(userKey);
        if (savedUserMeasurements) {
          try {
            setMeasurements(JSON.parse(savedUserMeasurements));
          } catch {
            // ignore
          }
        }

        // Direct to dashboard if currently on auth screens
        setCurrentScreen((prev) => (prev === 'login' || prev === 'register' ? 'dashboard' : prev));
      } else {
        setUser((prev) => ({ ...prev, isLoggedIn: prev.isLoggedIn, uid: undefined }));
      }
    });

    return () => unsubscribe();
  }, []);

  // Real-time Firestore sync for logged-in user
  useEffect(() => {
    const activeUid = auth.currentUser?.uid || user.uid;
    if (!activeUid) return;

    const unsubscribe = subscribeToUserMeasurements(
      activeUid,
      (firestoreItems) => {
        if (firestoreItems && firestoreItems.length > 0) {
          setMeasurements(firestoreItems);
        }
      },
      (err) => {
        console.warn('Usando armazenamento local como fallback:', err);
      }
    );

    return () => unsubscribe();
  }, [user.uid]);

  // Keep dark class in sync with documentElement
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('imc_saude_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('imc_saude_theme', 'light');
    }
  }, [isDark]);

  // Persist measurements locally
  useEffect(() => {
    localStorage.setItem('imc_saude_measurements', JSON.stringify(measurements));
    const activeUid = auth.currentUser?.uid || user.uid;
    if (activeUid) {
      localStorage.setItem(`imc_saude_measurements_${activeUid}`, JSON.stringify(measurements));
    }
  }, [measurements, user.uid]);

  // Persist user locally
  useEffect(() => {
    localStorage.setItem('imc_saude_user', JSON.stringify(user));
  }, [user]);

  const toggleTheme = () => {
    setIsDark((prev) => !prev);
  };

  const handleLoginSuccess = async (email: string, name?: string, photoURL?: string, uid?: string) => {
    const defaultName = name || email.split('@')[0] || 'Usuário';
    const formattedName = defaultName.charAt(0).toUpperCase() + defaultName.slice(1);
    const updatedUser = {
      uid,
      name: formattedName,
      email,
      photoURL,
      height: user.height || 1.77,
      isLoggedIn: true,
    };
    setUser(updatedUser);

    const activeUid = uid || auth.currentUser?.uid;
    if (activeUid) {
      try {
        await saveUserProfileToFirestore(activeUid, updatedUser);
        // Sincroniza medições locais acumuladas se houver
        if (measurements.length > 0) {
          await syncAllMeasurementsToFirestore(activeUid, measurements, updatedUser);
        }
      } catch (e) {
        console.warn('Erro ao salvar perfil no Firestore:', e);
      }
    }

    setCurrentScreen('dashboard');
  };

  const handleRegisterSuccess = async (name: string, email: string, photoURL?: string, uid?: string) => {
    const updatedUser = {
      uid,
      name,
      email,
      photoURL,
      height: 1.77,
      isLoggedIn: true,
    };
    setUser(updatedUser);

    const activeUid = uid || auth.currentUser?.uid;
    if (activeUid) {
      try {
        await saveUserProfileToFirestore(activeUid, updatedUser);
      } catch (e) {
        console.warn('Erro ao salvar perfil no Firestore:', e);
      }
    }

    setCurrentScreen('dashboard');
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Logout error:', error);
    }
    setUser({
      name: '',
      email: '',
      height: 1.77,
      isLoggedIn: false,
      uid: undefined,
    });
    setCurrentScreen('login');
  };

  const handleConnectGoogle = async (): Promise<{ success: boolean; error?: string }> => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const displayName =
        result.user.displayName ||
        (result.user.email ? result.user.email.split('@')[0] : 'Usuário');
      const formattedName = displayName.charAt(0).toUpperCase() + displayName.slice(1);
      const updatedUser: UserProfile = {
        uid: result.user.uid,
        name: formattedName,
        email: result.user.email || '',
        photoURL: result.user.photoURL || undefined,
        height: user.height || 1.77,
        isLoggedIn: true,
      };
      setUser(updatedUser);
      await saveUserProfileToFirestore(result.user.uid, updatedUser);
      if (measurements.length > 0) {
        await syncAllMeasurementsToFirestore(result.user.uid, measurements, updatedUser);
      }
      return { success: true };
    } catch (err: unknown) {
      console.error('Google connect error:', err);
      return { success: false, error: formatAuthError(err) };
    }
  };

  const handleSaveMeasurement = async (data: Omit<Measurement, 'id'>) => {
    const newMeasurement: Measurement = {
      ...data,
      id: 'm-' + Date.now(),
    };

    // Optimistic local update
    setMeasurements((prev) => [newMeasurement, ...prev]);

    const newHeight = data.height > 0 ? data.height : user.height;
    if (data.height > 0) {
      setUser((prev) => ({ ...prev, height: data.height }));
    }

    // Persist to Cloud Firestore - uses active uid or fallback
    const activeUid =
      auth.currentUser?.uid ||
      user.uid ||
      (user.email ? user.email.replace(/[^a-zA-Z0-9]/g, '_') : 'usuario-local');

    try {
      const res = await addFirestoreMeasurement(activeUid, newMeasurement, user);
      if (!res.success) {
        console.warn('Aviso ao sincronizar medição no Firestore:', res.error);
      }
      await saveUserProfileToFirestore(activeUid, { ...user, height: newHeight });
    } catch (e) {
      console.warn('Erro ao sincronizar medição no Firestore:', e);
    }
  };

  const handleUpdateMeasurement = async (updated: Measurement) => {
    setMeasurements((prev) =>
      prev.map((m) => (m.id === updated.id ? updated : m))
    );

    const activeUid =
      auth.currentUser?.uid ||
      user.uid ||
      (user.email ? user.email.replace(/[^a-zA-Z0-9]/g, '_') : 'usuario-local');

    try {
      await updateFirestoreMeasurement(activeUid, updated);
    } catch (e) {
      console.warn('Erro ao atualizar medição no Firestore:', e);
    }
  };

  const handleDeleteMeasurement = async (id: string) => {
    setMeasurements((prev) => {
      const updated = prev.filter((m) => m.id !== id);
      localStorage.setItem('imc_saude_measurements', JSON.stringify(updated));
      return updated;
    });

    const activeUid =
      auth.currentUser?.uid ||
      user.uid ||
      (user.email ? user.email.replace(/[^a-zA-Z0-9]/g, '_') : 'usuario-local');

    try {
      await deleteFirestoreMeasurement(activeUid, id);
    } catch (e) {
      console.warn('Erro ao deletar medição no Firestore:', e);
    }
  };

  const handleLoadDemoData = async () => {
    setMeasurements(DEMO_MEASUREMENTS);
    localStorage.setItem('imc_saude_measurements', JSON.stringify(DEMO_MEASUREMENTS));

    const activeUid =
      auth.currentUser?.uid ||
      user.uid ||
      (user.email ? user.email.replace(/[^a-zA-Z0-9]/g, '_') : 'usuario-local');

    try {
      for (const item of DEMO_MEASUREMENTS) {
        await addFirestoreMeasurement(activeUid, item, user);
      }
    } catch (e) {
      console.warn('Erro ao carregar dados de demonstração no Firestore:', e);
    }
  };

  const handleClearAllData = async () => {
    setMeasurements([]);
    localStorage.removeItem('imc_saude_measurements');

    const activeUid =
      auth.currentUser?.uid ||
      user.uid ||
      (user.email ? user.email.replace(/[^a-zA-Z0-9]/g, '_') : 'usuario-local');

    localStorage.removeItem(`imc_saude_measurements_${activeUid}`);
    try {
      await clearAllFirestoreMeasurements(activeUid);
    } catch (e) {
      console.warn('Erro ao limpar dados no Firestore:', e);
    }
  };

  const handleManualSync = async () => {
    const activeUid =
      auth.currentUser?.uid ||
      user.uid ||
      (user.email ? user.email.replace(/[^a-zA-Z0-9]/g, '_') : 'usuario-local');

    return await syncAllMeasurementsToFirestore(activeUid, measurements, user);
  };

  return (
    <div
      className={`min-h-screen flex flex-col transition-colors duration-300 ${
        isDark ? 'bg-[#001718] text-[#cde8e8]' : 'bg-[#e4feff] text-[#051F20]'
      }`}
    >
      {/* Login Screen */}
      {currentScreen === 'login' && (
        <LoginScreen
          isDark={isDark}
          onToggleTheme={toggleTheme}
          onLoginSuccess={handleLoginSuccess}
          onNavigateToRegister={() => setCurrentScreen('register')}
        />
      )}

      {/* Register Screen */}
      {currentScreen === 'register' && (
        <RegisterScreen
          isDark={isDark}
          onToggleTheme={toggleTheme}
          onRegisterSuccess={handleRegisterSuccess}
          onNavigateToLogin={() => setCurrentScreen('login')}
        />
      )}

      {/* Authenticated Application Views (Dashboard & New Measurement) */}
      {(currentScreen === 'dashboard' || currentScreen === 'new-measurement') && (
        <>
          <AppHeader
            isDark={isDark}
            currentScreen={currentScreen}
            onNavigate={(screen) => setCurrentScreen(screen)}
            onToggleTheme={toggleTheme}
            onLogout={handleLogout}
            user={user}
          />

          <main className="w-full flex-1 pt-16 flex flex-col">
            {currentScreen === 'dashboard' && (
              <DashboardScreen
                measurements={measurements}
                isDark={isDark}
                userHeight={user.height || 1.77}
                user={user}
                onNavigateToNew={() => setCurrentScreen('new-measurement')}
                onUpdateMeasurement={handleUpdateMeasurement}
                onDeleteMeasurement={handleDeleteMeasurement}
                onLoadDemoData={handleLoadDemoData}
                onClearAllData={handleClearAllData}
                onManualSync={handleManualSync}
                onTestFirestore={testFirestoreAccess}
                onConnectGoogle={handleConnectGoogle}
              />
            )}

            {currentScreen === 'new-measurement' && (
              <NewMeasurementScreen
                isDark={isDark}
                userDefaultHeight={user.height || 1.77}
                onSaveMeasurement={handleSaveMeasurement}
                onCancel={() => setCurrentScreen('dashboard')}
              />
            )}
          </main>

          <AppFooter isDark={isDark} />
        </>
      )}
    </div>
  );
}
