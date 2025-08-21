import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import  DashboardLayout from './components/layout/DashboardLayout';
import  Dashboard from './pages/Dashboard';
import  MediaManager from './pages/MediaManager';
import  TestimonialsManager from './pages/TestimonialsManager';
import  ProgramsManager from './pages/ProgramsManager';
import  DonationsTracking from './pages/DonationsTracking';
import  VolunteerApplications from './pages/VolunteerApplications';
import  EventsManager from './pages/EventsManager';
import  BlogManager from './pages/BlogManager';
import  FaqManager from './pages/FaqManager';
import  FormSubmissions from './pages/FormSubmissions';
import  NewsletterList from './pages/NewsletterList';
import  EventHighlights from './pages/EventHighlights';
import  GoogleAdsManager from './pages/GoogleAdsManager';

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<DashboardLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="media" element={<MediaManager />} />
          <Route path="testimonials" element={<TestimonialsManager />} />
          <Route path="programs" element={<ProgramsManager />} />
          <Route path="donations" element={<DonationsTracking />} />
          <Route path="volunteers" element={<VolunteerApplications />} />
          <Route path="events" element={<EventsManager />} />
          <Route path="blog" element={<BlogManager />} />
          <Route path="faq" element={<FaqManager />} />
          <Route path="submissions" element={<FormSubmissions />} />
          <Route path="newsletter" element={<NewsletterList />} />
          <Route path="highlights" element={<EventHighlights />} />
          <Route path="google-ads" element={<GoogleAdsManager />} />
        </Route>
      </Routes>
    </Router>
  );
}