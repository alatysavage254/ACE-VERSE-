import { FirebaseError } from 'firebase/app';

export interface FirebaseAuthError extends FirebaseError {
  code: string;
  message: string;
  customData?: {
    email?: string;
  };
}

export interface FirebaseStorageError extends FirebaseError {
  code: string;
  message: string;
  serverResponse?: string;
}

export type AppError = FirebaseAuthError | FirebaseStorageError | Error;
