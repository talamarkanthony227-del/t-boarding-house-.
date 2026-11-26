
import {
  ChangeDetectorRef,
  Component,
  OnDestroy,
  inject,
} from '@angular/core';
import { Tenant, TenantService } from '../../services/tenant';

type TenantFilter = 'all' | 'active' | 'inactive';

@Component({
  selector: 'app-tenant-list',
  templateUrl: './tenant-list.page.html',
  styleUrls: ['./tenant-list.page.scss'],
  standalone: false,
})
export class TenantListPage implements OnDestroy {
  tenants: Tenant[] = [];
  searchQuery = '';
  statusFilter: TenantFilter = 'all';
  isLoading = true;
  loadError = '';
  private unsubscribeTenants: (() => void) | null = null;
  private readonly changeDetector = inject(ChangeDetectorRef);
  private readonly tenantService = inject(TenantService);

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

  onSearchChange(event: CustomEvent<{ value?: string | null }>): void {
    this.searchQuery = event.detail.value?.trim().toLocaleLowerCase() ?? '';
  }

  get filteredTenants(): Tenant[] {
    return this.tenants.filter((tenant) => {
      const matchesStatus =
        this.statusFilter === 'all' || tenant.status === this.statusFilter;
      const searchableFields = [
        tenant.name,
        tenant.email,
        tenant.contact,
        tenant.roomNumber,
      ];
      const matchesSearch =
        this.searchQuery.length === 0 ||
        searchableFields.some((field) =>
          field.toLocaleLowerCase().includes(this.searchQuery)
        );

      return matchesStatus && matchesSearch;
    });
  }

  trackByTenantId(_index: number, tenant: Tenant): string {
    return tenant.id;
  }

  private unsubscribe(): void {
    this.unsubscribeTenants?.();
    this.unsubscribeTenants = null;
  }
}
