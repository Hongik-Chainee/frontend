import { JobApplicantsView } from '@/views/profile/JobApplicantsView';

type Props = {
  params: {
    postId: string;
  };
};

export default function JobApplicantsPage({ params }: Props) {
  return <JobApplicantsView postId={params.postId} />;
}
