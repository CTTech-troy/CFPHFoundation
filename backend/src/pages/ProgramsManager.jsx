import React, { useState, useEffect } from "react";
import { Card, CardContent } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Modal } from "../components/ui/Modal";
import {
  PlusIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  PackageIcon,
} from "lucide-react";

// Firebase (RTDB only)
import { rtdb } from "../firebase";
import {
  ref as dbRef,
  push,
  set,
  onValue,
  remove,
  update,
} from "firebase/database";

// SweetAlert2
import Swal from "sweetalert2";

export default function ProgramsManager() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  // File states
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);

  // 🔹 Load programs from Realtime DB
  useEffect(() => {
    const programsRef = dbRef(rtdb, "programs");
    const unsubscribe = onValue(programsRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        const loadedPrograms = Object.entries(data).map(([id, value]) => ({
          id,
          ...value,
        }));
        setItems(loadedPrograms);
      } else {
        setItems([]);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // 🔹 Log notification
  const logNotification = (action, program) => {
    const notificationsRef = dbRef(rtdb, "notifications");
    const newNotifRef = push(notificationsRef);

    const color =
      action === "added" ? "green" : action === "edited" ? "yellow" : "red";

    set(newNotifRef, {
      message: `Program "${program.title}" ${action}`,
      status: color,
      timestamp: Date.now(),
    });
  };

  const handleOpenModal = (item = null) => {
    setEditingItem(item);
    setFile(null);
    setPreview(item?.iconUrl || null);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setEditingItem(null);
    setFile(null);
    setPreview(null);
    setIsModalOpen(false);
  };

  // 🔹 Convert File to Base64
  const convertToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  };

  const handleSaveProgram = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const title = formData.get("title");
    const description = formData.get("description");
    const published = formData.get("published") === "on";

    let iconUrl = formData.get("iconUrl"); // fallback if user pastes URL

    // 🔹 If user selected a file, convert to Base64
    if (file) {
      try {
        iconUrl = await convertToBase64(file);
      } catch (error) {
        Swal.fire("Error", "Could not process file", "error");
        return;
      }
    }

    if (editingItem) {
      const programRef = dbRef(rtdb, `programs/${editingItem.id}`);
      await update(programRef, { title, description, published, iconUrl });
      logNotification("edited", { title });
      Swal.fire("Updated!", "Program updated successfully!", "success");
    } else {
      const programsRef = dbRef(rtdb, "programs");
      const newProgramRef = push(programsRef);
      await set(newProgramRef, { title, description, published, iconUrl });
      logNotification("added", { title });
      Swal.fire("Added!", "Program added successfully!", "success");
    }

    handleCloseModal();
  };

  const handleDelete = (id, title) => {
    const programRef = dbRef(rtdb, `programs/${id}`);
    remove(programRef);

    logNotification("deleted", { title });
    Swal.fire("Deleted!", "Program deleted successfully!", "error");
  };

  const handleTogglePublish = (id, currentState) => {
    const programRef = dbRef(rtdb, `programs/${id}`);
    update(programRef, { published: !currentState });
    Swal.fire(
      "Status Changed",
      `Program ${!currentState ? "published" : "unpublished"}!`,
      "info"
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Programs Manager</h1>
        <Button onClick={() => handleOpenModal()} icon={<PlusIcon size={16} />}>
          Add Program
        </Button>
      </div>

      {/* Program Cards */}
      {loading ? (
        <p className="text-gray-500">Loading programs...</p>
      ) : items.length === 0 ? (
        <p className="text-gray-500">No data in the database</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {items.map((program) => (
            <Card key={program.id}>
              <CardContent className="p-6">
                <div className="flex justify-between items-start">
                  <div className="text-blue-600">
                    {program.iconUrl ? (
                      <img
                        src={program.iconUrl}
                        alt="Program Icon"
                        className="w-10 h-10 object-cover rounded"
                      />
                    ) : (
                      <PackageIcon size={24} />
                    )}
                  </div>
                  <div
                    className={`px-2 py-1 text-xs rounded-full ${
                      program.published
                        ? "bg-green-100 text-green-700"
                        : "bg-gray-100 text-gray-700"
                    }`}
                  >
                    {program.published ? "Published" : "Draft"}
                  </div>
                </div>

                <h3 className="mt-4 font-medium text-gray-900">
                  {program.title}
                </h3>
                <p className="mt-2 text-sm text-gray-600">
                  {program.description}
                </p>

                <div className="flex space-x-2 mt-4 pt-4 border-t border-gray-100">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      handleTogglePublish(program.id, program.published)
                    }
                    icon={<EyeIcon size={14} />}
                  >
                    {program.published ? "Unpublish" : "Publish"}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleOpenModal(program)}
                    icon={<PencilIcon size={14} />}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => handleDelete(program.id, program.title)}
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

      {/* Modal for Add/Edit */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editingItem ? "Edit Program" : "Add Program"}
      >
        <form onSubmit={handleSaveProgram}>
          <div className="space-y-4">
            <div>
              <label
                htmlFor="title"
                className="block text-sm font-medium text-gray-700"
              >
                Program Title
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

            {/* Icon Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Program Icon
              </label>

              {/* Drag & Drop Zone */}
              <div
                className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-dashed rounded-md cursor-pointer"
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  if (e.dataTransfer.files[0]) {
                    setFile(e.dataTransfer.files[0]);
                    setPreview(URL.createObjectURL(e.dataTransfer.files[0]));
                  }
                }}
              >
                <div className="space-y-1 text-center">
                  {preview ? (
                    <img
                      src={preview}
                      alt="Preview"
                      className="mx-auto h-16 w-16 object-cover rounded"
                    />
                  ) : (
                    <PackageIcon className="mx-auto h-12 w-12 text-gray-400" />
                  )}
                  <div className="flex text-sm text-gray-600 justify-center">
                    <label className="relative cursor-pointer rounded-md font-medium text-green-600 hover:text-green-500">
                      <span>Upload a file</span>
                      <input
                        type="file"
                        className="sr-only"
                        accept="image/*"
                        onChange={(e) => {
                          setFile(e.target.files[0]);
                          setPreview(URL.createObjectURL(e.target.files[0]));
                        }}
                      />
                    </label>
                    <p className="pl-1">or drag and drop</p>
                  </div>
                </div>
              </div>

              {/* Optional: URL Input */}
              <input
                type="text"
                id="iconUrl"
                name="iconUrl"
                placeholder="Or paste image URL..."
                defaultValue={editingItem?.iconUrl || ""}
                className="mt-2 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm"
              />
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
                {editingItem ? "Update Program" : "Add Program"}
              </Button>
            </div>
          </div>
        </form>
      </Modal>
    </div>
  );
}
