import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { FileUpload } from '../components/ui/FileUpload';
import { PlusIcon, EyeIcon, PencilIcon, TrashIcon, UploadIcon } from 'lucide-react';

// Firebase
import { rtdb } from "../firebase";
import { ref, push, update, remove, onValue } from "firebase/database";

// SweetAlert2
import Swal from "sweetalert2";
import "sweetalert2/dist/sweetalert2.min.css";

export default function MediaManager() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [items, setItems] = useState([]);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [notifications, setNotifications] = useState([]);

  // Convert file to Base64
  const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  };

  // Log + push notifications to Firebase
  const logNotification = (type, message) => {
    const newNote = {
      type,
      message,
      time: new Date().toISOString()
    };

    setNotifications(prev => [
      { id: Date.now(), ...newNote },
      ...prev
    ]);

    const notifRef = ref(rtdb, "notifications");
    push(notifRef, newNote);
  };

  // Fetch media from Firebase
  useEffect(() => {
    const mediaRef = ref(rtdb, "media");
    const unsubscribe = onValue(mediaRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        const formatted = Object.keys(data).map(key => ({ id: key, ...data[key] }));
        setItems(formatted);
      } else {
        setItems([]);
        Swal.fire({
          icon: "info",
          title: "No Data Found",
          text: "There are no media items in the database.",
          timer: 2000,
          showConfirmButton: false
        });
        logNotification("info", "No data found in database");
      }
    });
    return () => unsubscribe();
  }, []);

  const handleOpenModal = (item = null) => {
    setEditingItem(item);
    setUploadedFile(null);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setEditingItem(null);
    setUploadedFile(null);
    setIsModalOpen(false);
  };

  const handleFileChange = (file) => {
    if(file.size > 5 * 1024 * 1024) {
      Swal.fire("Error", "File too large. Max 5MB allowed.", "error");
      return;
    }
    setUploadedFile(file);
  };

  const handleSaveMedia = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const title = formData.get('title');
    const published = formData.get('published') === 'on';
    let imageUrl = uploadedFile ? await fileToBase64(uploadedFile) : formData.get('imageUrl');

    try {
      if (editingItem) {
        const itemRef = ref(rtdb, `media/${editingItem.id}`);
        await update(itemRef, { title, imageUrl, published });
        Swal.fire("Updated!", "Media updated successfully.", "success");
        logNotification("edited", `Media "${title}" updated`);
      } else {
        const mediaRef = ref(rtdb, "media");
        await push(mediaRef, {
          title,
          imageUrl,
          published,
          dateAdded: new Date().toISOString()
        });
        Swal.fire("Uploaded!", "Media uploaded successfully.", "success");
        logNotification("uploaded", `Media "${title}" uploaded`);
      }
      handleCloseModal();
    } catch (err) {
      console.error("Error saving media:", err);
      Swal.fire("Error", "Something went wrong while saving media.", "error");
      logNotification("error", "Error saving media");
    }
  };

  const handleDelete = async (id) => {
    Swal.fire({
      title: "Are you sure?",
      text: "This will permanently delete the media.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!"
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const itemRef = ref(rtdb, `media/${id}`);
          await remove(itemRef);
          Swal.fire("Deleted!", "Your media has been deleted.", "success");
          logNotification("deleted", `Media deleted (ID: ${id})`);
        } catch (err) {
          console.error("Error deleting media:", err);
          Swal.fire("Error", "Failed to delete media.", "error");
          logNotification("error", "Error deleting media");
        }
      }
    });
  };

  const handleTogglePublish = async (id) => {
    const item = items.find(i => i.id === id);
    if (!item) return;
    try {
      const itemRef = ref(rtdb, `media/${id}`);
      await update(itemRef, { published: !item.published });
      Swal.fire(
        "Success",
        `Media has been ${item.published ? "unpublished" : "published"} successfully.`,
        "success"
      );
      logNotification("published", `Media "${item.title}" ${item.published ? "unpublished" : "published"}`);
    } catch (err) {
      console.error("Error toggling publish:", err);
      Swal.fire("Error", "Failed to change publish status.", "error");
      logNotification("error", "Error toggling publish status");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Media Manager</h1>
        <Button onClick={() => handleOpenModal()} icon={<PlusIcon size={16} />}>
          Add Media
        </Button>
      </div>

      {/* Media Items */}
      {items.length === 0 ? (
        <div className="text-center text-gray-500 py-10">No media available</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map(item => (
            <Card key={item.id} className="overflow-hidden">
              <div className="aspect-video w-full overflow-hidden bg-gray-100">
                <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover" />
              </div>
              <CardContent className="p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium text-gray-900">{item.title}</h3>
                    <p className="text-xs text-gray-500 mt-1">
                      Added on {new Date(item.dateAdded).toLocaleDateString()}
                    </p>
                  </div>
                  <div className={`px-2 py-1 text-xs rounded-full ${item.published ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                    {item.published ? 'Published' : 'Draft'}
                  </div>
                </div>
                <div className="flex space-x-2 mt-4">
                  <Button variant="outline" size="sm" onClick={() => handleTogglePublish(item.id)} icon={<EyeIcon size={14} />}>
                    {item.published ? 'Unpublish' : 'Publish'}
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleOpenModal(item)} icon={<PencilIcon size={14} />}>
                    Edit
                  </Button>
                  <Button variant="danger" size="sm" onClick={() => handleDelete(item.id)} icon={<TrashIcon size={14} />}>
                    Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Modal */}
      <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={editingItem ? 'Edit Media' : 'Add Media'}>
        <form onSubmit={handleSaveMedia}>
          <div className="space-y-4">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700">Title</label>
              <input
                type="text"
                id="title"
                name="title"
                defaultValue={editingItem?.title || ''}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Image</label>
              <FileUpload 
                onFileChange={handleFileChange} 
                previewUrl={uploadedFile ? URL.createObjectURL(uploadedFile) : editingItem?.imageUrl} 
              />
              <div className="mt-3">
                <label htmlFor="imageUrl" className="block text-sm font-medium text-gray-700">Or enter image URL</label>
                <input
                  type="text"
                  id="imageUrl"
                  name="imageUrl"
                  defaultValue={editingItem?.imageUrl || ''}
                  className="mt-1 block w-full rounded-md border-gray-300 focus:border-green-500 focus:ring-green-500 sm:text-sm"
                  placeholder="https://example.com/image.jpg"
                />
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
              <label htmlFor="published" className="ml-2 block text-sm text-gray-700">Publish immediately</label>
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <Button type="button" variant="outline" onClick={handleCloseModal}>Cancel</Button>
              <Button type="submit" icon={editingItem ? <PencilIcon size={16} /> : <UploadIcon size={16} />}>
                {editingItem ? 'Update' : 'Upload'}
              </Button>
            </div>
          </div>
        </form>
      </Modal>
    </div>
  );
}
