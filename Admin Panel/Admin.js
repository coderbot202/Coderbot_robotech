document.addEventListener("DOMContentLoaded", () => {
  const navLinks = document.querySelectorAll(".sidebar .nav-link[data-target]");
  const pages = document.querySelectorAll(".page");

  navLinks.forEach(link => {
    link.addEventListener("click", e => {
      e.preventDefault();

      // Remove active class from all links
      navLinks.forEach(l => l.classList.remove("active"));
      link.classList.add("active");

      // Hide all pages
      pages.forEach(page => page.classList.add("d-none"));

      // Show the selected page
      const target = document.getElementById(link.dataset.target);
      if (target) target.classList.remove("d-none");
    });
  });
});

// Sample Employee Data
let employees = [
  {
    id: 1,
    employeeName: "John Doe",
    username: "johnd",
    email: "johndoe@example.com",
    phone: "+91 8805322849",
    city: "Mumbai",
    status: "Active"
  },
  {
    id: 2,
    employeeName: "Jane Smith",
    username: "janes",
    email: "janesmith@example.com",
    phone: "+91 9123456789",
    city: "Delhi",
    status: "Inactive"
  },
  {
    id: 3,
    employeeName: "Alex Brown",
    username: "alexb",
    email: "alexbrown@example.com",
    phone: "+91 9012345678",
    city: "Bangalore",
    status: "Active"
  }
];

// Sidebar navigation switching
document.addEventListener("DOMContentLoaded", () => {
  const navLinks = document.querySelectorAll(".sidebar .nav-link[data-target]");
  const pages = document.querySelectorAll(".page");

  navLinks.forEach(link => {
    link.addEventListener("click", () => {
      navLinks.forEach(l => l.classList.remove("active"));
      link.classList.add("active");

      pages.forEach(page => page.classList.add("d-none"));
      document.getElementById(link.dataset.target).classList.remove("d-none");

      if (link.dataset.target === "activity") loadEmployees();
    });
  });
});

// Load employee table
function loadEmployees() {
  const tbody = document.getElementById("employeeTable");
  tbody.innerHTML = "";

  employees.forEach(emp => {
    const row = `
      <tr>
        <td><input type="checkbox"></td>
        <td><img src="https://via.placeholder.com/40" class="rounded-circle me-2">${emp.employeeName}</td>
        <td>${emp.username}</td>
        <td>${emp.email}</td>
        <td>${emp.phone}</td>
        <td>${emp.city}</td>
        <td>${emp.status}</td>
        <td><a href="#" class="text-danger" onclick="deleteEmployee(${emp.id})">Delete</a></td>
        <td><a href="#" class="text-primary" onclick="editEmployee(${emp.id})">Edit</a></td>
      </tr>
    `;
    tbody.insertAdjacentHTML("beforeend", row);
  });
}

// Delete employee
function deleteEmployee(id) {
  if (confirm("Are you sure you want to delete this employee?")) {
    employees = employees.filter(emp => emp.id !== id);
    loadEmployees();
  }
}

// Edit employee
function editEmployee(id) {
  const emp = employees.find(e => e.id === id);
  if (!emp) return;

  const newName = prompt("Edit Employee Name:", emp.employeeName);
  const newUsername = prompt("Edit Username:", emp.username);
  const newEmail = prompt("Edit Email:", emp.email);
  const newPhone = prompt("Edit Phone:", emp.phone);
  const newCity = prompt("Edit City:", emp.city);
  const newStatus = prompt("Edit Status (Active/Inactive):", emp.status);

  if (newName && newUsername && newEmail && newPhone && newCity && newStatus) {
    emp.employeeName = newName;
    emp.username = newUsername;
    emp.email = newEmail;
    emp.phone = newPhone;
    emp.city = newCity;
    emp.status = newStatus;
    loadEmployees();
  }
}

// Load queries from localStorage or default
let queries = JSON.parse(localStorage.getItem("queries")) || [
  { id: 1, name: "Alice", email: "alice@mail.com", message: "How to reset my password?", response: "" },
  { id: 2, name: "Bob", email: "bob@mail.com", message: "Is there a mobile app?", response: "" }
];

// Save queries to localStorage
function saveQueries() {
  localStorage.setItem("queries", JSON.stringify(queries));
}

// Render queries in table
function loadQueries() {
  const tbody = document.getElementById("queryTable");
  tbody.innerHTML = "";

  queries.forEach(q => {
    const row = `
      <tr>
        <td>${q.name}</td>
        <td>${q.email}</td>
        <td>${q.message}</td>
        <td>${q.response || "<span class='text-muted'>No response yet</span>"}</td>
        <td>
          <a href="#" class="text-primary me-2" onclick="respondQuery(${q.id})">Respond</a>
          <a href="#" class="text-danger" onclick="deleteQuery(${q.id})">Delete</a>
        </td>
      </tr>
    `;
    tbody.insertAdjacentHTML("beforeend", row);
  });
}

// Handle form submission
document.getElementById("queryForm").addEventListener("submit", function(e) {
  e.preventDefault();

  const name = document.getElementById("queryName").value.trim();
  const email = document.getElementById("queryEmail").value.trim();
  const message = document.getElementById("queryMessage").value.trim();

  if (name && email && message) {
    queries.push({ id: Date.now(), name, email, message, response: "" });
    saveQueries();
    loadQueries();
    this.reset();
  }
});

// Delete query
function deleteQuery(id) {
  queries = queries.filter(q => q.id !== id);
  saveQueries();
  loadQueries();
}

// Respond to query
function respondQuery(id) {
  const query = queries.find(q => q.id === id);
  if (!query) return;

  const reply = prompt("Enter your response:", query.response || "");
  if (reply !== null) {
    query.response = reply;
    saveQueries();
    loadQueries();
  }
}

// Load queries when Query tab is clicked
document.querySelector('[data-target="query"]').addEventListener("click", loadQueries);
