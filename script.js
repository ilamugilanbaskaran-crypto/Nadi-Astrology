// script.js

document.addEventListener('DOMContentLoaded', () => {
  // Initialize Lucide Icons
  if (typeof lucide !== 'undefined') {
    lucide.createIcons();
  }

  // 1. Mobile Menu Toggle
  const mobileMenuBtn = document.getElementById('mobile-menu-btn');
  const mobileMenu = document.getElementById('mobile-menu');

  if (mobileMenuBtn && mobileMenu) {
    mobileMenuBtn.addEventListener('click', () => {
      mobileMenu.classList.toggle('hidden');
      const icon = mobileMenuBtn.querySelector('i');
      if (icon) {
        if (mobileMenu.classList.contains('hidden')) {
          icon.setAttribute('data-lucide', 'menu');
        } else {
          icon.setAttribute('data-lucide', 'x');
        }
        lucide.createIcons();
      }
    });

    // Close menu when clicking links
    mobileMenu.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        mobileMenu.classList.add('hidden');
        const icon = mobileMenuBtn.querySelector('i');
        if (icon) {
          icon.setAttribute('data-lucide', 'menu');
          lucide.createIcons();
        }
      });
    });
  }

  // 2. Sticky Header Transparent to Solid on Scroll
  const header = document.querySelector('header');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      header.classList.add('shadow-lg', 'bg-navy-dark/95');
      header.classList.remove('bg-navy-dark/80');
    } else {
      header.classList.remove('shadow-lg', 'bg-navy-dark/95');
      header.classList.add('bg-navy-dark/80');
    }
  });

  // 3. Accordion Handler (Chapters and Kandam)
  const setupAccordion = (accordionContainerId) => {
    const container = document.getElementById(accordionContainerId);
    if (!container) return;

    const items = container.querySelectorAll('.accordion-item');

    items.forEach(item => {
      const trigger = item.querySelector('.accordion-trigger');
      const content = item.querySelector('.accordion-content');
      const arrow = item.querySelector('i[data-lucide="chevron-down"]');

      trigger.addEventListener('click', () => {
        const isActive = item.classList.contains('active');

        // Close all other items in this accordion
        items.forEach(otherItem => {
          if (otherItem !== item) {
            otherItem.classList.remove('active');
            const otherContent = otherItem.querySelector('.accordion-content');
            if (otherContent) otherContent.style.maxHeight = null;
            const otherArrow = otherItem.querySelector('i[data-lucide="chevron-down"]');
            if (otherArrow) otherArrow.style.transform = 'rotate(0deg)';
          }
        });

        // Toggle current item
        if (isActive) {
          item.classList.remove('active');
          content.style.maxHeight = null;
          if (arrow) arrow.style.transform = 'rotate(0deg)';
        } else {
          item.classList.add('active');
          // Set max-height dynamically to content scrollHeight for smooth transition
          content.style.maxHeight = content.scrollHeight + 'px';
          if (arrow) arrow.style.transform = 'rotate(180deg)';
        }
      });
    });
  };

  setupAccordion('chapters-accordion');
  setupAccordion('kandam-accordion');

  // 4. Twinkling Starfield Generator
  const generateStarfield = () => {
    const starfield = document.getElementById('starfield');
    if (!starfield) return;

    const starCount = window.innerWidth < 768 ? 40 : 100;
    const documentHeight = Math.max(
      document.body.scrollHeight,
      document.documentElement.scrollHeight
    );

    for (let i = 0; i < starCount; i++) {
      const star = document.createElement('div');
      star.className = 'star';
      
      const size = Math.random() * 2 + 1; // 1px to 3px
      const x = Math.random() * 100; // Left percentage
      const y = Math.random() * documentHeight; // Top pixel location
      const delay = Math.random() * 5;
      const duration = Math.random() * 3 + 2; // 2s to 5s

      star.style.width = `${size}px`;
      star.style.height = `${size}px`;
      star.style.left = `${x}%`;
      star.style.top = `${y}px`;
      star.style.setProperty('--twinkle-duration', `${duration}s`);
      star.style.animationDelay = `${delay}s`;

      starfield.appendChild(star);
    }
  };

  generateStarfield();

  // Re-generate stars on window resize to ensure full-page coverage
  let resizeTimeout;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
      const starfield = document.getElementById('starfield');
      if (starfield) {
        starfield.innerHTML = '';
        generateStarfield();
      }
    }, 500);
  });

  // 5. Booking Form Submission Handling
  const bookingForm = document.getElementById('booking-form');
  const formFeedback = document.getElementById('form-feedback');

  if (bookingForm && formFeedback) {
    bookingForm.addEventListener('submit', (e) => {
      e.preventDefault();

      // Get Form Details
      const formData = new FormData(bookingForm);
      const payload = {
        name: formData.get('name'),
        email: formData.get('email'),
        phone: formData.get('phone'),
        dob: formData.get('dob'),
        tob: formData.get('tob'),
        pob: formData.get('pob'),
        notes: formData.get('notes')
      };

      // Visual Loading state on submit button
      const submitBtn = document.getElementById('submit-btn');
      const originalBtnHTML = submitBtn.innerHTML;
      submitBtn.disabled = true;
      submitBtn.innerHTML = `
        <i data-lucide="loader-2" class="w-4 h-4 animate-spin mr-2"></i>
        <span>Locating Your Leaf Index...</span>
      `;
      lucide.createIcons();

      // Perform real API booking call
      fetch('/api/book', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      })
      .then(response => response.json().then(data => ({ status: response.status, data })))
      .then(({ status, data }) => {
        // Restore button state
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalBtnHTML;
        lucide.createIcons();

        if (status === 200) {
          // Display Success Alert Banner
          formFeedback.classList.remove('hidden', 'bg-red-950/80', 'border-red-500/50', 'text-red-300');
          formFeedback.classList.add('bg-green-950/80', 'border-green-500/50', 'text-green-300');
          formFeedback.innerHTML = `
            <div class="flex items-start space-x-3">
              <i data-lucide="check-circle" class="w-5 h-5 text-green-400 mt-0.5"></i>
              <div>
                <p class="font-bold text-white">Sacred Reading Request Sent Successfully!</p>
                <p class="mt-1 text-xs text-[#e5d5b0]/90">
                  Namaste <strong>${payload.name}</strong>, we have received your birth details. 
                  Our practitioners (C. Baskar & M. Thamarai Selvam) will search for your manuscript. 
                  A representative will contact you at <strong>${payload.email}</strong> shortly.
                </p>
                ${data.message ? `<p class="mt-2 text-[10px] text-green-400 font-mono">${data.message}</p>` : ''}
              </div>
            </div>
          `;
          bookingForm.reset();
        } else {
          // Display Error Alert Banner
          formFeedback.classList.remove('hidden', 'bg-green-950/80', 'border-green-500/50', 'text-green-300');
          formFeedback.classList.add('bg-red-950/80', 'border-red-500/50', 'text-red-300');
          formFeedback.innerHTML = `
            <div class="flex items-start space-x-3">
              <i data-lucide="alert-triangle" class="w-5 h-5 text-red-400 mt-0.5"></i>
              <div>
                <p class="font-bold text-white">Failed to Send Request</p>
                <p class="mt-1 text-xs text-[#e5d5b0]/90">
                  ${data.message || 'An unexpected error occurred. Please try again or contact us directly.'}
                </p>
              </div>
            </div>
          `;
        }
        lucide.createIcons();
        // Scroll to the feedback element smoothly
        formFeedback.scrollIntoView({ behavior: 'smooth', block: 'center' });
      })
      .catch(error => {
        // Restore button state
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalBtnHTML;
        lucide.createIcons();

        // Display Network Error Alert Banner
        formFeedback.classList.remove('hidden', 'bg-green-950/80', 'border-green-500/50', 'text-green-300');
        formFeedback.classList.add('bg-red-950/80', 'border-red-500/50', 'text-red-300');
        formFeedback.innerHTML = `
          <div class="flex items-start space-x-3">
            <i data-lucide="alert-circle" class="w-5 h-5 text-red-400 mt-0.5"></i>
            <div>
              <p class="font-bold text-white">Connection Error</p>
              <p class="mt-1 text-xs text-[#e5d5b0]/90">
                Could not connect to the sacred server. Please check your internet connection and try again.
              </p>
            </div>
          </div>
        `;
        lucide.createIcons();
        formFeedback.scrollIntoView({ behavior: 'smooth', block: 'center' });
      });
    });
  }

  // 6. Scroll Reveal Animation Trigger
  const revealElements = document.querySelectorAll('.reveal');
  const revealOnScroll = () => {
    const triggerBottom = (window.innerHeight / 10) * 8.5;

    revealElements.forEach(el => {
      const boxTop = el.getBoundingClientRect().top;
      if (boxTop < triggerBottom) {
        el.classList.add('active');
      } else {
        // Optional: remove class to animate again on scroll up
        // el.classList.remove('active');
      }
    });
  };

  // Run once initially to load elements currently in view
  revealOnScroll();
  window.addEventListener('scroll', revealOnScroll);
});
