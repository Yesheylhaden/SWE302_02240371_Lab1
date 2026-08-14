export function validateStudentId(
  studentId: string
): boolean {
  return /^\d{8}$/.test(studentId);
}

export function validatePassword(
  password: string
): boolean {
  return (
    password.length >= 8 &&
    password.length <= 12 &&
    /[A-Z]/.test(password) &&
    /[a-z]/.test(password) &&
    /\d/.test(password)
  );
}

export function validateTransactionNumber(
  transactionNumber: string
): boolean {
  return /^\d{3}-\d{9}$/.test(
    transactionNumber
  );
}

export function validateScreenshot(
  fileName: string
): boolean {
  return /\.(jpg|jpeg|png)$/i.test(
    fileName
  );
}

