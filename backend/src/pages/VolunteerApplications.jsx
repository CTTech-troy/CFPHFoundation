import React, { useEffect, useState } from 'react';
import { Card, CardHeader } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { EyeIcon, CheckIcon, TrashIcon, FilterIcon } from 'lucide-react';
import { rtdb, ref, onValue, update, remove } from '../firebase';
import Swal from 'sweetalert2';
import 'sweetalert2/dist/sweetalert2.min.css';

export default function VolunteerApplications() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedApp, setSelectedApp] = useState(null);

  useEffect(() => {
    const applicationsRef = ref(rtdb, 'volunteers');
    const unsubscribe = onValue(applicationsRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        const formattedData = Object.keys(data).map((key) => ({
          id: key,
          ...data[key],
        }));
        setApplications(formattedData);
      } else {
        setApplications([]);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Toggle Approve/Unapprove Handler
  const handleApprove = async (id, currentStatus) => {
    const appRef = ref(rtdb, `volunteers/${id}`);
    const action = currentStatus ? 'Unapprove' : 'Approve';
    const confirmButtonColor = currentStatus ? '#d97706' : '#16a34a'; // orange for unapprove, green for approve

    Swal.fire({
      title: `${action} Volunteer?`,
      text: `This will ${action.toLowerCase()} this volunteer.`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor,
      cancelButtonColor: '#d1d5db',
      confirmButtonText: `Yes, ${action}`
    }).then(async (result) => {
      if (result.isConfirmed) {
        await update(appRef, { approved: !currentStatus });

        // Update local state immediately
        setApplications((prev) =>
          prev.map((app) =>
            app.id === id ? { ...app, approved: !currentStatus } : app
          )
        );

        Swal.fire(`${action}d!`, `The volunteer has been ${action.toLowerCase()}d.`, 'success');
        console.log(`NOTIFICATION: Volunteer ${action.toLowerCase()}d ✅`);
      }
    });
  };

  // Delete Handler
  const handleDelete = async (id) => {
    const appRef = ref(rtdb, `volunteers/${id}`);
    Swal.fire({
      title: 'Delete Application?',
      text: 'This action cannot be undone.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc2626',
      cancelButtonColor: '#d1d5db',
      confirmButtonText: 'Yes, Delete'
    }).then(async (result) => {
      if (result.isConfirmed) {
        await remove(appRef);

        setApplications((prev) => prev.filter((app) => app.id !== id));

        Swal.fire('Deleted!', 'The application has been removed.', 'success');
        console.log('NOTIFICATION: Volunteer deleted ❌');
      }
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Volunteer Applications</h1>
        <Button variant="outline" icon={<FilterIcon size={16} />}>Filter</Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-medium text-gray-900">Applications</h2>
            <span className="text-sm text-gray-500">
              {loading ? 'Loading...' : `${applications.length} total`}
            </span>
          </div>
        </CardHeader> 

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Contact</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Interest</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date Applied</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {applications.length === 0 && !loading ? (
                <tr>
                  <td colSpan="6" className="text-center py-6 text-gray-500">
                    No applications found
                  </td>
                </tr>
              ) : (
                applications.map(application => (
                  <tr key={application.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{application.fullName}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{application.email}</div>
                      <div className="text-sm text-gray-500">{application.phone}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 text-xs bg-gray-100 text-gray-800 rounded-full">
                        {application.interest || 'None'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          application.approved
                            ? 'bg-green-100 text-green-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}
                      >
                        {application.approved ? 'Approved' : 'Pending'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {application.timestamp
                        ? new Date(application.timestamp).toLocaleDateString()
                        : 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          icon={<EyeIcon size={14} />}
                          onClick={() => setSelectedApp(application)}
                        >
                          View
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          icon={<CheckIcon size={14} />}
                          onClick={() => handleApprove(application.id, application.approved)}
                        >
                          {application.approved ? 'Unapprove' : 'Approve'}
                        </Button>
                        <Button
                          variant="danger"
                          size="sm"
                          icon={<TrashIcon size={14} />}
                          onClick={() => handleDelete(application.id)}
                        >
                          Delete
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Modal */}
      {selectedApp && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 backdrop-blur-md z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl transform transition-all scale-95 hover:scale-100">
            <h3 className="text-2xl font-bold mb-4 text-gray-800 border-b pb-2">
              Volunteer Details
            </h3>
            <div className="space-y-2 text-gray-700">
              <p><strong>Name:</strong> {selectedApp.fullName}</p>
              <p><strong>Email:</strong> {selectedApp.email}</p>
              <p><strong>Phone:</strong> {selectedApp.phone}</p>
              <p><strong>Interest:</strong> {selectedApp.interest || 'None'}</p>
              <p><strong>Status:</strong> {selectedApp.approved ? 'Approved' : 'Pending'}</p>
              <p><strong>Reason:</strong> {selectedApp.reason || 'N/A'}</p>
              <p><strong>Date Applied:</strong> {selectedApp.timestamp ? new Date(selectedApp.timestamp).toLocaleString() : 'N/A'}</p>
            </div>

            <div className="flex justify-end mt-6 space-x-3">
              <Button
                variant="outline"
                onClick={() => setSelectedApp(null)}
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
