import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular/lazy';

import { ManageTenantPageRoutingModule } from './manage-tenant-routing.module';

import { ManageTenantPage } from './manage-tenant.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ManageTenantPageRoutingModule
  ],
  declarations: [ManageTenantPage]
})
export class ManageTenantPageModule {}
