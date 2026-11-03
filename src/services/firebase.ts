import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, User } from 'firebase/auth';
import { getFirestore, doc, getDocFromServer } from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);

// CRITICAL: Must pass firestoreDatabaseId as required by Firebase skill
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account',
});

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

export interface AuthErrorInfo {
  code: string;
  message: string;
  domain: string;
  projectId: string;
  helpType: 'unauthorized-domain' | 'popup-blocked' | 'operation-not-allowed' | 'popup-closed' | 'general';
}

export function parseAuthError(error: unknown): AuthErrorInfo {
  const errObj = error as { code?: string; message?: string };
  const code = errObj?.code || 'auth/unknown';
  const domain = typeof window !== 'undefined' ? window.location.hostname : '';
  const projectId = firebaseConfig.projectId || '';
  let helpType: AuthErrorInfo['helpType'] = 'general';

  if (code === 'auth/unauthorized-domain') {
    helpType = 'unauthorized-domain';
  } else if (
    code === 'auth/popup-blocked' ||
    code === 'auth/cancelled-popup-request' ||
    (errObj?.message && errObj.message.toLowerCase().includes('popup'))
  ) {
    helpType = 'popup-blocked';
  } else if (code === 'auth/popup-closed-by-user') {
    helpType = 'popup-closed';
  } else if (code === 'auth/operation-not-allowed') {
    helpType = 'operation-not-allowed';
  }

  return {
    code,
    message: errObj?.message || 'Không thể đăng nhập Google.',
    domain,
    projectId,
    helpType,
  };
}

export function handleFirestoreError(
  error: unknown,
  operationType: OperationType,
  path: string | null
) {
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

// Test connection on boot
export async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('Firebase client is offline or network restricted.');
    }
  }
}

testConnection();

export const loginWithGoogle = async (): Promise<User> => {
  const result = await signInWithPopup(auth, googleProvider);
  return result.user;
};

export const loginWithGoogleRedirect = async (): Promise<void> => {
  const { signInWithRedirect } = await import('firebase/auth');
  await signInWithRedirect(auth, googleProvider);
};

export const getRedirectLoginResult = async (): Promise<User | null> => {
  const { getRedirectResult } = await import('firebase/auth');
  const result = await getRedirectResult(auth);
  return result ? result.user : null;
};

export const logoutGoogle = async (): Promise<void> => {
  await signOut(auth);
};
