// Initialize Firebase (only once)
const firebaseConfig = {
    apiKey: "AIzaSyCkSratKJWrvR-bPkL3VU06wV0vpZK7FGI",
    authDomain: "caqmieas.firebaseapp.com",
    projectId: "caqmieas",
    storageBucket: "caqmieas.firebasestorage.app",
    messagingSenderId: "135425429054",
    appId: "1:135425429054:web:b0feff7191d167ca4b4b6f",
    measurementId: "G-52GKQRNZ7V"
  };
  
  // Import necessary Firebase services
  import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.1/firebase-app.js";
  import { getFirestore, collection, getDocs, doc, setDoc, getDoc, addDoc } from "https://www.gstatic.com/firebasejs/9.22.1/firebase-firestore.js";
  
  // Initialize Firebase
  const app = initializeApp(firebaseConfig);
  const db = getFirestore(app);
  
// DOM Elements
const industryList = document.getElementById('industryList');
const addIndustryBtn = document.getElementById('addIndustryBtn');
const industryForm = document.getElementById('industryForm');
const stationForm = document.getElementById('stationForm');
const successPopup = document.getElementById('successPopup');
const doneBtn = document.getElementById('doneBtn');
const confirmIndustryBtn = document.getElementById('confirmIndustryBtn');

// Show Industry List on Page Load
const loadIndustries = async () => {
    try {
      const industriesSnapshot = await getDocs(collection(db, 'industries'));
      const industries = [];
  
      // Collect all industries in an array
      industriesSnapshot.forEach(docSnapshot => {
        industries.push({
          id: docSnapshot.id,
          name: docSnapshot.data().name
        });
      });
  
      // Sort industries alphabetically by name (A-Z)
      industries.sort((a, b) => a.name.localeCompare(b.name));
  
      industryList.innerHTML = ''; // Clear existing options

       // Create and add the default "Select your Industry" option
    const defaultOption = document.createElement('option');
    defaultOption.value = ''; // Empty value to indicate no selection
    defaultOption.textContent = 'select here'; // The text to show
    defaultOption.disabled = true; // Make it non-selectable
    defaultOption.selected = true; // Set it as the default option
    industryList.appendChild(defaultOption);
  
      // Add sorted industries to the list
      industries.forEach(industry => {
        const option = document.createElement('option');
        option.value = industry.id;
        option.textContent = industry.name;
        industryList.appendChild(option);
      });
    } catch (error) {
      console.error('Error loading industries:', error);
      alert('Failed to load industries. Please try again.');
    }
  };
  
  window.onload = loadIndustries;
  

// Register New Industry
addIndustryBtn.addEventListener('click', () => {
  industryForm.style.display = 'block';
  document.getElementById('industrySelection').style.display = 'none';
});

document.getElementById('industryFormFields').addEventListener('submit', async (e) => {
  e.preventDefault();

  const name = document.getElementById('industryName').value.trim();
  const location = document.getElementById('industryLocation').value.trim();
  const phone = document.getElementById('industryPhone').value.trim();
  const email = document.getElementById('industryEmail').value.trim();

  if (!name || !location || !phone || !email) {
    alert('All fields are required!');
    return;
  }

  try {
    // Generate a unique alphanumeric ID (format: IRGXXX)
    const industryID = 'IRG' + Math.random().toString(36).substr(2, 3).toUpperCase();
  
    // Create a new document with the generated industryID
    const industryRef = await setDoc(doc(db, 'industries', industryID), {
      name,
      location,
      contact_info: { phone, email }
    });
  
    // Optionally log the reference or ID
    console.log("Industry added with ID:", industryID);
    

    industryForm.style.display = 'none';
    successPopup.style.display = 'block';

    setTimeout(() => {
      successPopup.style.display = 'none';
      loadIndustries(); // Refresh industry list dynamically
      document.getElementById('industrySelection').style.display = 'block';
    }, 2000);
  } catch (error) {
    console.error('Error registering industry:', error);
    alert('Failed to register industry. Please try again.');
  }
});

// Register Station
document.getElementById('stationFormFields').addEventListener('submit', async (e) => {
  e.preventDefault();

  const stationID = document.getElementById('stationID').value.trim();
  const stationName = document.getElementById('stationName').value.trim();
  const stationLocation = document.getElementById('stationLocation').value.trim();
  const dateOfInstallation = new Date();

  if (!stationID || !stationName || !stationLocation) {
    alert('All fields are required!');
    return;
  }

  try {
    const selectedIndustryId = industryList.value;

    // Check if the station ID exists within the selected industry
    const stationRef = doc(db, 'industries', selectedIndustryId, 'stations', stationID);
    const stationSnapshot = await getDoc(stationRef);
    if (stationSnapshot.exists()) {
      alert('Station ID already exists. Please use a different ID.');
      return;
    }

    // Add station to the selected industry's stations subcollection
    await setDoc(stationRef, {
      station_name: stationName,
      installation_point: stationLocation,
      date_of_installation: dateOfInstallation
    });

    stationForm.style.display = 'none';
    successPopup.style.display = 'block';

    setTimeout(() => {
      successPopup.style.display = 'none';
      window.location.reload();
    }, 2000);
  } catch (error) {
    console.error('Error registering station:', error);
    alert('Failed to register station. Please try again.');
  }
});

// Industry Selection (Confirm button functionality)
confirmIndustryBtn.addEventListener('click', () => {
  const selectedIndustryId= industryList.value;

  if (!selectedIndustryId) {
    alert('Please select an industry.');
    return;
  }

  // Hide the industry selection section
  document.getElementById('industrySelection').style.display = 'none';

  // Show the station registration form
  stationForm.style.display = 'block';
  // Optional: Set a label or display the selected industry's name
  document.getElementById('selectedIndustryName').textContent = industryList.options[industryList.selectedIndex].textContent;
});

// Homepage or Close site after successful station registration
doneBtn.addEventListener('click', () => window.location.reload());
