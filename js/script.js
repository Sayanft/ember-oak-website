

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

    siteNav.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => {
        menuToggle.setAttribute("aria-expanded", "false");
        menuToggle.setAttribute("aria-label", "Open navigation");
        siteNav.classList.remove("is-open");
      });
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        menuToggle.setAttribute("aria-expanded", "false");
        menuToggle.setAttribute("aria-label", "Open navigation");
        siteNav.classList.remove("is-open");
      }
    });

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

        filterButtons.forEach((filterButton) => {
          const isActive = filterButton === button;
          filterButton.classList.toggle("active", isActive);
          filterButton.setAttribute("aria-pressed", String(isActive));
        });

        menuCards.forEach((card) => {
          const matches =
            selectedCategory === "all" ||
            card.dataset.category === selectedCategory;

          card.hidden = !matches;
        });
      });
    });
  }

  // 4. Contact form connected to the Flask backend.
  const contactForm = document.querySelector("#contact-form");
  const formStatus = document.querySelector("#form-status");

  if (contactForm && formStatus) {
    contactForm.addEventListener("submit", async (event) => {
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

      const submitButton = contactForm.querySelector(
        'button[type="submit"]'
      );

      const data = {
        name: document.querySelector("#name").value.trim(),
        email: document.querySelector("#email").value.trim(),
        subject: document.querySelector("#subject").value,
        message: document.querySelector("#message").value.trim()
      };

      if (data.name.length < 2 || data.message.length < 10) {
        formStatus.textContent =
          "Please enter a valid name and a message of at least 10 characters.";
        formStatus.classList.add("error");
        return;
      }

      submitButton.disabled = true;
      formStatus.textContent = "Sending your message...";

      try {
        const response = await fetch("/api/contact", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(data)
        });

        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.error || "Could not save your message.");
        }

        formStatus.textContent = result.message;
        formStatus.classList.add("success");
        contactForm.reset();
      } catch (error) {
        formStatus.textContent =
          error.message ||
          "Unable to connect to the server. Please try again.";
        formStatus.classList.add("error");
      } finally {
        submitButton.disabled = false;
      }
    });
  }
});

