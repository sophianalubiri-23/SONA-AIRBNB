// ==================== GLOBAL STATE ====================
let currentUser = null;
let slideIndex = 0;
let currentCurrency = "USD";
let currentMap = null;
let directionsMap = null;
let directionsRenderer = null;
let allBookings = [];

const exchangeRates = { USD: 1, UGX: 3850, EUR: 0.92, GBP: 0.79 };
const propertyPrices = {
  "Kampala Executive Suite": 85,
  "Jinja Riverside Cottage": 70,
  "Entebbe Airport Penthouse": 95,
  "Mbarara Modern Studio": 55,
  "Gulu Peace Haven": 45,
};
const propertyAddresses = {
  "Kampala Executive Suite": "Plot 23, Kololo Heights, Kampala, Uganda",
  "Jinja Riverside Cottage": "Riverside Drive, Jinja, Uganda",
  "Entebbe Airport Penthouse": "Church Road, Entebbe, Uganda",
  "Mbarara Modern Studio": "High Street, Mbarara, Uganda",
  "Gulu Peace Haven": "Pece Stadium Road, Gulu, Uganda",
};
const propertyCoordinates = {
  "Kampala Executive Suite": { lat: 0.3136, lng: 32.5811 },
  "Jinja Riverside Cottage": { lat: 0.4345, lng: 33.2026 },
  "Entebbe Airport Penthouse": { lat: 0.0512, lng: 32.4637 },
  "Mbarara Modern Studio": { lat: -0.6072, lng: 30.6545 },
  "Gulu Peace Haven": { lat: 2.7724, lng: 32.2971 },
};
const propertyGoogleMapsLinks = {
  "Kampala Executive Suite": "https://maps.google.com/?q=0.3136,32.5811",
  "Jinja Riverside Cottage": "https://maps.google.com/?q=0.4345,33.2026",
  "Entebbe Airport Penthouse": "https://maps.google.com/?q=0.0512,32.4637",
  "Mbarara Modern Studio": "https://maps.google.com/?q=-0.6072,30.6545",
  "Gulu Peace Haven": "https://maps.google.com/?q=2.7724,32.2971",
};

// Owner WhatsApp number
const OWNER_WHATSAPP = "256791825920";
const OWNER_PHONE = "0744824491";
const OWNER_EMAIL = "sophianalubiri@gmail.com";

// Chatbot conversation history
let chatHistory = [];
let humanHandoffRequested = false;

// ==================== INITIALIZATION ====================
document.addEventListener("DOMContentLoaded", () => {
  loadAllBookings();
  initNavigation();
  initSlideshow();
  initAuth();
  initBooking();
  initAdvancedChatbot();
  initReviews();
  initCurrencyConverter();
  initProfile();
  initCustomerTheme();
  checkUserSession();
  displayUserBookings();
  loadSavedReviews();
  initLocationMap();
  loadLeafletForDirections();
});

function loadAllBookings() {
  const users = JSON.parse(localStorage.getItem("sona_users") || "[]");
  allBookings = [];
  users.forEach((user) => {
    if (user.bookings) allBookings = allBookings.concat(user.bookings);
  });
}

// ==================== LOAD LEAFLET FOR DIRECTIONS ====================
function loadLeafletForDirections() {
  // Leaflet is already loaded from index.html
  console.log("Leaflet available for directions");
}

// ==================== CUSTOMER THEME ====================
function initCustomerTheme() {
  const savedTheme = localStorage.getItem("sona_customer_theme");
  const themeToggle = document.getElementById("customerThemeToggle");

  if (savedTheme === "dark") {
    document.body.classList.add("dark-customer-theme");
    document.body.classList.remove("light-customer-theme");
    if (themeToggle)
      themeToggle.innerHTML =
        '<i class="fas fa-sun"></i> <span>Light Mode</span>';
  } else {
    document.body.classList.add("light-customer-theme");
    document.body.classList.remove("dark-customer-theme");
    if (themeToggle)
      themeToggle.innerHTML =
        '<i class="fas fa-moon"></i> <span>Dark Mode</span>';
  }

  if (themeToggle) themeToggle.addEventListener("click", toggleCustomerTheme);
}

function toggleCustomerTheme() {
  const themeToggle = document.getElementById("customerThemeToggle");

  if (document.body.classList.contains("light-customer-theme")) {
    document.body.classList.remove("light-customer-theme");
    document.body.classList.add("dark-customer-theme");
    localStorage.setItem("sona_customer_theme", "dark");
    if (themeToggle)
      themeToggle.innerHTML =
        '<i class="fas fa-sun"></i> <span>Light Mode</span>';
  } else {
    document.body.classList.remove("dark-customer-theme");
    document.body.classList.add("light-customer-theme");
    localStorage.setItem("sona_customer_theme", "light");
    if (themeToggle)
      themeToggle.innerHTML =
        '<i class="fas fa-moon"></i> <span>Dark Mode</span>';
  }
}

// ==================== CURRENCY ====================
function initCurrencyConverter() {
  const selector = document.getElementById("currencySelector");
  if (selector)
    selector.addEventListener("change", (e) => {
      currentCurrency = e.target.value;
      updateAllPrices();
      updateBookingPrice();
    });
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
  document.querySelectorAll(".price-item").forEach((item) => {
    const usd = parseFloat(item.dataset.usd);
    if (usd) {
      const span = item.querySelector(".price-value");
      if (span) span.textContent = convertPrice(usd);
    }
  });
}

// ==================== NAVIGATION ====================
function initNavigation() {
  const navLinks = document.querySelectorAll(
    ".nav-links a, [data-page], .footer a[data-page]",
  );
  const pages = document.querySelectorAll(".page");
  navLinks.forEach((link) => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      const pageId = link.getAttribute("data-page");
      if (pageId) {
        pages.forEach((page) => page.classList.remove("active-page"));
        const target = document.getElementById(`${pageId}-page`);
        if (target) target.classList.add("active-page");
        document
          .querySelectorAll(".nav-links a")
          .forEach((a) => a.classList.remove("active"));
        if (link.closest(".nav-links")) link.classList.add("active");
        window.scrollTo(0, 0);
        const mobile = document.getElementById("nav-links");
        if (mobile) mobile.classList.remove("active");
      }
    });
  });
  const hamburger = document.getElementById("hamburger");
  if (hamburger)
    hamburger.addEventListener("click", () =>
      document.getElementById("nav-links").classList.toggle("active"),
    );
}

// ==================== SLIDESHOW ====================
function initSlideshow() {
  showSlides(slideIndex);
  setInterval(() => changeSlide(1), 5000);
}
function changeSlide(n) {
  showSlides((slideIndex += n));
}
function showSlides(n) {
  let slides = document.getElementsByClassName("slide");
  if (slides.length === 0) return;
  if (n >= slides.length) slideIndex = 0;
  if (n < 0) slideIndex = slides.length - 1;
  for (let i = 0; i < slides.length; i++) slides[i].style.display = "none";
  slides[slideIndex].style.display = "block";
}
window.changeSlide = changeSlide;

// ==================== AUTH ====================
function initAuth() {
  const modal = document.getElementById("authModal");
  const loginBtn = document.getElementById("loginBtn");
  const signupBtn = document.getElementById("signupBtn");
  const closeBtn = document.querySelector(".close");
  const doLogin = document.getElementById("doLogin");
  const doSignup = document.getElementById("doSignup");
  const logoutBtn = document.getElementById("logoutBtn");

  if (loginBtn)
    loginBtn.onclick = () => {
      showAuthModal("login");
      modal.style.display = "block";
    };
  if (signupBtn)
    signupBtn.onclick = () => {
      showAuthModal("signup");
      modal.style.display = "block";
    };
  if (closeBtn) closeBtn.onclick = () => (modal.style.display = "none");
  window.onclick = (e) => {
    if (e.target == modal) modal.style.display = "none";
  };

  if (doLogin) {
    doLogin.onclick = () => {
      const email = document.getElementById("loginEmail").value;
      const pwd = document.getElementById("loginPassword").value;
      const users = JSON.parse(localStorage.getItem("sona_users") || "[]");
      const user = users.find((u) => u.email === email && u.password === pwd);
      if (user) {
        currentUser = user;
        localStorage.setItem("sona_currentUser", JSON.stringify(user));
        updateUIForUser();
        modal.style.display = "none";
        alert(`Welcome back ${user.name || email}`);
        displayUserBookings();
        loadProfileData();
        loadAllBookings();
      } else alert("Invalid credentials");
    };
  }

  if (doSignup) {
    doSignup.onclick = () => {
      const name = document.getElementById("signupName").value;
      const email = document.getElementById("signupEmail").value;
      const phone = document.getElementById("signupPhone").value;
      const pwd = document.getElementById("signupPassword").value;
      if (!email || !pwd) return alert("Fill all fields");
      let users = JSON.parse(localStorage.getItem("sona_users") || "[]");
      if (users.find((u) => u.email === email)) return alert("User exists");
      const newUser = {
        name,
        email,
        phone,
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

  if (logoutBtn)
    logoutBtn.addEventListener("click", () => {
      localStorage.removeItem("sona_currentUser");
      location.reload();
    });
}

function showAuthModal(type) {
  const loginDiv = document.getElementById("loginForm");
  const signupDiv = document.getElementById("signupForm");
  if (type === "login") {
    loginDiv.style.display = "block";
    signupDiv.style.display = "none";
  } else {
    loginDiv.style.display = "none";
    signupDiv.style.display = "block";
  }
}
function updateUIForUser() {
  document.getElementById("loginBtn").style.display = "none";
  document.getElementById("signupBtn").style.display = "none";
  document.getElementById("logoutBtn").style.display = "inline-block";
  document.getElementById("userGreeting").innerText =
    `Hi ${currentUser.name || currentUser.email.split("@")[0]}`;
}
function checkUserSession() {
  const saved = localStorage.getItem("sona_currentUser");
  if (saved) {
    currentUser = JSON.parse(saved);
    updateUIForUser();
    loadProfileData();
  }
}

// ==================== SEND WHATSAPP MESSAGE TO OWNER ====================
function sendWhatsAppToOwner(bookingDetails) {
  const message = `🏨 *NEW BOOKING RECEIVED!* 🏨
    
━━━━━━━━━━━━━━━━━━━━━
📋 *BOOKING DETAILS*
━━━━━━━━━━━━━━━━━━━━━

🔑 *Booking ID:* ${bookingDetails.id}
👤 *Guest Name:* ${bookingDetails.name}
📧 *Email:* ${bookingDetails.email}
📞 *Phone:* ${bookingDetails.phone}

🏠 *Property:* ${bookingDetails.property}
📍 *Address:* ${bookingDetails.address}

📅 *Check-in Date:* ${bookingDetails.checkin}
📅 *Check-out Date:* ${bookingDetails.checkout}
🌙 *Number of Nights:* ${bookingDetails.nights}
👥 *Number of Guests:* ${bookingDetails.guests}

💰 *Nightly Rate:* $${bookingDetails.nightlyRate}
🧹 *Cleaning Fee:* $15
🛎️ *Service Fee (10%):* $${bookingDetails.serviceFee}
📊 *Tax (18% VAT):* $${bookingDetails.tax}

💵 *TOTAL AMOUNT:* $${bookingDetails.total}

💳 *Payment Method:* ${bookingDetails.paymentMethod}

━━━━━━━━━━━━━━━━━━━━━
📝 *SPECIAL REQUESTS*
━━━━━━━━━━━━━━━━━━━━━
${bookingDetails.specialRequests || "No special requests"}

━━━━━━━━━━━━━━━━━━━━━
✅ *STATUS: CONFIRMED*
📅 *Booked on:* ${new Date().toLocaleString()}
━━━━━━━━━━━━━━━━━━━━━

*ACTION REQUIRED:* Please prepare the room and send check-in instructions to the guest.`;

  const encodedMessage = encodeURIComponent(message);
  const whatsappUrl = `https://wa.me/${OWNER_WHATSAPP}?text=${encodedMessage}`;
  window.open(whatsappUrl, "_blank");
}

// ==================== BOOKING ====================
function initBooking() {
  const checkin = document.getElementById("checkin");
  const checkout = document.getElementById("checkout");
  const citySelect = document.getElementById("city");
  if (checkin) checkin.min = new Date().toISOString().split("T")[0];
  if (checkout) checkout.min = new Date().toISOString().split("T")[0];
  if (citySelect) citySelect.addEventListener("change", updateBookingPrice);
  if (checkin) checkin.addEventListener("change", updateBookingPrice);
  if (checkout) checkout.addEventListener("change", updateBookingPrice);

  const paymentRadios = document.querySelectorAll('input[name="payment"]');
  const creditCardForm = document.getElementById("creditCardForm");
  paymentRadios.forEach((radio) => {
    radio.addEventListener("change", () => {
      if (creditCardForm)
        creditCardForm.style.display =
          radio.value === "Credit Card" ? "block" : "none";
    });
  });

  const form = document.getElementById("bookingForm");
  if (form) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      if (!currentUser) {
        alert("Please login first");
        document.getElementById("authModal").style.display = "block";
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
      const specialRequests =
        document.querySelector("#specialRequests textarea")?.value || "";

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

      const isAvailable = checkRoomAvailability(
        property,
        checkinDate,
        checkoutDate,
      );
      if (!isAvailable) {
        alert(
          "Sorry, this room is already booked. Please choose different dates.",
        );
        return;
      }

      const nights = Math.ceil(
        (new Date(checkoutDate) - new Date(checkinDate)) /
          (1000 * 60 * 60 * 24),
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
        property,
        guestName: name,
        email,
        phone,
        checkin: checkinDate,
        checkout: checkoutDate,
        nights,
        guests,
        paymentMethod,
        specialRequests,
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
      const userIndex = users.findIndex((u) => u.email === currentUser.email);
      if (userIndex !== -1) {
        if (!users[userIndex].bookings) users[userIndex].bookings = [];
        users[userIndex].bookings.push(booking);
        localStorage.setItem("sona_users", JSON.stringify(users));
        currentUser.bookings = users[userIndex].bookings;
        localStorage.setItem("sona_currentUser", JSON.stringify(currentUser));
      }

      const whatsappDetails = {
        id: bookingId,
        name: name,
        email: email,
        phone: phone,
        property: property,
        address: propertyAddresses[property],
        checkin: checkinDate,
        checkout: checkoutDate,
        nights: nights,
        guests: guests,
        nightlyRate: nightlyRate,
        serviceFee: service.toFixed(2),
        tax: tax.toFixed(2),
        total: total.toFixed(2),
        paymentMethod: paymentMethod,
        specialRequests: specialRequests,
      };

      sendWhatsAppToOwner(whatsappDetails);

      document.getElementById("successBookingDetails").innerHTML = `
                <p><strong>Booking ID:</strong> ${bookingId}</p>
                <p><strong>Property:</strong> ${property}</p>
                <p><strong>Dates:</strong> ${checkinDate} to ${checkoutDate}</p>
                <p><strong>Total:</strong> ${convertPrice(total)}</p>
                <p><strong>📍 Address:</strong> ${propertyAddresses[property]}</p>
                <p><strong>📍 Google Maps:</strong> <a href="${propertyGoogleMapsLinks[property]}" target="_blank">Click for Directions</a></p>
            `;
      document.getElementById("roomStatusMessage").innerHTML =
        `<div class="room-available">✓ Room confirmed! Check-in on ${checkinDate} at 2PM.</div>`;
      document.getElementById("successModal").style.display = "flex";

      form.reset();
      document.getElementById("priceBreakdown").style.display = "none";
      displayUserBookings();
      loadAllBookings();

      alert(
        `✅ Booking Confirmed! WhatsApp will open to send details to the owner.`,
      );
    });
  }
}

function checkRoomAvailability(property, checkin, checkout) {
  const checkinDate = new Date(checkin);
  const checkoutDate = new Date(checkout);
  const conflict = allBookings.find((b) => {
    if (b.property !== property) return false;
    if (b.status === "Cancelled" || b.status === "Cancelled (No refund)")
      return false;
    const bStart = new Date(b.checkin);
    const bEnd = new Date(b.checkout);
    return checkinDate < bEnd && checkoutDate > bStart;
  });
  return !conflict;
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
        `${convertPrice(nightly)} x ${nights} nights = ${convertPrice(subtotal)}`;
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
  document.querySelector('[data-page="mybookings"]').click();
}
window.closeSuccessModal = closeSuccessModal;

function displayUserBookings() {
  const container = document.getElementById("userBookingsList");
  if (!container) return;
  if (!currentUser?.bookings?.length) {
    container.innerHTML =
      '<p>No bookings yet. <a href="#" data-page="booking">Book now!</a></p>';
    return;
  }
  container.innerHTML = currentUser.bookings
    .map(
      (b) => `
        <div class="booking-card">
            <h4>🏠 ${b.property}</h4>
            <p><strong>Booking ID:</strong> ${b.id}</p>
            <p><strong>Dates:</strong> ${b.checkin} to ${b.checkout} (${b.nights} nights)</p>
            <p><strong>Total:</strong> ${convertPrice(b.totalUSD)}</p>
            <p><strong>Status:</strong> <span style="background:#28a745;color:white;padding:4px 12px;border-radius:20px;">${b.status}</span></p>
            <p><strong>📍 Address:</strong> ${b.address}</p>
            <p><strong>📍 <a href="${propertyGoogleMapsLinks[b.property]}" target="_blank" style="color:var(--primary);">Get Directions on Google Maps</a></strong></p>
            <button onclick="cancelBooking('${b.id}')" class="btn-outline">Cancel</button>
        </div>
    `,
    )
    .join("");
}

function cancelBooking(id) {
  if (confirm("Cancel this booking?")) {
    let users = JSON.parse(localStorage.getItem("sona_users") || "[]");
    const idx = users.findIndex((u) => u.email === currentUser.email);
    if (idx !== -1) {
      users[idx].bookings = users[idx].bookings.filter((b) => b.id !== id);
      localStorage.setItem("sona_users", JSON.stringify(users));
      currentUser.bookings = users[idx].bookings;
      localStorage.setItem("sona_currentUser", JSON.stringify(currentUser));
      displayUserBookings();
      loadAllBookings();
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
    uploadBtn.addEventListener("click", () => photoUpload.click());
    photoUpload.addEventListener("change", (e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          const preview = document.getElementById("profilePhotoPreview");
          preview.innerHTML = `<img src="${event.target.result}" style="width:100%;height:100%;object-fit:cover;">`;
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
    saveBtn.addEventListener("click", () => {
      if (currentUser) {
        currentUser.name = document.getElementById("profileName").value;
        currentUser.email = document.getElementById("profileEmail").value;
        currentUser.phone = document.getElementById("profilePhone").value;
        currentUser.bio = document.getElementById("profileBio").value;
        updateUserInStorage();
        alert("Profile updated!");
        updateUIForUser();
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
        `<img src="${currentUser.profilePhoto}" style="width:100%;height:100%;object-fit:cover;">`;
    }
  }
}
function updateUserInStorage() {
  let users = JSON.parse(localStorage.getItem("sona_users") || "[]");
  const idx = users.findIndex((u) => u.email === currentUser.email);
  if (idx !== -1) {
    users[idx] = currentUser;
    localStorage.setItem("sona_users", JSON.stringify(users));
    localStorage.setItem("sona_currentUser", JSON.stringify(currentUser));
  }
}

// ==================== MAPS ====================
function initLocationMap() {
  const mapContainer = document.getElementById("locationMap");
  if (!mapContainer) return;
  const map = L.map("locationMap").setView([0.3136, 32.5811], 7);
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png").addTo(map);
  const locations = [
    {
      name: "Kampala",
      lat: 0.3136,
      lng: 32.5811,
      address: propertyAddresses["Kampala Executive Suite"],
    },
    {
      name: "Jinja",
      lat: 0.4345,
      lng: 33.2026,
      address: propertyAddresses["Jinja Riverside Cottage"],
    },
    {
      name: "Entebbe",
      lat: 0.0512,
      lng: 32.4637,
      address: propertyAddresses["Entebbe Airport Penthouse"],
    },
  ];
  locations.forEach((loc) => {
    const marker = L.marker([loc.lat, loc.lng]).addTo(map).bindPopup(`
            <b>${loc.name}</b><br>
            ${loc.address}<br>
            <a href="https://maps.google.com/?q=${loc.lat},${loc.lng}" target="_blank">Get Directions →</a>
        `);
  });
}

// ==================== REVIEWS ====================
function initReviews() {
  const submitBtn = document.getElementById("submitReviewBtn");
  if (submitBtn) {
    submitBtn.addEventListener("click", () => {
      const text = document.getElementById("newReview").value;
      if (text && currentUser) {
        const reviews = JSON.parse(
          localStorage.getItem("sona_reviews") || "[]",
        );
        reviews.unshift({
          text,
          name: currentUser.name || currentUser.email.split("@")[0],
          date: new Date().toISOString(),
        });
        localStorage.setItem("sona_reviews", JSON.stringify(reviews));
        document.getElementById("newReview").value = "";
        loadSavedReviews();
        alert("Thank you for your review!");
      } else if (!currentUser) alert("Please login");
      else alert("Write a review");
    });
  }
}
function loadSavedReviews() {
  const container = document.getElementById("reviewList");
  if (!container) return;
  const reviews = JSON.parse(localStorage.getItem("sona_reviews") || "[]");
  container.innerHTML = reviews.length
    ? reviews
        .slice(0, 20)
        .map(
          (r) =>
            `<div class="review"><div class="stars">★★★★★</div><p>"${r.text}"</p><strong>- ${r.name}</strong><small>${new Date(r.date).toLocaleDateString()}</small></div>`,
        )
        .join("")
    : "<p>No reviews yet</p>";
}

// ==================== ADVANCED CHATBOT ====================
function initAdvancedChatbot() {
  const chatBody = document.getElementById("chatBody");
  const chatHeader = document.getElementById("chatHeader");
  const chatMinimize = document.getElementById("chatMinimize");
  const chatClose = document.getElementById("chatClose");
  const chatInput = document.getElementById("chatInput");
  const chatSend = document.getElementById("chatSend");
  const chatMessages = document.getElementById("chatMessages");
  const chatTyping = document.getElementById("chatTyping");
  let isMinimized = false;

  // Minimize/Maximize chat
  if (chatMinimize) {
    chatMinimize.onclick = () => {
      isMinimized = !isMinimized;
      if (isMinimized) {
        document.getElementById("chatbot").classList.add("minimized");
        chatMinimize.innerHTML = "+";
      } else {
        document.getElementById("chatbot").classList.remove("minimized");
        chatMinimize.innerHTML = "−";
      }
    };
  }

  // Close chat
  if (chatClose) {
    chatClose.onclick = () => {
      document.getElementById("chatbot").style.display = "none";
    };
  }

  // Quick reply buttons
  document.querySelectorAll(".quick-reply").forEach((btn) => {
    btn.addEventListener("click", () => {
      const replyText = btn.innerText;
      chatInput.value = replyText;
      sendChatMessage();
    });
  });

  function addMessage(text, isUser = false, isTyping = false) {
    if (isTyping) {
      chatTyping.style.display = "flex";
      setTimeout(() => {
        chatTyping.style.display = "none";
        const msgDiv = document.createElement("div");
        msgDiv.className = `chat-message ${isUser ? "user" : "bot"}`;
        msgDiv.innerHTML = `<div class="message-content">${text}</div>`;
        chatMessages.appendChild(msgDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
      }, 1000);
      return;
    }

    const msgDiv = document.createElement("div");
    msgDiv.className = `chat-message ${isUser ? "user" : "bot"}`;
    msgDiv.innerHTML = `<div class="message-content">${text}</div>`;
    chatMessages.appendChild(msgDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;

    // Save to history
    chatHistory.push({ text, isUser, timestamp: new Date() });
  }

  async function sendChatMessage() {
    const message = chatInput.value.trim();
    if (!message) return;

    addMessage(message, true);
    chatInput.value = "";

    // Show typing indicator
    chatTyping.style.display = "flex";

    // Process message and get response
    setTimeout(async () => {
      chatTyping.style.display = "none";
      const response = await getChatbotResponse(message);
      addMessage(response, false);

      // Check if human handoff is needed
      if (
        humanHandoffRequested ||
        message.toLowerCase().includes("talk to human") ||
        message.toLowerCase().includes("help me") ||
        message.toLowerCase().includes("contact support")
      ) {
        humanHandoffRequested = true;
        setTimeout(() => {
          addMessage(
            `
                        <div style="background: var(--primary-light); padding: 10px; border-radius: 10px;">
                            <strong>📞 Need human assistance?</strong><br>
                            <button onclick="openHumanSupportModal()" class="btn-primary" style="margin-top: 10px;">
                                <i class="fas fa-headset"></i> Contact Support
                            </button>
                            <button onclick="openWhatsAppSupport()" class="btn-primary" style="margin-top: 10px; margin-left: 10px;">
                                <i class="fab fa-whatsapp"></i> WhatsApp
                            </button>
                        </div>
                    `,
            false,
          );
        }, 500);
      }
    }, 500);
  }

  async function getChatbotResponse(message) {
    const lowerMsg = message.toLowerCase();

    // Greetings
    if (
      lowerMsg.includes("hello") ||
      lowerMsg.includes("hi") ||
      lowerMsg.includes("hey")
    ) {
      return "Hello! 👋 Welcome to SONA AIRBNB UGANDA. How can I help you today?";
    }

    // Prices
    if (
      lowerMsg.includes("price") ||
      lowerMsg.includes("cost") ||
      lowerMsg.includes("how much")
    ) {
      const prices = Object.entries(propertyPrices)
        .map(([name, price]) => `• ${name}: ${convertPrice(price)}/night`)
        .join("\n");
      return `💰 *Our Room Prices:*\n\n${prices}\n\nAdditional fees: Cleaning $15, Service fee 10%, Tax 18% VAT.`;
    }

    // Availability
    if (
      lowerMsg.includes("available") ||
      lowerMsg.includes("free") ||
      lowerMsg.includes("booked")
    ) {
      return `📅 To check availability, please go to the Book page and select your dates. I can help you find available rooms! Which city are you interested in? (Kampala, Jinja, Entebbe, Mbarara, or Gulu)`;
    }

    // Directions / Location
    if (
      lowerMsg.includes("direction") ||
      lowerMsg.includes("how to get") ||
      lowerMsg.includes("location") ||
      lowerMsg.includes("where is")
    ) {
      return `📍 I can help you get directions to any of our properties!\n\nJust click the "Get Directions" button below or go to the Contact page for the map.\n\nWhich property would you like directions to?`;
    }

    // Specific property directions
    if (lowerMsg.includes("kampala")) {
      return `📍 *Kampala Executive Suite*\nAddress: ${propertyAddresses["Kampala Executive Suite"]}\n\n<a href="${propertyGoogleMapsLinks["Kampala Executive Suite"]}" target="_blank" style="color: var(--primary);">🗺️ Click here for Google Maps Directions</a>\n\nYou can also call us at ${OWNER_PHONE} for assistance.`;
    }
    if (lowerMsg.includes("jinja")) {
      return `📍 *Jinja Riverside Cottage*\nAddress: ${propertyAddresses["Jinja Riverside Cottage"]}\n\n<a href="${propertyGoogleMapsLinks["Jinja Riverside Cottage"]}" target="_blank" style="color: var(--primary);">🗺️ Click here for Google Maps Directions</a>`;
    }
    if (lowerMsg.includes("entebbe")) {
      return `📍 *Entebbe Airport Penthouse*\nAddress: ${propertyAddresses["Entebbe Airport Penthouse"]}\n\n<a href="${propertyGoogleMapsLinks["Entebbe Airport Penthouse"]}" target="_blank" style="color: var(--primary);">🗺️ Click here for Google Maps Directions</a>`;
    }

    // Cancellation policy
    if (lowerMsg.includes("cancel") || lowerMsg.includes("refund")) {
      return `❌ *Cancellation Policy:*\n\n• Free cancellation up to 7 days before check-in (Full refund)\n• 50% refund up to 48 hours before check-in\n• No refund within 48 hours of check-in\n• $25 cancellation fee applies`;
    }

    // Check-in/out
    if (lowerMsg.includes("check-in") || lowerMsg.includes("checkout")) {
      return `⏰ *Check-in:* 2:00 PM\n⏰ *Check-out:* 11:00 AM\n\nEarly check-in and late check-out available upon request (additional fees may apply).`;
    }

    // Amenities
    if (
      lowerMsg.includes("pool") ||
      lowerMsg.includes("wifi") ||
      lowerMsg.includes("amenities")
    ) {
      return `🏊 *Amenities:*\n• Free High-Speed WiFi\n• Swimming Pool\n• Pool Table / Games Room\n• On-site Bar\n• Free Parking\n• 24/7 Security\n• Air Conditioning\n• Fully Equipped Kitchen`;
    }

    // Booking help
    if (lowerMsg.includes("book") || lowerMsg.includes("reserve")) {
      return `📝 To make a booking:\n\n1. Login or Sign Up\n2. Go to the Book page\n3. Select property and dates\n4. Enter guest details\n5. Complete payment\n6. You'll receive confirmation via WhatsApp and Email\n\nNeed help? Just ask!`;
    }

    // Human handoff
    if (
      lowerMsg.includes("talk to human") ||
      lowerMsg.includes("help me") ||
      lowerMsg.includes("contact support") ||
      lowerMsg.includes("agent")
    ) {
      humanHandoffRequested = true;
      return `I understand you need human assistance. Please click the "Contact Support" button below and our team will get back to you shortly.\n\nYou can also reach us directly:\n📞 Call: ${OWNER_PHONE}\n💬 WhatsApp: ${OWNER_WHATSAPP}\n📧 Email: ${OWNER_EMAIL}`;
    }

    // Default response
    return `Thank you for your message! 🙏\n\nI can help you with:\n💰 Prices & Rates\n📍 Directions to properties\n📅 Room Availability\n❌ Cancellation Policy\n🏊 Amenities\n📝 Booking Process\n\nIf you need human assistance, just type "talk to human" or "help me".\n\nHow can I assist you today?`;
  }

  if (chatSend) {
    chatSend.onclick = sendChatMessage;
  }
  if (chatInput) {
    chatInput.addEventListener("keypress", (e) => {
      if (e.key === "Enter") sendChatMessage();
    });
  }
}

// ==================== DIRECTIONS & MAPS FUNCTIONS ====================
let userLocation = null;
let directionsMapInstance = null;
let currentPropertyCoords = null;

function openDirectionsModal() {
  document.getElementById("directionsModal").style.display = "flex";
  updateDirectionsMap();
}

function closeDirectionsModal() {
  document.getElementById("directionsModal").style.display = "none";
}

function updateDirectionsMap() {
  const property = document.getElementById("directionsProperty").value;
  if (!property || !propertyCoordinates[property]) return;

  currentPropertyCoords = propertyCoordinates[property];

  if (directionsMapInstance) {
    directionsMapInstance.remove();
  }

  directionsMapInstance = L.map("directionsMap").setView(
    [currentPropertyCoords.lat, currentPropertyCoords.lng],
    14,
  );
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png").addTo(
    directionsMapInstance,
  );

  // Add marker for property
  L.marker([currentPropertyCoords.lat, currentPropertyCoords.lng])
    .addTo(directionsMapInstance)
    .bindPopup(`<b>${property}</b><br>${propertyAddresses[property]}`)
    .openPopup();

  document.getElementById("directionsResult").innerHTML = `
        <strong>📍 ${property}</strong><br>
        Address: ${propertyAddresses[property]}<br>
        <a href="${propertyGoogleMapsLinks[property]}" target="_blank" style="color: var(--primary);">
            🗺️ Open in Google Maps
        </a>
    `;
}

function getCurrentLocation() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        userLocation = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
        document.getElementById("manualLocation").value =
          `${userLocation.lat}, ${userLocation.lng}`;
        getDirections();
      },
      () => {
        alert("Unable to get your location. Please enter manually.");
      },
    );
  } else {
    alert("Geolocation not supported. Please enter address manually.");
  }
}

function getDirections() {
  const property = document.getElementById("directionsProperty").value;
  if (!property) {
    alert("Please select a property first");
    return;
  }

  let origin = document.getElementById("manualLocation").value;
  if (!origin && userLocation) {
    origin = `${userLocation.lat},${userLocation.lng}`;
  }

  if (!origin) {
    alert('Please enter your location or use "Use My Location" button');
    return;
  }

  const destination = `${propertyCoordinates[property].lat},${propertyCoordinates[property].lng}`;
  const googleMapsUrl = `https://www.google.com/maps/dir/${encodeURIComponent(origin)}/${destination}`;

  // Open Google Maps with directions
  window.open(googleMapsUrl, "_blank");

  // Also show text directions
  document.getElementById("routeInstructions").innerHTML = `
        <div style="background: var(--bg-primary); padding: 15px; border-radius: 10px;">
            <strong>🚗 Directions to ${property}:</strong><br><br>
            📍 From: ${origin}<br>
            📍 To: ${propertyAddresses[property]}<br><br>
            <a href="${googleMapsUrl}" target="_blank" style="color: var(--primary);">
                🗺️ Click here for full directions on Google Maps
            </a>
        </div>
    `;
}

function openGoogleMaps() {
  const property = document.getElementById("directionsProperty").value;
  if (property && propertyGoogleMapsLinks[property]) {
    window.open(propertyGoogleMapsLinks[property], "_blank");
  } else {
    alert("Please select a property first");
  }
}

function shareLocationViaWhatsApp() {
  const property = document.getElementById("directionsProperty").value;
  if (!property) {
    alert("Please select a property first");
    return;
  }

  const message = `📍 *SONA AIRBNB - ${property}*\n\nAddress: ${propertyAddresses[property]}\n\nGoogle Maps Link: ${propertyGoogleMapsLinks[property]}\n\nI need directions to this property. Can you help me?`;
  const encodedMessage = encodeURIComponent(message);
  window.open(
    `https://wa.me/${OWNER_WHATSAPP}?text=${encodedMessage}`,
    "_blank",
  );
}

// ==================== HUMAN SUPPORT FUNCTIONS ====================
function openHumanSupportModal() {
  document.getElementById("humanSupportModal").style.display = "flex";
}

function closeHumanSupportModal() {
  document.getElementById("humanSupportModal").style.display = "none";
}

function sendSupportRequest() {
  const name = document.getElementById("supportName").value;
  const email = document.getElementById("supportEmail").value;
  const question = document.getElementById("supportQuestion").value;

  if (!name || !email || !question) {
    alert("Please fill all fields");
    return;
  }

  const message = `👨‍💼 *SUPPORT REQUEST*\n\nName: ${name}\nEmail: ${email}\nQuestion: ${question}\n\nPlease respond to this customer.`;
  const encodedMessage = encodeURIComponent(message);
  window.open(
    `https://wa.me/${OWNER_WHATSAPP}?text=${encodedMessage}`,
    "_blank",
  );

  alert(
    "Your message has been sent to support. You will receive a response shortly!",
  );
  closeHumanSupportModal();
  document.getElementById("supportName").value = "";
  document.getElementById("supportEmail").value = "";
  document.getElementById("supportQuestion").value = "";
}

function openWhatsAppSupport() {
  const message = `Hello SONA AIRBNB, I need assistance with my booking. Please help me.`;
  const encodedMessage = encodeURIComponent(message);
  window.open(
    `https://wa.me/${OWNER_WHATSAPP}?text=${encodedMessage}`,
    "_blank",
  );
}

// Make functions global
window.openDirectionsModal = openDirectionsModal;
window.closeDirectionsModal = closeDirectionsModal;
window.getCurrentLocation = getCurrentLocation;
window.getDirections = getDirections;
window.updateDirectionsMap = updateDirectionsMap;
window.openGoogleMaps = openGoogleMaps;
window.shareLocationViaWhatsApp = shareLocationViaWhatsApp;
window.openHumanSupportModal = openHumanSupportModal;
window.closeHumanSupportModal = closeHumanSupportModal;
window.sendSupportRequest = sendSupportRequest;
window.openWhatsAppSupport = openWhatsAppSupport;
// ==================== FAQ SEARCH AND FILTER ====================
function initFAQ() {
  const searchInput = document.getElementById("faqSearch");
  const categoryBtns = document.querySelectorAll(".faq-cat-btn");
  const faqItems = document.querySelectorAll(".faq-item");

  // Category filter
  categoryBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      categoryBtns.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      const category = btn.getAttribute("data-cat");

      faqItems.forEach((item) => {
        if (category === "all" || item.getAttribute("data-cat") === category) {
          item.style.display = "block";
        } else {
          item.style.display = "none";
        }
      });
    });
  });

  // Search filter
  if (searchInput) {
    searchInput.addEventListener("input", () => {
      const searchTerm = searchInput.value.toLowerCase();
      faqItems.forEach((item) => {
        const question = item.querySelector("h3").innerText.toLowerCase();
        const answer = item
          .querySelector(".faq-answer")
          .innerText.toLowerCase();
        if (question.includes(searchTerm) || answer.includes(searchTerm)) {
          item.style.display = "block";
        } else {
          item.style.display = "none";
        }
      });
    });
  }

  // Accordion functionality
  faqItems.forEach((item) => {
    const question = item.querySelector("h3");
    question.addEventListener("click", () => {
      const isOpen = item.classList.contains("open");
      faqItems.forEach((i) => i.classList.remove("open"));
      if (!isOpen) {
        item.classList.add("open");
      }
    });
  });
}

// Call initFAQ when page loads
// Add this to your DOMContentLoaded:
// initFAQ();
// ==================== CHATBOT TOGGLE ====================
function initChatbotToggle() {
  const toggleBtn = document.getElementById("chatbotToggleBtn");
  const chatbot = document.getElementById("chatbot");
  const chatClose = document.getElementById("chatClose");
  const chatMinimize = document.getElementById("chatMinimize");

  if (toggleBtn) {
    toggleBtn.addEventListener("click", () => {
      if (chatbot.classList.contains("open")) {
        chatbot.classList.remove("open");
        toggleBtn.innerHTML = '<i class="fas fa-comment-dots"></i>';
      } else {
        chatbot.classList.add("open");
        toggleBtn.innerHTML = '<i class="fas fa-times"></i>';
      }
    });
  }

  if (chatClose) {
    chatClose.addEventListener("click", () => {
      chatbot.classList.remove("open");
      toggleBtn.innerHTML = '<i class="fas fa-comment-dots"></i>';
    });
  }

  if (chatMinimize) {
    let isMinimized = false;
    chatMinimize.addEventListener("click", () => {
      const chatBody = document.getElementById("chatBody");
      if (!isMinimized) {
        chatBody.style.display = "none";
        chatMinimize.innerHTML = "+";
        isMinimized = true;
      } else {
        chatBody.style.display = "flex";
        chatMinimize.innerHTML = "−";
        isMinimized = false;
      }
    });
  }
}

// Call this in DOMContentLoaded
// initChatbotToggle();
// ==================== FAQ SEARCH, FILTER, AND ACCORDION ====================
function initFAQ() {
  const searchInput = document.getElementById("faqSearch");
  const categoryBtns = document.querySelectorAll(".faq-cat-btn");
  const faqItems = document.querySelectorAll(".faq-item");

  // Accordion functionality - toggle answer when clicking question
  faqItems.forEach((item) => {
    const question = item.querySelector("h3");
    question.addEventListener("click", (e) => {
      e.stopPropagation();
      // Close all other items
      faqItems.forEach((otherItem) => {
        if (otherItem !== item && otherItem.classList.contains("open")) {
          otherItem.classList.remove("open");
        }
      });
      // Toggle current item
      item.classList.toggle("open");
    });
  });

  // Category filter
  categoryBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      categoryBtns.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      const category = btn.getAttribute("data-cat");

      faqItems.forEach((item) => {
        if (category === "all" || item.getAttribute("data-cat") === category) {
          item.style.display = "block";
        } else {
          item.style.display = "none";
        }
      });
    });
  });

  // Search filter
  if (searchInput) {
    searchInput.addEventListener("input", () => {
      const searchTerm = searchInput.value.toLowerCase().trim();
      let visibleCount = 0;

      faqItems.forEach((item) => {
        const question = item.querySelector("h3").innerText.toLowerCase();
        const answer = item
          .querySelector(".faq-answer")
          .innerText.toLowerCase();

        if (
          searchTerm === "" ||
          question.includes(searchTerm) ||
          answer.includes(searchTerm)
        ) {
          item.style.display = "block";
          visibleCount++;
        } else {
          item.style.display = "none";
        }
      });

      // Show message if no results
      const container = document.querySelector(".faq-container");
      let noResultsMsg = document.getElementById("noResultsMsg");
      if (visibleCount === 0 && searchTerm !== "") {
        if (!noResultsMsg) {
          noResultsMsg = document.createElement("div");
          noResultsMsg.id = "noResultsMsg";
          noResultsMsg.style.textAlign = "center";
          noResultsMsg.style.padding = "40px";
          noResultsMsg.style.color = "var(--text-secondary)";
          noResultsMsg.innerHTML = `🔍 No results found for "${searchTerm}".<br>Try different keywords or browse categories above.`;
          container.appendChild(noResultsMsg);
        }
      } else if (noResultsMsg) {
        noResultsMsg.remove();
      }
    });
  }
}

// Call this in your DOMContentLoaded
// initFAQ();
// Add this line inside your DOMContentLoaded function
document.addEventListener("DOMContentLoaded", () => {
  loadAllBookings();
  initNavigation();
  initSlideshow();
  initAuth();
  initBooking();
  initAdvancedChatbot();
  initReviews();
  initCurrencyConverter();
  initProfile();
  initCustomerTheme();
  initChatbotToggle(); // Add this
  initFAQ(); // Add this
  checkUserSession();
  displayUserBookings();
  loadSavedReviews();
  initLocationMap();
  loadLeafletForDirections();
});
