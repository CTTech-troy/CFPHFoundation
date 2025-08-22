import React, { useEffect, useState } from 'react';
import { Card, CardHeader } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { EyeIcon, TrashIcon, FilterIcon, DownloadIcon } from 'lucide-react';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import { rtdb } from '../firebase'; // Adjust path if needed
import { ref, onValue, remove } from 'firebase/database';

const MySwal = withReactContent(Swal);

export default function FormSubmissions() {
  const [submissions, setSubmissions] = useState([]);
  const [filterActive, setFilterActive] = useState(false);

  // Fetch data from RTDB
  useEffect(() => {
    const submissionsRef = ref(rtdb, 'messages');
    onValue(submissionsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const formatted = Object.keys(data).map((key) => ({
          id: key,
          ...data[key],
        }));
        setSubmissions(formatted.reverse());
      } else {
        setSubmissions([]);
      }
    });
  }, []);

  // View message in modal
  const handleView = (submission) => {
    MySwal.fire({
      title: `${submission.firstName} ${submission.lastName}`,
      html: `
        <p><strong>Email:</strong> ${submission.email}</p>
        <p><strong>Message:</strong></p>
        <p>${submission.message}</p>
      `,
      icon: 'info',
      confirmButtonText: 'Close',
    });
  };

  // Delete message
  const handleDelete = async (id) => {
    const confirm = await MySwal.fire({
      title: 'Are you sure?',
      text: "This submission will be deleted permanently.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!'
    });

    if (confirm.isConfirmed) {
      try {
        await remove(ref(rtdb, `messages/${id}`));
        setSubmissions((prev) => prev.filter((sub) => sub.id !== id));

        MySwal.fire({
          icon: 'success',
          title: 'Deleted!',
          text: 'The submission has been removed.',
          toast: true,
          position: 'top-end',
          showConfirmButton: false,
          timer: 2000
        });
      } catch (error) {
        console.error(error);
        MySwal.fire({
          icon: 'error',
          title: 'Failed!',
          text: 'Could not delete the submission.',
          toast: true,
          position: 'top-end',
          showConfirmButton: false,
          timer: 3000
        });
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Form Submissions</h1>
        <div className="flex space-x-3">
          <Button
            variant={filterActive ? "default" : "outline"}
            icon={<FilterIcon size={16} />}
            onClick={() => setFilterActive(!filterActive)}
          >
            {filterActive ? "Filter Active" : "Filter"}
          </Button>
          <Button variant="outline" icon={<DownloadIcon size={16} />}>
            Export
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-medium text-gray-900">
              Contact Form Submissions
            </h2>
            <span className="text-sm text-gray-500">
              {submissions.length} submissions
            </span>
          </div>
        </CardHeader>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Message
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody className="bg-white divide-y divide-gray-200">
              {submissions.map((submission) => (
                <tr key={submission.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {submission.firstName} {submission.lastName}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{submission.email}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-500 line-clamp-1">
                      {submission.message}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {submission.timestamp
                      ? new Date(submission.timestamp).toLocaleDateString()
                      : 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        icon={<EyeIcon size={14} />}
                        onClick={() => handleView(submission)}
                      >
                        View
                      </Button>
                      <Button
                        variant="danger"
                        size="sm"
                        icon={<TrashIcon size={14} />}
                        onClick={() => handleDelete(submission.id)}
                      >
                        Delete
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
