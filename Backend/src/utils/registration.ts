export interface RegistrationConditions {
  paymentVerified: boolean;
  drugTestVerified: boolean;
  registrationOpen: boolean;
}

export function checkRegistrationEligibility(
  conditions: RegistrationConditions
): string {

  if (!conditions.paymentVerified) {
    return 'Tuition payment not verified.';
  }

  if (!conditions.drugTestVerified) {
    return 'Drug testing report not verified.';
  }

  if (!conditions.registrationOpen) {
    return 'Registration period is closed.';
  }

  return 'Registration Allowed';
}

