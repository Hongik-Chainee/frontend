'use client';

import { useState } from 'react';

export default function ProfileEditPage() {
  const [name, setName] = useState('Yoonseo Lee');
  const [tags, setTags] = useState('Designer, Illustrator');
  const [university, setUniversity] = useState('Hongik. Univ');
  const [location, setLocation] = useState('Seoul, Republic of Korea');
  const [website, setWebsite] = useState('www.yoonseolee.com');

  const handleSave = () => {
    // Implement save logic here
    console.log('Saved:', { name, tags, university, location, website });
  };

  const handleCancel = () => {
    // Implement cancel logic here (e.g., redirect to profile page)
    window.history.back();
  };

  return (
    <div className="min-h-screen bg-background text-white p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">Edit Profile</h1>
        <div className="space-y-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-400">Name</label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 block w-full bg-[#222] border border-gray-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-purple-500 focus:border-purple-500"
            />
          </div>
          <div>
            <label htmlFor="tags" className="block text-sm font-medium text-gray-400">Tags (comma-separated)</label>
            <input
              type="text"
              id="tags"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              className="mt-1 block w-full bg-[#222] border border-gray-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-purple-500 focus:border-purple-500"
            />
          </div>
          <div>
            <label htmlFor="university" className="block text-sm font-medium text-gray-400">University</label>
            <input
              type="text"
              id="university"
              value={university}
              onChange={(e) => setUniversity(e.target.value)}
              className="mt-1 block w-full bg-[#222] border border-gray-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-purple-500 focus:border-purple-500"
            />
          </div>
          <div>
            <label htmlFor="location" className="block text-sm font-medium text-gray-400">Location</label>
            <input
              type="text"
              id="location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="mt-1 block w-full bg-[#222] border border-gray-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-purple-500 focus:border-purple-500"
            />
          </div>
          <div>
            <label htmlFor="website" className="block text-sm font-medium text-gray-400">Website</label>
            <input
              type="text"
              id="website"
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
              className="mt-1 block w-full bg-[#222] border border-gray-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-purple-500 focus:border-purple-500"
            />
          </div>
        </div>
        <div className="mt-8 flex justify-end space-x-4">
          <button
            onClick={handleCancel}
            className="bg-gray-700 text-white py-2 px-4 rounded-lg hover:bg-gray-600"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}