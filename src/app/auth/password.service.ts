import { Injectable } from '@angular/core';
import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

@Injectable({providedIn: 'root'})
export class PasswordService {
  static generateChars(chars, length) {
    let pass = '';
    for (let x = 0; x < Math.round(length / 4); x++) {
      const i = Math.floor(Math.random() * chars.length);
      pass += chars.charAt(i);
    }
    return pass;
  }

  static shuffle(s) {
    const arr = s.split('');

    arr.sort(() => {
      return 0.5 - Math.random();
    });
    s = arr.join('');
    return s;
  }

  patternValidator(regex: RegExp, error: ValidationErrors): ValidatorFn {
    return (control: AbstractControl): { [key: string]: any } => {
      if (!control.value) {
        return null;
      }
      const valid = regex.test(control.value);
      return valid ? null : error;
    };
  }

  randomPassword(length) {
    const letters = 'abcdefghijklmnopqrstuvwxyz';
    const capitals = 'ABCDEFGHIJKLMNOP';
    const numbers = '1234567890';
    const symbols = '!@#$%^&*()-+<>';

    const password = PasswordService.generateChars(letters, length) + PasswordService.generateChars(capitals, length) + PasswordService.generateChars(numbers, length) + PasswordService.generateChars(symbols, length);

    return PasswordService.shuffle(password);
  }
}
