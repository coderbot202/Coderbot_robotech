// ================= Categories Section =================
const categories = [
  {
    icon: "https://cdn-icons-png.flaticon.com/128/12446/12446956.png",
    title: "Marketing & Communication",
    jobs: 58
  },
  {
    icon: "https://cdn-icons-png.flaticon.com/128/17163/17163509.png",
    title: "UI / UX Design",
    jobs: 120,
    active: true
  },
  {
    icon: "https://cdn-icons-png.flaticon.com/128/3820/3820195.png",
    title: "Finance Management",
    jobs: 230
  },
  {
    icon: "https://cdn-icons-png.flaticon.com/128/4131/4131518.png",
    title: "Web Development",
    jobs: 100
  },
  {
    icon: "https://cdn-icons-png.flaticon.com/128/6208/6208634.png",
    title: "Project Management",
    jobs: 87
  },
  {
    icon: "https://cdn-icons-png.flaticon.com/128/9139/9139531.png",
    title: "Business & Consulting",
    jobs: 23
  },
  {
    icon: "https://cdn-icons-png.flaticon.com/128/17109/17109597.png",
    title: "Graphic Designer",
    jobs: 65
  },
  {
    icon: "https://cdn-icons-png.flaticon.com/128/8350/8350470.png",
    title: "Video Editor",
    jobs: 120
  }
];

const categoryGrid = document.getElementById("categoryGrid");

function renderCategories() {
  categoryGrid.innerHTML = categories
    .map((cat, index) => `
      <div class="category-box ${cat.active ? 'active' : ''}" data-index="${index}">
        <img src="${cat.icon}" alt="${cat.title} Icon">
        <h3>${cat.title}</h3>
        <p>${cat.jobs} Jobs Available</p>
      </div>
    `)
    .join("");

  document.querySelectorAll(".category-box").forEach(box => {
    box.addEventListener("click", () => {
      const idx = box.getAttribute("data-index");
      categories.forEach(c => c.active = false);
      categories[idx].active = true;
      renderCategories();
    });
  });
}
renderCategories();


// ================= Upcoming Hiring Section =================
const UH_DATA = [
  { title: "Frontend Developer", category: "IT - Information Technology", location: "Delhi", experience: "1–2 Years", jobMode: "Remote", company: "TechCorp", image: "https://picsum.photos/seed/it1/600/360" },
  { title: "Backend Developer", category: "IT - Information Technology", location: "Hyderabad", experience: "3+ Years", jobMode: "On-site", company: "CodeWorks", image: "https://picsum.photos/seed/it2/600/360" },
  { title: "Full Stack Engineer", category: "IT - Information Technology", location: "Bengaluru", experience: "2–4 Years", jobMode: "Hybrid", company: "ShipFast", image: "https://picsum.photos/seed/it3/600/360" },
  { title: "Sales Executive", category: "Sales and Marketing", location: "Mumbai", experience: "0–1 Year", jobMode: "On-site", company: "SalesPro", image: "https://picsum.photos/seed/sales1/600/360" },
  { title: "Digital Marketer", category: "Sales and Marketing", location: "Remote", experience: "1–3 Years", jobMode: "Remote", company: "AdLaunch", image: "https://picsum.photos/seed/sales2/600/360" },
  { title: "Finance Analyst", category: "Banking Finance", location: "Pune", experience: "2–3 Years", jobMode: "Hybrid", company: "FinEdge", image: "https://picsum.photos/seed/fin1/600/360" },
  { title: "Soft Skills Trainer", category: "Personal Development", location: "Chennai", experience: "3+ Years", jobMode: "On-site", company: "SkillGrow", image: "https://picsum.photos/seed/pd1/600/360" },
  { title: "HR Manager", category: "HR - Human Resource", location: "Pune", experience: "5+ Years", jobMode: "On-site", company: "PeopleFirst", image: "https://picsum.photos/seed/hr1/600/360" },
  { title: "Product Manager", category: "Management", location: "Gurgaon", experience: "4–6 Years", jobMode: "Hybrid", company: "RoadMap", image: "https://picsum.photos/seed/mgmt1/600/360" }
];

const uhSection  = document.querySelector('.uh-section');
const uhTrack    = document.getElementById('uhTrack');
const uhTabs     = document.getElementById('uhTabs');
const uhPrev     = document.getElementById('uhPrev');
const uhNext     = document.getElementById('uhNext');
const uhViewAll  = document.getElementById('uhViewAll');
let uhFiltered = [...UH_DATA];
let uhIndex = 0;
let uhTimer = null;

function uhVisibleCount() {
  if (window.innerWidth >= 1024) return 3;
  if (window.innerWidth >= 640)  return 2;
  return 1;
}
function uhStepPX() {
  const root = getComputedStyle(document.documentElement);
  const w = parseInt(root.getPropertyValue('--uh-card-w')) || 300;
  const g = parseInt(root.getPropertyValue('--uh-gap')) || 16;
  return w + g;
}
function uhRender() {
  uhTrack.innerHTML = uhFiltered.map(item => `
    <article class="uh-card">
      <img class="uh-cover" src="${item.image}" alt="${item.title}">
      <div class="uh-body">
        <h3 class="uh-title-sm">${item.title}</h3>
        <p class="uh-meta"><strong>Company:</strong> ${item.company}</p>
        <p class="uh-meta"><strong>Location:</strong> ${item.location}</p>
        <p class="uh-meta"><strong>Experience:</strong> ${item.experience}</p>
        <p class="uh-meta"><strong>Mode:</strong> ${item.jobMode}</p>
        <span class="uh-badge">${item.category}</span>
      </div>
    </article>
  `).join('');
  uhIndex = 0;
  uhUpdateTransform();
  uhUpdateArrows();
  uhUpdateViewAllLabel();
}
function uhUpdateTransform() {
  if (uhSection.classList.contains('uh--all')) return;
  const maxIndex = Math.max(0, uhFiltered.length - uhVisibleCount());
  uhIndex = Math.min(Math.max(uhIndex, 0), maxIndex);
  uhTrack.style.transform = `translateX(-${uhIndex * uhStepPX()}px)`;
}
function uhUpdateArrows() {
  if (uhSection.classList.contains('uh--all')) { uhPrev.disabled = uhNext.disabled = true; return; }
  const maxIndex = Math.max(0, uhFiltered.length - uhVisibleCount());
  uhPrev.disabled = (uhFiltered.length <= uhVisibleCount());
  uhNext.disabled = (uhFiltered.length <= uhVisibleCount());
}
uhTabs.addEventListener('click', (e) => {
  const btn = e.target.closest('.uh-tab');
  if (!btn) return;
  document.querySelectorAll('.uh-tab').forEach(t => t.classList.remove('uh-tab--active'));
  btn.classList.add('uh-tab--active');
  const cat = btn.dataset.category;
  uhFiltered = (cat === 'All') ? [...UH_DATA] : UH_DATA.filter(j => j.category === cat);
  uhSection.classList.remove('uh--all');
  uhRender();
  uhRestartAutoSlide();
});
uhNext.addEventListener('click', () => {
  const maxIndex = Math.max(0, uhFiltered.length - uhVisibleCount());
  uhIndex = (uhIndex >= maxIndex) ? 0 : uhIndex + 1;
  uhUpdateTransform();
  uhRestartAutoSlide();
});
uhPrev.addEventListener('click', () => {
  const maxIndex = Math.max(0, uhFiltered.length - uhVisibleCount());
  uhIndex = (uhIndex <= 0) ? maxIndex : uhIndex - 1;
  uhUpdateTransform();
  uhRestartAutoSlide();
});
function uhStartAutoSlide() {
  uhStopAutoSlide();
  if (uhSection.classList.contains('uh--all')) return;
  uhTimer = setInterval(() => {
    const maxIndex = Math.max(0, uhFiltered.length - uhVisibleCount());
    uhIndex = (uhIndex >= maxIndex) ? 0 : uhIndex + 1;
    uhUpdateTransform();
  }, 3000);
}
function uhStopAutoSlide() { if (uhTimer) { clearInterval(uhTimer); uhTimer = null; } }
function uhRestartAutoSlide() { uhStartAutoSlide(); }
function uhUpdateViewAllLabel() {
  const label = uhSection.classList.contains('uh--all') ? 'Show Less' : `View All (${uhFiltered.length})`;
  uhViewAll.textContent = label;
}
uhViewAll.addEventListener('click', () => {
  uhSection.classList.toggle('uh--all');
  if (uhSection.classList.contains('uh--all')) {
    uhTrack.style.transform = 'none';
    uhStopAutoSlide();
  } else {
    uhIndex = 0;
    uhUpdateTransform();
    uhStartAutoSlide();
  }
  uhUpdateArrows();
  uhUpdateViewAllLabel();
});
window.addEventListener('resize', () => {
  uhUpdateTransform();
  uhUpdateArrows();
});
uhRender();
uhStartAutoSlide();


// ================= Hiring Cards Section =================
const hiringData = [
  { title: "Frontend Developer", category: "Software Engineer", location: "Delhi", experience: "1-3 years", jobMode: "Remote", company: "TechCorp", image: "https://via.placeholder.com/300x160" },
  { title: "Sales Executive", category: "Sales", location: "Mumbai", experience: "0-2 years", jobMode: "On-site", company: "SalesPro", image: "https://via.placeholder.com/300x160" },
  { title: "Business Development Executive", category: "BDE", location: "Bangalore", experience: "2-4 years", jobMode: "Hybrid", company: "BizGrow", image: "https://via.placeholder.com/300x160" },
  { title: "Backend Developer", category: "Software Engineer", location: "Pune", experience: "3-5 years", jobMode: "Remote", company: "CodeBase", image: "https://via.placeholder.com/300x160" },
  { title: "UI/UX Designer", category: "Software Engineer", location: "Hyderabad", experience: "2-4 years", jobMode: "Hybrid", company: "Designify", image: "https://via.placeholder.com/300x160" }
];

const cardWrapper = document.getElementById("hiringCards");
const tabs = document.querySelectorAll(".uh-tab");
const viewAllBtn = document.getElementById("viewAllBtn");
const section = document.getElementById("hiringSection");
const viewport = document.querySelector(".uh-viewport");

function renderCards(filterCategory = "All") {
  cardWrapper.innerHTML = "";
  let filteredData = filterCategory === "All" ? hiringData : hiringData.filter(item => item.category === filterCategory);
  cardWrapper.innerHTML = filteredData.map(item => `
    <article class="uh-card">
      <img class="uh-cover" src="${item.image}" alt="${item.title}">
      <div class="uh-body">
        <h3 class="uh-title-sm">${item.title}</h3>
        <p class="uh-meta"><strong>Company:</strong> ${item.company}</p>
        <p class="uh-meta"><strong>Location:</strong> ${item.location}</p>
        <p class="uh-meta"><strong>Experience:</strong> ${item.experience}</p>
        <p class="uh-meta"><strong>Mode:</strong> ${item.jobMode}</p>
        <span class="uh-badge">${item.category}</span>
        <button class="uh-apply-btn">Apply Now</button>
      </div>
    </article>
  `).join('');
}
tabs.forEach(tab => {
  tab.addEventListener("click", () => {
    tabs.forEach(t => t.classList.remove("uh-tab--active"));
    tab.classList.add("uh-tab--active");
    renderCards(tab.dataset.category);
  });
});
viewAllBtn.addEventListener("click", () => {
  section.classList.toggle("uh--all");
  viewAllBtn.textContent = section.classList.contains("uh--all") ? "Show Less" : "View All";
});
document.getElementById("slideLeft").addEventListener("click", () => {
  viewport.scrollBy({ left: -320, behavior: 'smooth' });
});
document.getElementById("slideRight").addEventListener("click", () => {
  viewport.scrollBy({ left: 320, behavior: 'smooth' });
});
renderCards();


// ================= Remote Jobs Section =================
const remoteJobsData = [
  { title: "Loan Officer", company: "Eligible HR Consultancy", posted: "Hot! 1 day ago", experience: "1 to 4 Yrs", location: "Other Uttar Pradesh", tags: ["Be an Early Applicant", "Regular", "10 Positions"], category: "Finance", image: "https://via.placeholder.com/300x160" },
  { title: "Business Development", company: "Vision 360 Visionary Business Solutions", posted: "Hot! 2 days ago", experience: "1 to 6 Yrs", location: "Noida +2", tags: ["Be an Early Applicant", "Regular", "20 Positions"], category: "Sales", image: "https://via.placeholder.com/300x160" },
  { title: "Recruiter OR Senior Recruiter", company: "First Solution (HR Bhayandar)", posted: "3 days ago", experience: "1 to 6 Yrs", location: "Mira Bhayandar", tags: ["Internship", "14 Positions"], category: "HR", image: "https://via.placeholder.com/300x160" },
  { title: "Software Engineer", company: "TechSoft Pvt Ltd", posted: "2 days ago", experience: "2 to 5 Yrs", location: "Remote", tags: ["Remote Work", "Full-time"], category: "IT", image: "https://via.placeholder.com/300x160" }
];

const remoteTrack = document.getElementById("remoteTrack");
const remoteTabs = document.querySelectorAll("#remoteTabs .uh-tab");
const remoteViewAllBtn = document.getElementById("remoteViewAll");
const remoteSection = document.getElementById("remoteJobsSection");

function renderRemoteCards(filter = "All") {
  let remoteFiltered = filter === "All" ? remoteJobsData : remoteJobsData.filter(j => j.category === filter);
  remoteTrack.innerHTML = remoteFiltered.map(job => `
    <article class="uh-card">
      <img class="uh-cover" src="${job.image}" alt="${job.title}">
      <div class="uh-body">
        <p class="uh-meta"><strong>${job.posted}</strong></p>
        <h3 class="uh-title-sm">${job.title}</h3>
        <p class="uh-meta">${job.company}</p>
        <p class="uh-meta"><strong>Exp:</strong> ${job.experience}</p>
        <p class="uh-meta"><strong>Loc:</strong> ${job.location}</p>
        <div class="uh-meta">
          ${job.tags.map(tag => `<span class="uh-badge">${tag}</span>`).join(" ")}
        </div>
        <div style="margin-top:12px; display:flex; gap:8px;">
          <button class="uh-apply-btn" style="background:#6b7280;">Not Interested</button>
          <button class="uh-apply-btn">Apply</button>
        </div>
      </div>
    </article>
  `).join("");
}
remoteTabs.forEach(tab => {
  tab.addEventListener("click", () => {
    remoteTabs.forEach(t => t.classList.remove("uh-tab--active"));
    tab.classList.add("uh-tab--active");
    renderRemoteCards(tab.dataset.category);
  });
});
document.getElementById("remoteLeft").addEventListener("click", () => {
  document.querySelector("#remoteJobsSection .uh-viewport").scrollBy({ left: -320, behavior: "smooth" });
});
document.getElementById("remoteRight").addEventListener("click", () => {
  document.querySelector("#remoteJobsSection .uh-viewport").scrollBy({ left: 320, behavior: "smooth" });
});
remoteViewAllBtn.addEventListener("click", () => {
  remoteSection.classList.toggle("uh--all");
  remoteViewAllBtn.textContent = remoteSection.classList.contains("uh--all") ? "Show Less" : "View All";
});
renderRemoteCards();
