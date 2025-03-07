export const SERVER_ERROR = {
  response: {
    status: 500,
    data: { message: 'Internal Server Error' },
  },
}
export const UNAUTHORIZED = {
  response: {
    status: 401,
    data: { message: 'Unauthorized' },
  },
}

export const INVALID_CREDENTIALS = {
  response: {
    status: 401,
    data: { message: 'Invalid credentials' },
  },
}
