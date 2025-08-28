document.getElementById("candidateForm").addEventListener("submit", async function (e) {
  e.preventDefault();

  // Ensure latest skills are updated before submitting
  hiddenSkills.value = skills.join(",");

  const formData = new FormData(this);

  try {
    const res = await fetch("http://localhost:5000/api/candidates", {
      method: "POST",
      body: formData
    });

    const data = await res.json();
    if (res.ok) {
      alert("✅ Applied successfully!");
      this.reset();

      // Clear selected skills
      skills = [];
      renderSkills();
    } else {
      alert("❌ Error: " + data.error);
    }
  } catch (err) {
    alert("⚠️ Failed to connect to server.");
    console.error(err);
  }
});

// ================== Skills Multi-Select ==================
const skillInput = document.getElementById("skillInput");
const skillsContainer = document.getElementById("skillsContainer");
const hiddenSkills = document.getElementById("skills");
const skillsDropdown = document.getElementById("skillsDropdown");

let skills = [];

// Predefined skill suggestions
const skillSuggestions = [
  "HTML5", "CSS3", "JavaScript", "React.js", "Node.js", "Express.js", "MongoDB", 
  "SQL", "HTML", "CSS", "Bootstrap", "Python", "Java", "C++", "Git", "GitHub", 
  "REST APIs", "GraphQL", "Docker", "Kubernetes", "AWS", "Azure", "Google Cloud", 
  "CI/CD", "Linux", "Agile Methodologies", "Problem-Solving", "Data Structures", 
  "Algorithms", "System Design", "Communication Skills", "Team Collaboration", "Debugging", 
  "Testing", "Unit Testing", "Jest", "Cypress", "Postman", "Figma", "UI/UX Basics"
];

// Show suggestions as user types
skillInput.addEventListener("input", function () {
  const query = skillInput.value.toLowerCase();
  skillsDropdown.innerHTML = "";
  
  if (query) {
    const filtered = skillSuggestions.filter(s => 
      s.toLowerCase().includes(query) && !skills.includes(s)
    );

    if (filtered.length > 0) {
      skillsDropdown.classList.add("show");
      filtered.forEach(s => {
        const li = document.createElement("li");
        li.innerHTML = `<a class="dropdown-item" href="#">${s}</a>`;
        li.querySelector("a").addEventListener("click", (e) => {
          e.preventDefault();
          addSkill(s);
        });
        skillsDropdown.appendChild(li);
      });
    } else {
      skillsDropdown.classList.remove("show");
    }
  } else {
    skillsDropdown.classList.remove("show");
  }
});

// Add skill on Enter key
skillInput.addEventListener("keypress", function (e) {
  if (e.key === "Enter") {
    e.preventDefault();
    const skill = skillInput.value.trim();
    if (skill && !skills.includes(skill)) {
      addSkill(skill);
    }
    skillInput.value = "";
    skillsDropdown.classList.remove("show");
  }
});

function addSkill(skill) {
  skills.push(skill);
  renderSkills();
  skillInput.value = "";
  skillsDropdown.classList.remove("show");
}

function renderSkills() {
  skillsContainer.innerHTML = "";
  skills.forEach((skill, index) => {
    const skillChip = document.createElement("div");
    skillChip.className = "skill-chip";
    skillChip.innerHTML = `
      ${skill}
      <button type="button" class="btn-close btn-close-white ms-2" aria-label="Remove"></button>
    `;
    skillChip.querySelector("button").addEventListener("click", () => {
      skills.splice(index, 1);
      renderSkills();
    });
    skillsContainer.appendChild(skillChip);
  });

  // Update hidden field
  hiddenSkills.value = skills.join(",");
}

//Automatic fill
/*
  document.addEventListener("DOMContentLoaded", async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const jobId = urlParams.get("jobId"); // get jobId from URL

    if (jobId) {
      try {
        // Fetch job details from backend
        const res = await fetch(`http://localhost:5000/api/jobs/${jobId}`);
        const job = await res.json();

        if (res.ok) {
          // Autofill form fields
          document.getElementById("jobTitle").value = job.title;
          document.getElementById("jobRole").value = job.field;
        } else {
          console.error("Error fetching job:", job.error);
        }
      } catch (err) {
        console.error("⚠️ Failed to fetch job details", err);
      }
    }
  });
*/
  // Dummy Job Data
  const jobs = [
    { id: "1", title: "Software Engineer", role: "Backend Developer", company: "Tech Corp", location: "Bangalore" },
    { id: "2", title: "Data Analyst", role: "Data Visualization", company: "DataWorks", location: "Hyderabad" },
    { id: "3", title: "Marketing Manager", role: "Digital Marketing", company: "Marketify", location: "Delhi" },
    { id: "4", title: "UI/UX Designer", role: "Product Designer", company: "DesignHub", location: "Mumbai" }
  ];

  // Get jobId from query params
  const urlParams = new URLSearchParams(window.location.search);
  const jobId = urlParams.get("jobId");

  if (jobId) {
    const job = jobs.find(j => j.id === jobId);

    if (job) {
      document.querySelector('[name="jobTitle"]').value = job.title;
      document.querySelector('[name="jobRole"]').value = job.role;
    }
  }
