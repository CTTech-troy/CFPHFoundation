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

  // ✅ Fetch notifications from Firebase
  useEffect(() => {
    const notifRef = ref(rtdb, "notifications");
    const unsubscribe = onValue(notifRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        const formatted = Object.keys(data)
          .map(key => ({
            id: key,
            text: data[key].message,
            time: new Date(data[key].time).toLocaleString(),
            type: data[key].type
          }))
          .reverse(); // newest first
        setActivities(formatted);
      } else {
        setActivities([]);
      }
    });
    return () => unsubscribe();
  }, []);

  const stats = [
    {
      title: 'Total Donations',
      value: '$25,650',
      change: '+12%',
      icon: <DollarSignIcon size={24} className="text-green-600" />
    },
    {
      title: 'Volunteer Applications',
      value: '124',
      change: '+8%',
      icon: <UsersIcon size={24} className="text-blue-600" />
    },
    {
      title: 'Upcoming Events',
      value: '7',
      change: '+2',
      icon: <CalendarIcon size={24} className="text-purple-600" />
    },
    {
      title: 'Media Items',
      value: '89',
      change: '+14',
      icon: <ImageIcon size={24} className="text-amber-600" />
    }
  ];
  

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

        {/* ✅ Recent Activity with colored dots */}
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
      activities
        .slice(0, 5) // ✅ show only the 5 most recent
        .map((activity) => {
          let dotColor = "bg-green-500"; // default
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

      {/* Volunteer Status + Upcoming Events (unchanged placeholders) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
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
                    <circle
                      cx="18"
                      cy="18"
                      r="16"
                      fill="none"
                      stroke="#e5e7eb"
                      strokeWidth="2"
                    ></circle>
                    <circle
                      cx="18"
                      cy="18"
                      r="16"
                      fill="none"
                      stroke="#10b981"
                      strokeWidth="2"
                      strokeDasharray="100"
                      strokeDashoffset="25"
                      strokeLinecap="round"
                      transform="rotate(-90 18 18)"
                    ></circle>
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-xl font-bold text-gray-900">75%</span>
                  </div>
                </div>
                <p className="text-sm text-gray-500 mt-2">
                  Application Approval Rate
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4 pt-2">
                <div className="text-center">
                  <p className="text-xl font-bold text-gray-900">42</p>
                  <p className="text-xs text-gray-500">Active Volunteers</p>
                </div>
                <div className="text-center">
                  <p className="text-xl font-bold text-gray-900">16</p>
                  <p className="text-xs text-gray-500">Pending Applications</p>
                </div>
              </div>
            </div>
          </CardContent>

        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center">
              <CalendarIcon size={18} className="text-gray-500 mr-2" />
              <h2 className="text-lg font-medium text-gray-900">Upcoming Events</h2>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start pb-4 border-b border-gray-100">
                <div className="flex-shrink-0 w-12 h-12 bg-green-100 text-green-700 rounded-lg flex flex-col items-center justify-center mr-4">
                  <span className="text-xs font-medium">AUG</span>
                  <span className="text-lg font-bold leading-none">20</span>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-900">
                    Community Clean-up Day
                  </h3>
                  <p className="text-xs text-gray-500 mt-1">
                    Riverside Park • 9:00 AM
                  </p>
                  <div className="flex items-center mt-2">
                    <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                      35 attendees
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-start pb-4 border-b border-gray-100">
                <div className="flex-shrink-0 w-12 h-12 bg-blue-100 text-blue-700 rounded-lg flex flex-col items-center justify-center mr-4">
                  <span className="text-xs font-medium">SEP</span>
                  <span className="text-lg font-bold leading-none">15</span>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-900">
                    Annual Fundraising Gala
                  </h3>
                  <p className="text-xs text-gray-500 mt-1">
                    Grand Ballroom, Hilton Hotel • 6:00 PM
                  </p>
                  <div className="flex items-center mt-2">
                    <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                      120 attendees
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-start">
                <div className="flex-shrink-0 w-12 h-12 bg-purple-100 text-purple-700 rounded-lg flex flex-col items-center justify-center mr-4">
                  <span className="text-xs font-medium">AUG</span>
                  <span className="text-lg font-bold leading-none">5</span>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-900">
                    Educational Workshop Series
                  </h3>
                  <p className="text-xs text-gray-500 mt-1">
                    Community Center • 2:00 PM
                  </p>
                  <div className="flex items-center mt-2">
                    <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full">
                      50 attendees
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
