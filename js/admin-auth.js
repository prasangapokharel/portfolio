(function (global) {
  const SESSION_KEY = 'portfolio_admin_session';
  const ADMIN_PASSWORD = '560741';

  function isAuthenticated() {
    return sessionStorage.getItem(SESSION_KEY) === '1';
  }

  function login(password) {
    if (password !== ADMIN_PASSWORD) {
      return false;
    }
    sessionStorage.setItem(SESSION_KEY, '1');
    return true;
  }

  function logout() {
    sessionStorage.removeItem(SESSION_KEY);
  }

  global.AdminAuth = {
    isAuthenticated,
    login,
    logout
  };
})(window);
