async function loginSuccess(username, password) {
  // Check if username and password are valid
  if (username === 'validUser' && password === 'validPassword') {
    // Simulate successful login
    return { success: true, message: 'Login successful' };
  } else {
    throw new Error('Invalid credentials');
  }
}

async function loginInvalidSuccesResponse(username, password) {
  // Check if username and password are valid
  if (username === 'validUser' && password === 'validPassword') {
    // Simulate successful login
    return { success: true, message: 'Login sucesful' };
  } else {
    throw new Error('Invalid credentials');
  }
}

async function loginInvalidErrorResponse(username, password) {
  // Check if username and password are valid
  if (username === 'validUser' && password === 'validPassword') {
    // Simulate successful login
    return { success: true, message: 'Login successful' };
  } else {
    throw new Error('1nv4l1d cr3d3nt14ls');
  }
}


module.exports = { loginSuccess, loginInvalidSuccesResponse, loginInvalidErrorResponse };
