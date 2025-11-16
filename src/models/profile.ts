export interface User {
  id?: number;
  name: string;
  tags: string[];
  university: string;
  location: string;
  website: string;
  followers: number;
  following: number;
  avatarUrl: string; // Added for the avatar image
  isFollowing?: boolean;
}

export interface Project {
  name: string;
  description: string;
  imageUrl: string; // Added for the project image
}

export interface JobPosting {
  name: string;
  status: 'OPEN' | 'Closed';
  details: string;
  applicantCount?: number;
}

export interface Resume {
  id: number;
  title: string;
  name: string;
  introduction?: string;
  desiredPosition?: string;
  skills: string[];
  careerLevel?: string;
  portfolioUrl?: string;
  updatedAt?: string;
  createdAt?: string;
}

export interface Introduction {
    title: string;
    body: string;
}

export interface ProfileResponse {
  id: number;
  email?: string;
  name?: string;
  profileImageUrl?: string;
  positions?: string[];
  from?: string;
  in?: string;
  website?: string;
  introductionHeadline?: string;
  introductionContent?: string;
  introductionPhotoUrl?: string;
  mainProject?: ApiProject;
  myProjects?: ApiProject[];
  jobPosts?: ApiJobPost[];
  resumes?: ApiResume[];
  followerCount?: number;
  followingCount?: number;
  isFollowing?: boolean;
}

export interface ApiProject {
  id: number;
  title?: string;
  nftTokenUri?: string;
  completedAt?: string;
  description?: string;
  isPublic?: boolean;
  thumbnailUrl?: string;
}

export interface ApiJobPost {
  id: number;
  title?: string;
  description?: string;
  payment?: number;
  requiredSkills?: string[] | string;
  deadline?: string;
  applicantCount?: number;
  status?: string;
  location?: string;
}

export interface ApiResume {
  id?: number;
  name?: string;
  title?: string;
  updatedAt?: string;
  lastUpdate?: string;
}
