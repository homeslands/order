export enum AuthRules {
  MIN_LENGTH = 8,
  MAX_LENGTH = 20,
  HAS_LETTER = 'hasLetter',
  HAS_NUMBER = 'hasNumber',
  MIN_NAME_LENGTH = 1,
  MAX_NAME_LENGTH = 100,
  MAX_ADDRESS_LENGTH = 255,
}

export enum UserStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
}
