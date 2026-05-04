document.addEventListener('DOMContentLoaded', async () => {

  const navLinks = document.querySelector('.nav-links'); 
  let currentUser = null;

  // ================================
  // FETCH CURRENT USER
  // ================================
  async function getCurrentUser() {
    try {
      const res = await fetch('/current-user');
      return await res.json();
    } catch (err) {
      console.error('Error fetching user:', err);
      return null;
    }
  }

  const data = await getCurrentUser();
  if (data?.loggedIn) {
    currentUser = data;
    const loginLink = navLinks.querySelector('.login-btn');
    const signupLink = navLinks.querySelector('.signup-btn');
    if (loginLink) loginLink.remove();
    if (signupLink) signupLink.remove();

    const userItem = document.createElement('li');
    userItem.innerHTML = `
      <span class="username">${data.username}</span>
      <ul class="dropdown">
        <li><a href="/logout">Logout</a></li>
      </ul>
    `;
    navLinks.appendChild(userItem);
  }

  // ================================
  // Reservation Form
  // ================================
  const bookBtn = document.querySelector('.btn');
  const overlay = document.createElement('div');
  overlay.classList.add('overlay');
  document.body.appendChild(overlay);

  const reservationForm = document.createElement('div');
  reservationForm.classList.add('reservation-form');
  reservationForm.innerHTML = `
    <h2>Room Reservation</h2>
    <div id="reserve-msg" style="color: red; margin-bottom: 8px;"></div>
    <form id="reserveForm">
      <label>Full Name</label>
      <input type="text" id="fullname" placeholder="Enter your full name" required>
      <label>Email</label>
      <input type="email" id="email" placeholder="Enter your email" required>
      <label>Check-in Date</label>
      <input type="date" id="checkin" required>
      <label>Check-out Date</label>
      <input type="date" id="checkout" required>
      <label>Room Type</label>
      <select id="roomType" required>
        <option value="Deluxe">Deluxe Room</option>
        <option value="Family">Family Suite</option>
        <option value="Executive">Executive Suite</option>
      </select>
      <button type="submit" class="reserve-btn">Submit Reservation</button>
    </form>
  `;
  document.body.appendChild(reservationForm);

  // ================================
  // Show Reservation Form
  // ================================
  bookBtn.addEventListener('click', (e) => {
    e.preventDefault();
    if (!currentUser) {
      alert('You must be logged in to make a reservation.');
      return;
    }
    const emailInput = reservationForm.querySelector('#email');
    emailInput.value = currentUser.email;
    emailInput.readOnly = true;

    // Set minimum dates
    const today = new Date().toISOString().split('T')[0];
    reservationForm.querySelector('#checkin').min = today;
    reservationForm.querySelector('#checkout').min = today;

    reservationForm.classList.add('show');
    overlay.classList.add('show');
  });

  overlay.addEventListener('click', () => {
    reservationForm.classList.remove('show');
    overlay.classList.remove('show');
  });

  // ================================
  // Reservation Form Submission
  // ================================
  const reserveFormEl = reservationForm.querySelector('#reserveForm');
  const msgEl = reservationForm.querySelector('#reserve-msg');

  reserveFormEl.addEventListener('submit', async (e) => {
    e.preventDefault();
    msgEl.textContent = '';
    msgEl.style.color = 'red';
    const submitBtn = reserveFormEl.querySelector('button');
    submitBtn.disabled = true;

    const payload = {
      fullname: reservationForm.querySelector('#fullname').value.trim(),
      email: reservationForm.querySelector('#email').value.trim(),
      checkin: reservationForm.querySelector('#checkin').value,
      checkout: reservationForm.querySelector('#checkout').value,
      roomType: reservationForm.querySelector('#roomType').value
    };

    // ================================
    // Client-side Validation
    // ================================
    if (!payload.fullname || !payload.email || !payload.checkin || !payload.checkout || !payload.roomType) {
      msgEl.textContent = 'Please fill all fields.';
      submitBtn.disabled = false;
      return;
    }
    if (payload.checkout < payload.checkin) {
      msgEl.textContent = 'Check-out date must be after check-in.';
      submitBtn.disabled = false;
      return;
    }

    try {
      const resp = await fetch('/reserve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await resp.json();

      if (resp.ok && data.success) {
        msgEl.style.color = 'green';
        msgEl.textContent = 'Reservation submitted. ID: ' + data.id;
        setTimeout(() => {
          reservationForm.classList.remove('show');
          overlay.classList.remove('show');
          msgEl.textContent = '';
          reserveFormEl.reset();
          submitBtn.disabled = false;
        }, 1200);
      } else {
        msgEl.textContent = data.message || 'Reservation failed.';
        submitBtn.disabled = false;
      }
    } catch (err) {
      console.error(err);
      msgEl.textContent = 'Network or server error.';
      submitBtn.disabled = false;
    }
  });
});
