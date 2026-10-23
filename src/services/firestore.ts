import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  getDocs,
  onSnapshot,
  writeBatch,
} from 'firebase/firestore';
import { db, auth } from '../firebase';
import { Measurement, UserProfile } from '../types';

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(
  error: unknown,
  operationType: OperationType,
  path: string | null
): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo:
        auth.currentUser?.providerData?.map((provider) => ({
          providerId: provider.providerId,
          email: provider.email,
        })) || [],
    },
    operationType,
    path,
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

/**
 * Diagnostic test to verify if Firestore read/write is allowed
 */
export async function testFirestoreAccess(): Promise<{
  connected: boolean;
  canWrite: boolean;
  message: string;
  code?: string;
}> {
  try {
    // Test write to connection doc
    const testRef = doc(db, 'test', 'status');
    await setDoc(testRef, {
      lastChecked: new Date().toISOString(),
      testedBy: auth.currentUser?.email || 'anonimo',
      projectId: 'imc-saude-71e4a',
    });
    return {
      connected: true,
      canWrite: true,
      message: 'Conexão e gravação no Firestore confirmadas com sucesso! Seu banco de dados está ativo e recebendo dados.',
    };
  } catch (err: unknown) {
    const errorObj = err as { code?: string; message?: string };
    const code = errorObj.code || '';
    let message = errorObj.message || 'Erro ao conectar ao Firestore.';

    if (code === 'permission-denied') {
      message =
        'Permissão negada (permission-denied). Suas regras de segurança no console do Firebase estão bloqueando gravação. Acesse Firebase Console > Firestore Database > Regras (Rules) e libere para teste.';
    } else if (code === 'not-found') {
      message =
        'Banco de dados não encontrado (not-found). Verifique se você clicou em "Criar banco de dados" no console do Firebase Firestore para o projeto imc-saude-71e4a.';
    } else if (code === 'unavailable') {
      message = 'Serviço do Firestore temporariamente indisponível ou offline.';
    }

    return {
      connected: false,
      canWrite: false,
      code,
      message,
    };
  }
}

/**
 * Real-time listener for user measurements in Firestore
 */
export function subscribeToUserMeasurements(
  userId: string,
  onData: (measurements: Measurement[]) => void,
  onError?: (error: Error) => void
): () => void {
  const effectiveUserId = userId || auth.currentUser?.uid || 'usuario-principal';
  const measurementsCol = collection(db, 'users', effectiveUserId, 'measurements');

  return onSnapshot(
    measurementsCol,
    (snapshot) => {
      const items: Measurement[] = snapshot.docs.map((docSnap) => {
        const data = docSnap.data();
        return {
          id: docSnap.id,
          date: data.date || '',
          time: data.time || '08:00',
          weight: Number(data.weight) || 0,
          height: Number(data.height) || 1.77,
          bmi: Number(data.bmi) || 0,
          classification: data.classification || 'Saudável',
          statusLabel: data.statusLabel,
        };
      });

      // Sort descending by date and time
      items.sort(
        (a, b) =>
          new Date(`${b.date}T${b.time || '00:00'}`).getTime() -
          new Date(`${a.date}T${a.time || '00:00'}`).getTime()
      );

      onData(items);
    },
    (error) => {
      console.warn('Listener Firestore:', error);
      if (onError) onError(error);
    }
  );
}

/**
 * Add or overwrite a measurement in Firestore
 * Writes BOTH to /measurements/{id} (root for direct visibility in Firebase Console)
 * AND to /users/{userId}/measurements/{id}
 */
export async function addFirestoreMeasurement(
  userId: string,
  measurement: Measurement,
  userProfile?: Partial<UserProfile>
): Promise<{ success: boolean; error?: string; code?: string }> {
  const effectiveUserId = userId || auth.currentUser?.uid || 'usuario-principal';
  const payload = {
    id: measurement.id,
    date: measurement.date,
    time: measurement.time,
    weight: measurement.weight,
    height: measurement.height,
    bmi: measurement.bmi,
    classification: measurement.classification,
    statusLabel: measurement.statusLabel || '',
    userId: effectiveUserId,
    userEmail: userProfile?.email || auth.currentUser?.email || '',
    userName: userProfile?.name || auth.currentUser?.displayName || '',
    createdAt: new Date().toISOString(),
  };

  let rootSuccess = false;
  let userSubSuccess = false;
  let lastError: unknown = null;

  // 1. Root collection /measurements/{id} (Visible immediately in Firebase Console root)
  try {
    const rootDocRef = doc(db, 'measurements', measurement.id);
    await setDoc(rootDocRef, payload, { merge: true });
    rootSuccess = true;
  } catch (error) {
    lastError = error;
    console.warn('Tentativa de salvar em /measurements falhou:', error);
  }

  // 2. User subcollection /users/{effectiveUserId}/measurements/{id}
  try {
    const userSubDocRef = doc(db, 'users', effectiveUserId, 'measurements', measurement.id);
    await setDoc(userSubDocRef, payload, { merge: true });
    userSubSuccess = true;
  } catch (error) {
    lastError = error;
    console.warn(`Tentativa de salvar em users/${effectiveUserId}/measurements falhou:`, error);
  }

  if (rootSuccess || userSubSuccess) {
    return { success: true };
  }

  const errObj = lastError as { code?: string; message?: string } | null;
  return {
    success: false,
    code: errObj?.code,
    error: errObj?.message || 'Falha ao gravar no Firestore',
  };
}

/**
 * Update an existing measurement in Firestore
 */
export async function updateFirestoreMeasurement(
  userId: string,
  measurement: Measurement
): Promise<void> {
  const effectiveUserId = userId || auth.currentUser?.uid || 'usuario-principal';
  const updatePayload = {
    date: measurement.date,
    time: measurement.time,
    weight: measurement.weight,
    height: measurement.height,
    bmi: measurement.bmi,
    classification: measurement.classification,
    statusLabel: measurement.statusLabel || '',
    updatedAt: new Date().toISOString(),
  };

  // 1. Root collection update
  try {
    const rootDocRef = doc(db, 'measurements', measurement.id);
    await setDoc(rootDocRef, updatePayload, { merge: true });
  } catch {
    // continue
  }

  // 2. User subcollection update
  try {
    const docRef = doc(db, 'users', effectiveUserId, 'measurements', measurement.id);
    await setDoc(docRef, updatePayload, { merge: true });
  } catch (error) {
    console.warn('Erro ao atualizar medição no Firestore:', error);
  }
}

/**
 * Delete a measurement in Firestore
 */
export async function deleteFirestoreMeasurement(
  userId: string,
  measurementId: string
): Promise<void> {
  const effectiveUserId = userId || auth.currentUser?.uid || 'usuario-principal';
  try {
    const rootDocRef = doc(db, 'measurements', measurementId);
    await deleteDoc(rootDocRef);
  } catch {
    // continue
  }

  try {
    const docRef = doc(db, 'users', effectiveUserId, 'measurements', measurementId);
    await deleteDoc(docRef);
  } catch (error) {
    console.warn('Erro ao deletar medição no Firestore:', error);
  }
}

/**
 * Clear all measurements for a user in Firestore
 */
export async function clearAllFirestoreMeasurements(userId: string): Promise<void> {
  const effectiveUserId = userId || auth.currentUser?.uid || 'usuario-principal';
  try {
    const measurementsCol = collection(db, 'users', effectiveUserId, 'measurements');
    const snapshot = await getDocs(measurementsCol);
    if (!snapshot.empty) {
      const batch = writeBatch(db);
      snapshot.docs.forEach((docSnap) => {
        batch.delete(docSnap.ref);
        try {
          batch.delete(doc(db, 'measurements', docSnap.id));
        } catch {
          // ignore
        }
      });
      await batch.commit();
    }
  } catch (error) {
    console.warn('Erro ao limpar medições no Firestore:', error);
  }
}

/**
 * Save user profile in Firestore
 */
export async function saveUserProfileToFirestore(
  userId: string,
  profile: Partial<UserProfile>
): Promise<void> {
  const effectiveUserId = userId || auth.currentUser?.uid || 'usuario-principal';
  try {
    const docRef = doc(db, 'users', effectiveUserId);
    await setDoc(
      docRef,
      {
        uid: effectiveUserId,
        name: profile.name || '',
        email: profile.email || '',
        height: profile.height || 1.77,
        photoURL: profile.photoURL || '',
        updatedAt: new Date().toISOString(),
      },
      { merge: true }
    );
  } catch (error) {
    console.warn('Erro ao salvar users/{userId}:', error);
  }
}

/**
 * Push all local measurements to Firestore in batch
 */
export async function syncAllMeasurementsToFirestore(
  userId: string,
  measurements: Measurement[],
  userProfile?: Partial<UserProfile>
): Promise<{ successCount: number; errorCount: number; lastError?: string; code?: string }> {
  let successCount = 0;
  let errorCount = 0;
  let lastError: string | undefined;
  let lastCode: string | undefined;

  const effectiveUserId = userId || auth.currentUser?.uid || 'usuario-principal';

  for (const m of measurements) {
    const res = await addFirestoreMeasurement(effectiveUserId, m, userProfile);
    if (res.success) {
      successCount++;
    } else {
      errorCount++;
      lastError = res.error;
      lastCode = res.code;
    }
  }

  return { successCount, errorCount, lastError, code: lastCode };
}
