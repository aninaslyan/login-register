import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';

import { environment } from '../../environments/environment';
import { IUser, User } from './user.model';

export interface IAuthResponseData {
  idToken: string;
  email: string;
  refreshToken: string;
  expiresIn: string;
  localId: string;
  registered?: boolean;
}

export interface IVerificationResponse {
  email: string;
  emailVerified: boolean;
}

@Injectable({providedIn: 'root'})
export class AuthService {
  user = new BehaviorSubject<User>(null);
  // todo think about user count
  userCount = 0;
  private tokenExpirationTimer: any;

  constructor(private http: HttpClient, private router: Router) {
  }

  private static handleError(errorRes: HttpErrorResponse) {
    let errorMessage = 'An unknown error occurred';

    if (!errorRes.error || !errorRes.error.error) {
      return throwError(errorMessage);
    }

    switch (errorRes.error.error.message) {
      case 'EMAIL_EXISTS':
        errorMessage = 'This email already exists!';
        break;
      case 'EMAIL_NOT_FOUND':
        errorMessage = 'There is no registered user with this email!';
        break;
      case 'OPERATION_NOT_ALLOWED':
        errorMessage = 'Password sign-in is disabled for this project!';
        break;
      case 'TOO_MANY_ATTEMPTS_TRY_LATER':
        errorMessage = 'Too many requests. Try again later!';
        break;
      case 'INVALID_PASSWORD':
        errorMessage = 'The password is invalid!';
        break;
      case 'INVALID_ID_TOKEN':
        errorMessage = 'Your credential is no longer valid. Please sign in again!';
        break;
      case 'USER_NOT_FOUND':
        errorMessage = 'There is no user with this identifier!';
        break;
      case 'INVALID_OOB_CODE':
        errorMessage = 'The verification code is wrong or expired!';
        break;
      case 'EXPIRED_OOB_CODE':
        errorMessage = 'The verification code is expired!';
        break;
      case 'USER_DISABLED':
        errorMessage = 'The user account has been disabled by administrator!';
        break;
    }

    return throwError(errorMessage);
  }

  private handleAuthentication(email: string, id: string, token: string, expiresIn: number) {
    const expirationDate = new Date(new Date().getTime() + expiresIn * 1000);
    const user = new User(
      email,
      id,
      token,
      expirationDate)
    ;
    this.user.next(user);
    this.autoLogOut(expiresIn * 1000);
    localStorage.setItem('userData', JSON.stringify(user));
  }

  autoLogin() {
    const userData: IUser = JSON.parse(localStorage.getItem('userData'));

    if (!userData) {
      return;
    }
    const loadedUser = new User(userData.email, userData.id, userData._token, new Date(userData._tokenExpirationDate));

    if (loadedUser.token) {
      this.user.next(loadedUser);
      const expirationDuration = new Date(userData._tokenExpirationDate).getTime() - new Date().getTime();
      this.autoLogOut(expirationDuration);
    }
  }

  getCurrentUser() {
    return JSON.parse(localStorage.getItem('userData'));
  }

  autoLogOut(expirationDuration: number) {
    this.tokenExpirationTimer = setTimeout(() => {
      this.logOut();
    }, expirationDuration);
  }

  emailVerification(requestType, idToken) {
    return this.http.post<IAuthResponseData>(environment.sendEmail, {
      requestType,
      idToken,
    }).pipe(catchError(AuthService.handleError));
  }

  signUp(email: string, password: string) {
    return this.http.post<IAuthResponseData>(environment.userSignUp, {
      email,
      password,
      returnSecureToken: true
    }).pipe(catchError(AuthService.handleError));
  }

  logIn(email: string, password: string) {
    return this.http.post<IAuthResponseData>(environment.userLogIn, {
      email,
      password,
      returnSecureToken: true
    })
      .pipe(catchError(AuthService.handleError),
        tap(resData => {
          this.handleAuthentication(resData.email, resData.localId, resData.idToken, +resData.expiresIn);
        })
      );
  }

  confirmEmailCode(code: string, localId: string, idToken: string, expiresIn: string) {
    return this.http.post<IVerificationResponse>(environment.confirmEmail, {
      oobCode: code,
    })
      .pipe(catchError(AuthService.handleError),
        tap(resData => {
          this.handleAuthentication(resData.email, localId, idToken, +expiresIn);
        })
      );
  }

  sendForgotPasswordCode(email: string) {
    return this.http.post<IVerificationResponse>(environment.sendResetPassEmail, {
      email,
      requestType: 'PASSWORD_RESET'
    }).pipe(catchError(AuthService.handleError));
  }

  confirmResetPasswordCode(oobCode: string, newPassword: string) {
    return this.http.post<IVerificationResponse>(environment.confirmResetPassEmail, {
      oobCode,
      newPassword
    }).pipe(catchError(AuthService.handleError));
  }

  logOut() {
    this.user.next(null);
    this.router.navigate(['/auth']);
    localStorage.removeItem('userData');
    if (this.tokenExpirationTimer) {
      clearTimeout(this.tokenExpirationTimer);
    }
    this.tokenExpirationTimer = null;
  }
}
