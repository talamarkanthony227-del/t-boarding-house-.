import { Injectable } from '@angular/core';
import { getApps, initializeApp } from 'firebase/app';
import {
  getAuth,
  signInAnonymously,
  User,
} from 'firebase/auth';
import { environment } from '../../environments/environment';

function getFirebaseApp() {
  return (
    getApps().find((existingApp) => existingApp.name === 'boarding-house') ??
    initializeApp(environment.firebaseConfig, 'boarding-house')
  );
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly auth = getAuth(getFirebaseApp());
  private anonymousSession: Promise<User> | null = null;

  async ensureAnonymousSession(): Promise<User> {
    await this.auth.authStateReady();

    if (this.auth.currentUser) {
      return this.auth.currentUser;
    }

    this.anonymousSession ??= signInAnonymously(this.auth)
      .then((credential) => credential.user)
      .catch((error: unknown) => {
        this.anonymousSession = null;
        throw error;
      });

    return this.anonymousSession;
  }
}
