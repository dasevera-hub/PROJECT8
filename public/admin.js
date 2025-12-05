const tableBody = document.getElementById('reservationTable');
const searchInput = document.getElementById('searchInput');
const roomFilter = document.getElementById('roomFilter');

let allReservations = [];

// ================================
// Helper: Escape HTML to prevent XSS
// ================================
function escapeHTML(str) {
  if (!str) return '';
  return str.replace(/[&<>"']/g, function(m) {
    return ({
      '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;'
    })[m];
  });
}

// ================================
// LOAD ALL RESERVATIONS
// ================================
async function loadReservations() {
  try {
    tableBody.innerHTML = `<tr><td colspan="8">Loading reservations...</td></tr>`;
    const res = await fetch('/admin/reservations'); 
    if (!res.ok) throw new Error('Failed to load');

    const data = await res.json();
    if (!data.success) throw new Error(data.message || 'Failed to load');

    allReservations = data.reservations;
    renderTable(allReservations);

  } catch (err) {
    tableBody.innerHTML = `<tr><td colspan="8" style="color:red;">Error loading reservations</td></tr>`;
    console.error(err);
  }
}

// ================================
// RENDER TABLE
// ================================
function renderTable(data) {
  if (!data.length) {
    tableBody.innerHTML = `<tr><td colspan="8">No reservations found.</td></tr>`;
    return;
  }

  tableBody.innerHTML = "";

  data.forEach(r => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${r.id}</td>
      <td>${escapeHTML(r.fullname)}</td>
      <td>${escapeHTML(r.email)}</td>
      <td>${escapeHTML(r.room_type)}</td>
      <td>${r.checkin}</td>
      <td>${r.checkout}</td>
      <td><span class="status ${r.status ? r.status.toLowerCase() : 'pending'}">${r.status || 'Pending'}</span></td>
      <td>
        <button class="approve-btn" data-id="${r.id}">Approve</button>
        <button class="delete-btn" data-id="${r.id}">Delete</button>
      </td>
    `;
    tableBody.appendChild(row);
  });
}

// ================================
// FILTER SEARCH
// ================================
function filterReservations() {
  const search = searchInput.value.toLowerCase();
  const room = roomFilter.value;

  const filtered = allReservations.filter(r =>
    (r.fullname.toLowerCase().includes(search) ||
     r.email.toLowerCase().includes(search)) &&
    (room ? r.room_type === room : true)
  );

  renderTable(filtered);
}

searchInput.addEventListener('input', debounce(filterReservations, 200));
roomFilter.addEventListener('change', filterReservations);

// ================================
// BUTTON ACTIONS
// ================================
tableBody.addEventListener('click', async (e) => {
  const id = e.target.dataset.id;
  if (!id) return;

  e.target.disabled = true; // prevent double click

  try {
    if (e.target.classList.contains('approve-btn')) {
      await fetch(`/admin/reservations/${id}/approve`, { method: 'PUT' });
      loadReservations();
    } else if (e.target.classList.contains('delete-btn')) {
      if (confirm('Delete this reservation?')) {
        await fetch(`/admin/reservations/${id}`, { method: 'DELETE' });
        loadReservations();
      }
    }
  } catch (err) {
    alert('Action failed. Check console.');
    console.error(err);
  } finally {
    e.target.disabled = false;
  }
});

// ================================
// Debounce helper
// ================================
function debounce(fn, delay) {
  let timeout;
  return function (...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => fn.apply(this, args), delay);
  };
}

loadReservations();
