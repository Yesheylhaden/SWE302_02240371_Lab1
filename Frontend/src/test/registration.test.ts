import { describe, expect, test } from 'vitest';

import {
  checkRegistrationEligibility,
} from '../utils/registration';

describe('Student Registration Decision Table', () => {

  test('R1 - Payment verified, Drug Test verified, Registration open', () => {
    expect(
      checkRegistrationEligibility({
        paymentVerified: true,
        drugTestVerified: true,
        registrationOpen: true,
      })
    ).toBe('Registration Allowed');
  });

  test('R2 - Payment verified, Drug Test verified, Registration closed', () => {
    expect(
      checkRegistrationEligibility({
        paymentVerified: true,
        drugTestVerified: true,
        registrationOpen: false,
      })
    ).toBe('Registration period is closed.');
  });

  test('R3 - Payment verified, Drug Test not verified, Registration open', () => {
    expect(
      checkRegistrationEligibility({
        paymentVerified: true,
        drugTestVerified: false,
        registrationOpen: true,
      })
    ).toBe('Drug testing report not verified.');
  });

  test('R4 - Payment verified, Drug Test not verified, Registration closed', () => {
    expect(
      checkRegistrationEligibility({
        paymentVerified: true,
        drugTestVerified: false,
        registrationOpen: false,
      })
    ).toBe('Drug testing report not verified.');
  });

  test('R5 - Payment not verified, Drug Test verified, Registration open', () => {
    expect(
      checkRegistrationEligibility({
        paymentVerified: false,
        drugTestVerified: true,
        registrationOpen: true,
      })
    ).toBe('Tuition payment not verified.');
  });

  test('R6 - Payment not verified, Drug Test verified, Registration closed', () => {
    expect(
      checkRegistrationEligibility({
        paymentVerified: false,
        drugTestVerified: true,
        registrationOpen: false,
      })
    ).toBe('Tuition payment not verified.');
  });

  test('R7 - Payment not verified, Drug Test not verified, Registration open', () => {
    expect(
      checkRegistrationEligibility({
        paymentVerified: false,
        drugTestVerified: false,
        registrationOpen: true,
      })
    ).toBe('Tuition payment not verified.');
  });

  test('R8 - Payment not verified, Drug Test not verified, Registration closed', () => {
    expect(
      checkRegistrationEligibility({
        paymentVerified: false,
        drugTestVerified: false,
        registrationOpen: false,
      })
    ).toBe('Tuition payment not verified.');
  });

});

