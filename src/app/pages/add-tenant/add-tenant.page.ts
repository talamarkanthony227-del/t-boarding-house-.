
import { ChangeDetectorRef, Component, inject } from '@angular/core';
import { AlertController } from '@ionic/angular';
import { TenantFormData, TenantService } from '../../services/tenant';

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
  selector: 'app-add-tenant',
  templateUrl: './add-tenant.page.html',
  styleUrls: ['./add-tenant.page.scss'],
  standalone: false,
})
export class AddTenantPage {
  tenant = emptyTenant();
  isSaving = false;

  private readonly alertController = inject(AlertController);
  private readonly tenantService = inject(TenantService);
  private readonly changeDetector = inject(ChangeDetectorRef);

  async saveTenant(): Promise<void> {
    const tenant: TenantFormData = {
      name: this.tenant.name.trim(),
      email: this.tenant.email.trim(),
      contact: this.tenant.contact.trim(),
      roomNumber: this.tenant.roomNumber.trim(),
      status: this.tenant.status,
    };

    if (
      !tenant.name ||
      !tenant.email ||
      !tenant.contact ||
      !tenant.roomNumber
    ) {
      await this.showAlert(
        'Incomplete Information',
        'Please fill in all fields.'
      );
      return;
    }

    this.isSaving = true;

    let saveError: string | null = null;

    try {
      await this.tenantService.addTenant(tenant);
      this.tenant = emptyTenant();
    } catch (error) {
      saveError = this.errorMessage(error);
    } finally {
      this.isSaving = false;
      this.changeDetector.detectChanges();
    }

    if (saveError) {
      await this.showAlert(
        'Could Not Add Tenant',
        saveError
      );
      return;
    }

    await this.showAlert('Success', 'Tenant added successfully!');
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
}
