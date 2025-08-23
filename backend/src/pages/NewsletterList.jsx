import React, { useEffect, useState } from "react";
import { Card, CardHeader } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { TrashIcon, DownloadIcon, SendIcon } from "lucide-react";
import { rtdb } from "../firebase";
import { ref, onValue, remove } from "firebase/database";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";

const MySwal = withReactContent(Swal);

function MailModal({ isOpen, onClose, onSend, isSending }) {
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white rounded-2xl p-6 w-full max-w-lg">
        <h2 className="text-xl font-bold mb-4">Send Newsletter</h2>
        <input
          type="text"
          placeholder="Subject"
          className="w-full p-2 border rounded mb-3"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
        />
        <textarea
          placeholder="Write your message here (HTML supported)"
          className="w-full p-2 border rounded mb-3 h-40"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={onClose} disabled={isSending}>
            Cancel
          </Button>
          <Button
            variant="primary"
            icon={<SendIcon size={16} />}
            onClick={() => onSend(subject, message)}
            disabled={isSending}
          >
            {isSending ? "Sending..." : "Send"}
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function NewsletterList() {
  const [subscribers, setSubscribers] = useState([]);
  const [isModalOpen, setModalOpen] = useState(false);
  const [isSending, setIsSending] = useState(false);

  // Fetch subscribers from Firebase RTDB
  useEffect(() => {
    const dbRef = ref(rtdb, "newsletterSubscribers");
    const unsubscribe = onValue(dbRef, (snapshot) => {
      const data = snapshot.val();
      setSubscribers(
        data
          ? Object.entries(data).map(([id, value]) => ({ id, ...value }))
          : []
      );
    });
    return () => unsubscribe();
  }, []);

  // Fetch backend message (for debugging)
  useEffect(() => {
    const fetchMessage = async () => {
      try {
        const response = await fetch(
          "https://cfphfback.onrender.com/api/message"
        );
        const data = await response.json();
        console.log("Backend message:", data.message);
      } catch (error) {
        console.error("Error fetching backend message:", error);
      }
    };
    fetchMessage();
  }, []);

  // Delete subscriber
  const handleDelete = async (id) => {
    const result = await MySwal.fire({
      title: "Are you sure?",
      text: "This subscriber will be removed permanently.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
    });

    if (result.isConfirmed) {
      await remove(ref(rtdb, `newsletterSubscribers/${id}`));
      MySwal.fire("Deleted!", "Subscriber has been removed.", "success");
    }
  };

  // Send newsletter via backend
  const handleSendMail = async (subject, message) => {
    if (!subject.trim() || !message.trim()) {
      MySwal.fire(
        "Missing Information",
        "Please provide both a subject and a message.",
        "error"
      );
      return;
    }

    const emailList = subscribers.map((s) => s.email);

    try {
      setIsSending(true);

      MySwal.fire({
        title: "Sending Newsletter...",
        text: "Please wait while we send your emails.",
        allowOutsideClick: false,
        didOpen: () => {
          MySwal.showLoading();
        },
      });

      const response = await fetch(
        "https://cfphfback.onrender.com/api/sendNewsletter",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            subject,
            html: message,
            emails: emailList,
          }),
        }
      );

      const result = await response.json();

      if (response.ok && result.success) {
        MySwal.fire(
          "Newsletter Sent!",
          `Successfully sent to ${emailList.length} subscribers.`,
          "success"
        );
        setModalOpen(false);
      } else {
        throw new Error(result.error || "Failed to send newsletter.");
      }
    } catch (error) {
      MySwal.fire("Error", error.message, "error");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">
          Newsletter Subscribers
        </h1>
        <div className="flex gap-3">
          <Button
            variant="outline"
            icon={<DownloadIcon size={16} />}
            onClick={() =>
              MySwal.fire(
                "Coming Soon",
                "Export CSV feature coming soon!",
                "info"
              )
            }
          >
            Export CSV
          </Button>
          <Button
            variant="primary"
            icon={<SendIcon size={16} />}
            onClick={() => setModalOpen(true)}
          >
            Send Newsletter
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-medium text-gray-900">Subscribers</h2>
            <span className="text-sm text-gray-500">{subscribers.length} total</span>
          </div>
        </CardHeader>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date Subscribed
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {subscribers.map((subscriber) => (
                <tr key={subscriber.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {subscriber.email}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(subscriber.subscribedAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <Button
                      variant="danger"
                      size="sm"
                      icon={<TrashIcon size={14} />}
                      onClick={() => handleDelete(subscriber.id)}
                    >
                      Delete
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <MailModal
        isOpen={isModalOpen}
        onClose={() => setModalOpen(false)}
        onSend={handleSendMail}
        isSending={isSending}
      />
    </div>
  );
}
