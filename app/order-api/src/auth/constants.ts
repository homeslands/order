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

// Phone number regex pattern for Vietnamese numbers
export const PHONE_NUMBER_REGEX = /^(?:\+84|0)(3|5|7|8|9)(\d{8})$/;
