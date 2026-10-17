
/* =========================================
   EMBER & OAK - INTERACTIVE FEATURES
   ========================================= */

document.addEventListener("DOMContentLoaded", () => {
  // 1. Automatically update the copyright year.
  document.querySelectorAll(".current-year").forEach((element) => {
    element.textContent = new Date().getFullYear();
  });

  // 2. Mobile navigation.
  const menuToggle = document.querySelector(".menu-toggle");
  const siteNav = document.querySelector(".site-nav");

  if (menuToggle && siteNav) {
    menuToggle.addEventListener("click", () => {
      const isOpen = menuToggle.getAttribute("aria-expanded") === "true";

      menuToggle.setAttribute("aria-expanded", String(!isOpen));
      menuToggle.setAttribute(
        "aria-label",
        isOpen ? "Open navigation" : "Close navigation"
      );
      siteNav.classList.toggle("is-open", !isOpen);
    });

    // Close the mobile menu after choosing a page.
    siteNav.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => {
        menuToggle.setAttribute("aria-expanded", "false");
        menuToggle.setAttribute("aria-label", "Open navigation");
        siteNav.classList.remove("is-open");
      });
    });

    // Close the menu with Escape.
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        menuToggle.setAttribute("aria-expanded", "false");
        menuToggle.setAttribute("aria-label", "Open navigation");
        siteNav.classList.remove("is-open");
      }
    });

    // Return to desktop navigation layout when the screen gets wider.
    window.addEventListener("resize", () => {
      if (window.innerWidth > 700) {
        menuToggle.setAttribute("aria-expanded", "false");
        menuToggle.setAttribute("aria-label", "Open navigation");
        siteNav.classList.remove("is-open");
      }
    });
  }

  // 3. Menu category filters.
  const filterButtons = document.querySelectorAll(".filter-btn");
  const menuCards = document.querySelectorAll(".menu-card");

  if (filterButtons.length && menuCards.length) {
    filterButtons.forEach((button) => {
      button.addEventListener("click", () => {
        const selectedCategory = button.dataset.filter;

        // Update the selected filter button.
        filterButtons.forEach((filterButton) => {
          const isActive = filterButton === button;
          filterButton.classList.toggle("active", isActive);
          filterButton.setAttribute("aria-pressed", String(isActive));
        });

        // Show matching menu cards.
        menuCards.forEach((card) => {
          const matches =
            selectedCategory === "all" ||
            card.dataset.category === selectedCategory;

          card.hidden = !matches;
        });
      });
    });
  }

  // 4. Frontend-only contact form validation.
  const contactForm = document.querySelector("#contact-form");
  const formStatus = document.querySelector("#form-status");

  if (contactForm && formStatus) {
    contactForm.addEventListener("submit", (event) => {
      event.preventDefault();

      formStatus.textContent = "";
      formStatus.className = "form-status";

      if (!contactForm.checkValidity()) {
        contactForm.reportValidity();
        formStatus.textContent =
          "Please complete all required fields correctly.";
        formStatus.classList.add("error");
        return;
      }

      const name = document.querySelector("#name").value.trim();
      const message = document.querySelector("#message").value.trim();

      if (name.length < 2 || message.length < 10) {
        formStatus.textContent =
          "Please enter your name and a message of at least 10 characters.";
        formStatus.classList.add("error");
        return;
      }

      formStatus.textContent =
        `Thank you, ${name}! The demo form works, but your message has not been sent. A backend or form service is needed to receive messages.`;
      formStatus.classList.add("success");

      // Clear the form after displaying the demo confirmation.
      contactForm.reset();
    });
  }
});
