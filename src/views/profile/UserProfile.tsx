'use client';

import { useSearchParams } from 'next/navigation';
import { useProfileViewModel } from '@/viewModels/profileViewModel';
import { Introduction } from "./Introduction";
import { MyProject } from "./MyProject";
import { JobPostings } from "./JobPostings";
import { Resume } from "./Resume";
import { UserInfo } from "./UserInfo";

export function UserProfile() {
  const searchParams = useSearchParams();
  const userId = searchParams?.get('userId') ?? undefined;

  const {
    user,
    projects,
    jobPostings,
    resumes,
    introduction,
    isLoading,
    error,
    refetch,
  } = useProfileViewModel({ userId });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p className="text-2xl">Loading profile...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p className="text-2xl text-red-400">{error}</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <main>
        <div className="mt-8">
          <UserInfo user={user} onUpdated={refetch} />
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-16">
            <div className="lg:col-span-2">
              <Introduction introduction={introduction} />
            </div>
            <div className="hidden lg:block">
              {/* This could be a dynamic component or ad space later */}
              <div className="bg-purple-500 h-64 w-full rounded-lg"></div>
            </div>
          </div>
          
          <MyProject projects={projects} />
          <JobPostings jobPostings={jobPostings} />
          <Resume resumes={resumes} />
        </div>
      </main>
    </div>
  );
}
