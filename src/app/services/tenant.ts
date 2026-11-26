import { Injectable } from '@angular/core';
import { inject } from '@angular/core';
import { getApps, initializeApp } from 'firebase/app';
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  Firestore,
  getFirestore,
  onSnapshot,
  updateDoc,
  writeBatch,
} from 'firebase/firestore';
import { environment } from '../../environments/environment';
import { AuthService } from './auth';

export type TenantStatus = 'active' | 'inactive';

export interface TenantFormData {
  name: string;
  email: string;
  contact: string;
  roomNumber: string;
  status: TenantStatus;
}

export interface Tenant extends TenantFormData {
  id: string;
  order: number;
}

type TenantDocument = TenantFormData & { order?: number };

@Injectable({
  providedIn: 'root',
})
export class TenantService {
  private readonly app =
    getApps().find((existingApp) => existingApp.name === 'boarding-house') ??
    initializeApp(environment.firebaseConfig, 'boarding-house');
  private readonly firestore: Firestore = getFirestore(this.app);
  private readonly authService = inject(AuthService);
  private readonly tenantsCollection = collection(this.firestore, 'tenants');

  watchTenants(
    onTenants: (tenants: Tenant[]) => void,
    onError: (error: Error) => void
  ): () => void {
    let isCancelled = false;
    let unsubscribe: (() => void) | null = null;

    void this.authService
      .ensureAnonymousSession()
      .then(() => {
        if (isCancelled) {
          return;
        }

        unsubscribe = onSnapshot(
          this.tenantsCollection,
          (snapshot) => {
            try {
              const tenants = snapshot.docs.map((tenantDocument, index) => {
                const data = tenantDocument.data() as TenantDocument;
                const status = data.status ?? 'active';
                const order = data.order ?? index;

                if (
                  typeof data.name !== 'string' ||
                  typeof data.email !== 'string' ||
                  typeof data.contact !== 'string' ||
                  typeof data.roomNumber !== 'string' ||
                  (status !== 'active' && status !== 'inactive') ||
                  typeof order !== 'number'
                ) {
                  throw new Error(
                    `Tenant record ${tenantDocument.id} has invalid data.`
                  );
                }

                return {
                  id: tenantDocument.id,
                  name: data.name,
                  email: data.email,
                  contact: data.contact,
                  roomNumber: data.roomNumber,
                  status,
                  order,
                };
              });

              tenants.sort(
                (left, right) =>
                  left.order - right.order || left.id.localeCompare(right.id)
              );
              onTenants(tenants);
            } catch (error) {
              onError(error instanceof Error ? error : new Error(String(error)));
            }
          },
          onError
        );
      })
      .catch((error: unknown) => {
        onError(error instanceof Error ? error : new Error(String(error)));
      });

    return () => {
      isCancelled = true;
      unsubscribe?.();
    };
  }

  async addTenant(tenant: TenantFormData): Promise<void> {
    await this.authService.ensureAnonymousSession();
    await addDoc(this.tenantsCollection, {
      ...tenant,
      order: Date.now(),
    });
  }

  async updateTenant(
    tenantId: string,
    tenant: TenantFormData
  ): Promise<void> {
    await this.authService.ensureAnonymousSession();
    await updateDoc(doc(this.firestore, 'tenants', tenantId), { ...tenant });
  }

  async deleteTenant(tenantId: string): Promise<void> {
    await this.authService.ensureAnonymousSession();
    await deleteDoc(doc(this.firestore, 'tenants', tenantId));
  }

  async reorderTenants(tenants: Tenant[]): Promise<void> {
    await this.authService.ensureAnonymousSession();
    const batchSize = 500;

    for (let offset = 0; offset < tenants.length; offset += batchSize) {
      const batch = writeBatch(this.firestore);
      const batchTenants = tenants.slice(offset, offset + batchSize);

      batchTenants.forEach((tenant, index) => {
        batch.update(doc(this.firestore, 'tenants', tenant.id), {
          order: offset + index,
        });
      });

      await batch.commit();
    }
  }
}
