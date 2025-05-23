document.addEventListener("DOMContentLoaded", () => {
  // Initialize the content
  loadPage("home");

  // Add click event listeners to navigation links
  document.querySelectorAll(".nav-links a").forEach((link) => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      const page = e.target.dataset.page;
      loadPage(page);

      // Update active state
      document
        .querySelectorAll(".nav-links a")
        .forEach((a) => a.classList.remove("active"));
      e.target.classList.add("active");
    });
  });

  // Start auto-updating opening hours
  updateOpeningStatus();
  setInterval(updateOpeningStatus, 60000); // Update every minute
});

// Product data
const products = [
  {
    name: "Wit Brood",
    category: "brood",
    price: "€2,50",
    description: "Klassiek wit brood",
  },
  {
    name: "Meergranen",
    category: "brood",
    price: "€3,00",
    description: "Gezond meergranenbrood",
  },
  {
    name: "Chocoladetaart",
    category: "taart",
    price: "€18,50",
    description: "Rijke chocoladetaart",
  },
  {
    name: "Appeltaart",
    category: "taart",
    price: "€15,00",
    description: "Hollandse appeltaart",
  },
  {
    name: "Krentenbollen",
    category: "broodjes",
    price: "€0,75",
    description: "Met rozijnen",
  },
  {
    name: "Chocoladekoekjes",
    category: "koekjes",
    price: "€3,50",
    description: "Per 6 stuks",
  },
];

// Check if the bakery is currently open
function isCurrentlyOpen() {
  const now = new Date();
  const day = now.getDay(); // 0 = Sunday, 1 = Monday, etc.
  const hour = now.getHours();
  const minute = now.getMinutes();
  const currentTime = hour + minute / 60;

  const openingHours = {
    0: { open: 8, close: 12 }, // Sunday
    1: { open: 7, close: 18 }, // Monday
    2: { open: 7, close: 18 }, // Tuesday
    3: { open: 7, close: 18 }, // Wednesday
    4: { open: 7, close: 18 }, // Thursday
    5: { open: 7, close: 18 }, // Friday
    6: { open: 7, close: 16 }, // Saturday
  };

  const todayHours = openingHours[day];
  return currentTime >= todayHours.open && currentTime < todayHours.close;
}

// Update the opening status in the DOM
function updateOpeningStatus() {
  const statusElement = document.querySelector(".opening-status");
  if (statusElement) {
    const isOpen = isCurrentlyOpen();
    statusElement.textContent = isOpen ? "Nu Geopend" : "Nu Gesloten";
    statusElement.className = `opening-status ${isOpen ? "open" : "closed"}`;
  }
}

// Filter products based on search input
function filterProducts(searchTerm) {
  return products.filter(
    (product) =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description.toLowerCase().includes(searchTerm.toLowerCase())
  );
}

// Render product cards
function renderProductCards(products) {
  return products
    .map(
      (product) => `
    <div class="product-card" data-category="${product.category}">
      <h3>${product.name}</h3>
      <p>${product.description}</p>
      <p class="price">${product.price}</p>
      <button onclick="addToCart('${product.name}', '${product.price}')" class="add-to-cart">
        In winkelwagen
      </button>
    </div>
  `
    )
    .join("");
}

// Shopping cart functionality
let cart = [];

function addToCart(name, price) {
  const existingItem = cart.find((item) => item.name === name);
  if (existingItem) {
    existingItem.quantity += 1;
  } else {
    cart.push({ name, price, quantity: 1 });
  }
  updateCartCount();
  showNotification(`${name} toegevoegd aan winkelwagen!`);
  updateCartOverlay();
}

function updateCartCount() {
  const cartCount = document.querySelector(".cart-count");
  if (cartCount) {
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    cartCount.textContent = totalItems;
  }
}

function calculateTotal() {
  return cart
    .reduce((total, item) => {
      const price = parseFloat(item.price.replace("€", "").replace(",", "."));
      return total + price * item.quantity;
    }, 0)
    .toFixed(2);
}

function updateCartOverlay() {
  const cartContent = document.querySelector(".cart-content");
  if (!cartContent) return;

  if (cart.length === 0) {
    cartContent.innerHTML = `
      <button class="close-cart" onclick="toggleCart()">
        <i class="fas fa-times"></i>
      </button>
      <h2>Winkelwagen</h2>
      <p>Uw winkelwagen is leeg</p>
    `;
    return;
  }

  cartContent.innerHTML = `
    <button class="close-cart" onclick="toggleCart()">
      <i class="fas fa-times"></i>
    </button>
    <h2>Winkelwagen</h2>
    <div class="cart-items">
      ${cart
        .map(
          (item) => `
        <div class="cart-item">
          <div class="item-info">
            <h3>${item.name}</h3>
            <p>Prijs: ${item.price}</p>
          </div>
          <div class="item-quantity">
            <button onclick="updateQuantity('${item.name}', -1)">-</button>
            <span>${item.quantity}</span>
            <button onclick="updateQuantity('${item.name}', 1)">+</button>
          </div>
          <button class="remove-item" onclick="removeFromCart('${item.name}')">
            <i class="fas fa-trash"></i>
          </button>
        </div>
      `
        )
        .join("")}
    </div>
    <div class="cart-total">
      <h3>Totaal: €${calculateTotal()}</h3>
      <button onclick="loadPage('checkout')" class="checkout-button">Afrekenen</button>
    </div>
  `;
}

function updateQuantity(name, change) {
  const item = cart.find((item) => item.name === name);
  if (item) {
    item.quantity += change;
    if (item.quantity <= 0) {
      removeFromCart(name);
    } else {
      updateCartCount();
      updateCartOverlay();
    }
  }
}

function removeFromCart(name) {
  cart = cart.filter((item) => item.name !== name);
  updateCartCount();
  updateCartOverlay();
  showNotification("Product verwijderd uit winkelwagen");
}

function toggleCart() {
  const overlay = document.querySelector(".cart-overlay");
  if (overlay) {
    overlay.classList.toggle("show");
    if (overlay.classList.contains("show")) {
      updateCartOverlay();
    }
  }
}

function showNotification(message) {
  const notification = document.createElement("div");
  notification.className = "notification";
  notification.textContent = message;
  document.body.appendChild(notification);

  // Animate notification
  setTimeout(() => {
    notification.classList.add("show");
    setTimeout(() => {
      notification.classList.remove("show");
      setTimeout(() => {
        notification.remove();
      }, 300);
    }, 2000);
  }, 100);
}

function loadPage(page) {
  const content = document.getElementById("content");

  switch (page) {
    case "home":
      content.innerHTML = `
                <div class="welcome-section">
                    <div class="welcome-text">
                        <h1>Welkom bij De Gouden Korst</h1>
                        <p>Al meer dan 30 jaar bakken wij met passie de lekkerste broden en gebakjes voor onze klanten. 
                           Onze bakkerij staat bekend om zijn ambachtelijke bereiding en gebruik van de beste ingrediënten.</p>
                        <p>Meesterbakker Jan de Vries en zijn team staan elke dag vroeg op om verse producten te maken 
                           voor onze gewaardeerde klanten.</p>
                    </div>
                    <div class="welcome-image">
                        <img src="images/Bakkerij.png" alt="Onze Bakkerij" />
                    </div>
                </div>

                <div class="info-section">
                    <h2>Openingstijden <span class="opening-status"></span></h2>
                    <div class="opening-hours">
                        <div class="hours-item">
                            <span>Maandag t/m Vrijdag:</span>
                            <span>07:00 - 18:00</span>
                        </div>
                        <div class="hours-item">
                            <span>Zaterdag:</span>
                            <span>07:00 - 16:00</span>
                        </div>
                        <div class="hours-item">
                            <span>Zondag:</span>
                            <span>08:00 - 12:00</span>
                        </div>
                    </div>

                    <h2>Onze Specialiteiten</h2>
                    <div class="specialties">
                        <div class="specialty-item" onmouseover="this.classList.add('hover')" onmouseout="this.classList.remove('hover')">
                            <h3>Ambachtelijk Desembrood</h3>
                            <p>Ons desembrood wordt op traditionele wijze bereid met eigen desemcultuur. 
                               Een proces dat 24 uur duurt voor de perfecte smaak en structuur.</p>
                        </div>
                        <div class="specialty-item" onmouseover="this.classList.add('hover')" onmouseout="this.classList.remove('hover')">
                            <h3>Seizoensgebak</h3>
                            <p>We volgen de seizoenen met onze specialiteiten: 
                               oliebollen in de winter, paasstol in het voorjaar, 
                               fruitvlaai in de zomer en speculaas in de herfst.</p>
                        </div>
                        <div class="specialty-item" onmouseover="this.classList.add('hover')" onmouseout="this.classList.remove('hover')">
                            <h3>Verjaardagstaarten</h3>
                            <p>Maak uw feest compleet met onze op maat gemaakte taarten. 
                               Bestel minimaal 48 uur van tevoren voor een persoonlijk ontwerp.</p>
                        </div>
                    </div>

                    <h2>Over Ons</h2>
                    <div class="about-section">
                        <p>De Gouden Korst is een familiebedrijf dat al drie generaties lang de fijnste 
                           bakkersproducten maakt. Opgericht in 1992 door Jan de Vries Sr., wordt de 
                           bakkerij nu gerund door zijn zoon Jan jr. en diens kinderen.</p>
                        <p>Wij geloven in:</p>
                        <ul class="values-list">
                            <li>100% natuurlijke ingrediënten</li>
                            <li>Dagelijks vers gebakken producten</li>
                            <li>Traditionele bereidingswijzen</li>
                            <li>Persoonlijke service</li>
                        </ul>
                    </div>

                    <h2>Locatie</h2>
                    <div class="location-info">
                        <p><strong>Adres:</strong> Bakkerijstraat 123, 1234 AB Broodstad</p>
                        <p><strong>Telefoon:</strong> 012-3456789</p>
                        <p><strong>Email:</strong> info@degoudenkorst.nl</p>
                    </div>
                </div>
            `;
      updateOpeningStatus();
      break;

    case "assortiment":
      content.innerHTML = `
                <h1>Ons Assortiment</h1>
                <div class="search-section">
                    <input type="text" id="productSearch" placeholder="Zoek in ons assortiment..." 
                           class="search-input">
                    <div class="category-filters">
                        <button class="filter-btn active" data-category="all">Alles</button>
                        <button class="filter-btn" data-category="brood">Brood</button>
                        <button class="filter-btn" data-category="taart">Taarten</button>
                        <button class="filter-btn" data-category="koekjes">Koekjes</button>
                    </div>
                </div>
                <div class="products-grid">
                    ${renderProductCards(products)}
                </div>

                <!-- Shopping Cart Overlay -->
                <div class="cart-overlay">
                    <div class="cart-content">
                        <button class="close-cart" onclick="toggleCart()">
                            <i class="fas fa-times"></i>
                        </button>
                        <!-- Cart items will be loaded here -->
                    </div>
                </div>

                <!-- Shopping Cart Widget -->
                <div class="cart-widget" onclick="toggleCart()">
                    <span class="cart-count">0</span>
                    <i class="fas fa-shopping-cart"></i>
                </div>
            `;

      // Add event listeners for search and filters
      const searchInput = document.getElementById("productSearch");
      if (searchInput) {
        searchInput.addEventListener("input", (e) => {
          const filtered = filterProducts(e.target.value);
          document.querySelector(".products-grid").innerHTML =
            renderProductCards(filtered);
        });
      }

      // Add event listeners for category filters
      document.querySelectorAll(".filter-btn").forEach((btn) => {
        btn.addEventListener("click", (e) => {
          // Update active state
          document
            .querySelectorAll(".filter-btn")
            .forEach((b) => b.classList.remove("active"));
          e.target.classList.add("active");

          // Filter products
          const category = e.target.dataset.category;
          const filtered =
            category === "all"
              ? products
              : products.filter((p) => p.category === category);
          document.querySelector(".products-grid").innerHTML =
            renderProductCards(filtered);
        });
      });

      // Add click event listener to close cart when clicking outside
      document.addEventListener("click", (e) => {
        const cartOverlay = document.querySelector(".cart-overlay");
        const cartWidget = document.querySelector(".cart-widget");

        if (
          cartOverlay &&
          cartOverlay.classList.contains("show") &&
          !cartOverlay.contains(e.target) &&
          !cartWidget.contains(e.target)
        ) {
          toggleCart();
        }
      });

      // Update cart count
      updateCartCount();
      break;

    case "contact":
      content.innerHTML = `
                <h1>Contact</h1>
                <form class="contact-form" id="contactForm">
                    <div class="form-group">
                        <label for="name">Naam:</label>
                        <input type="text" id="name" name="name" required>
                        <span class="validation-message"></span>
                    </div>
                    <div class="form-group">
                        <label for="email">E-mailadres:</label>
                        <input type="email" id="email" name="email" required>
                        <span class="validation-message"></span>
                    </div>
                    <div class="form-group">
                        <label for="subject">Onderwerp:</label>
                        <select id="subject" name="subject" required>
                            <option value="">Kies een onderwerp</option>
                            <option value="bestelling">Bestelling plaatsen</option>
                            <option value="informatie">Informatie aanvragen</option>
                            <option value="klacht">Klacht indienen</option>
                            <option value="anders">Anders</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="message">Bericht:</label>
                        <textarea id="message" name="message" rows="5" required></textarea>
                        <span class="validation-message"></span>
                    </div>
                    <div class="form-group">
                        <label>
                            <input type="checkbox" id="newsletter" name="newsletter">
                            Ja, ik wil de nieuwsbrief ontvangen
                        </label>
                    </div>
                    <button type="submit">Verstuur</button>
                </form>
            `;

      // Enhanced form validation and submission
      const form = document.getElementById("contactForm");
      if (form) {
        // Real-time validation
        form.querySelectorAll("input, textarea").forEach((input) => {
          input.addEventListener("input", (e) => {
            validateField(e.target);
          });
        });

        form.addEventListener("submit", (e) => {
          e.preventDefault();

          // Validate all fields
          let isValid = true;
          form.querySelectorAll("input, textarea").forEach((input) => {
            if (!validateField(input)) {
              isValid = false;
            }
          });

          if (isValid) {
            const name = document.getElementById("name").value;
            const email = document.getElementById("email").value;
            const subject = document.getElementById("subject").value;
            const message = document.getElementById("message").value;
            const newsletter = document.getElementById("newsletter").checked;

            // Show success message with animation
            showNotification(
              `Bedankt voor uw bericht, ${name}! We nemen zo spoedig mogelijk contact met u op.`
            );
            form.reset();
          }
        });
      }
      break;

    case "checkout":
      if (cart.length === 0) {
        showNotification("Uw winkelwagen is leeg");
        loadPage("assortiment");
        return;
      }

      content.innerHTML = `
        <h1>Afrekenen</h1>
        <div class="checkout-container">
          <div class="order-summary">
            <h2>Uw bestelling</h2>
            <div class="order-items">
              ${cart
                .map(
                  (item) => `
                <div class="order-item">
                  <span>${item.quantity}x ${item.name}</span>
                  <span>${item.price}</span>
                </div>
              `
                )
                .join("")}
            </div>
            <div class="order-total">
              <h3>Totaal: €${calculateTotal()}</h3>
            </div>
          </div>

          <form class="checkout-form" id="checkoutForm">
            <h2>Bezorggegevens</h2>
            <div class="form-group">
              <label for="fullName">Naam:</label>
              <input type="text" id="fullName" required>
            </div>
            <div class="form-group">
              <label for="email">E-mail:</label>
              <input type="email" id="email" required>
            </div>
            <div class="form-group">
              <label for="phone">Telefoon:</label>
              <input type="tel" id="phone" required>
            </div>
            <div class="form-group">
              <label for="address">Adres:</label>
              <input type="text" id="address" required>
            </div>
            <div class="form-group">
              <label for="postal">Postcode:</label>
              <input type="text" id="postal" required>
            </div>
            <div class="form-group">
              <label for="city">Plaats:</label>
              <input type="text" id="city" required>
            </div>
            <div class="form-group">
              <label for="delivery">Bezorgmoment:</label>
              <select id="delivery" required>
                <option value="">Kies een bezorgmoment</option>
                <option value="morning">Ochtend (8:00 - 12:00)</option>
                <option value="afternoon">Middag (12:00 - 17:00)</option>
              </select>
            </div>
            <div class="form-group">
              <label>
                <input type="checkbox" id="terms" required>
                Ik ga akkoord met de algemene voorwaarden
              </label>
            </div>
            <button type="submit" class="submit-order">Bestelling plaatsen</button>
          </form>
        </div>
      `;

      // Update the form submission handler
      document
        .getElementById("checkoutForm")
        .addEventListener("submit", handleCheckoutSubmit);
      break;

    case "gouden-koorts":
      content.innerHTML = goudenKoortsContent;
      initGoudenKoorts();
      break;
  }
}

// Form validation helper
function validateField(input) {
  const validationMessage = input.nextElementSibling;
  let isValid = true;
  let message = "";

  if (input.required && !input.value) {
    isValid = false;
    message = "Dit veld is verplicht";
  } else if (input.type === "email" && input.value) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(input.value)) {
      isValid = false;
      message = "Voer een geldig e-mailadres in";
    }
  }

  if (validationMessage) {
    validationMessage.textContent = message;
    validationMessage.style.color = isValid ? "green" : "red";
  }

  input.style.borderColor = isValid ? "#ddd" : "red";
  return isValid;
}

function handleCheckoutSubmit(e) {
  e.preventDefault();

  // Validate all fields
  let isValid = true;
  form.querySelectorAll("input, textarea").forEach((input) => {
    if (!validateField(input)) {
      isValid = false;
    }
  });

  if (isValid) {
    const name = document.getElementById("name").value;

    // Toon bevestigingsbericht
    showNotification(
      `Bedankt voor uw bestelling, ${name}! We gaan direct aan de slag.`
    );

    // Reset winkelwagen
    cart = [];
    updateCartCount();

    // Ga terug naar de homepagina
    setTimeout(() => {
      loadPage("home");
    }, 2000);
  }
}

// Gouden Koorts Functionaliteit
const goudenKoortsData = {
  punten: 0,
  niveau: "Brons",
  dagelijkeDeals: [
    {
      product: "Gouden Croissant",
      originelePrijs: "€2,50",
      dealPrijs: "€1,75",
      eindtijd: null,
    },
    {
      product: "Luxe Krentenbol",
      originelePrijs: "€1,00",
      dealPrijs: "€0,75",
      eindtijd: null,
    },
  ],
};

// Initialiseer de Gouden Koorts deals
function initGoudenKoorts() {
  // Reset deals elke dag om middernacht
  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);

  goudenKoortsData.dagelijkeDeals.forEach((deal) => {
    deal.eindtijd = tomorrow;
  });

  updateGoudenKoortsDeals();
  setInterval(updateGoudenKoortsDeals, 1000); // Update elke seconde
}

// Update de deals en timer
function updateGoudenKoortsDeals() {
  const dealsContainer = document.querySelector(".gouden-koorts-deals");
  if (!dealsContainer) return;

  const now = new Date();

  const dealsHTML = goudenKoortsData.dagelijkeDeals
    .map((deal) => {
      const timeLeft = deal.eindtijd - now;
      const hours = Math.floor(timeLeft / (1000 * 60 * 60));
      const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);

      return `
      <div class="deal-card">
        <h3>${deal.product}</h3>
        <p class="original-price">${deal.originelePrijs}</p>
        <p class="deal-price">${deal.dealPrijs}</p>
        <div class="timer">
          <span>Nog geldig voor: ${hours}:${minutes}:${seconds}</span>
        </div>
        <button onclick="koopDealProduct('${deal.product}')" class="deal-button">
          Koop Nu
        </button>
      </div>
    `;
    })
    .join("");

  dealsContainer.innerHTML = dealsHTML;
}

// Voeg punten toe aan spaarprogramma
function voegPuntenToe(aantalPunten) {
  goudenKoortsData.punten += aantalPunten;
  updateNiveau();
  updatePuntenWeergave();
}

// Update het niveau van de klant
function updateNiveau() {
  const punten = goudenKoortsData.punten;
  if (punten >= 1000) {
    goudenKoortsData.niveau = "Goud";
  } else if (punten >= 500) {
    goudenKoortsData.niveau = "Zilver";
  } else {
    goudenKoortsData.niveau = "Brons";
  }
}

// Update de punten weergave
function updatePuntenWeergave() {
  const puntenElement = document.querySelector(".gouden-koorts-punten");
  if (puntenElement) {
    // Bepaal de niveau-klasse
    let niveauKlasse = "niveau-brons";
    if (goudenKoortsData.punten >= 1000) {
      niveauKlasse = "niveau-goud";
    } else if (goudenKoortsData.punten >= 500) {
      niveauKlasse = "niveau-zilver";
    }

    puntenElement.innerHTML = `
      <div class="punten-status ${niveauKlasse}">
        <h3>Uw Spaarprogramma Status</h3>
        <p>Niveau: ${goudenKoortsData.niveau}</p>
        <p>Punten: ${goudenKoortsData.punten}</p>
        <div class="voortgang-balk">
          <div class="voortgang" style="width: ${Math.min(
            (goudenKoortsData.punten / 1000) * 100,
            100
          )}%">
            ${goudenKoortsData.niveau}
          </div>
        </div>
        <p>Nog ${Math.max(1000 - goudenKoortsData.punten, 0)} punten tot ${
      goudenKoortsData.punten >= 1000 ? "het hoogste niveau!" : "Goud niveau!"
    }</p>
      </div>
    `;
  }
}

// Koop een deal product
function koopDealProduct(productNaam) {
  const deal = goudenKoortsData.dagelijkeDeals.find(
    (d) => d.product === productNaam
  );
  if (deal) {
    addToCart(productNaam, deal.dealPrijs);
    voegPuntenToe(10); // Voeg 10 punten toe voor elke deal aankoop
    showNotification(`${productNaam} toegevoegd aan winkelwagen! +10 punten!`);
  }
}

// Voeg Gouden Koorts pagina toe aan de loadPage functie
const goudenKoortsContent = `
  <div class="gouden-koorts-container">
    <h1>Gouden Koorts Spaarprogramma</h1>
    <div class="gouden-koorts-punten"></div>
    <h2>Dagelijkse Deals</h2>
    <div class="gouden-koorts-deals"></div>
    <div class="voordelen">
      <h2>Uw Voordelen</h2>
      <div class="voordelen-grid">
        <div class="voordeel" data-niveau="brons">
          <h3>Brons Niveau</h3>
          <p>5% korting op alle broden</p>
          <p>Spaar punten met elke aankoop</p>
          <p>Toegang tot dagelijkse deals</p>
        </div>
        <div class="voordeel" data-niveau="zilver">
          <h3>Zilver Niveau</h3>
          <p>10% korting op alle producten</p>
          <p>Exclusieve seizoensaanbiedingen</p>
          <p>Gratis koffie bij elke bestelling</p>
        </div>
        <div class="voordeel" data-niveau="goud">
          <h3>Goud Niveau</h3>
          <p>15% korting + gratis bezorging</p>
          <p>VIP toegang tot nieuwe producten</p>
          <p>Maandelijkse verrassingsbox</p>
        </div>
      </div>
    </div>
  </div>
`;
