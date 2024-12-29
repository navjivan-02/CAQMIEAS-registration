// Import necessary Firebase services
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.1/firebase-app.js";
import { getFirestore, collection, getDocs, doc, setDoc, getDoc, addDoc } from "https://www.gstatic.com/firebasejs/9.22.1/firebase-firestore.js";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCkSratKJWrvR-bPkL3VU06wV0vpZK7FGI",
  authDomain: "caqmieas.firebaseapp.com",
  projectId: "caqmieas",
  storageBucket: "caqmieas.firebasestorage.app",
  messagingSenderId: "135425429054",
  appId: "1:135425429054:web:b0feff7191d167ca4b4b6f",
  measurementId: "G-52GKQRNZ7V",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// DOM Elements
const industryList = document.getElementById("industryList");
const addIndustryBtn = document.getElementById("addIndustryBtn");
const industryForm = document.getElementById("industryForm");
const stationForm = document.getElementById("stationForm");
const successPopup = document.getElementById("successPopup");
const doneBtn = document.getElementById("doneBtn");
const confirmIndustryBtn = document.getElementById("confirmIndustryBtn");

// Load industries and populate dropdown
const loadIndustries = async () => {
  try {
    const industriesSnapshot = await getDocs(collection(db, "industries"));
    const industries = [];

    industriesSnapshot.forEach((docSnapshot) => {
      industries.push({
        id: docSnapshot.id,
        name: docSnapshot.data().name,
      });
    });

    industries.sort((a, b) => a.name.localeCompare(b.name));

    industryList.innerHTML = "";

    // Default "select" option
    const defaultOption = document.createElement("option");
    defaultOption.value = "";
    defaultOption.textContent = "Select here";
    defaultOption.disabled = true;
    defaultOption.selected = true;
    industryList.appendChild(defaultOption);

    industries.forEach((industry) => {
      const option = document.createElement("option");
      option.value = industry.id;
      option.textContent = industry.name;
      industryList.appendChild(option);
    });
  } catch (error) {
    console.error("Error loading industries:", error);
    alert("Failed to load industries. Please try again.");
  }
};

// Show add industry form
addIndustryBtn.addEventListener("click", () => {
  industryForm.style.display = "block";
  document.getElementById("industrySelection").style.display = "none";
});

// Add industry form submission
document.getElementById("industryFormFields").addEventListener("submit", async (e) => {
  e.preventDefault();

  const name = document.getElementById("industryName").value.trim();
  const location = document.getElementById("industryLocation").value.trim();
  const phone = document.getElementById("industryPhone").value.trim();
  const email = document.getElementById("industryEmail").value.trim();

  // Validate phone number (must be exactly 10 digits)
  const phoneRegex = /^[0-9]{10}$/;
  if (!phoneRegex.test(phone)) {
    alert("Invalid phone number! Please enter a 10-digit phone number.");
    return;
  }

  // Validate email (basic validation)
  if (!email.includes("@") || !email.includes(".")) {
    alert("Invalid email address! Please enter a valid email.");
    return;
  }

  if (!name || !location || !phone || !email) {
    alert("All fields are required!");
    return;
  }

  const submitButton = document.querySelector('button[type="submit"]');
  submitButton.disabled = true;

  try {
    const industryID = "IRG" + Math.random().toString(36).substr(2, 3).toUpperCase();

    const industryDocRef = doc(db, "industries", industryID);
    const docSnapshot = await getDoc(industryDocRef);

    if (docSnapshot.exists()) {
      throw new Error("Duplicate Industry ID detected. Try again.");
    }

    await setDoc(industryDocRef, {
      name,
      location,
      contact_info: { phone, email },
    });

    industryForm.style.display = "none";
    successPopup.style.display = "block";
  } catch (error) {
    console.error("Error registering industry:", error);
    alert("Failed to register industry. Please try again.");
  } finally {
    submitButton.disabled = false;
  }
});


// Add station
document.getElementById("stationFormFields").addEventListener("submit", async (e) => {
  e.preventDefault();

  const stationID = document.getElementById("stationID").value.trim();
  const stationName = document.getElementById("stationName").value.trim();
  const stationLocation = document.getElementById("stationLocation").value.trim();
  const dateOfInstallation = new Date();

  if (!stationID || !stationName || !stationLocation) {
    alert("All fields are required!");
    return;
  }

  try {
    const selectedIndustryId = industryList.value;

    const stationRef = doc(db, "industries", selectedIndustryId, "stations", stationID);
    const stationSnapshot = await getDoc(stationRef);

    if (stationSnapshot.exists()) {
      alert("Station ID already exists. Please use a different ID.");
      return;
    }

    await setDoc(stationRef, {
      station_name: stationName,
      installation_point: stationLocation,
      date_of_installation: dateOfInstallation,
    });

    stationForm.style.display = "none";
    successPopup.style.display = "block";
  } catch (error) {
    console.error("Error registering station:", error);
    alert("Failed to register station. Please try again.");
  }
});

// Confirm industry selection
confirmIndustryBtn.addEventListener("click", () => {
  const selectedIndustryId = industryList.value;

  if (!selectedIndustryId) {
    alert("Please select an industry.");
    return;
  }

  document.getElementById("industrySelection").style.display = "none";
  stationForm.style.display = "block";

  document.getElementById("selectedIndustryName").textContent =
    industryList.options[industryList.selectedIndex].textContent;
});

// Reload page on success
doneBtn.addEventListener("click", () => window.location.reload());

// Load industries on page load
window.onload = loadIndustries;
