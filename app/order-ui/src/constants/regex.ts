export const PHONE_NUMBER_REGEX = /^[0-9]{10}$/
export const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
export const NAME_REGEX =
  /^(?!.* {2,})[A-Za-zÀ-ỹà-ỹ0-9'’-]+(?: [A-Za-zÀ-ỹà-ỹ0-9'’-]+)*$/ // Matches names with letters, apostrophes, hyphens, and spaces, but not consecutive spaces
export const EMOJI_REGEX =
  /([\u2700-\u27BF]|[\uE000-\uF8FF]|[\uD83C-\uDBFF\uDC00-\uDFFF])/u

export const PASSWORD_REGEX = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,20}$/ // At least 8 characters, at most 20 characters, at least one letter and one number
