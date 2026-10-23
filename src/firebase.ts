import { initializeApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  sendPasswordResetEmail,
  User as FirebaseUser,
} from 'firebase/auth';

import { getFirestore, doc, getDocFromServer } from 'firebase/firestore';

// User provided Firebase configuration
export const firebaseConfig = {
  apiKey: "AIzaSyAjJwa31zYyLwqg_mWyJRs0T7KION04HHc",
  authDomain: "imc-saude-71e4a.firebaseapp.com",
  projectId: "imc-saude-71e4a",
  storageBucket: "imc-saude-71e4a.firebasestorage.app",
  messagingSenderId: "248094888477",
  appId: "1:248094888477:web:9b9a2705cacc7db848acf4"
};

// Initialize Firebase App
export const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication
export const auth = getAuth(app);

// Initialize Cloud Firestore
export const db = getFirestore(app);

// Test Firestore Connection on Boot (per skill guideline)
async function testFirestoreConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn("Verifique a configuração do Firestore.");
    }
  }
}
testFirestoreConnection();

// Configure Google Provider
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account',
});

// Helper to translate Firebase Auth errors into friendly Portuguese messages
export function formatAuthError(error: unknown): string {
  if (typeof error !== 'object' || error === null) {
    return 'Ocorreu um erro inesperado ao autenticar.';
  }

  const err = error as { code?: string; message?: string };
  const code = err.code || '';

  switch (code) {
    case 'auth/popup-closed-by-user':
      return 'O popup de login do Google foi fechado antes de concluir.';
    case 'auth/popup-blocked':
      return 'O popup de autenticação foi bloqueado pelo navegador. Por favor, permita popups neste site.';
    case 'auth/cancelled-popup-request':
      return 'Solicitação de popup cancelada. Tente novamente.';
    case 'auth/unauthorized-domain':
      return 'Acesso temporariamente não autorizado a partir deste domínio. Tente recarregar a página ou entre pelo link oficial.';
    case 'auth/user-not-found':
      return 'Nenhum usuário encontrado com este e-mail.';
    case 'auth/wrong-password':
    case 'auth/invalid-credential':
      return 'E-mail ou senha incorretos.';
    case 'auth/email-already-in-use':
      return 'Este e-mail já está cadastrado. Faça login ou use outro e-mail.';
    case 'auth/weak-password':
      return 'A senha fornecida é muito fraca. Escolha uma senha com no mínimo 6 caracteres.';
    case 'auth/invalid-email':
      return 'O endereço de e-mail informado é inválido.';
    case 'auth/network-request-failed':
      return 'Falha de conexão com a rede. Verifique sua conexão com a internet.';
    case 'auth/too-many-requests':
      return 'Muitas tentativas malsucedidas. Tente novamente mais tarde.';
    case 'auth/operation-not-allowed':
      return 'O login com Google está temporariamente indisponível. Tente novamente em instantes.';
    default:
      return err.message || 'Falha ao autenticar. Tente novamente.';
  }
}

export {
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  sendPasswordResetEmail,
};
export type { FirebaseUser };
