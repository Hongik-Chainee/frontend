import { useState } from 'react';
import Image from 'next/image';
import type { User } from '@/models/profile';
import { updateMyProfile } from '@/services/profileEditApi';

interface UserInfoProps {
  user: User | null;
  onUpdated?: () => void;
}

export function UserInfo({ user, onUpdated }: UserInfoProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState({
    name: user?.name ?? '',
    profileImageUrl: user?.avatarUrl ?? '',
    positions: user?.tags ?? [],
    from: user?.university ?? '',
    inLocation: user?.location ?? '',
    website: user?.website ?? '',
    introductionHeadline: '',
    introductionContent: '',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!user) return null;

  const handleChange = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    setSaving(true);
    setError(null);
    try {
      await updateMyProfile(form);
      setIsEditing(false);
      onUpdated?.();
    } catch (err: any) {
      setError(err?.message ?? '프로필 수정에 실패했습니다.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-[#222] p-8 rounded-lg">
      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between">
        <div className="flex flex-col sm:flex-row items-center sm:items-start flex-1">
          <div className="relative w-32 h-32 sm:w-48 sm:h-48 rounded-full bg-gray-300 overflow-hidden mb-4 sm:mb-0 sm:mr-8">
            {user.avatarUrl ? (
              <Image src={user.avatarUrl} alt={user.name} fill className="object-cover" />
            ) : null}
          </div>
          <div className="text-center sm:text-left w-full">
            {isEditing ? (
              <div className="space-y-3">
                <input
                  className="w-full rounded bg-black/20 px-4 py-2 text-white outline-none"
                  value={form.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                />
                <input
                  className="w-full rounded bg-black/20 px-4 py-2 text-white outline-none"
                  placeholder="Image URL"
                  value={form.profileImageUrl}
                  onChange={(e) => handleChange('profileImageUrl', e.target.value)}
                />
                <input
                  className="w-full rounded bg-black/20 px-4 py-2 text-white outline-none"
                  placeholder="Positions (comma separated)"
                  value={form.positions?.join(', ') ?? ''}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      positions: e.target.value.split(',').map((s) => s.trim()).filter(Boolean),
                    }))
                  }
                />
                <input
                  className="w-full rounded bg-black/20 px-4 py-2 text-white outline-none"
                  placeholder="University"
                  value={form.from}
                  onChange={(e) => handleChange('from', e.target.value)}
                />
                <input
                  className="w-full rounded bg-black/20 px-4 py-2 text-white outline-none"
                  placeholder="Location"
                  value={form.inLocation}
                  onChange={(e) => handleChange('inLocation', e.target.value)}
                />
                <input
                  className="w-full rounded bg-black/20 px-4 py-2 text-white outline-none"
                  placeholder="Website"
                  value={form.website}
                  onChange={(e) => handleChange('website', e.target.value)}
                />
                <textarea
                  className="w-full rounded bg-black/20 px-4 py-2 text-white outline-none"
                  placeholder="Introduction headline"
                  value={form.introductionHeadline}
                  onChange={(e) => handleChange('introductionHeadline', e.target.value)}
                />
                <textarea
                  className="w-full rounded bg-black/20 px-4 py-2 text-white outline-none"
                  placeholder="Introduction content"
                  value={form.introductionContent}
                  onChange={(e) => handleChange('introductionContent', e.target.value)}
                />
                {error && <p className="text-red-400 text-sm">{error}</p>}
                <div className="flex gap-3 justify-end">
                  <button
                    className="px-4 py-2 rounded bg-gray-600 text-white"
                    onClick={() => setIsEditing(false)}
                    disabled={saving}
                  >
                    Cancel
                  </button>
                  <button
                    className="px-4 py-2 rounded bg-purple-600 text-white disabled:opacity-60"
                    onClick={handleSubmit}
                    disabled={saving}
                  >
                    {saving ? 'Saving...' : 'Save'}
                  </button>
                </div>
              </div>
            ) : (
              <>
                <h1 className="text-3xl sm:text-4xl font-bold">{user.name}</h1>
                <div className="flex flex-wrap justify-center sm:justify-start gap-2 mt-2">
                  {user.tags.map((tag) => (
                    <span key={tag} className="bg-blue-600 px-3 py-1 rounded-full text-sm">
                      {tag}
                    </span>
                  ))}
                </div>
                <div className="mt-4 text-gray-400 space-y-1">
                  <p>{user.university}</p>
                  <p>{user.location}</p>
                  {user.website && (
                    <p>
                      web{' '}
                      <a
                        href={user.website.startsWith('http') ? user.website : `http://${user.website}`}
                        className="text-blue-400"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {user.website}
                      </a>
                    </p>
                  )}
                </div>
              </>
            )}
          </div>
        </div>

        <div className="mt-8 lg:mt-0 lg:ml-8 w-full lg:w-auto lg:min-w-[200px]">
          <div className="flex justify-center lg:justify-between items-center mb-6">
            <div className="text-center mr-8 lg:mr-4">
              <p className="text-gray-400">Followers</p>
              <p className="text-2xl font-bold">{user.followers}</p>
            </div>
            <div className="text-center">
              <p className="text-gray-400">Following</p>
              <p className="text-2xl font-bold">{user.following}</p>
            </div>
          </div>
          <div className="flex flex-col space-y-3">
            <button className="bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700">
              Share
            </button>
            <button
              className="bg-gray-700 text-white py-2 px-4 rounded-lg hover:bg-gray-600"
              onClick={() => setIsEditing(true)}
            >
              Edit profile
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
