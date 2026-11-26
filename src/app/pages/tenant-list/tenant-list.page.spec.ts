import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TenantListPage } from './tenant-list.page';

describe('TenantListPage', () => {
  let component: TenantListPage;
  let fixture: ComponentFixture<TenantListPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(TenantListPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
