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
  "JavaScript", "Python", "Java", "C++", "React", "Node.js", "MongoDB",
  "Express.js", "HTML", "CSS", "Bootstrap", "SQL", "Git", "Docker"
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
