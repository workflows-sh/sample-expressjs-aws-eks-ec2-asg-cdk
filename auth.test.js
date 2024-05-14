// This test checks if the login function rejects invalid credentials

const { loginSuccess, loginInvalidSuccesResponse, loginInvalidErrorResponse } = require('./auth');

test.skip('Rejects invalid login credentials', async () => {
  const username = 'invalidUser';
  const password = 'invalidPassword';
  await expect(loginSuccess(username, password)).rejects.toThrow('Invalid credentials');
});

test.skip('Success response should be valid', async () => {
  const username = 'validUser';
  const password = 'validPassword';
  await expect(loginInvalidSuccesResponse(username, password)).resolves.toMatchObject({
    message: "Login successful",
    success: true
  });
});

test.skip('Reject response should be valid', async () => {
  const username = 'invalidUser';
  const password = 'invalidPassword';
  await expect(loginInvalidErrorResponse(username, password)).rejects.toThrow('Invalid credentials');
});