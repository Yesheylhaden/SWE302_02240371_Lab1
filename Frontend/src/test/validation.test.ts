import { describe, expect, test } from 'vitest';

import {
  validateStudentId,
  validatePassword,
  validateTransactionNumber,
  validatePaymentScreenshot,
} from '../utils/validation';

describe('Student ID Validation', () => {
  test('accepts exactly 8 digits', () => {
    expect(validateStudentId('02240371')).toBe(true);
  });

  test('rejects 7 digits', () => {
    expect(validateStudentId('0224037')).toBe(false);
  });

  test('rejects 9 digits', () => {
    expect(validateStudentId('022403712')).toBe(false);
  });

  test('rejects letters', () => {
    expect(validateStudentId('022403ABC')).toBe(false);
  });

  test('rejects empty Student ID', () => {
    expect(validateStudentId('')).toBe(false);
  });
});

describe('Password Validation', () => {
  test('accepts valid password', () => {
    expect(validatePassword('Yeshey20')).toBe(true);
  });

  test('rejects password shorter than 8 characters', () => {
    expect(validatePassword('Yeshey2')).toBe(false);
  });

  test('rejects password without uppercase letter', () => {
    expect(validatePassword('yeshey20')).toBe(false);
  });

  test('rejects password without number', () => {
    expect(validatePassword('Yesheylh')).toBe(false);
  });

  test('rejects empty password', () => {
    expect(validatePassword('')).toBe(false);
  });

  test('accepts 12-character password', () => {
    expect(validatePassword('Yeshey200421')).toBe(true);
  });

  test('rejects 13-character password', () => {
    expect(validatePassword('Yesheylhaden2')).toBe(false);
  });
});

describe('Transaction Number Validation', () => {
  test('accepts valid transaction number', () => {
    expect(validateTransactionNumber('123-123456789')).toBe(true);
  });

  test('rejects transaction number with only 2 digits before hyphen', () => {
    expect(validateTransactionNumber('12-123456789')).toBe(false);
  });

  test('rejects transaction number without hyphen', () => {
    expect(validateTransactionNumber('123123456789')).toBe(false);
  });

  test('rejects letters', () => {
    expect(validateTransactionNumber('ABC-123456789')).toBe(false);
  });

  test('rejects empty transaction number', () => {
    expect(validateTransactionNumber('')).toBe(false);
  });

  test('rejects 12-character transaction number', () => {
    expect(validateTransactionNumber('123-12345678')).toBe(false);
  });

  test('rejects 14-character transaction number', () => {
    expect(validateTransactionNumber('123-1234567890')).toBe(false);
  });
});

describe('Payment Screenshot Validation', () => {
  test('accepts JPG file', () => {
    expect(validatePaymentScreenshot('payment.jpg')).toBe(true);
  });

  test('accepts JPEG file', () => {
    expect(validatePaymentScreenshot('receipt.jpeg')).toBe(true);
  });

  test('accepts PNG file', () => {
    expect(validatePaymentScreenshot('payment.png')).toBe(true);
  });

  test('rejects PDF file', () => {
    expect(validatePaymentScreenshot('payment.pdf')).toBe(false);
  });

  test('rejects unsupported file type', () => {
    expect(validatePaymentScreenshot('payment.docx')).toBe(false);
  });
});