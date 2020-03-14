import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';

// import { DataStorageService } from '../shared/data-storage.service';
import { AuthService } from '../auth/auth.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit, OnDestroy {
  private userSubscription: Subscription;
  public isAuthenticated = false;

  constructor(private authService: AuthService) {
  }

  // onSaveData() {
  //   this.dataStorageService.storeRecipes();
  // }
  //
  // onFetchData() {
  //   this.dataStorageService.fetchRecipes()
  //     .subscribe(
  //       () => {
  //         console.log('fetched');
  //       },
  //       error => {
  //         console.log('There is no recipe ' + error);
  //       });
  // }

  onLogOut() {
    this.authService.logOut();
  }

  ngOnInit(): void {
    this.userSubscription = this.authService.user
      .subscribe(user => {
        this.isAuthenticated = !!user;
      });
  }

  ngOnDestroy(): void {
    this.userSubscription.unsubscribe();
  }
}
