// Media Manager
export const mediaItems = [{
  id: 1,
  title: 'Community Garden Project',
  imageUrl: 'https://images.unsplash.com/photo-1464638681273-0962e9b53566?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80',
  published: true,
  dateAdded: '2023-04-15T10:30:00Z'
}, {
  id: 2,
  title: 'Volunteer Training Session',
  imageUrl: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80',
  published: true,
  dateAdded: '2023-05-20T14:45:00Z'
}, {
  id: 3,
  title: 'Education Outreach Program',
  imageUrl: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80',
  published: false,
  dateAdded: '2023-06-05T09:15:00Z'
}, {
  id: 4,
  title: 'Fundraising Gala',
  imageUrl: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80',
  published: true,
  dateAdded: '2023-06-12T18:30:00Z'
}, {
  id: 5,
  title: 'Clean Water Initiative',
  imageUrl: 'https://images.unsplash.com/photo-1519750783826-e2420f4d687f?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80',
  published: true,
  dateAdded: '2023-07-01T11:20:00Z'
}, {
  id: 6,
  title: 'Youth Leadership Workshop',
  imageUrl: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80',
  published: false,
  dateAdded: '2023-07-18T13:45:00Z'
}];
// Testimonials
export const testimonials = [{
  id: 1,
  title: 'Life-Changing Support',
  description: "The assistance I received from this NGO completely transformed my family's situation. We now have access to clean water and educational opportunities.",
  author: 'Maria Rodriguez',
  category: 'Beneficiary',
  published: true
}, {
  id: 2,
  title: 'Incredible Volunteer Experience',
  description: 'Volunteering with this organization has been the most rewarding experience of my life. The team is dedicated and the impact is real.',
  author: 'John Smith',
  category: 'Volunteer',
  published: true
}, {
  id: 3,
  title: 'Transparent Use of Donations',
  description: 'As a long-time donor, I appreciate how transparent this NGO is about how funds are used. I can see the direct impact of every dollar.',
  author: 'Robert Johnson',
  category: 'Donor',
  published: true
}, {
  id: 4,
  title: 'Community Transformation',
  description: 'Our village has seen remarkable improvements since this NGO began working here. From healthcare to education, everything has improved.',
  author: 'Amara Okafor',
  category: 'Beneficiary',
  published: false
}];
// Programs
export const programs = [{
  id: 1,
  title: 'Clean Water Initiative',
  description: 'Providing clean water solutions to rural communities through well construction and water purification systems.',
  published: true
}, {
  id: 2,
  title: 'Education For All',
  description: 'Supporting education through school construction, teacher training, and scholarship programs for underprivileged children.',
  published: true
}, {
  id: 3,
  title: 'Community Healthcare',
  description: 'Mobile clinics and healthcare education programs targeting preventable diseases in remote communities.',
  published: false
}, {
  id: 4,
  title: 'Sustainable Agriculture',
  description: 'Training farmers in sustainable practices to improve crop yields and ensure food security.',
  published: true
}];
// Donations
export const donations = [{
  id: 1,
  donorName: 'Sarah Williams',
  amount: 500,
  method: 'Card',
  date: '2023-07-15T14:30:00Z',
  campaign: 'General Fund'
}, {
  id: 2,
  donorName: 'Michael Chen',
  amount: 1000,
  method: 'Transfer',
  date: '2023-07-10T09:45:00Z',
  campaign: 'Education Program'
}, {
  id: 3,
  donorName: 'Emily Johnson',
  amount: 250,
  method: 'Google Pay',
  date: '2023-07-05T16:20:00Z',
  campaign: 'Clean Water Project'
}, {
  id: 4,
  donorName: 'David Thompson',
  amount: 750,
  method: 'Card',
  date: '2023-06-28T11:15:00Z',
  campaign: 'Healthcare Initiative'
}, {
  id: 5,
  donorName: 'Lisa Garcia',
  amount: 300,
  method: 'Google Pay',
  date: '2023-06-20T13:40:00Z',
  campaign: 'General Fund'
}];
// Volunteer Applications
export const volunteerApplications = [{
  id: 1,
  name: 'James Wilson',
  email: 'james.wilson@example.com',
  phone: '(555) 123-4567',
  interests: ['Education', 'Community Outreach'],
  status: 'Pending',
  dateApplied: '2023-07-10T10:30:00Z'
}, {
  id: 2,
  name: 'Sophia Martinez',
  email: 'sophia.m@example.com',
  phone: '(555) 987-6543',
  interests: ['Healthcare', 'Fundraising'],
  status: 'Approved',
  dateApplied: '2023-07-05T14:15:00Z'
}, {
  id: 3,
  name: 'Daniel Lee',
  email: 'daniel.lee@example.com',
  phone: '(555) 456-7890',
  interests: ['Environmental Projects', 'Event Planning'],
  status: 'Pending',
  dateApplied: '2023-07-01T09:45:00Z'
}, {
  id: 4,
  name: 'Olivia Brown',
  email: 'olivia.b@example.com',
  phone: '(555) 234-5678',
  interests: ['Social Media', 'Grant Writing'],
  status: 'Approved',
  dateApplied: '2023-06-25T16:20:00Z'
}];
// Events
export const events = [{
  id: 1,
  title: 'Annual Fundraising Gala',
  date: '2023-09-15',
  time: '18:00',
  location: 'Grand Ballroom, Hilton Hotel',
  description: 'Our biggest fundraising event of the year featuring dinner, live music, and an auction.',
  attendees: 120,
  reminders: 45
}, {
  id: 2,
  title: 'Community Clean-up Day',
  date: '2023-08-20',
  time: '09:00',
  location: 'Riverside Park',
  description: 'Join us for a day of cleaning up our local park and waterways.',
  attendees: 35,
  reminders: 28
}, {
  id: 3,
  title: 'Educational Workshop Series',
  date: '2023-08-05',
  time: '14:00',
  location: 'Community Center',
  description: 'A series of workshops on sustainable living practices for local communities.',
  attendees: 50,
  reminders: 22
}];
// Blog Posts
export const blogPosts = [{
  id: 1,
  title: 'The Impact of Clean Water on Community Health',
  excerpt: 'Exploring how our clean water initiatives have improved health outcomes in rural communities.',
  imageUrl: 'https://images.unsplash.com/photo-1581244277943-fe4a9c777189?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80',
  author: 'Dr. Emma Roberts',
  date: '2023-07-01',
  published: true
}, {
  id: 2,
  title: 'Education as a Path to Empowerment',
  excerpt: 'How our education programs are creating opportunities for underprivileged children.',
  imageUrl: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80',
  author: 'Marcus Johnson',
  date: '2023-06-15',
  published: true
}, {
  id: 3,
  title: 'Sustainable Farming Techniques for Small-Scale Farmers',
  excerpt: 'Innovative farming methods that are improving yields and protecting the environment.',
  imageUrl: 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80',
  author: 'Priya Sharma',
  date: '2023-05-28',
  published: false
}];
// FAQs
export const faqs = [{
  id: 1,
  question: 'How can I donate to your organization?',
  answer: 'You can donate through our website using credit/debit card or Google Pay, or set up a direct bank transfer. We also accept checks by mail to our office address.'
}, {
  id: 2,
  question: 'What percentage of my donation goes directly to programs?',
  answer: "We, re proud that 85% of all donations go directly to our program work. The remaining 15% covers essential administrative and fundraising costs.'"
}, {
  id: 3,
  question: 'How can I volunteer with your organization?',
  answer: 'You can apply to volunteer through our website by filling out the volunteer application form. We have opportunities both locally and internationally.'
}, {
  id: 4,
  question: 'Are donations tax-deductible?',
  answer: 'Yes, we are a registered 501(c)(3) organization, and all donations are tax-deductible to the extent allowed by law.'
}];
// Form Submissions
export const formSubmissions = [{
  id: 1,
  firstName: 'Thomas',
  lastName: 'Anderson',
  email: 'thomas.anderson@example.com',
  message: "I, d like to learn more about your clean water projects in East Africa and how my company might support them.'",
  dateSubmitted: '2023-07-15T10:30:00Z'
}, {
  id: 2,
  firstName: 'Michelle',
  lastName: 'Wong',
  email: 'michelle.w@example.com',
  message: "I, m a teacher interested in having someone from your organization speak to my students about global water issues.'",
  dateSubmitted: '2023-07-12T14:45:00Z'
}, {
  id: 3,
  firstName: 'Robert',
  lastName: 'Davis',
  email: 'robert.davis@example.com',
  message: "I, d like to discuss a potential partnership between our organizations for the upcoming community development project.'",
  dateSubmitted: '2023-07-08T09:15:00Z'
}];
// Newsletter Subscribers
export const newsletterSubscribers = [{
  id: 1,
  email: 'jennifer.smith@example.com',
  dateSubscribed: '2023-06-10T11:30:00Z',
  source: 'Website'
}, {
  id: 2,
  email: 'carlos.rodriguez@example.com',
  dateSubscribed: '2023-06-05T15:45:00Z',
  source: 'Event'
}, {
  id: 3,
  email: 'sarah.johnson@example.com',
  dateSubscribed: '2023-05-28T09:20:00Z',
  source: 'Social Media'
}, {
  id: 4,
  email: 'michael.wong@example.com',
  dateSubscribed: '2023-05-15T14:10:00Z',
  source: 'Website'
}, {
  id: 5,
  email: 'rachel.green@example.com',
  dateSubscribed: '2023-05-10T16:30:00Z',
  source: 'Newsletter Signup Form'
}];
// Event Highlights
export const eventHighlights = [{
  id: 1,
  title: 'Community Garden Opening',
  imageUrl: 'https://images.unsplash.com/photo-1591857177580-dc82b9ac4e1e?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80',
  date: '2023-06-15',
  published: true
}, {
  id: 2,
  title: 'Youth Leadership Summit',
  imageUrl: 'https://images.unsplash.com/photo-1517048676732-d65bc937f952?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80',
  date: '2023-05-28',
  published: true
}, {
  id: 3,
  title: 'Volunteer Appreciation Day',
  imageUrl: 'https://images.unsplash.com/photo-1526976668912-1a811878dd37?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80',
  date: '2023-05-10',
  published: false
}];
// Google Ads Campaigns
export const adCampaigns = [{
  id: 1,
  name: 'Summer Donation Drive',
  status: 'Active',
  budget: 500,
  spent: 324.5,
  clicks: 1245,
  impressions: 15678,
  ctr: 7.94,
  startDate: '2023-06-01',
  endDate: '2023-08-31'
}, {
  id: 2,
  name: 'Volunteer Recruitment',
  status: 'Active',
  budget: 300,
  spent: 187.25,
  clicks: 876,
  impressions: 9543,
  ctr: 9.18,
  startDate: '2023-07-15',
  endDate: '2023-09-15'
}, {
  id: 3,
  name: 'Annual Fundraising Gala',
  status: 'Paused',
  budget: 450,
  spent: 112.8,
  clicks: 523,
  impressions: 6234,
  ctr: 8.39,
  startDate: '2023-08-01',
  endDate: '2023-09-15'
}, {
  id: 4,
  name: 'Community Awareness Program',
  status: 'Draft',
  budget: 250,
  spent: 0,
  clicks: 0,
  impressions: 0,
  ctr: 0,
  startDate: '2023-09-01',
  endDate: '2023-10-31'
}];