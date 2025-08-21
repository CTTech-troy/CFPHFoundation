import React, { useState } from 'react';
import { Card, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { FileUpload } from '../components/ui/FileUpload';
import { PlusIcon, EyeIcon, PencilIcon, TrashIcon, FileTextIcon } from 'lucide-react';
import { blogPosts } from '../utils/mockData';
export default function BlogManager()  {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [items, setItems] = useState(blogPosts);
const [uploadedFile, setUploadedFile] = useState(null);
  const handleOpenModal = (item = null) => {
    setEditingItem(item);
    setUploadedFile(null);
    setIsModalOpen(true);
  };
  const handleCloseModal = () => {
    setEditingItem(null);
    setIsModalOpen(false);
  };
  const handleFileChange = (file) => {
    setUploadedFile(file);
  };
  const handleSaveBlogPost = e => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const title = formData.get('title');
    const excerpt = formData.get('excerpt');
    const author = formData.get('author');
    const published = formData.get('published') === 'on';
    // Use either the uploaded file or the URL from the form
    let imageUrl = formData.get('imageUrl');
    if (uploadedFile) {
      // In a real application, you would upload the file to a server
      // and get back a URL. For this demo, we'll create a temporary URL.
      imageUrl = URL.createObjectURL(uploadedFile);
    }
    const today = new Date();
    const date = today.toISOString().split('T')[0];
    if (editingItem) {
      // Update existing item
      setItems(items.map(item => item.id === editingItem.id ? {
        ...item,
        title,
        excerpt,
        author,
        imageUrl,
        published
      } : item));
    } else {
      // Add new item
      setItems([...items, {
        id: items.length + 1,
        title,
        excerpt,
        author,
        imageUrl,
        date,
        published
      }]);
    }
    handleCloseModal();
  };
  const handleDelete = id => {
    setItems(items.filter(item => item.id !== id));
  };
  const handleTogglePublish = id => {
    setItems(items.map(item => item.id === id ? {
      ...item,
      published: !item.published
    } : item));
  };
  return <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Blog Manager</h1>
        <Button onClick={() => handleOpenModal()} icon={<PlusIcon size={16} />}>
          Add Article
        </Button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {items.map(post => <Card key={post.id} className="overflow-hidden">
            <div className="aspect-video w-full overflow-hidden bg-gray-100">
              <img src={post.imageUrl} alt={post.title} className="w-full h-full object-cover" />
            </div>
            <CardContent className="p-4">
              <div className="flex justify-between items-start">
                <h3 className="font-medium text-gray-900">{post.title}</h3>
                <div className={`px-2 py-1 text-xs rounded-full ${post.published ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                  {post.published ? 'Published' : 'Draft'}
                </div>
              </div>
              <p className="mt-2 text-sm text-gray-600 line-clamp-2">
                {post.excerpt}
              </p>
              <div className="mt-4 flex items-center justify-between">
                <div className="text-sm text-gray-500">
                  By {post.author} • {post.date}
                </div>
                <div className="text-green-600">
                  <FileTextIcon size={16} />
                </div>
              </div>
              <div className="flex space-x-2 mt-4 pt-4 border-t border-gray-100">
                <Button variant="outline" size="sm" onClick={() => handleTogglePublish(post.id)} icon={<EyeIcon size={14} />}>
                  {post.published ? 'Unpublish' : 'Publish'}
                </Button>
                <Button variant="outline" size="sm" onClick={() => handleOpenModal(post)} icon={<PencilIcon size={14} />}>
                  Edit
                </Button>
                <Button variant="danger" size="sm" onClick={() => handleDelete(post.id)} icon={<TrashIcon size={14} />}>
                  Delete
                </Button>
              </div>
            </CardContent>
          </Card>)}
      </div>
      <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={editingItem ? 'Edit Article' : 'Add Article'}>
        <form onSubmit={handleSaveBlogPost}>
          <div className="space-y-4">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                Title
              </label>
              <input type="text" id="title" name="title" defaultValue={editingItem?.title || ''} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm" required />
            </div>
            <div>
              <label htmlFor="excerpt" className="block text-sm font-medium text-gray-700">
                Excerpt
              </label>
              <textarea id="excerpt" name="excerpt" rows={3} defaultValue={editingItem?.excerpt || ''} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm" required />
            </div>
            <div>
              <label htmlFor="author" className="block text-sm font-medium text-gray-700">
                Author
              </label>
              <input type="text" id="author" name="author" defaultValue={editingItem?.author || ''} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Featured Image
              </label>
              <FileUpload onFileChange={handleFileChange} previewUrl={editingItem?.imageUrl} />
              <div className="mt-3">
                <label htmlFor="imageUrl" className="block text-sm font-medium text-gray-700">
                  Or enter image URL
                </label>
                <input type="text" id="imageUrl" name="imageUrl" defaultValue={editingItem?.imageUrl || ''} className="mt-1 block w-full rounded-md border-gray-300 focus:border-green-500 focus:ring-green-500 sm:text-sm" placeholder="https://example.com/image.jpg" />
              </div>
            </div>
            <div className="flex items-center">
              <input id="published" name="published" type="checkbox" defaultChecked={editingItem?.published || false} className="h-4 w-4 rounded border-gray-300 text-green-600 focus:ring-green-500" />
              <label htmlFor="published" className="ml-2 block text-sm text-gray-700">
                Publish immediately
              </label>
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
    </div>;
}