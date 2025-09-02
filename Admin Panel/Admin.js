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
