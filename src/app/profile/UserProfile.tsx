import {
  UserProfileHeader,
  ProfileBody,
  ProfileSidebar,
} from ".";

export function UserProfile() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <main>
        <div className="mt-8">
          <UserProfileHeader />
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-16">
            <div className="lg:col-span-2">
              <ProfileBody />
            </div>
            <ProfileSidebar />
          </div>
        </div>
      </main>
    </div>
  );
}
