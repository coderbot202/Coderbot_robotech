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



// Sample Users
let users = [
  {
    id: 1,
    name: "Aman Verma",
    username: "amanvermaaman",
    email: "aman@gmail.com",
    phone: "+91 8805322849",
    city: "Mumbai",
    state: "Maharashtra",
    country: "India",
    pdf: "sample1.pdf"
  },
  {
    id: 2,
    name: "Jane Smith",
    username: "janes",
    email: "jane@gmail.com",
    phone: "+1 2025550198",
    city: "New York",
    state: "NY",
    country: "USA",
    pdf: "sample2.pdf"
  }
];

// Render users
function loadUsers(filter = "") {
  const tbody = document.getElementById("userTable");
  tbody.innerHTML = "";

  users
    .filter(u =>
      u.name.toLowerCase().includes(filter.toLowerCase()) ||
      u.username.toLowerCase().includes(filter.toLowerCase())
    )
    .forEach(u => {
      const row = `
        <tr>
          <td>${u.name}</td>
          <td>${u.username}</td>
          <td>${u.email}</td>
          <td>${u.phone}</td>
          <td>${u.city}</td>
          <td>${u.state}</td>
          <td>${u.country}</td>
          <td><a href="${u.pdf}" class="btn btn-sm btn-primary" target="_blank">View PDF</a></td>
        </tr>
      `;
      tbody.insertAdjacentHTML("beforeend", row);
    });
}

// Search filter
document.getElementById("searchUser").addEventListener("input", function () {
  loadUsers(this.value);
});

// Load users when Users tab clicked
document.querySelector('[data-target="users"]').addEventListener("click", () => loadUsers());


// ================= CMS DASHBOARD ===================

// Load CMS (cards + website traffic + total users chart)
function loadCMS(timeRange = "today") {
  updateCards(timeRange);
  updateWebsiteTraffic(timeRange);
  updateTotalUsersChart(timeRange);
}

// ----------------- CARDS -----------------
const cardData = {
  today: {
    views: { count: "1,200", change: "+2.3%", color: "text-success" },
    visits: { count: "980", change: "-0.5%", color: "text-danger" },
    newUsers: { count: "25", change: "+5.1%", color: "text-success" },
    activeUsers: { count: "630", change: "+1.8%", color: "text-success" }
  },
  week: {
    views: { count: "8,540", change: "+6.7%", color: "text-success" },
    visits: { count: "6,720", change: "-1.1%", color: "text-danger" },
    newUsers: { count: "180", change: "+12.0%", color: "text-success" },
    activeUsers: { count: "4,510", change: "+3.2%", color: "text-success" }
  },
  month: {
    views: { count: "32,680", change: "+10.4%", color: "text-success" },
    visits: { count: "28,450", change: "-0.8%", color: "text-danger" },
    newUsers: { count: "750", change: "+18.5%", color: "text-success" },
    activeUsers: { count: "17,200", change: "+5.7%", color: "text-success" }
  },
  year: {
    views: { count: "420,000", change: "+15.2%", color: "text-success" },
    visits: { count: "390,500", change: "+2.8%", color: "text-success" },
    newUsers: { count: "8,900", change: "+22.1%", color: "text-success" },
    activeUsers: { count: "210,300", change: "+7.9%", color: "text-success" }
  }
};

function updateCards(range) {
  const data = cardData[range];

  document.getElementById("viewsCount").innerText = data.views.count;
  document.getElementById("viewsChange").innerText = data.views.change;
  document.getElementById("viewsChange").className = data.views.color;

  document.getElementById("visitsCount").innerText = data.visits.count;
  document.getElementById("visitsChange").innerText = data.visits.change;
  document.getElementById("visitsChange").className = data.visits.color;

  document.getElementById("newUsersCount").innerText = data.newUsers.count;
  document.getElementById("newUsersChange").innerText = data.newUsers.change;
  document.getElementById("newUsersChange").className = data.newUsers.color;

  document.getElementById("activeUsersCount").innerText = data.activeUsers.count;
  document.getElementById("activeUsersChange").innerText = data.activeUsers.change;
  document.getElementById("activeUsersChange").className = data.activeUsers.color;
}

// ----------------- WEBSITE TRAFFIC -----------------
const websiteTrafficData = {
  today: [
    { site: "Google", value: 45 },
    { site: "YouTube", value: 25 },
    { site: "Instagram", value: 15 },
    { site: "Pinterest", value: 7 },
    { site: "Facebook", value: 5 },
    { site: "Twitter", value: 3 }
  ],
  week: [
    { site: "Google", value: 40 },
    { site: "YouTube", value: 28 },
    { site: "Instagram", value: 18 },
    { site: "Pinterest", value: 6 },
    { site: "Facebook", value: 5 },
    { site: "Twitter", value: 3 }
  ],
  month: [
    { site: "Google", value: 50 },
    { site: "YouTube", value: 22 },
    { site: "Instagram", value: 14 },
    { site: "Pinterest", value: 7 },
    { site: "Facebook", value: 5 },
    { site: "Twitter", value: 2 }
  ],
  year: [
    { site: "Google", value: 48 },
    { site: "YouTube", value: 24 },
    { site: "Instagram", value: 12 },
    { site: "Pinterest", value: 8 },
    { site: "Facebook", value: 5 },
    { site: "Twitter", value: 3 }
  ]
};

function updateWebsiteTraffic(range) {
  const container = document.getElementById("websiteTraffic");
  container.innerHTML = "";

  websiteTrafficData[range].forEach(item => {
    const li = `
      <li class="mb-3">
        <div class="d-flex justify-content-between">
          <span>${item.site}</span>
          <span>${item.value}%</span>
        </div>
        <div class="progress" style="height: 6px;">
          <div class="progress-bar bg-primary" role="progressbar" style="width: ${item.value}%;"></div>
        </div>
      </li>
    `;
    container.insertAdjacentHTML("beforeend", li);
  });
}

// ----------------- TOTAL USERS CHART -----------------
let totalUsersChart;

function updateTotalUsersChart(range) {
  const ctx = document.getElementById("totalUsersChart").getContext("2d");

  const dataSets = {
    today: [20, 30, 40, 25, 35, 45, 50],
    week: [200, 250, 220, 280, 300, 350, 370],
    month: [1000, 1200, 1150, 1300, 1500, 1600, 1700],
    year: [5000, 7000, 8000, 9000, 9500, 11000, 12000]
  };

  if (totalUsersChart) totalUsersChart.destroy();

  totalUsersChart = new Chart(ctx, {
    type: "line",
    data: {
      labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
      datasets: [{
        label: "Total Users",
        data: dataSets[range],
        borderColor: "#215C5C",
        backgroundColor: "rgba(33,92,92,0.2)",
        fill: true,
        tension: 0.4
      }]
    },
    options: {
      responsive: true,
      plugins: { legend: { display: false } },
      scales: {
        x: { ticks: { color: "#333" }, grid: { color: "#eaeaea" } },
        y: { ticks: { color: "#333" }, grid: { color: "#eaeaea" } }
      }
    }
  });
}

// ----------------- EVENT LISTENERS -----------------
document.querySelector('[data-target="cms"]').addEventListener("click", () => {
  loadCMS("today");
});

document.getElementById("timeFilter").addEventListener("change", function () {
  loadCMS(this.value);
});

//Settings
document.getElementById("addTaskBtn").addEventListener("click", () => {
  const input = document.getElementById("newTaskInput");
  const taskName = input.value.trim();
  if (taskName === "") return;

  const taskList = document.getElementById("taskList");
  const li = document.createElement("li");
  li.className = "list-group-item d-flex justify-content-between align-items-center";
  li.innerHTML = `
    <div>
      <input type="checkbox" class="form-check-input me-2">
      ${taskName}
    </div>
    <div>
      <button class="btn btn-sm btn-outline-warning me-2">★</button>
      <button class="btn btn-sm btn-outline-danger">✖</button>
    </div>
  `;

  // Delete task
  li.querySelector(".btn-outline-danger").addEventListener("click", () => {
    li.remove();
  });

  // Star task
  li.querySelector(".btn-outline-warning").addEventListener("click", (e) => {
    e.target.classList.toggle("text-warning");
  });

  taskList.appendChild(li);
  input.value = "";
});

document.addEventListener("DOMContentLoaded", function () {
  const calendarEl = document.getElementById("calendar");
  let calendar;

  // Listen for modal show
  const calendarModal = document.getElementById("calendarModal");
  calendarModal.addEventListener("shown.bs.modal", function () {
    if (!calendar) {
      calendar = new FullCalendar.Calendar(calendarEl, {
        initialView: "dayGridMonth",
        height: "auto",
        headerToolbar: {
          left: "prev,next today",
          center: "title",
          right: "dayGridMonth,timeGridWeek,timeGridDay"
        },
        events: [
          { title: "Meeting with CEO", start: "2025-09-10" },
          { title: "Design Review", start: "2025-09-15" },
          { title: "Project Deadline", start: "2025-09-20" }
        ]
      });
      calendar.render();
    } else {
      calendar.render(); // re-render if already created
    }
  });
});


// Project list sample data
const sampleProjects = [
  { manager: "Byewind", date: "2025-06-24", amount: 942, status: "In Progress" },
  { manager: "Natal Craig", date: "2025-03-10", amount: 881, status: "Complete" },
  { manager: "Drew Cano", date: "2025-11-10", amount: 409, status: "Pending" },
  { manager: "Orlando Diggs", date: "2025-12-20", amount: 953, status: "Approved" },
  { manager: "Andi Lane", date: "2025-07-25", amount: 307, status: "Rejected" }
];

function renderProjects() {
  const tableBody = document.querySelector("#projectsTable tbody");
  tableBody.innerHTML = "";

  sampleProjects.forEach((p, index) => {
    const badgeClass = {
      "In Progress": "bg-primary-subtle text-primary",
      "Complete": "bg-success-subtle text-success",
      "Pending": "bg-info-subtle text-info",
      "Approved": "bg-warning-subtle text-warning",
      "Rejected": "bg-secondary-subtle text-secondary"
    }[p.status];

    const row = `
      <tr>
        <td><img src="https://i.pravatar.cc/30?img=${index+1}" class="rounded-circle me-2">${p.manager}</td>
        <td>${new Date(p.date).toLocaleDateString()}</td>
        <td>$${p.amount.toFixed(2)}</td>
        <td><span class="badge rounded-pill ${badgeClass}">${p.status}</span></td>
        <td>
          <button class="btn btn-sm btn-warning me-2" onclick="openUpdateModal(${index})">Update</button>
          <button class="btn btn-sm btn-danger" onclick="deleteProject(${index})">Delete</button>
        </td>
      </tr>
    `;
    tableBody.insertAdjacentHTML("beforeend", row);
  });
}

function openUpdateModal(index) {
  document.getElementById("updateProjectIndex").value = index;
  document.getElementById("updateProjectStatus").value = sampleProjects[index].status;

  new bootstrap.Modal(document.getElementById("updateProjectModal")).show();
}

// Handle update form
document.getElementById("updateProjectForm").addEventListener("submit", function (e) {
  e.preventDefault();

  const index = document.getElementById("updateProjectIndex").value;
  const newStatus = document.getElementById("updateProjectStatus").value;

  sampleProjects[index].status = newStatus;
  renderProjects();

  bootstrap.Modal.getInstance(document.getElementById("updateProjectModal")).hide();
});



function deleteProject(index) {
  sampleProjects.splice(index, 1);
  renderProjects();
}

// Handle new project form
document.getElementById("projectForm").addEventListener("submit", function (e) {
  e.preventDefault();

  const manager = document.getElementById("projectManager").value;
  const date = document.getElementById("projectDate").value;
  const amount = parseFloat(document.getElementById("projectAmount").value);
  const status = document.getElementById("projectStatus").value;

  sampleProjects.push({ manager, date, amount, status });
  renderProjects();

  // Close modal
  bootstrap.Modal.getInstance(document.getElementById("projectModal")).hide();

  // Reset form
  this.reset();
});

// Initial render
renderProjects();

//New user
document.getElementById("gotousers").addEventListener("click", () => {
  // Hide all pages
  document.querySelectorAll(".page").forEach(page => page.classList.add("d-none"));

  // Show the Settings page (where projects live)
  document.getElementById("users").classList.remove("d-none");
  
  // Update sidebar active link
  document.querySelectorAll(".sidebar .nav-link").forEach(link => link.classList.remove("active"));
  document.querySelector('[data-target="users"]').classList.add("active");
});

//Manage User
document.getElementById("gotoactivity").addEventListener("click", () => {
  // Hide all pages
  document.querySelectorAll(".page").forEach(page => page.classList.add("d-none"));

  // Show the Settings page (where projects live)
  document.getElementById("activity").classList.remove("d-none");
  
  // Update sidebar active link
  document.querySelectorAll(".sidebar .nav-link").forEach(link => link.classList.remove("active"));
  document.querySelector('[data-target="activity"]').classList.add("active");
});

//Real Time Analytics
document.getElementById("gotocms").addEventListener("click", () => {
  // Hide all pages
  document.querySelectorAll(".page").forEach(page => page.classList.add("d-none"));

  // Show the Settings page (where projects live)
  document.getElementById("cms").classList.remove("d-none");
  
  // Update sidebar active link
  document.querySelectorAll(".sidebar .nav-link").forEach(link => link.classList.remove("active"));
  document.querySelector('[data-target="cms"]').classList.add("active");
});

