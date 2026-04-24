export const AUTH_COOKIE_NAME = "precon_auth";

export function getExpectedPassword() {
  return process.env.APP_PASSWORD ?? "";
}

export function isPasswordValid(password: string) {
  const expectedPassword = getExpectedPassword();

  return expectedPassword.length > 0 && password === expectedPassword;
}
