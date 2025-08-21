import React, { useState } from 'react';
import { Card, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { PlusIcon, PencilIcon, TrashIcon, PauseIcon, PlayIcon, LineChartIcon, DollarSignIcon, MousePointerClickIcon, EyeIcon } from 'lucide-react';
import { adCampaigns } from '../utils/mockData';
export default function GoogleAdsManager() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState(null);
  const [campaigns, setCampaigns] = useState(adCampaigns);
  const handleOpenModal = (campaign = null) => {
    setEditingCampaign(campaign);
    setIsModalOpen(true);
  };
  const handleCloseModal = () => {
    setEditingCampaign(null);
    setIsModalOpen(false);
  };
  const handleSaveCampaign = e => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const name = formData.get('name') ;
    const budget = parseFloat(formData.get('budget') );
    const startDate = formData.get('startDate') ;
    const endDate = formData.get('endDate') ;
    const status = formData.get('status') ;
    if (editingCampaign) {
      // Update existing campaign
      setCampaigns(campaigns.map(campaign => campaign.id === editingCampaign.id ? {
        ...campaign,
        name,
        budget,
        startDate,
        endDate,
        status
      } : campaign));
    } else {
      // Add new campaign
      setCampaigns([...campaigns, {
        id: campaigns.length + 1,
        name,
        budget,
        spent: 0,
        clicks: 0,
        impressions: 0,
        ctr: 0,
        startDate,
        endDate,
        status
      }]);
    }
    handleCloseModal();
  };
  const handleDelete = id => {
    setCampaigns(campaigns.filter(campaign => campaign.id !== id));
  };
  const handleToggleStatus = id => {
    setCampaigns(campaigns.map(campaign => campaign.id === id ? {
      ...campaign,
      status: campaign.status === 'Active' ? 'Paused' : 'Active'
    } : campaign));
  };
  const getStatusColor = status => {
    switch (status) {
      case 'Active':
        return 'bg-green-100 text-green-700';
      case 'Paused':
        return 'bg-amber-100 text-amber-700';
      case 'Draft':
        return 'bg-gray-100 text-gray-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };
  const formatCurrency = amount => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(amount);
  };
  // Calculate total metrics
  const totalBudget = campaigns.reduce((sum, campaign) => sum + campaign.budget, 0);
  const totalClicks = campaigns.reduce((sum, campaign) => sum + campaign.clicks, 0);
  const totalImpressions = campaigns.reduce((sum, campaign) => sum + campaign.impressions, 0);
  const averageCTR = totalImpressions > 0 ? totalClicks / totalImpressions * 100 : 0;
  return <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Google Ads Manager</h1>
        <Button onClick={() => handleOpenModal()} icon={<PlusIcon size={16} />}>
          Create Campaign
        </Button>
      </div>
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <div className="p-2 rounded-full bg-blue-100 text-blue-600 mr-3">
                <DollarSignIcon size={20} />
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Budget</p>
                <p className="text-xl font-semibold">
                  {formatCurrency(totalBudget)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <div className="p-2 rounded-full bg-green-100 text-green-600 mr-3">
                <MousePointerClickIcon size={20} />
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Clicks</p>
                <p className="text-xl font-semibold">
                  {totalClicks.toLocaleString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <div className="p-2 rounded-full bg-purple-100 text-purple-600 mr-3">
                <EyeIcon size={20} />
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Impressions</p>
                <p className="text-xl font-semibold">
                  {totalImpressions.toLocaleString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <div className="p-2 rounded-full bg-amber-100 text-amber-600 mr-3">
                <LineChartIcon size={20} />
              </div>
              <div>
                <p className="text-sm text-gray-500">Average CTR</p>
                <p className="text-xl font-semibold">
                  {averageCTR.toFixed(2)}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      {/* Campaigns Table */}
      <Card>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Campaign
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Budget
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Spent
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Clicks
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Impressions
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  CTR
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date Range
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {campaigns.map(campaign => <tr key={campaign.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="font-medium text-gray-900">
                      {campaign.name}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(campaign.status)}`}>
                      {campaign.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-900">
                    {formatCurrency(campaign.budget)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-900">
                    {formatCurrency(campaign.spent)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-900">
                    {campaign.clicks.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-900">
                    {campaign.impressions.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-900">
                    {campaign.ctr.toFixed(2)}%
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                    {campaign.startDate} - {campaign.endDate}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end space-x-2">
                      {campaign.status !== 'Draft' && <Button variant="outline" size="sm" onClick={() => handleToggleStatus(campaign.id)} icon={campaign.status === 'Active' ? <PauseIcon size={14} /> : <PlayIcon size={14} />}>
                          {campaign.status === 'Active' ? 'Pause' : 'Activate'}
                        </Button>}
                      <Button variant="outline" size="sm" onClick={() => handleOpenModal(campaign)} icon={<PencilIcon size={14} />}>
                        Edit
                      </Button>
                      <Button variant="danger" size="sm" onClick={() => handleDelete(campaign.id)} icon={<TrashIcon size={14} />}>
                        Delete
                      </Button>
                    </div>
                  </td>
                </tr>)}
            </tbody>
          </table>
        </div>
      </Card>
      {/* Create/Edit Campaign Modal */}
      <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={editingCampaign ? 'Edit Campaign' : 'Create Campaign'}>
        <form onSubmit={handleSaveCampaign}>
          <div className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Campaign Name
              </label>
              <input type="text" id="name" name="name" defaultValue={editingCampaign?.name || ''} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm" required />
            </div>
            <div>
              <label htmlFor="budget" className="block text-sm font-medium text-gray-700">
                Budget (USD)
              </label>
              <input type="number" id="budget" name="budget" min="0" step="0.01" defaultValue={editingCampaign?.budget || ''} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm" required />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="startDate" className="block text-sm font-medium text-gray-700">
                  Start Date
                </label>
                <input type="date" id="startDate" name="startDate" defaultValue={editingCampaign?.startDate || ''} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm" required />
              </div>
              <div>
                <label htmlFor="endDate" className="block text-sm font-medium text-gray-700">
                  End Date
                </label>
                <input type="date" id="endDate" name="endDate" defaultValue={editingCampaign?.endDate || ''} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm" required />
              </div>
            </div>
            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-700">
                Status
              </label>
              <select id="status" name="status" defaultValue={editingCampaign?.status || 'Draft'} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm" required>
                <option value="Draft">Draft</option>
                <option value="Active">Active</option>
                <option value="Paused">Paused</option>
              </select>
            </div>
            <div className="flex justify-end space-x-3 pt-4">
              <Button type="button" variant="outline" onClick={handleCloseModal}>
                Cancel
              </Button>
              <Button type="submit">
                {editingCampaign ? 'Update Campaign' : 'Create Campaign'}
              </Button>
            </div>
          </div>
        </form>
      </Modal>
    </div>;
}