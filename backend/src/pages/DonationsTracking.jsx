import React, { useState } from 'react';
import { Card, CardContent, CardHeader } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { DollarSignIcon, FilterIcon, DownloadIcon } from 'lucide-react';
import { donations } from '../utils/mockData';
export default function DonationsTracking() {
  const [items] = useState(donations);
  // Calculate summary statistics
  const totalDonations = items.reduce((sum, item) => sum + item.amount, 0);
  const donationsByMethod = items.reduce((acc, item) => {
    acc[item.method] = (acc[item.method] || 0) + item.amount;
    return acc;
  }, {});
  // Placeholder implementation - will be expanded in future iterations
  return <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Donations Tracking</h1>
        <div className="flex space-x-3">
          <Button variant="outline" icon={<FilterIcon size={16} />}>
            Filter
          </Button>
          <Button variant="outline" icon={<DownloadIcon size={16} />}>
            Export
          </Button>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="md:col-span-1">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-gray-500">
                  Total Donations
                </p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  ${totalDonations.toLocaleString()}
                </p>
              </div>
              <div className="p-2 rounded-md bg-green-100 text-green-600">
                <DollarSignIcon size={24} />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="md:col-span-1">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-gray-500">
                  Card Payments
                </p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  ${(donationsByMethod.Card || 0).toLocaleString()}
                </p>
              </div>
              <div className="p-2 rounded-md bg-blue-100 text-blue-600">
                <DollarSignIcon size={24} />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="md:col-span-1">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-gray-500">
                  Bank Transfers
                </p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  ${(donationsByMethod.Transfer || 0).toLocaleString()}
                </p>
              </div>
              <div className="p-2 rounded-md bg-purple-100 text-purple-600">
                <DollarSignIcon size={24} />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="md:col-span-1">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-gray-500">Google Pay</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  ${(donationsByMethod['Google Pay'] || 0).toLocaleString()}
                </p>
              </div>
              <div className="p-2 rounded-md bg-amber-100 text-amber-600">
                <DollarSignIcon size={24} />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      <Card>
        <CardHeader>
          <h2 className="text-lg font-medium text-gray-900">
            Recent Donations
          </h2>
        </CardHeader>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Donor
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Method
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Campaign
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {items.map(donation => <tr key={donation.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {donation.donorName}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      ${donation.amount.toLocaleString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${donation.method === 'Card' ? 'bg-blue-100 text-blue-800' : donation.method === 'Transfer' ? 'bg-purple-100 text-purple-800' : 'bg-amber-100 text-amber-800'}`}>
                      {donation.method}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {donation.campaign}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(donation.date).toLocaleDateString()}
                  </td>
                </tr>)}
            </tbody>
          </table>
        </div>
      </Card>
    </div>;
}