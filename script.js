// ==================== GLOBAL STATE ====================
let currentUser = null;
let slideIndex = 0;
let currentCurrency = "USD";
let currentMap = null;

const exchangeRates = { USD: 1, UGX: 3850, EUR: 0.92, GBP: 0.79 };
const propertyPrices = {
  "Kampala Executive Suite": 85,
  "Jinja Riverside Cottage": 70,
  "Entebbe Airport Penthouse": 95,
  "Mbarara Modern Studio": 55,
  "Gulu Peace Haven": 45,
  "Fort Portal Crater Lake Cottage": 65,
  "Mbale Mountain Escape": 60,
  "Masaka Garden Villa": 50,
  "Kasese Lake View Suite": 55,
  "Soroti Serenity Lodge": 40,
  "Lira Green Valley House": 48,
};

const propertyAddresses = {
  "Kampala Executive Suite": "Plot 23, Kololo Heights, Kampala",
  "Jinja Riverside Cottage": "Riverside Drive, Jinja",
  "Entebbe Airport Penthouse": "Church Road, Entebbe",
  "Mbarara Modern Studio": "High Street, Mbarara",
  "Gulu Peace Haven": "Pece Stadium Road, Gulu",
  "Fort Portal Crater Lake Cottage": "Crater Lake Road, Fort Portal",
  "Mbale Mountain Escape": "Wash & Wills Road, Mbale",
  "Masaka Garden Villa": "Mengo Road, Masaka",
  "Kasese Lake View Suite": "Lake View Road, Kasese",
  "Soroti Serenity Lodge": "Oasis Road, Soroti",
  "Lira Green Valley House": "Green Valley Road, Lira",
};

// ==================== DOMContentLoaded ====================
document.addEventListener("DOMContentLoaded", function () {
  // Initialize components
  initCurrencyConverter();
  initCustomerTheme();
  initAuth();
  initSlideshow();
  initBookingForm();
  initReviews();
  initProfile();
  checkUserSession();
  displayUserBookings();
  loadSavedReviews();
  loadProfileData();
  initHamburgerMenu();
});

// ==================== HAMBURGER MENU ====================
function initHamburgerMenu() {
  const hamburger = document.getElementById("hamburger");
  const navLinks = document.getElementById("nav-links");
  if (hamburger && navLinks) {
    hamburger.addEventListener("click", function () {
      navLinks.classList.toggle("open");
    });
  }
}

// ==================== CURRENCY CONVERTER ====================
function initCurrencyConverter() {
  const selector = document.getElementById("currencySelector");
  if (selector) {
    selector.addEventListener("change", function () {
      currentCurrency = this.value;
      updateAllPrices();
      updateBookingPrice();
    });
  }
}

function convertPrice(usdPrice) {
  const rate = exchangeRates[currentCurrency];
  const converted = usdPrice * rate;
  const symbols = { USD: "$", UGX: "Shs ", EUR: "€", GBP: "£" };
  const format =
    currentCurrency === "UGX"
      ? Math.round(converted).toLocaleString()
      : converted.toFixed(2);
  return `${symbols[currentCurrency]}${format}`;
}

function updateAllPrices() {
  document.querySelectorAll(".price-item").forEach(function (item) {
    const usd = parseFloat(item.dataset.usd);
    if (usd) {
      const span = item.querySelector(".price-value");
      if (span) span.textContent = convertPrice(usd);
    }
  });
}

// ==================== THEME TOGGLE ====================
function initCustomerTheme() {
  const savedTheme = localStorage.getItem("sona_customer_theme");
  const themeToggle = document.getElementById("customerThemeToggle");

  if (savedTheme === "dark") {
    document.body.classList.add("dark-customer-theme");
    document.body.classList.remove("light-customer-theme");
    if (themeToggle)
      themeToggle.innerHTML = '<i class="fas fa-sun"></i> Light Mode';
  } else {
    document.body.classList.add("light-customer-theme");
    document.body.classList.remove("dark-customer-theme");
    if (themeToggle)
      themeToggle.innerHTML = '<i class="fas fa-moon"></i> Dark Mode';
  }

  if (themeToggle) {
    themeToggle.addEventListener("click", toggleCustomerTheme);
  }
}

function toggleCustomerTheme() {
  const themeToggle = document.getElementById("customerThemeToggle");
  if (document.body.classList.contains("light-customer-theme")) {
    document.body.classList.remove("light-customer-theme");
    document.body.classList.add("dark-customer-theme");
    localStorage.setItem("sona_customer_theme", "dark");
    if (themeToggle)
      themeToggle.innerHTML = '<i class="fas fa-sun"></i> Light Mode';
  } else {
    document.body.classList.remove("dark-customer-theme");
    document.body.classList.add("light-customer-theme");
    localStorage.setItem("sona_customer_theme", "light");
    if (themeToggle)
      themeToggle.innerHTML = '<i class="fas fa-moon"></i> Dark Mode';
  }
}

// ==================== AUTHENTICATION ====================
function initAuth() {
  const modal = document.getElementById("authModal");
  const loginBtn = document.getElementById("loginBtn");
  const signupBtn = document.getElementById("signupBtn");
  const closeBtn = document.querySelector(".close");
  const doLogin = document.getElementById("doLogin");
  const doSignup = document.getElementById("doSignup");
  const logoutBtn = document.getElementById("logoutBtn");
  const switchAuth = document.getElementById("switchAuth");

  if (loginBtn)
    loginBtn.onclick = function () {
      showAuthModal("login");
      modal.style.display = "flex";
    };
  if (signupBtn)
    signupBtn.onclick = function () {
      showAuthModal("signup");
      modal.style.display = "flex";
    };
  if (closeBtn)
    closeBtn.onclick = function () {
      modal.style.display = "none";
    };
  window.onclick = function (e) {
    if (e.target == modal) modal.style.display = "none";
  };

  if (switchAuth) {
    switchAuth.addEventListener("click", function (e) {
      e.preventDefault();
      const currentForm =
        document.getElementById("loginForm").style.display !== "none"
          ? "login"
          : "signup";
      showAuthModal(currentForm === "login" ? "signup" : "login");
    });
  }

  if (doLogin) {
    doLogin.onclick = function () {
      const email = document.getElementById("loginEmail").value;
      const pwd = document.getElementById("loginPassword").value;
      const users = JSON.parse(localStorage.getItem("sona_users") || "[]");
      const user = users.find(function (u) {
        return u.email === email && u.password === pwd;
      });
      if (user) {
        currentUser = user;
        localStorage.setItem("sona_currentUser", JSON.stringify(user));
        updateUIForUser();
        modal.style.display = "none";
        alert("Welcome back " + (user.name || email));
        displayUserBookings();
        loadProfileData();
      } else {
        alert("Invalid credentials");
      }
    };
  }

  if (doSignup) {
    doSignup.onclick = function () {
      const name = document.getElementById("signupName").value;
      const email = document.getElementById("signupEmail").value;
      const phone = document.getElementById("signupPhone").value;
      const pwd = document.getElementById("signupPassword").value;
      if (!email || !pwd) return alert("Fill all fields");
      let users = JSON.parse(localStorage.getItem("sona_users") || "[]");
      if (
        users.find(function (u) {
          return u.email === email;
        })
      )
        return alert("User already exists");
      const newUser = {
        name: name,
        email: email,
        phone: phone,
        password: pwd,
        bookings: [],
        profilePhoto: null,
        bio: "",
      };
      users.push(newUser);
      localStorage.setItem("sona_users", JSON.stringify(users));
      currentUser = newUser;
      localStorage.setItem("sona_currentUser", JSON.stringify(newUser));
      updateUIForUser();
      modal.style.display = "none";
      alert("Signup successful!");
    };
  }

  if (logoutBtn) {
    logoutBtn.addEventListener("click", function () {
      localStorage.removeItem("sona_currentUser");
      currentUser = null;
      location.reload();
    });
  }
}

function showAuthModal(type) {
  const loginDiv = document.getElementById("loginForm");
  const signupDiv = document.getElementById("signupForm");
  const switchAuth = document.getElementById("switchAuth");
  if (type === "login") {
    loginDiv.style.display = "block";
    signupDiv.style.display = "none";
    if (switchAuth)
      switchAuth.innerHTML =
        'Don\'t have an account? <a href="#" style="color:var(--primary);">Sign Up</a>';
  } else {
    loginDiv.style.display = "none";
    signupDiv.style.display = "block";
    if (switchAuth)
      switchAuth.innerHTML =
        'Already have an account? <a href="#" style="color:var(--primary);">Login</a>';
  }
}

function updateUIForUser() {
  const loginBtn = document.getElementById("loginBtn");
  const signupBtn = document.getElementById("signupBtn");
  const logoutBtn = document.getElementById("logoutBtn");
  const userGreeting = document.getElementById("userGreeting");
  if (loginBtn) loginBtn.style.display = "none";
  if (signupBtn) signupBtn.style.display = "none";
  if (logoutBtn) logoutBtn.style.display = "inline-block";
  if (userGreeting)
    userGreeting.innerText =
      "Hi " + (currentUser.name || currentUser.email.split("@")[0]);
}

function checkUserSession() {
  const saved = localStorage.getItem("sona_currentUser");
  if (saved) {
    currentUser = JSON.parse(saved);
    updateUIForUser();
    loadProfileData();
  }
}

// ==================== SLIDESHOW ====================
function initSlideshow() {
  showSlides(slideIndex);
  setInterval(function () {
    changeSlide(1);
  }, 5000);
}

function changeSlide(n) {
  showSlides((slideIndex += n));
}

function showSlides(n) {
  const slides = document.getElementsByClassName("slide");
  if (slides.length === 0) return;
  if (n >= slides.length) slideIndex = 0;
  if (n < 0) slideIndex = slides.length - 1;
  for (let i = 0; i < slides.length; i++) slides[i].style.display = "none";
  slides[slideIndex].style.display = "block";
}

window.changeSlide = changeSlide;

// ==================== BOOKING FORM ====================
function initBookingForm() {
  const form = document.getElementById("bookingForm");
  if (!form) return;

  const checkin = document.getElementById("checkin");
  const checkout = document.getElementById("checkout");
  const citySelect = document.getElementById("city");

  if (checkin) {
    checkin.min = new Date().toISOString().split("T")[0];
    checkin.addEventListener("change", updateBookingPrice);
  }
  if (checkout) {
    checkout.addEventListener("change", updateBookingPrice);
  }
  if (citySelect) {
    citySelect.addEventListener("change", updateBookingPrice);
  }

  // Payment method toggle
  const paymentRadios = document.querySelectorAll('input[name="payment"]');
  const creditCardForm = document.getElementById("creditCardForm");
  paymentRadios.forEach(function (radio) {
    radio.addEventListener("change", function () {
      if (creditCardForm) {
        creditCardForm.style.display =
          radio.value === "Credit Card" ? "block" : "none";
      }
    });
  });

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    if (!currentUser) {
      alert("Please login first");
      document.getElementById("authModal").style.display = "flex";
      return;
    }

    const property = document.getElementById("city").value;
    const name = document.getElementById("fullName").value;
    const email = document.getElementById("email").value;
    const phone = document.getElementById("phone").value;
    const checkinDate = document.getElementById("checkin").value;
    const checkoutDate = document.getElementById("checkout").value;
    const guests = parseInt(document.getElementById("guests").value);
    const paymentMethod = document.querySelector(
      'input[name="payment"]:checked',
    )?.value;

    if (!property || !name || !email || !phone) {
      alert("Fill all fields");
      return;
    }
    if (!checkinDate || !checkoutDate) {
      alert("Select dates");
      return;
    }
    if (new Date(checkinDate) >= new Date(checkoutDate)) {
      alert("Check-out after check-in");
      return;
    }

    const nights = Math.ceil(
      (new Date(checkoutDate) - new Date(checkinDate)) / (1000 * 60 * 60 * 24),
    );
    const nightlyRate = propertyPrices[property];
    const subtotal = nightlyRate * nights;
    const cleaning = 15;
    const service = subtotal * 0.1;
    const tax = (subtotal + cleaning + service) * 0.18;
    const total = subtotal + cleaning + service + tax;

    const bookingId =
      "SONA-" +
      Date.now() +
      "-" +
      Math.random().toString(36).substr(2, 6).toUpperCase();

    const booking = {
      id: bookingId,
      property: property,
      guestName: name,
      email: email,
      phone: phone,
      checkin: checkinDate,
      checkout: checkoutDate,
      nights: nights,
      guests: guests,
      paymentMethod: paymentMethod,
      specialRequests:
        document.querySelector("#specialRequests textarea")?.value || "",
      subtotalUSD: subtotal,
      cleaningUSD: cleaning,
      serviceUSD: service,
      taxUSD: tax,
      totalUSD: total,
      status: "Confirmed",
      bookingDate: new Date().toISOString(),
      address: propertyAddresses[property],
    };

    let users = JSON.parse(localStorage.getItem("sona_users") || "[]");
    const userIndex = users.findIndex(function (u) {
      return u.email === currentUser.email;
    });
    if (userIndex !== -1) {
      if (!users[userIndex].bookings) users[userIndex].bookings = [];
      users[userIndex].bookings.push(booking);
      localStorage.setItem("sona_users", JSON.stringify(users));
      currentUser.bookings = users[userIndex].bookings;
      localStorage.setItem("sona_currentUser", JSON.stringify(currentUser));
    }

    // Show success
    document.getElementById("successBookingDetails").innerHTML = `
            <p><strong>Booking ID:</strong> ${bookingId}</p>
            <p><strong>Property:</strong> ${property}</p>
            <p><strong>Dates:</strong> ${checkinDate} to ${checkoutDate}</p>
            <p><strong>Total:</strong> ${convertPrice(total)}</p>
            <p><strong>Address:</strong> ${propertyAddresses[property]}</p>
        `;
    document.getElementById("roomStatusMessage").innerHTML =
      '<div class="room-available">✓ Room confirmed! Check-in at 2PM.</div>';
    document.getElementById("successModal").style.display = "flex";

    form.reset();
    document.getElementById("priceBreakdown").style.display = "none";
    displayUserBookings();
  });
}

function updateBookingPrice() {
  const property = document.getElementById("city")?.value;
  const checkin = document.getElementById("checkin")?.value;
  const checkout = document.getElementById("checkout")?.value;

  if (property && checkin && checkout && propertyPrices[property]) {
    const nights = Math.ceil(
      (new Date(checkout) - new Date(checkin)) / (1000 * 60 * 60 * 24),
    );
    if (nights > 0) {
      const nightly = propertyPrices[property];
      const subtotal = nightly * nights;
      const cleaning = 15;
      const service = subtotal * 0.1;
      const tax = (subtotal + cleaning + service) * 0.18;
      const total = subtotal + cleaning + service + tax;

      document.getElementById("nightlyRate").textContent =
        convertPrice(nightly) +
        " x " +
        nights +
        " nights = " +
        convertPrice(subtotal);
      document.getElementById("cleaningFee").textContent =
        convertPrice(cleaning);
      document.getElementById("serviceFee").textContent = convertPrice(service);
      document.getElementById("tax").textContent = convertPrice(tax);
      document.getElementById("totalPrice").textContent = convertPrice(total);
      document.getElementById("priceBreakdown").style.display = "block";
    }
  }
}

function closeSuccessModal() {
  document.getElementById("successModal").style.display = "none";
  window.location.href = "mybookings.html";
}
window.closeSuccessModal = closeSuccessModal;

function displayUserBookings() {
  const container = document.getElementById("userBookingsList");
  if (!container) return;
  if (!currentUser?.bookings?.length) {
    container.innerHTML =
      '<p style="text-align:center; color:var(--text-secondary);">No bookings yet. <a href="bookings.html" style="color:var(--primary);">Book your first stay!</a></p>';
    return;
  }

  container.innerHTML = currentUser.bookings
    .map(function (b) {
      return `
            <div class="booking-card">
                <h4>🏠 ${b.property}</h4>
                <p><strong>Booking ID:</strong> ${b.id}</p>
                <p><strong>Dates:</strong> ${b.checkin} to ${b.checkout} (${b.nights} nights)</p>
                <p><strong>Total:</strong> ${convertPrice(b.totalUSD)}</p>
                <p><strong>Status:</strong> <span style="background:#28a745;color:white;padding:4px 12px;border-radius:20px;">${b.status}</span></p>
                <button onclick="cancelBooking('${b.id}')" class="btn-outline">Cancel Booking</button>
            </div>
        `;
    })
    .join("");
}

function cancelBooking(id) {
  if (confirm("Cancel this booking?")) {
    let users = JSON.parse(localStorage.getItem("sona_users") || "[]");
    const idx = users.findIndex(function (u) {
      return u.email === currentUser.email;
    });
    if (idx !== -1) {
      users[idx].bookings = users[idx].bookings.filter(function (b) {
        return b.id !== id;
      });
      localStorage.setItem("sona_users", JSON.stringify(users));
      currentUser.bookings = users[idx].bookings;
      localStorage.setItem("sona_currentUser", JSON.stringify(currentUser));
      displayUserBookings();
      alert("Booking cancelled");
    }
  }
}
window.cancelBooking = cancelBooking;

// ==================== PROFILE ====================
function initProfile() {
  const uploadBtn = document.getElementById("uploadPhotoBtn");
  const photoUpload = document.getElementById("profilePhotoUpload");
  const saveBtn = document.getElementById("saveProfileBtn");

  if (uploadBtn && photoUpload) {
    uploadBtn.addEventListener("click", function () {
      photoUpload.click();
    });
    photoUpload.addEventListener("change", function (e) {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = function (event) {
          const preview = document.getElementById("profilePhotoPreview");
          preview.innerHTML =
            '<img src="' +
            event.target.result +
            '" style="width:100%;height:100%;object-fit:cover;">';
          if (currentUser) {
            currentUser.profilePhoto = event.target.result;
            updateUserInStorage();
          }
        };
        reader.readAsDataURL(file);
      }
    });
  }

  if (saveBtn) {
    saveBtn.addEventListener("click", function () {
      if (currentUser) {
        currentUser.name = document.getElementById("profileName").value;
        currentUser.email = document.getElementById("profileEmail").value;
        currentUser.phone = document.getElementById("profilePhone").value;
        currentUser.bio = document.getElementById("profileBio").value;
        updateUserInStorage();
        alert("Profile updated!");
        updateUIForUser();
      } else {
        alert("Please login first");
      }
    });
  }
}

function loadProfileData() {
  if (currentUser) {
    document.getElementById("profileName").value = currentUser.name || "";
    document.getElementById("profileEmail").value = currentUser.email || "";
    document.getElementById("profilePhone").value = currentUser.phone || "";
    document.getElementById("profileBio").value = currentUser.bio || "";
    if (currentUser.profilePhoto) {
      document.getElementById("profilePhotoPreview").innerHTML =
        '<img src="' +
        currentUser.profilePhoto +
        '" style="width:100%;height:100%;object-fit:cover;">';
    }
  }
}

function updateUserInStorage() {
  let users = JSON.parse(localStorage.getItem("sona_users") || "[]");
  const idx = users.findIndex(function (u) {
    return u.email === currentUser.email;
  });
  if (idx !== -1) {
    users[idx] = currentUser;
    localStorage.setItem("sona_users", JSON.stringify(users));
    localStorage.setItem("sona_currentUser", JSON.stringify(currentUser));
  }
}

// ==================== REVIEWS ====================
function initReviews() {
  const submitBtn = document.getElementById("submitReviewBtn");
  if (submitBtn) {
    submitBtn.addEventListener("click", function () {
      const text = document.getElementById("newReview").value;
      if (text && currentUser) {
        const reviews = JSON.parse(
          localStorage.getItem("sona_reviews") || "[]",
        );
        reviews.unshift({
          text: text,
          name: currentUser.name || currentUser.email.split("@")[0],
          date: new Date().toISOString(),
        });
        localStorage.setItem("sona_reviews", JSON.stringify(reviews));
        document.getElementById("newReview").value = "";
        loadSavedReviews();
        alert("Thank you for your review!");
      } else if (!currentUser) {
        alert("Please login");
      } else {
        alert("Write a review");
      }
    });
  }
}

function loadSavedReviews() {
  const container = document.getElementById("reviewList");
  if (!container) return;
  const reviews = JSON.parse(localStorage.getItem("sona_reviews") || "[]");
  if (reviews.length > 0) {
    container.innerHTML = reviews
      .slice(0, 20)
      .map(function (r) {
        return (
          '<div class="review"><div class="stars">★★★★★</div><p>"' +
          r.text +
          '"</p><strong>- ' +
          r.name +
          "</strong><small>" +
          new Date(r.date).toLocaleDateString() +
          "</small></div>"
        );
      })
      .join("");
  }
}
