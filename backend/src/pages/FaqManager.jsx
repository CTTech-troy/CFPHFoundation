import React, { useState } from 'react';
import { Card, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { PlusIcon, GripIcon, TrashIcon, HelpCircleIcon, PencilIcon } from 'lucide-react';
import { faqs } from '../utils/mockData';
export default function FaqManager() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [items, setItems] = useState(faqs);
  const handleOpenModal = (item = null) => {
    setEditingItem(item);
    setIsModalOpen(true);
  };
  const handleCloseModal = () => {
    setEditingItem(null);
    setIsModalOpen(false);
  };
  const handleSaveFaq = e => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const question = formData.get('question') ;
    const answer = formData.get('answer') ;
    if (editingItem) {
      // Update existing item
      setItems(items.map(item => item.id === editingItem.id ? {
        ...item,
        question,
        answer
      } : item));
    } else {
      // Add new item
      setItems([...items, {
        id: items.length + 1,
        question,
        answer
      }]);
    }
    handleCloseModal();
  };
  const handleDelete = id => {
    setItems(items.filter(item => item.id !== id));
  };
  return <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">FAQ Manager</h1>
        <Button onClick={() => handleOpenModal()} icon={<PlusIcon size={16} />}>
          Add FAQ
        </Button>
      </div>
      <Card>
        <div className="p-4 border-b border-gray-200">
          <p className="text-sm text-gray-500">
            Drag and drop to reorder FAQs. Changes are saved automatically.
          </p>
        </div>
        <div className="divide-y divide-gray-200">
          {items.map((faq) => <div key={faq.id} className="p-4 hover:bg-gray-50">
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
                      <Button variant="outline" size="sm" onClick={() => handleOpenModal(faq)} icon={<PencilIcon size={14} />}>
                        Edit
                      </Button>
                      <Button variant="danger" size="sm" onClick={() => handleDelete(faq.id)} icon={<TrashIcon size={14} />}>
                        Delete
                      </Button>
                    </div>
                  </div>
                  <div className="mt-2 pl-6 text-sm text-gray-600">
                    {faq.answer}
                  </div>
                </div>
              </div>
            </div>)}
        </div>
      </Card>
      <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={editingItem ? 'Edit FAQ' : 'Add FAQ'}>
        <form onSubmit={handleSaveFaq}>
          <div className="space-y-4">
            <div>
              <label htmlFor="question" className="block text-sm font-medium text-gray-700">
                Question
              </label>
              <input type="text" id="question" name="question" defaultValue={editingItem?.question || ''} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm" required />
            </div>
            <div>
              <label htmlFor="answer" className="block text-sm font-medium text-gray-700">
                Answer
              </label>
              <textarea id="answer" name="answer" rows={4} defaultValue={editingItem?.answer || ''} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm" required />
            </div>
            <div className="flex justify-end space-x-3 pt-4">
              <Button type="button" variant="outline" onClick={handleCloseModal}>
                Cancel
              </Button>
              <Button type="submit">
                {editingItem ? 'Update FAQ' : 'Add FAQ'}
              </Button>
            </div>
          </div>
        </form>
      </Modal>
    </div>;
}