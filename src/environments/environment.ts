// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
  apiUrl: 'https://login-register-b1f78.firebaseio.com/users.json',
  apiKey: 'AIzaSyDbx6nFtrno2Dwjm1JvItMhGFBaxCspFjE',
  userSignUp: `https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${this.apiKey}`,
  userLogIn: `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${this.apiKey}`,
  sendEmail: `https://identitytoolkit.googleapis.com/v1/accounts:sendOobCode?key=${this.apiKey}`,
  confirmEmail: `https://identitytoolkit.googleapis.com/v1/accounts:update?key=${this.apiKey}`,
  sendResetPassEmail: `https://identitytoolkit.googleapis.com/v1/accounts:sendOobCode?key=${this.apiKey}`,
  confirmResetPassEmail: `https://identitytoolkit.googleapis.com/v1/accounts:resetPassword?key=${this.apiKey}`,
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/dist/zone-error';  // Included with Angular CLI.
