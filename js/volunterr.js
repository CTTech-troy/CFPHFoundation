import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import { getDatabase, ref, push } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyCQc8HJ9SDTDR0rGiIzzamr44VdQvtuAvo",
  authDomain: "cfphfoundation.firebaseapp.com",
  projectId: "cfphfoundation",
  storageBucket: "cfphfoundation.appspot.com",
  messagingSenderId: "164594658812",
  appId: "1:164594658812:web:a13657916de5a5f8109679",
  measurementId: "G-0TCTKDZSP9",
  databaseURL: "https://cfphfoundation-default-rtdb.firebaseio.com"
};

const app = initializeApp(firebaseConfig);
const rtdb = getDatabase(app);

document.getElementById('volunteerForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const button = e.target.querySelector('button[type="submit"]');
    button.textContent = "Submitting...";
    button.disabled = true;

    const fullName = document.getElementById('fullName').value.trim();
    const email = document.getElementById('email').value.trim();
    const phone = document.getElementById('phone').value.trim();
    const interest = document.getElementById('interest').value;
    const reason = document.getElementById('reason').value.trim();

    if (!fullName || !email || !phone || !interest || !reason) {
        Swal.fire('Error', 'Please fill out all fields.', 'error');
        button.textContent = "Submit Application";
        button.disabled = false;
        return;
    }

    try {
        const volunteersRef = ref(rtdb, 'volunteers');
        await push(volunteersRef, {
            fullName,
            email,
            phone,
            interest,
            reason,
            approved: false, // <-- NEW BOOLEAN FIELD
            timestamp: new Date().toISOString()
        });

        Swal.fire('Success', 'Thank you for registering as a volunteer!', 'success');
        e.target.reset();
    } catch (error) {
        console.error(error);
        Swal.fire('Error', 'Failed to submit your application. Try again.', 'error');
    } finally {
        button.textContent = "Submit Application";
        button.disabled = false;
    }
});
