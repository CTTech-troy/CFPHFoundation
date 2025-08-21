import React, { useState, useEffect } from "react";
import { Card, CardContent } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Modal } from "../components/ui/Modal";
import { PlusIcon, EyeIcon, PencilIcon, TrashIcon, QuoteIcon } from "lucide-react";

import { rtdb } from "../firebase";
import { ref, push, set, update, remove, get, child } from "firebase/database";

export default function TestimonialsManager() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [items, setItems] = useState([]);
  const [alert, setAlert] = useState(null);

  // ✅ Fetch testimonials from RTDB
  useEffect(() => {
    const fetchTestimonials = async () => {
      try {
        const snapshot = await get(child(ref(rtdb), "testimonials"));
        if (snapshot.exists()) {
          const data = snapshot.val();
          const formatted = Object.keys(data).map((key) => ({
            id: key,
            ...data[key],
          }));
          setItems(formatted);
        } else {
          setItems([]);
          showAlert("No testimonials found", "error");
        }
      } catch (error) {
        console.error("RTDB fetch error:", error);
        showAlert("Failed to load testimonials", "error");
      }
    };
    fetchTestimonials();
  }, []);

  const showAlert = (message, type = "success") => {
    setAlert({ message, type });
    setTimeout(() => setAlert(null), 3000);
  };

  // ✅ Helper: log activity into notifications
  const logNotification = async (message, type) => {
    try {
      const notifRef = push(ref(rtdb, "notifications"));
      await set(notifRef, {
        message,
        type, // "added", "edited", "deleted"
        time: Date.now(),
      });
    } catch (error) {
      console.error("Notification log error:", error);
    }
  };

  const handleOpenModal = (item = null) => {
    setEditingItem(item);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setEditingItem(null);
    setIsModalOpen(false);
  };

  // ✅ Save testimonial (Add / Edit in RTDB)
  const handleSaveTestimonial = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const title = formData.get("title");
    const description = formData.get("description");
    const author = formData.get("author");
    const category = formData.get("category");
    const published = formData.get("published") !== null;

    try {
      if (editingItem) {
        // Update existing testimonial
        await update(ref(rtdb, `testimonials/${editingItem.id}`), {
          title,
          description,
          author,
          category,
          published,
        });

        setItems((prev) =>
          prev.map((item) =>
            item.id === editingItem.id
              ? { ...item, title, description, author, category, published }
              : item
          )
        );
        showAlert("Testimonial updated successfully");

        // 🟡 Log edit notification
        await logNotification(`Testimonial "${title}" was edited.`, "edited");
      } else {
        // Add new testimonial
        const newRef = push(ref(rtdb, "testimonials"));
        const newItem = { title, description, author, category, published };
        await set(newRef, newItem);

        setItems((prev) => [...prev, { id: newRef.key, ...newItem }]);
        showAlert("Testimonial added successfully");

        // 🟢 Log add notification
        await logNotification(`New testimonial "${title}" was added.`, "added");
      }
      handleCloseModal();
    } catch (error) {
      console.error("Save error:", error);
      showAlert("Failed to save testimonial", "error");
    }
  };

  // ✅ Delete testimonial
  const handleDelete = async (id) => {
    try {
      const item = items.find((i) => i.id === id);
      await remove(ref(rtdb, `testimonials/${id}`));
      setItems(items.filter((i) => i.id !== id));
      showAlert("Testimonial deleted successfully");

      // 🔴 Log delete notification
      await logNotification(`Testimonial "${item?.title}" was deleted.`, "deleted");
    } catch (error) {
      console.error("Delete error:", error);
      showAlert("Failed to delete testimonial", "error");
    }
  };

  // ✅ Toggle publish
  const handleTogglePublish = async (id) => {
    try {
      const item = items.find((t) => t.id === id);
      await update(ref(rtdb, `testimonials/${id}`), {
        published: !item.published,
      });

      setItems((prev) =>
        prev.map((t) =>
          t.id === id ? { ...t, published: !t.published } : t
        )
      );
      showAlert(
        `Testimonial ${item.published ? "unpublished" : "published"} successfully`
      );

      // (Optional: log publish/unpublish)
      await logNotification(
        `Testimonial "${item.title}" was ${item.published ? "unpublished" : "published"}.`,
        "updated"
      );
    } catch (error) {
      console.error("Publish toggle error:", error);
      showAlert("Failed to update publish status", "error");
    }
  };

  return (
    <div className="space-y-6">
      {/* ✅ Alerts */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">
          Testimonials Manager
        </h1>
        <Button onClick={() => handleOpenModal()} icon={<PlusIcon size={16} />}>
          Add Testimonial
        </Button>
      </div>
      {alert && (
        <div
          className={`p-3 rounded-md text-sm ${
            alert.type === "error"
              ? "bg-red-100 text-red-700"
              : "bg-green-100 text-green-700"
          }`}
        >
          {alert.message}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {items.map((item) => (
          <Card key={item.id}>
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div className="text-green-600">
                  <QuoteIcon size={24} />
                </div>
                <div
                  className={`px-2 py-1 text-xs rounded-full ${
                    item.published
                      ? "bg-green-100 text-green-700"
                      : "bg-gray-100 text-gray-700"
                  }`}
                >
                  {item.published ? "Published" : "Draft"}
                </div>
              </div>
              <h3 className="mt-4 font-medium text-gray-900">{item.title}</h3>
              <p className="mt-2 text-sm text-gray-600 line-clamp-3">
                {item.description}
              </p>
              <div className="mt-4 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {item.author}
                  </p>
                  <p className="text-xs text-gray-500">{item.category}</p>
                </div>
              </div>
              <div className="flex space-x-2 mt-4 pt-4 border-t border-gray-100">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleTogglePublish(item.id)}
                  icon={<EyeIcon size={14} />}
                >
                  {item.published ? "Unpublish" : "Publish"}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleOpenModal(item)}
                  icon={<PencilIcon size={14} />}
                >
                  Edit
                </Button>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => handleDelete(item.id)}
                  icon={<TrashIcon size={14} />}
                >
                  Delete
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* ✅ Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editingItem ? "Edit Testimonial" : "Add Testimonial"}
      >
        <form onSubmit={handleSaveTestimonial}>
          <div className="space-y-4">
            <div>
              <label
                htmlFor="title"
                className="block text-sm font-medium text-gray-700"
              >
                Title
              </label>
              <input
                type="text"
                id="title"
                name="title"
                defaultValue={editingItem?.title || ""}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm"
                required
              />
            </div>
            <div>
              <label
                htmlFor="description"
                className="block text-sm font-medium text-gray-700"
              >
                Description
              </label>
              <textarea
                id="description"
                name="description"
                rows={4}
                defaultValue={editingItem?.description || ""}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm"
                required
              />
            </div>
            <div>
              <label
                htmlFor="author"
                className="block text-sm font-medium text-gray-700"
              >
                Author
              </label>
              <input
                type="text"
                id="author"
                name="author"
                defaultValue={editingItem?.author || ""}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm"
                required
              />
            </div>
            <div>
              <label
                htmlFor="category"
                className="block text-sm font-medium text-gray-700"
              >
                Category
              </label>
              <div className="relative mt-1">
                <input
                  type="text"
                  id="category"
                  name="category"
                  defaultValue={editingItem?.category || ""}
                  list="category-options"
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm"
                  required
                />
                <datalist id="category-options">
                  <option value="Beneficiary" />
                  <option value="Donor" />
                  <option value="Volunteer" />
                  <option value="Partner" />
                  <option value="Staff" />
                </datalist>
              </div>
            </div>
            <div className="flex items-center">
              <input
                id="published"
                name="published"
                type="checkbox"
                defaultChecked={editingItem?.published || false}
                className="h-4 w-4 rounded border-gray-300 text-green-600 focus:ring-green-500"
              />
              <label
                htmlFor="published"
                className="ml-2 block text-sm text-gray-700"
              >
                Publish immediately
              </label>
            </div>
            <div className="flex justify-end space-x-3 pt-4">
              <Button type="button" variant="outline" onClick={handleCloseModal}>
                Cancel
              </Button>
              <Button type="submit">
                {editingItem ? "Update Testimonial" : "Add Testimonial"}
              </Button>
            </div>
          </div>
        </form>
      </Modal>
    </div>
  );
}
