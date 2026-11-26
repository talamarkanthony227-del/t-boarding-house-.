import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular/lazy';

import { TenantListPageRoutingModule } from './tenant-list-routing.module';

import { TenantListPage } from './tenant-list.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    TenantListPageRoutingModule
  ],
  declarations: [TenantListPage]
})
export class TenantListPageModule {}
