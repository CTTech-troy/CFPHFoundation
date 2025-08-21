import React, { useState, useEffect } from "react";
import { Card, CardContent } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Modal } from "../components/ui/Modal";
import { FileUpload } from "../components/ui/FileUpload";
import { PlusIcon, EyeIcon, TrashIcon, PencilIcon } from "lucide-react";
import Swal from "sweetalert2";   // ✅ SweetAlert2

// ✅ Import from firebase.js
import { rtdb, ref, push, set, onValue, update, remove } from "../firebase";

export default function EventHighlights() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [items, setItems] = useState([]);
  const [uploadedFile, setUploadedFile] = useState(null);

  // ✅ Fetch data from RTDB
  useEffect(() => {
    const highlightsRef = ref(rtdb, "eventHighlights");
    onValue(highlightsRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        const loaded = Object.keys(data).map((id) => ({ id, ...data[id] }));
        setItems(loaded);
      } else {
        setItems([]); // no data found
      }
    });
  }, []);

  const handleOpenModal = (item = null) => {
    setEditingItem(item);
    setUploadedFile(null);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setEditingItem(null);
    setIsModalOpen(false);
  };

  const handleFileChange = (file) => setUploadedFile(file);

  // ✅ Helper to push notifications into RTDB
  const pushNotification = (type, message) => {
    const notifRef = push(ref(rtdb, "notifications"));
    set(notifRef, {
      type, // "success", "edited", "deleted"
      message,
      time: Date.now(),
    });
  };

  // ✅ Save or Update in RTDB
  const handleSaveHighlight = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const title = formData.get("title");
    const date = formData.get("date");
    const published = formData.get("published") === "on";
    let imageUrl = formData.get("imageUrl");

    if (uploadedFile) {
      imageUrl = URL.createObjectURL(uploadedFile); // temp preview
    }

    if (editingItem) {
      // Update existing item
      update(ref(rtdb, "eventHighlights/" + editingItem.id), {
        title,
        date,
        imageUrl,
        published,
      });
      pushNotification("edited", "Highlight updated");

      Swal.fire({
        icon: "success",
        title: "Updated!",
        text: "Highlight has been updated successfully.",
        timer: 2000,
        showConfirmButton: false,
      });
    } else {
      // Add new item
      const newRef = push(ref(rtdb, "eventHighlights"));
      set(newRef, { title, date, imageUrl, published });
      pushNotification("success", "Highlight added");

      Swal.fire({
        icon: "success",
        title: "Added!",
        text: "New highlight has been added successfully.",
        timer: 2000,
        showConfirmButton: false,
      });
    }

    handleCloseModal();
  };

  // ✅ Delete with SweetAlert2 confirmation
  const handleDelete = (id) => {
    Swal.fire({
      title: "Are you sure?",
      text: "This action cannot be undone!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
    }).then((result) => {
      if (result.isConfirmed) {
        remove(ref(rtdb, "eventHighlights/" + id));
        pushNotification("deleted", "Highlight deleted");

        Swal.fire({
          icon: "success",
          title: "Deleted!",
          text: "The highlight has been deleted.",
          timer: 2000,
          showConfirmButton: false,
        });
      }
    });
  };

  // ✅ Toggle publish status
  const handleTogglePublish = (item) => {
    update(ref(rtdb, "eventHighlights/" + item.id), {
      published: !item.published,
    });
    pushNotification(
      "edited",
      `Highlight ${item.published ? "unpublished" : "published"}`
    );

    Swal.fire({
      icon: "info",
      title: "Status Changed",
      text: `Highlight is now ${item.published ? "Draft" : "Published"}`,
      timer: 2000,
      showConfirmButton: false,
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Event Highlights</h1>
        <Button onClick={() => handleOpenModal()} icon={<PlusIcon size={16} />}>
          Add Highlight
        </Button>
      </div>

      {/* ✅ Show if no data */}
      {items.length === 0 ? (
        <p className="text-gray-500">No data found in the DB</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((highlight) => (
            <Card key={highlight.id} className="overflow-hidden">
              <div className="aspect-video w-full overflow-hidden bg-gray-100">
                <img
                  src={highlight.imageUrl}
                  alt={highlight.title}
                  className="w-full h-full object-cover"
                />
              </div>
              <CardContent className="p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium text-gray-900">
                      {highlight.title}
                    </h3>
                    <p className="text-xs text-gray-500 mt-1">
                      {highlight.date}
                    </p>
                  </div>
                  <div
                    className={`px-2 py-1 text-xs rounded-full ${
                      highlight.published
                        ? "bg-green-100 text-green-700"
                        : "bg-gray-100 text-gray-700"
                    }`}
                  >
                    {highlight.published ? "Published" : "Draft"}
                  </div>
                </div>
                <div className="flex space-x-2 mt-4 pt-4 border-t border-gray-100">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleTogglePublish(highlight)}
                    icon={<EyeIcon size={14} />}
                  >
                    {highlight.published ? "Unpublish" : "Publish"}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleOpenModal(highlight)}
                    icon={<PencilIcon size={14} />}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => handleDelete(highlight.id)}
                    icon={<TrashIcon size={14} />}
                  >
                    Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editingItem ? "Edit Event Highlight" : "Add Event Highlight"}
      >
        <form onSubmit={handleSaveHighlight}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium">Title</label>
              <input
                type="text"
                name="title"
                defaultValue={editingItem?.title || ""}
                required
                className="w-full border p-2 rounded"
              />
            </div>
            <div>
              <label className="block text-sm font-medium">Date</label>
              <input
                type="date"
                name="date"
                defaultValue={editingItem?.date || ""}
                required
                className="w-full border p-2 rounded"
              />
            </div>
            <div>
              <label className="block text-sm font-medium">Image</label>
              <FileUpload
                onFileChange={handleFileChange}
                previewUrl={editingItem?.imageUrl}
              />
              <input
                type="text"
                name="imageUrl"
                defaultValue={editingItem?.imageUrl || ""}
                placeholder="https://example.com/image.jpg"
                className="w-full border p-2 rounded mt-2"
              />
            </div>
            <div className="flex items-center">
              <input
                id="published"
                name="published"
                type="checkbox"
                defaultChecked={editingItem?.published || false}
              />
              <label htmlFor="published" className="ml-2">
                Publish immediately
              </label>
            </div>
            <div className="flex justify-end space-x-3">
              <Button type="button" variant="outline" onClick={handleCloseModal}>
                Cancel
              </Button>
              <Button type="submit">
                {editingItem ? "Update Highlight" : "Add Highlight"}
              </Button>
            </div>
          </div>
        </form>
      </Modal>
    </div>
  );
}
