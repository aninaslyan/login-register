import { Component, ComponentFactoryResolver, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { Router } from '@angular/router';

import { AuthService } from './auth.service';
import { IAuthResponseData } from './auth.service';
import { AlertComponent } from '../shared/alert/alert.component';
import { PlaceholderDirective } from '../shared/placeholder/placeholder.directive';
import { PasswordService } from './password.service';

@Component({
  selector: 'app-auth',
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.css']
})
export class AuthComponent implements OnInit, OnDestroy {
  isLoginMode = true;
  isLoading = false;
  authForm: FormGroup;
  verifyForm: FormGroup;
  sendPassForm: FormGroup;
  generatedPass: string;
  isSignUpEmailSent: boolean;
  isForgotPassEmailSent: boolean;
  isForgotPassMode: boolean;
  userInfo: IAuthResponseData;
  @ViewChild(PlaceholderDirective, { static: false }) alertHost: PlaceholderDirective;

  private closeSubscription: Subscription;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private componentFactoryResolver: ComponentFactoryResolver,
    private passwordService: PasswordService
    ) {
  }

  ngOnInit(): void {
    this.formInit();
  }

  formInit() {
    this.authForm = this.fb.group({
      email: ['', Validators.compose([Validators.email, Validators.required])],
      password: [
        '',
        Validators.compose([
          Validators.required,
          Validators.minLength(8),
          this.passwordService.patternValidator(/\d/, { hasNumber: true }),
          this.passwordService.patternValidator(/[A-Z]/, { hasCapitalCase: true }),
          this.passwordService.patternValidator(/[a-z]/, { hasSmallCase: true }),
          this.passwordService.patternValidator(/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+/, { hasSpecialCharacters: true }),
        ])
      ]
    });
    this.verifyForm = this.fb.group({
      emailCode: ''
    });
    this.sendPassForm = this.fb.group({
      resetCode: '',
      newPass: [
        '',
        Validators.compose([
          Validators.required,
          Validators.minLength(8),
          this.passwordService.patternValidator(/\d/, { hasNumber: true }),
          this.passwordService.patternValidator(/[A-Z]/, { hasCapitalCase: true }),
          this.passwordService.patternValidator(/[a-z]/, { hasSmallCase: true }),
          this.passwordService.patternValidator(/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+/, { hasSpecialCharacters: true }),
        ])
      ]
    });
  }

  onSwitchMode() {
    this.isLoginMode = !this.isLoginMode;
  }

  onSubmit() {
    if (!this.authForm.valid) {
      return;
    }

    this.isLoading = true;

    const email = this.authForm.value.email;
    const password = this.authForm.value.password;

    if (this.isLoginMode) {
      this.authService.logIn(email, password)
        .subscribe(() => {
          this.isLoading = false;
          this.router.navigate(['/users']);
        }, errorMessage => {
          this.showErrorAlert(errorMessage);
          this.isLoading = false;
        });
    } else {
      this.authService.signUp(email, password)
        .subscribe((resData: IAuthResponseData) => {
          this.userInfo = resData;
          this.authService.emailVerification('VERIFY_EMAIL', resData.idToken)
            .subscribe(() => {
              this.isSignUpEmailSent = true;
            }, errorMessage => {
              this.showErrorAlert(errorMessage);
            });
          this.isLoading = false;
        }, errorMessage => {
          this.showErrorAlert(errorMessage);
          this.isLoading = false;
        });
    }

    this.authForm.reset();
  }

  private showErrorAlert(message: string) {
    const alertComponentFactory = this.componentFactoryResolver.resolveComponentFactory(AlertComponent);

    // where to add this component
    const hostViewContainerRef = this.alertHost.viewContainerRef;
    hostViewContainerRef.clear();

    const componentRef = hostViewContainerRef.createComponent(alertComponentFactory);
    componentRef.instance.message = message;

    this.closeSubscription = componentRef.instance.close.subscribe(() => {
        this.closeSubscription.unsubscribe();
        hostViewContainerRef.clear();
    });
  }

  generateAPass() {
    this.generatedPass = this.passwordService.randomPassword(8);
  }

  verifyEmailRegistrationCode() {
    const verificationCode = this.verifyForm.controls.emailCode.value;
    const userInfo = this.userInfo;
    const response = this.authService.confirmEmailCode(verificationCode, userInfo.localId, userInfo.idToken, userInfo.expiresIn);
    response.subscribe(() => {
      this.router.navigate(['/users']);
    }, errorMessage => {
      this.showErrorAlert(errorMessage);
    });
  }

  resetPassword() {
    const verificationCode = this.sendPassForm.controls.resetCode.value;
    const newPassword = this.sendPassForm.controls.newPass.value;
    this.authService.confirmResetPasswordCode(verificationCode, newPassword)
      .subscribe(() => {
        this.showErrorAlert('Your password has been reset. Please log in.');
        location.reload();
      }, errorMessage => {
        this.showErrorAlert(errorMessage);
      });
  }

  onForgotPassword(email: string) {
    this.authService.sendForgotPasswordCode(email)
      .subscribe(resData => {
        console.log(resData, 'onForgotPassword');
        this.isForgotPassEmailSent = true;
      }, errorMessage => {
        this.showErrorAlert(errorMessage);
      });
  }

  ngOnDestroy(): void {
    if (this.closeSubscription) {
      this.closeSubscription.unsubscribe();
    }
  }
}
