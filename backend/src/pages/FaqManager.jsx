import React, { useState, useEffect } from 'react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { PlusIcon, GripIcon, TrashIcon, HelpCircleIcon, PencilIcon } from 'lucide-react';

// Firebase
import { rtdb } from "../firebase"; 
import { ref, push, set, onValue, remove, update } from "firebase/database";

// SweetAlert2
import Swal from "sweetalert2";

export default function FaqManager() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  // ✅ Fetch FAQs from RTDB
  useEffect(() => {
    const faqsRef = ref(rtdb, "faqs");
    onValue(faqsRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        const formatted = Object.entries(data).map(([id, value]) => ({
          id,
          ...value,
        }));
        setItems(formatted);
      } else {
        setItems([]); // no data
      }
      setLoading(false);
    });
  }, []);

  const handleOpenModal = (item = null) => {
    setEditingItem(item);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setEditingItem(null);
    setIsModalOpen(false);
  };

  // ✅ Log notifications to RTDB
  const logNotification = (type, message) => {
    const notifRef = ref(rtdb, "notifications");
    const newNotif = {
      type, // add | update | delete
      message,
      timestamp: Date.now(),
    };
    push(notifRef, newNotif);
    console.log("Notification logged:", newNotif);
  };

  // ✅ Save / Update FAQ in RTDB
  const handleSaveFaq = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const question = formData.get("question");
    const answer = formData.get("answer");

    const newFaq = { question, answer, timestamp: Date.now() };
    console.log("Saving FAQ format:", newFaq);

    if (editingItem) {
      // Update existing FAQ
      const faqRef = ref(rtdb, `faqs/${editingItem.id}`);
      update(faqRef, newFaq);
      logNotification("update", `FAQ updated: ${question}`);
    } else {
      // Add new FAQ
      const faqsRef = ref(rtdb, "faqs");
      const newRef = push(faqsRef);
      set(newRef, newFaq);
      logNotification("add", `FAQ added: ${question}`);
    }

    handleCloseModal();
  };

  // ✅ Delete FAQ with SweetAlert confirm
  const handleDelete = (id, question) => {
    Swal.fire({
      title: "Are you sure?",
      text: `Do you really want to delete: "${question}"?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#e3342f",
      cancelButtonColor: "#6c757d",
      confirmButtonText: "Yes, delete it!",
    }).then((result) => {
      if (result.isConfirmed) {
        const faqRef = ref(rtdb, `faqs/${id}`);
        remove(faqRef);
        logNotification("delete", `FAQ deleted: ${question}`);
        Swal.fire("Deleted!", "FAQ has been deleted.", "success");
      }
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">FAQ Manager</h1>
        <Button onClick={() => handleOpenModal()} icon={<PlusIcon size={16} />}>
          Add FAQ
        </Button>
      </div>

      <Card>
        <div className="p-4 border-b border-gray-200">
          <p className="text-sm text-gray-500">
            FAQs are synced with Realtime Database.
          </p>
        </div>
        <div className="divide-y divide-gray-200">
          {loading ? (
            <p className="p-4 text-gray-500">Loading...</p>
          ) : items.length === 0 ? (
            <p className="p-4 text-gray-500">No data found</p>
          ) : (
            items.map((faq) => (
              <div key={faq.id} className="p-4 hover:bg-gray-50">
                <div className="flex items-start">
                  <div className="mr-3 cursor-move text-gray-400">
                    <GripIcon size={20} />
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <div className="flex items-start">
                        <div className="mr-2 mt-0.5 text-blue-600">
                          <HelpCircleIcon size={16} />
                        </div>
                        <h3 className="font-medium text-gray-900">
                          {faq.question}
                        </h3>
                      </div>
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleOpenModal(faq)}
                          icon={<PencilIcon size={14} />}
                        >
                          Edit
                        </Button>
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => handleDelete(faq.id, faq.question)}
                          icon={<TrashIcon size={14} />}
                        >
                          Delete
                        </Button>
                      </div>
                    </div>
                    <div className="mt-2 pl-6 text-sm text-gray-600">
                      {faq.answer}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </Card>

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editingItem ? "Edit FAQ" : "Add FAQ"}
      >
        <form onSubmit={handleSaveFaq}>
          <div className="space-y-4">
            <div>
              <label
                htmlFor="question"
                className="block text-sm font-medium text-gray-700"
              >
                Question
              </label>
              <input
                type="text"
                id="question"
                name="question"
                defaultValue={editingItem?.question || ""}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm"
                required
              />
            </div>
            <div>
              <label
                htmlFor="answer"
                className="block text-sm font-medium text-gray-700"
              >
                Answer
              </label>
              <textarea
                id="answer"
                name="answer"
                rows={4}
                defaultValue={editingItem?.answer || ""}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm"
                required
              />
            </div>
            <div className="flex justify-end space-x-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleCloseModal}
              >
                Cancel
              </Button>
              <Button type="submit">
                {editingItem ? "Update FAQ" : "Add FAQ"}
              </Button>
            </div>
          </div>
        </form>
      </Modal>
    </div>
  );
}
