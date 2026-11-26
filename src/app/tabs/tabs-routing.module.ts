
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { TabsPage } from './tabs.page';

const routes: Routes = [
  {
    
    path: '',
    component: TabsPage,
    children: [
      {
        path: 'add-tenant',
        loadChildren: () =>
          import('../pages/add-tenant/add-tenant.module').then(
            (m) => m.AddTenantPageModule
          ),
      },
      {
        path: 'tenant-list',
        loadChildren: () =>
          import('../pages/tenant-list/tenant-list.module').then(
            (m) => m.TenantListPageModule
          ),
      },
      {
        path: 'manage-tenant',
        loadChildren: () =>
          import('../pages/manage-tenant/manage-tenant.module').then(
            (m) => m.ManageTenantPageModule
          ),
      },
      {
        path: '',
        redirectTo: '/tabs/add-tenant',
        pathMatch: 'full',
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TabsPageRoutingModule {}
