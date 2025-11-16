import { JobDetailView } from '@/views/projects/JobDetailView';

type Props = {
  params: {
    postId: string;
  };
};

export default function ProjectDetailPage({ params }: Props) {
  return <JobDetailView postId={params.postId} />;
}
