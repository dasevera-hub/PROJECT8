document.addEventListener('DOMContentLoaded', () => {
  const loginForm = document.getElementById('loginForm');
  const signupForm = document.getElementById('signupForm');

  // ----------------------
  // LOGIN FORM
  // ----------------------
  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const email = loginForm.querySelector('#email').value.trim();
      const password = loginForm.querySelector('#password').value;

      if (!email || !password) {
        alert('Please fill in both fields.');
        return;
      }

      loginForm.querySelector('button').disabled = true;

      try {
        await fetch('/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: new URLSearchParams({ email, password })
        });
        // Server handles redirect on success
      } catch (err) {
        console.error(err);
        alert('Network error. Try again.');
      } finally {
        loginForm.querySelector('button').disabled = false;
      }
    });
  }

  // ----------------------
  // SIGNUP FORM
  // ----------------------
  if (signupForm) {
    signupForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const username = signupForm.querySelector('#username').value.trim();
      const email = signupForm.querySelector('#email').value.trim();
      const phone = signupForm.querySelector('#phone').value.trim();
      const password = signupForm.querySelector('#password').value;

      if (!username || !email || !phone || !password) {
        alert('All fields are required.');
        return;
      }

      signupForm.querySelector('button').disabled = true;

      try {
        await fetch('/signup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: new URLSearchParams({ username, email, phone, password })
        });
        // Server handles redirect on success
      } catch (err) {
        console.error(err);
        alert('Network error. Try again.');
      } finally {
        signupForm.querySelector('button').disabled = false;
      }
    });
  }
});
