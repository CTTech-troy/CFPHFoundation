import React, { useEffect, useState } from 'react';
import { rtdb } from "../firebase";
import { ref, onValue } from "firebase/database";
import { Card, CardContent, CardHeader } from '../components/ui/Card';
import { 
  BarChartIcon, 
  UsersIcon, 
  CalendarIcon, 
  ImageIcon, 
  FileTextIcon, 
  DollarSignIcon 
} from 'lucide-react';

export default function Dashboard() {
  const [activities, setActivities] = useState([]);
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [volunteerStats, setVolunteerStats] = useState({
    active: 0,
    pending: 0,
    approvalRate: 0,
  });

  const [stats, setStats] = useState([
    {
      title: 'Total Donations',
      value: '$25,650', 
      change: '+12%',
      icon: <DollarSignIcon size={24} className="text-green-600" />
    },
    {
      title: 'Volunteer Applications',
      value: '0',
      change: '+8%',
      icon: <UsersIcon size={24} className="text-blue-600" />
    },
    {
      title: 'Upcoming Events',
      value: '0',
      change: '+2',
      icon: <CalendarIcon size={24} className="text-purple-600" />
    },
    {
      title: 'Media Items',
      value: '89',
      change: '+14',
      icon: <ImageIcon size={24} className="text-amber-600" />
    }
  ]);

  // Fetch volunteer stats
  useEffect(() => {
    const volunteerRef = ref(rtdb, "volunteers");

    const unsubscribe = onValue(volunteerRef, (snapshot) => {
      const data = snapshot.val() || {};
      const allVolunteers = Object.values(data);

      const activeCount = allVolunteers.filter(v => v.approved === true).length;
      const pendingCount = allVolunteers.filter(v => v.approved === false).length;
      const totalCount = allVolunteers.length;
      const approvalRate = totalCount ? Math.round((activeCount / totalCount) * 100) : 0;

      setVolunteerStats({ active: activeCount, pending: pendingCount, approvalRate });

      // Update Volunteer Applications stat
      setStats(prevStats =>
        prevStats.map(stat =>
          stat.title === 'Volunteer Applications'
            ? { ...stat, value: totalCount.toString() }
            : stat
        )
      );

      console.log("Active Volunteers:", activeCount);
      console.log("Pending Applications:", pendingCount);
    });

    return () => unsubscribe();
  }, []);

  // Fetch upcoming events
  useEffect(() => {
    const eventsRef = ref(rtdb, "EventsManager");
    const unsubscribe = onValue(eventsRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        const parsed = Object.entries(data).map(([id, value]) => ({
          id,
          ...value,
        }));

        const now = new Date();
        const futureEvents = parsed.filter(event => new Date(event.date) >= now);

        const formattedEvents = futureEvents.map(event => {
          const dateObj = new Date(event.date);
          const day = dateObj.getDate();
          const month = dateObj.toLocaleString('en-US', { month: 'short' }).toUpperCase();
          const year = dateObj.getFullYear();
          return { ...event, formattedDay: day, formattedMonth: month, formattedYear: year };
        });

        setUpcomingEvents(formattedEvents);

        // Update Upcoming Events stat
        setStats(prevStats =>
          prevStats.map(stat =>
            stat.title === 'Upcoming Events'
              ? { ...stat, value: futureEvents.length.toString() }
              : stat
          )
        );
      } else {
        setUpcomingEvents([]);
        setStats(prevStats =>
          prevStats.map(stat =>
            stat.title === 'Upcoming Events'
              ? { ...stat, value: '0' }
              : stat
          )
        );
      }
    });

    return () => unsubscribe();
  }, []);

  // Fetch notifications + Volunteer Applications for Recent Activity
  useEffect(() => {
    const notifRef = ref(rtdb, "notifications");
    const volunteerRef = ref(rtdb, "volunteers");

    const unsubscribeNotif = onValue(notifRef, (notifSnap) => {
      const notifData = notifSnap.exists()
        ? Object.entries(notifSnap.val()).map(([key, val]) => ({
            id: key,
            text: val.message || "No message provided",
            time: val.time ? new Date(val.time).toLocaleString() : "Unknown time",
            type: val.type || "added"
          }))
        : [];

      onValue(volunteerRef, (volSnap) => {
        const volunteerData = volSnap.exists()
          ? Object.entries(volSnap.val()).map(([key, val]) => ({
              id: `vol-${key}`,
              text: `New Volunteer Application: ${val.fullName || "Unknown"}`,
              time: val.timestamp ? new Date(val.timestamp).toLocaleString() : "Pending",
              type: "added"
            }))
          : [];

        setActivities([...volunteerData, ...notifData].reverse());
      });
    });

    return () => unsubscribeNotif();
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-500">
          Last updated: {new Date().toLocaleDateString()}
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <Card key={index}>
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-medium text-gray-500">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
                  <p className="text-sm font-medium text-green-600 mt-1">{stat.change}</p>
                </div>
                <div className="p-2 rounded-md bg-gray-50">{stat.icon}</div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Donation Summary + Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Donation Summary */}
        <Card>
          <CardHeader>
            <div className="flex items-center">
              <BarChartIcon size={18} className="text-gray-500 mr-2" />
              <h2 className="text-lg font-medium text-gray-900">Donation Summary</h2>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">Card Payments</span>
                <span className="text-sm font-medium">$12,500</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div className="bg-green-600 h-2.5 rounded-full" style={{ width: '65%' }}></div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">Bank Transfers</span>
                <span className="text-sm font-medium">$8,200</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: '40%' }}></div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">Google Pay</span>
                <span className="text-sm font-medium">$4,950</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div className="bg-purple-600 h-2.5 rounded-full" style={{ width: '25%' }}></div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <div className="flex items-center">
              <FileTextIcon size={18} className="text-gray-500 mr-2" />
              <h2 className="text-lg font-medium text-gray-900">Recent Activity</h2>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 max-h-64 overflow-y-auto pr-2 scrollbar-hide">
              {activities.length === 0 ? (
                <p className="text-sm text-gray-500">No activity yet...</p>
              ) : (
                activities.slice(0, 5).map((activity) => {
                  let dotColor = "bg-green-500";
                  if (activity.type === "deleted") dotColor = "bg-red-500";
                  else if (activity.type === "edited" || activity.type === "updated") dotColor = "bg-yellow-500";

                  return (
                    <div
                      key={activity.id}
                      className="flex items-start pb-4 border-b border-gray-100 last:border-0 last:pb-0"
                    >
                      <div className={`w-2 h-2 mt-1.5 rounded-full mr-3 ${dotColor}`}></div>
                      <div>
                        <p className="text-sm text-gray-700">{activity.text}</p>
                        <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Volunteer Status + Upcoming Events */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Volunteer Status */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <div className="flex items-center">
              <UsersIcon size={18} className="text-gray-500 mr-2" />
              <h2 className="text-lg font-medium text-gray-900">Volunteer Status</h2>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex flex-col items-center">
                <div className="relative w-24 h-24">
                  <svg className="w-full h-full" viewBox="0 0 36 36">
                    <circle cx="18" cy="18" r="16" fill="none" stroke="#e5e7eb" strokeWidth="2" />
                    <circle
                      cx="18"
                      cy="18"
                      r="16"
                      fill="none"
                      stroke="#10b981"
                      strokeWidth="2"
                      strokeDasharray="100"
                      strokeDashoffset={100 - volunteerStats.approvalRate}
                      strokeLinecap="round"
                      transform="rotate(-90 18 18)"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-xl font-bold text-gray-900">{volunteerStats.approvalRate}%</span>
                  </div>
                </div>
                <p className="text-sm text-gray-500 mt-2">
                  Application Approval Rate
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4 pt-2">
                <div className="text-center">
                  <p className="text-xl font-bold text-gray-900">{volunteerStats.active}</p>
                  <p className="text-xs text-gray-500">Active Volunteers</p>
                </div>
                <div className="text-center">
                  <p className="text-xl font-bold text-gray-900">{volunteerStats.pending}</p>
                  <p className="text-xs text-gray-500">Pending Applications</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Upcoming Events */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center">
              <CalendarIcon size={18} className="text-gray-500 mr-2" />
              <h2 className="text-lg font-medium text-gray-900">Upcoming Events</h2>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {upcomingEvents.length === 0 ? (
                <p className="text-sm text-gray-500">No upcoming events...</p>
              ) : (
                upcomingEvents.map((event) => (
                  <div
                    key={event.id}
                    className="flex items-start pb-4 border-b border-gray-100 last:border-0 last:pb-0"
                  >
                    <div className="flex-shrink-0 w-12 h-12 bg-green-100 text-green-700 rounded-lg flex flex-col items-center justify-center mr-4">
                      <span className="text-xs font-medium">{event.formattedMonth}</span>
                      <span className="text-lg font-bold leading-none">{event.formattedDay}</span>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-900">{event.title}</h3>
                      <p className="text-xs text-gray-500 mt-1">
                        {event.location} • {event.time}
                      </p>
                      <div className="flex items-center mt-2">
                        <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                          {event.attendees || 0} attendees
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
