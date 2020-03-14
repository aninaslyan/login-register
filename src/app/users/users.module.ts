import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

import { SharedModule } from '../shared/shared.module';
import { UsersComponent } from "./users.component";
import { UsersRoutingModule } from "./users-routing.module";

@NgModule({
  declarations: [
    UsersComponent,
  ],
  imports: [
    RouterModule,
    SharedModule,
    UsersRoutingModule,
  ]
})
export class UsersModule {
}
