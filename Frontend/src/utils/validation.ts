//implements R1 and R2 requirements. (Student ID validation)
export function validateStudentId(studentId: string): boolean {
  return /^\d{8}$/.test(studentId);
}

//implements R3 and R4 requirements. (Password validation)
export function validatePassword(password: string): boolean {
  return (
    password.length >= 8 &&
    password.length <= 12 &&
    /[A-Z]/.test(password) &&
    /[a-z]/.test(password) &&
    /\d/.test(password)
  );
}

//implements R5 requirement. (Transaction Number validation)
export function validateTransactionNumber(
  transactionNumber: string
): boolean {
  return /^\d{3}-\d{9}$/.test(transactionNumber);
}

//implements R6 requirement. (Payment Screenshot validation)
export function validatePaymentScreenshot(
  fileName: string
): boolean {
  return /\.(jpg|jpeg|png)$/i.test(fileName);
}