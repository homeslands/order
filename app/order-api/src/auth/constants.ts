export const jwtConstants = {
  secret:
    'DO NOT USE THIS VALUE. INSTEAD, CREATE A COMPLEX SECRET AND KEEP IT SAFE OUTSIDE OF THE SOURCE CODE.',
};


export enum AccountVerificationType {
  MAIL = 'mail',
  PHONE_NUMBER = 'phone-number',
}

export enum AccountVerificationStatus {
  VERIFIED = 'verified',
  UNVERIFIED = 'unverified',
}

// Vietnamese phone number regex pattern
export const VIETNAMESE_PHONE_REGEX = /^(0[3|5|7|8|9][0-9]{8})$/;
