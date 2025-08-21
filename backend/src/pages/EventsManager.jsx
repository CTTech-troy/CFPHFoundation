import React, { useState } from 'react';
import { Card, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { PlusIcon, CalendarIcon, UsersIcon, BellIcon, TrashIcon, EyeIcon, PencilIcon, MapPinIcon } from 'lucide-react';
import { events } from '../utils/mockData';
export default function EventsManager() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [items, setItems] = useState(events);
  const handleOpenModal = (item = null) => {
    setEditingItem(item);
    setIsModalOpen(true);
  };
  const handleCloseModal = () => {
    setEditingItem(null);
    setIsModalOpen(false);
  };
  const handleSaveEvent = e => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const title = formData.get('title');
    const date = formData.get('date');
    const time = formData.get('time');
    const location = formData.get('location');
    const description = formData.get('description');
    if (editingItem) {
      // Update existing item
      setItems(items.map(item => item.id === editingItem.id ? {
        ...item,
        title,
        date,
        time,
        location,
        description
      } : item));
    } else {
      // Add new item
      setItems([...items, {
        id: items.length + 1,
        title,
        date,
        time,
        location,
        description,
        attendees: 0,
        reminders: 0
      }]);
    }
    handleCloseModal();
  };
  const handleDelete = id => {
    setItems(items.filter(item => item.id !== id));
  };
  return <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Events Manager</h1>
        <Button onClick={() => handleOpenModal()} icon={<PlusIcon size={16} />}>
          Add Event
        </Button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {items.map(event => <Card key={event.id}>
            <CardContent className="p-6">
              <div className="flex justify-between">
                <div className="flex items-center text-purple-600">
                  <CalendarIcon size={20} className="mr-2" />
                  <span className="font-medium">{event.date}</span>
                </div>
                <span className="text-sm text-gray-500">{event.time}</span>
              </div>
              <h3 className="mt-3 text-lg font-medium text-gray-900">
                {event.title}
              </h3>
              <p className="mt-1 text-sm text-gray-600 line-clamp-2">
                {event.description}
              </p>
              <div className="mt-3 text-sm text-gray-500 flex items-center">
                <MapPinIcon size={16} className="mr-1" />
                {event.location}
              </div>
              <div className="mt-4 flex items-center justify-between">
                <div className="flex items-center text-sm text-gray-500">
                  <UsersIcon size={16} className="mr-1" />
                  <span>{event.attendees} attendees</span>
                </div>
                <div className="flex items-center text-sm text-gray-500">
                  <BellIcon size={16} className="mr-1" />
                  <span>{event.reminders} reminders</span>
                </div>
              </div>
              <div className="flex space-x-2 mt-4 pt-4 border-t border-gray-100">
                <Button variant="outline" size="sm" onClick={() => handleOpenModal(event)} icon={<PencilIcon size={14} />}>
                  Edit
                </Button>
                <Button variant="outline" size="sm" icon={<UsersIcon size={14} />}>
                  Attendees
                </Button>
                <Button variant="danger" size="sm" onClick={() => handleDelete(event.id)} icon={<TrashIcon size={14} />}>
                  Delete
                </Button>
              </div>
            </CardContent>
          </Card>)}
      </div>
      <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={editingItem ? 'Edit Event' : 'Add Event'}>
        <form onSubmit={handleSaveEvent}>
          <div className="space-y-4">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                Event Title
              </label>
              <input type="text" id="title" name="title" defaultValue={editingItem?.title || ''} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm" required />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="date" className="block text-sm font-medium text-gray-700">
                  Date
                </label>
                <input type="date" id="date" name="date" defaultValue={editingItem?.date || ''} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm" required />
              </div>
              <div>
                <label htmlFor="time" className="block text-sm font-medium text-gray-700">
                  Time
                </label>
                <input type="time" id="time" name="time" defaultValue={editingItem?.time || ''} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm" required />
              </div>
            </div>
            <div>
              <label htmlFor="location" className="block text-sm font-medium text-gray-700">
                Location
              </label>
              <input type="text" id="location" name="location" defaultValue={editingItem?.location || ''} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm" required />
            </div>
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                Description
              </label>
              <textarea id="description" name="description" rows={4} defaultValue={editingItem?.description || ''} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm" required />
            </div>
            <div className="flex justify-end space-x-3 pt-4">
              <Button type="button" variant="outline" onClick={handleCloseModal}>
                Cancel
              </Button>
              <Button type="submit">
                {editingItem ? 'Update Event' : 'Add Event'}
              </Button>
            </div>
          </div>
        </form>
      </Modal>
    </div>;
}