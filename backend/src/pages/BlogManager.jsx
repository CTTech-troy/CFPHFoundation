import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { FileUpload } from '../components/ui/FileUpload';
import { PlusIcon, EyeIcon, PencilIcon, TrashIcon, FileTextIcon } from 'lucide-react';
import { rtdb } from '../firebase';
import { ref, push, set, update, remove, onValue } from 'firebase/database';
import Swal from 'sweetalert2';

export default function BlogManager() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [items, setItems] = useState([]);
  const [uploadedFile, setUploadedFile] = useState(null); // Base64 string

  // 🔥 Fetch blogs live from RTDB
  useEffect(() => {
    const blogRef = ref(rtdb, 'blog');
    const unsubscribe = onValue(blogRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        const blogs = Object.keys(data).map((key) => ({
          id: key,
          ...data[key],
        }));
        setItems(blogs);
      } else {
        setItems([]);
      }
    });
    return () => unsubscribe();
  }, []);

  const handleOpenModal = (item = null) => {
    setEditingItem(item);
    setUploadedFile(item?.imageUrl || null);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setEditingItem(null);
    setUploadedFile(null);
    setIsModalOpen(false);
  };

  const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  };

  const handleFileChange = async (file) => {
    if (!file) return;
    const base64 = await fileToBase64(file);
    setUploadedFile(base64);
  };

  // ✅ Save blog (add/edit)
  const handleSaveBlogPost = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const title = formData.get('title');
    const excerpt = formData.get('excerpt');
    const author = formData.get('author');
    const published = formData.get('published') === 'on';
    const isArticle = formData.get('isArticle') === 'on';

    let imageUrl = formData.get('imageUrl') || '';
    if (uploadedFile) {
      imageUrl = uploadedFile; // Base64
    }

    const today = new Date();
    const date = today.toISOString().split('T')[0];

    if (editingItem) {
      const blogRef = ref(rtdb, `blog/${editingItem.id}`);
      await update(blogRef, { title, excerpt, author, imageUrl, published, isArticle, date });
      await logNotification('edit', `Blog "${title}" updated`);
      Swal.fire('Updated!', 'Blog post has been updated.', 'success');
    } else {
      const blogRef = push(ref(rtdb, 'blog'));
      await set(blogRef, { title, excerpt, author, imageUrl, published, isArticle, date });
      await logNotification('add', `Blog "${title}" added`);
      Swal.fire('Added!', 'Blog post has been added.', 'success');
    }

    handleCloseModal();
  };

  // 🗑 Delete blog
  const handleDelete = async (id, title) => {
    Swal.fire({
      title: 'Are you sure?',
      text: `Delete "${title}"? This cannot be undone!`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!',
    }).then(async (result) => {
      if (result.isConfirmed) {
        await remove(ref(rtdb, `blog/${id}`));
        await logNotification('delete', `Blog "${title}" deleted`);
        Swal.fire('Deleted!', 'Blog has been deleted.', 'success');
      }
    });
  };

  // 👁 Toggle publish
  const handleTogglePublish = async (id, post) => {
    const blogRef = ref(rtdb, `blog/${id}`);
    await update(blogRef, { published: !post.published });
    await logNotification('edit', `Blog "${post.title}" ${post.published ? 'unpublished' : 'published'}`);
  };

  // 🔄 Toggle Article
  const handleToggleArticle = async (id, post) => {
    const blogRef = ref(rtdb, `blog/${id}`);
    await update(blogRef, { isArticle: !post.isArticle });
    await logNotification('edit', `Blog "${post.title}" marked as ${post.isArticle ? 'Other' : 'Article'}`);
  };

  // 📢 Log notification
  const logNotification = async (type, message) => {
    const notifRef = push(ref(rtdb, 'notifications'));
    await set(notifRef, {
      type,
      message,
      timestamp: Date.now(),
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Blog Manager</h1>
        <Button onClick={() => handleOpenModal()} icon={<PlusIcon size={16} />}>
          Add Article
        </Button>
      </div>

      {items.length === 0 ? (
        <p className="text-gray-500 text-center">No data found</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {items.map((post) => (
            <Card key={post.id} className="overflow-hidden">
              <div className="aspect-video w-full overflow-hidden bg-gray-100">
                <img
                  src={post.imageUrl}
                  alt={post.title}
                  className="w-full h-full object-cover"
                />
              </div>
              <CardContent className="p-4">
                <div className="flex justify-between items-start space-x-2">
                  <h3 className="font-medium text-gray-900">{post.title}</h3>
                  <div className="flex space-x-2">
                    <div
                      className={`px-2 py-1 text-xs rounded-full ${
                        post.published
                          ? 'bg-green-100 text-green-700'
                          : 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      {post.published ? 'Published' : 'Draft'}
                    </div>
                    <div
                      className={`px-2 py-1 text-xs rounded-full ${
                        post.isArticle ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      {post.isArticle ? 'Article' : 'Other'}
                    </div>
                  </div>
                </div>
                <p className="mt-2 text-sm text-gray-600 line-clamp-2">{post.excerpt}</p>
                <div className="mt-4 flex items-center justify-between">
                  <div className="text-sm text-gray-500">
                    By {post.author} • {post.date}
                  </div>
                  <div className="text-green-600">
                    <FileTextIcon size={16} />
                  </div>
                </div>
                <div className="flex space-x-2 mt-4 pt-4 border-t border-gray-100">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleTogglePublish(post.id, post)}
                    icon={<EyeIcon size={14} />}
                  >
                    {post.published ? 'Unpublish' : 'Publish'}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleToggleArticle(post.id, post)}
                    icon={<FileTextIcon size={14} />}
                  >
                    {post.isArticle ? 'Mark Other' : 'Mark Article'}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleOpenModal(post)}
                    icon={<PencilIcon size={14} />}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => handleDelete(post.id, post.title)}
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
        title={editingItem ? 'Edit Article' : 'Add Article'}
      >
        <form onSubmit={handleSaveBlogPost}>
          <div className="space-y-4">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                Title
              </label>
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
              <label htmlFor="excerpt" className="block text-sm font-medium text-gray-700">
                Excerpt
              </label>
              <textarea
                id="excerpt"
                name="excerpt"
                rows={3}
                defaultValue={editingItem?.excerpt || ''}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm"
                required
              />
            </div>
            <div>
              <label htmlFor="author" className="block text-sm font-medium text-gray-700">
                Author
              </label>
              <input
                type="text"
                id="author"
                name="author"
                defaultValue={editingItem?.author || ''}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Featured Image
              </label>
              <FileUpload onFileChange={handleFileChange} previewUrl={uploadedFile} />
              <div className="mt-3">
                <label htmlFor="imageUrl" className="block text-sm font-medium text-gray-700">
                  Or enter image URL
                </label>
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
            <div className="flex items-center space-x-6">
              <div className="flex items-center">
                <input
                  id="published"
                  name="published"
                  type="checkbox"
                  defaultChecked={editingItem?.published || false}
                  className="h-4 w-4 rounded border-gray-300 text-green-600 focus:ring-green-500"
                />
                <label htmlFor="published" className="ml-2 block text-sm text-gray-700">
                  Publish immediately
                </label>
              </div>
              <div className="flex items-center">
                <input
                  id="isArticle"
                  name="isArticle"
                  type="checkbox"
                  defaultChecked={editingItem?.isArticle || false}
                  className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="isArticle" className="ml-2 block text-sm text-gray-700">
                  Is this an Article?
                </label>
              </div>
            </div>
            <div className="flex justify-end space-x-3 pt-4">
              <Button type="button" variant="outline" onClick={handleCloseModal}>
                Cancel
              </Button>
              <Button type="submit">
                {editingItem ? 'Update Article' : 'Add Article'}
              </Button>
            </div>
          </div>
        </form>
      </Modal>
    </div>
  );
}
