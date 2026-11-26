import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ManageTenantPage } from './manage-tenant.page';

describe('ManageTenantPage', () => {
  let component: ManageTenantPage;
  let fixture: ComponentFixture<ManageTenantPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(ManageTenantPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
