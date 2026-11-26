import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ManageTenantPage } from './manage-tenant.page';

const routes: Routes = [
  {
    path: '',
    component: ManageTenantPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ManageTenantPageRoutingModule {}
