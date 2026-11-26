import {
  ChangeDetectorRef,
  Component,
  OnDestroy,
  inject,
} from '@angular/core';
import { AlertController } from '@ionic/angular';
import {
  Tenant,
  TenantFormData,
  TenantService,
  TenantStatus,
} from '../../services/tenant';

interface TenantReorderDetail {
  from: number;
  to: number;
  complete: (tenants?: Tenant[]) => void;
}

function emptyTenant(): TenantFormData {
  return {
    name: '',
    email: '',
    contact: '',
    roomNumber: '',
    status: 'active',
  };
}

@Component({
  selector: 'app-manage-tenant',
  templateUrl: './manage-tenant.page.html',
  styleUrls: ['./manage-tenant.page.scss'],
  standalone: false,
})
export class ManageTenantPage implements OnDestroy {
  tenants: Tenant[] = [];
  editTenant: TenantFormData = emptyTenant();
  editingTenantId: string | null = null;
  isEditModalOpen = false;
  isLoading = true;
  loadError = '';
  isBusy = false;
  busyMessage = '';
  private unsubscribeTenants: (() => void) | null = null;
  private readonly changeDetector = inject(ChangeDetectorRef);
  private readonly tenantService = inject(TenantService);
  private readonly alertController = inject(AlertController);

  ionViewWillEnter(): void {
    if (!this.unsubscribeTenants) {
      this.loadTenants();
    }
  }

  ngOnDestroy(): void {
    this.unsubscribe();
  }

  loadTenants(): void {
    this.unsubscribe();
    this.isLoading = true;
    this.loadError = '';
    this.unsubscribeTenants = this.tenantService.watchTenants(
      (tenants) => {
        this.tenants = tenants;
        this.isLoading = false;
        this.changeDetector.detectChanges();
      },
      (error) => {
        this.isLoading = false;
        this.loadError = error.message;
        this.unsubscribeTenants = null;
        this.changeDetector.detectChanges();
      }
    );
  }

  openEditModal(tenant: Tenant): void {
    this.editingTenantId = tenant.id;
    this.editTenant = {
      name: tenant.name,
      email: tenant.email,
      contact: tenant.contact,
      roomNumber: tenant.roomNumber,
      status: tenant.status,
    };
    this.isEditModalOpen = true;
  }

  closeEditModal(): void {
    this.isEditModalOpen = false;
    this.editingTenantId = null;
    this.editTenant = emptyTenant();
  }

  setTenantStatus(status: TenantStatus): void {
    this.editTenant.status = status;
  }

  async saveChanges(): Promise<void> {
    const tenantId = this.editingTenantId;
    const tenant: TenantFormData = {
      name: this.editTenant.name.trim(),
      email: this.editTenant.email.trim(),
      contact: this.editTenant.contact.trim(),
      roomNumber: this.editTenant.roomNumber.trim(),
      status: this.editTenant.status,
    };

    if (!tenantId) {
      await this.showAlert(
        'Could Not Update Tenant',
        'Select a tenant before saving changes.'
      );
      return;
    }

    if (!tenant.name || !tenant.email || !tenant.contact || !tenant.roomNumber) {
      await this.showAlert(
        'Incomplete Information',
        'Please fill in all fields.'
      );
      return;
    }

    this.isBusy = true;
    this.busyMessage = 'Updating tenant...';
    let saveError: string | null = null;

    try {
      await this.tenantService.updateTenant(tenantId, tenant);
      this.closeEditModal();
    } catch (error) {
      saveError = this.errorMessage(error);
    } finally {
      this.isBusy = false;
      this.busyMessage = '';
      this.changeDetector.detectChanges();
    }

    if (saveError) {
      await this.showAlert('Could Not Update Tenant', saveError);
    }
  }

  async confirmDelete(tenant: Tenant): Promise<void> {
    const alert = await this.alertController.create({
      header: 'Delete Tenant',
      message: `Delete ${tenant.name} from the tenant list?`,
      buttons: [
        { text: 'Cancel', role: 'cancel' },
        {
          text: 'Delete',
          role: 'destructive',
          handler: () => {
            void this.deleteTenant(tenant);
          },
        },
      ],
    });

    await alert.present();
  }

  async deleteTenant(tenant: Tenant): Promise<void> {
    this.isBusy = true;
    this.busyMessage = 'Deleting tenant...';

    try {
      await this.tenantService.deleteTenant(tenant.id);
    } catch (error) {
      await this.showAlert(
        'Could Not Delete Tenant',
        this.errorMessage(error)
      );
    } finally {
      this.isBusy = false;
      this.busyMessage = '';
    }
  }

  async handleReorder(event: CustomEvent<TenantReorderDetail>): Promise<void> {
    const previousOrder = this.tenants;
    const reordered = [...previousOrder];
    const [movedTenant] = reordered.splice(event.detail.from, 1);

    if (!movedTenant) {
      event.detail.complete();
      return;
    }

    reordered.splice(event.detail.to, 0, movedTenant);
    this.tenants = reordered;
    event.detail.complete(reordered);
    this.isBusy = true;
    this.busyMessage = 'Saving tenant order...';

    try {
      await this.tenantService.reorderTenants(reordered);
    } catch (error) {
      this.tenants = previousOrder;
      await this.showAlert(
        'Could Not Reorder Tenants',
        this.errorMessage(error)
      );
    } finally {
      this.isBusy = false;
      this.busyMessage = '';
    }
  }

  trackByTenantId(_index: number, tenant: Tenant): string {
    return tenant.id;
  }

  private async showAlert(header: string, message: string): Promise<void> {
    const alert = await this.alertController.create({
      header,
      message,
      buttons: ['OK'],
    });
    await alert.present();
  }

  private errorMessage(error: unknown): string {
    return error instanceof Error ? error.message : String(error);
  }

  private unsubscribe(): void {
    this.unsubscribeTenants?.();
    this.unsubscribeTenants = null;
  }
}
