document.addEventListener('DOMContentLoaded', function() {
const navbar = document.getElementById('navbar');
const navLogo = document.getElementById('nav-logo');
window.addEventListener('scroll', function() {
if (window.scrollY > 50) {
navbar.classList.add('navbar-scrolled');
navLogo.classList.remove('text-white');
navLogo.classList.add('text-secondary');
const navLinks = navbar.querySelectorAll('a');
navLinks.forEach(link => {
if (!link.classList.contains('bg-primary')) {
link.classList.remove('text-white');
link.classList.add('text-secondary');
}
});
} else {
navbar.classList.remove('navbar-scrolled');
navLogo.classList.remove('text-secondary');
navLogo.classList.add('text-white');
const navLinks = navbar.querySelectorAll('a');
navLinks.forEach(link => {
if (!link.classList.contains('bg-primary')) {
link.classList.remove('text-secondary');
link.classList.add('text-white');
}
});
}
});
});
document.addEventListener('DOMContentLoaded', function() {
const mobileMenuBtn = document.getElementById('mobile-menu-btn');
const mobileMenu = document.getElementById('mobile-menu');
const closeMenuBtn = document.getElementById('close-menu');
mobileMenuBtn.addEventListener('click', function() {
mobileMenu.classList.add('open');
});
closeMenuBtn.addEventListener('click', function() {
mobileMenu.classList.remove('open');
});
mobileMenu.addEventListener('click', function(e) {
if (e.target === mobileMenu) {
mobileMenu.classList.remove('open');
}
});
});
document.addEventListener('DOMContentLoaded', function() {
const observerOptions = {
threshold: 0.1,
rootMargin: '0px 0px -50px 0px'
};
const observer = new IntersectionObserver(function(entries) {
entries.forEach(entry => {
if (entry.isIntersecting) {
entry.target.classList.add('visible');
setTimeout(() => {
entry.target.style.transition = 'all 0.3s ease';
}, 500);
}
});
}, observerOptions);
document.querySelectorAll('.fade-in').forEach(el => {
observer.observe(el);
});
});
document.addEventListener('DOMContentLoaded', function() {
const counters = document.querySelectorAll('.counter');
const observerOptions = {
threshold: 0.5
};
const observer = new IntersectionObserver(function(entries) {
entries.forEach(entry => {
if (entry.isIntersecting) {
const counter = entry.target;
const target = parseInt(counter.getAttribute('data-target'));
const duration = 1000;
const increment = target / (duration / 16);
let current = 0;
const updateCounter = () => {
current += increment;
if (current < target) {
counter.textContent = Math.floor(current).toLocaleString();
requestAnimationFrame(updateCounter);
} else {
counter.textContent = target.toLocaleString();
}
};
counter.classList.add('animate-counter');
updateCounter();
observer.unobserve(counter);
}
}); 
}, observerOptions);
counters.forEach(counter => {
observer.observe(counter);
});
});
document.addEventListener('DOMContentLoaded', function() {
const donationCards = document.querySelectorAll('.donation-card');
const monthlyBtn = document.getElementById('monthly-btn');
const onetimeBtn = document.getElementById('onetime-btn');
const usdBtn = document.getElementById('usd-btn');
const ngnBtn = document.getElementById('ngn-btn');
const transferBtn = document.getElementById('transfer-btn');
const transferModal = document.getElementById('transfer-modal');
const closeModal = document.getElementById('close-modal');
const paymentMethods = document.querySelectorAll('.payment-method');
const copyBtn = document.querySelector('.copy-btn');
let currentCurrency = 'USD';
const exchangeRate = 1200; // NGN to USD rate
function updateDonationAmounts(currency) {
donationCards.forEach(card => {
const amount = parseInt(card.getAttribute('data-amount'));
const displayAmount = currency === 'USD' ? amount : amount * exchangeRate;
const symbol = currency === 'USD' ? '$' : '₦';
card.querySelector('.text-2xl').textContent = `${symbol}${displayAmount.toLocaleString()}`;
});
}
donationCards.forEach(card => {
card.addEventListener('click', function() {
donationCards.forEach(c => c.classList.remove('selected'));
this.classList.add('selected');
});
});
monthlyBtn.addEventListener('click', function() {
monthlyBtn.classList.add('bg-primary', 'text-white');
monthlyBtn.classList.remove('text-gray-600');
onetimeBtn.classList.remove('bg-primary', 'text-white');
onetimeBtn.classList.add('text-gray-600');
});
onetimeBtn.addEventListener('click', function() {
onetimeBtn.classList.add('bg-primary', 'text-white');
onetimeBtn.classList.remove('text-gray-600');
monthlyBtn.classList.remove('bg-primary', 'text-white');
monthlyBtn.classList.add('text-gray-600');
});
usdBtn.addEventListener('click', function() {
usdBtn.classList.add('bg-primary', 'text-white');
usdBtn.classList.remove('text-gray-600');
ngnBtn.classList.remove('bg-primary', 'text-white');
ngnBtn.classList.add('text-gray-600');
currentCurrency = 'USD';
updateDonationAmounts('USD');
});
ngnBtn.addEventListener('click', function() {
ngnBtn.classList.add('bg-primary', 'text-white');
ngnBtn.classList.remove('text-gray-600');
usdBtn.classList.remove('bg-primary', 'text-white');
usdBtn.classList.add('text-gray-600');
currentCurrency = 'NGN';
updateDonationAmounts('NGN');
});
paymentMethods.forEach(method => {
method.addEventListener('click', function() {
paymentMethods.forEach(m => {
m.classList.remove('bg-primary', 'text-white');
m.classList.add('hover:border-primary');
});
this.classList.add('bg-primary', 'text-white');
this.classList.remove('hover:border-primary');
if (this.id === 'transfer-btn') {
transferModal.classList.remove('hidden');
}
});
});
closeModal.addEventListener('click', function() {
transferModal.classList.add('hidden');
});
transferModal.addEventListener('click', function(e) {
if (e.target === transferModal) {
transferModal.classList.add('hidden');
}
});
copyBtn.addEventListener('click', function() {
const accountNumber = '1028535101';
navigator.clipboard.writeText(accountNumber).then(() => {
const icon = this.querySelector('i');
icon.classList.remove('ri-file-copy-line');
icon.classList.add('ri-check-line');
setTimeout(() => {
icon.classList.remove('ri-check-line');
icon.classList.add('ri-file-copy-line');
}, 2000);
});
});
});
document.addEventListener('DOMContentLoaded', function() {
const testimonials = document.querySelectorAll('.testimonial-card');
const dots = document.querySelectorAll('.testimonial-dot');
let currentSlide = 0;
function showSlide(index) {
testimonials.forEach((testimonial, i) => {
testimonial.classList.remove('active');
if (i === index) {
testimonial.classList.add('active');
}
});
dots.forEach((dot, i) => {
if (i === index) {
dot.classList.remove('bg-gray-300');
dot.classList.add('bg-primary');
} else {
dot.classList.remove('bg-primary');
dot.classList.add('bg-gray-300');
}
});
}
function nextSlide() {
currentSlide = (currentSlide + 1) % testimonials.length;
showSlide(currentSlide);
}
dots.forEach((dot, index) => {
dot.addEventListener('click', function() {
currentSlide = index;
showSlide(currentSlide);
});
});
setInterval(nextSlide, 5000);
});
document.addEventListener('DOMContentLoaded', function() {
const faqQuestions = document.querySelectorAll('.faq-question');
faqQuestions.forEach(question => {
question.addEventListener('click', function() {
const faqItem = this.closest('.faq-item');
const answer = faqItem.querySelector('.faq-answer');
const icon = this.querySelector('i');
const isOpen = !answer.classList.contains('hidden');
document.querySelectorAll('.faq-answer').forEach(a => a.classList.add('hidden'));
document.querySelectorAll('.faq-question i').forEach(i => {
i.classList.remove('ri-subtract-line');
i.classList.add('ri-add-line');
});
if (!isOpen) {
answer.classList.remove('hidden');
icon.classList.remove('ri-add-line');
icon.classList.add('ri-subtract-line');
}
});
});
});
document.addEventListener('DOMContentLoaded', function() {
const reminderBtns = document.querySelectorAll('.reminder-btn');
reminderBtns.forEach(btn => {
btn.addEventListener('click', function() {
const eventDetails = this.closest('.p-6');
const title = eventDetails.querySelector('.text-2xl').textContent;
const subtitle = eventDetails.querySelector('.text-xl').textContent;
const dateTime = eventDetails.querySelectorAll('.flex.items-center span');
const date = dateTime[0].textContent;
const time = dateTime[1].textContent;
const location = dateTime[2].textContent;

if ('Notification' in window) {
Notification.requestPermission().then(permission => {
if (permission === 'granted') {
const originalContent = this.innerHTML;
this.innerHTML = '<i class="ri-check-line mr-2"></i>Reminder Set';
this.classList.add('bg-green-600');

// Parse date and time
const [month, day, year] = date.split(' ');
const [startTime, endTime] = time.split(' - ');
const monthNum = new Date(Date.parse(month + " 1, 2024")).getMonth() + 1;
const formattedDate = `${year}${monthNum.toString().padStart(2, '0')}${day.replace(',', '').padStart(2, '0')}`;

// Convert time to 24-hour format
const convertTo24Hour = (time12h) => {
const [time, modifier] = time12h.split(' ');
let [hours, minutes] = time.split(':');
if (hours === '12') {
hours = '00';
}
if (modifier === 'PM') {
hours = parseInt(hours, 10) + 12;
}
return `${hours.toString().padStart(2, '0')}${minutes}00`;
};

const startDateTime = formattedDate + 'T' + convertTo24Hour(startTime);
const endDateTime = formattedDate + 'T' + convertTo24Hour(endTime);

const eventText = `${title} - ${subtitle}\nTime: ${time}\nLocation: ${location}`;
const googleCalendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(title)}&details=${encodeURIComponent(eventText)}&location=${encodeURIComponent(location)}&dates=${startDateTime}/${endDateTime}`;

window.open(googleCalendarUrl, '_blank');

// Reset button after 2 seconds
setTimeout(() => {
this.innerHTML = '<i class="ri-notification-line mr-2"></i>Set Reminder';
this.classList.remove('bg-green-600');
}, 2000);
}
});
}
});
});
});
document.addEventListener('DOMContentLoaded', function() {
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
anchor.addEventListener('click', function (e) {
e.preventDefault();
const target = document.querySelector(this.getAttribute('href'));
if (target) {
target.scrollIntoView({
behavior: 'smooth',
block: 'start'
});
}
});
});
const donateNavBtn = document.getElementById('donate-nav-btn');
if (donateNavBtn) {
donateNavBtn.addEventListener('click', function() {
const donateSection = document.getElementById('donate');
if (donateSection) {
donateSection.scrollIntoView({
behavior: 'smooth',
block: 'start'
});
}
});
}
});
  function showError() {
    event.preventDefault(); // stop link from reloading the page
    Swal.fire({
      icon: 'error',
      title: 'Transfer Error',
      text: 'Transaction could not be processed. Please try again or make use of the transfer details provided.',
      confirmButtonColor: '#16a34a' // green confirm button
    });
  }
