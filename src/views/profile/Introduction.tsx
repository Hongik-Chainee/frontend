import { Introduction as IntroductionModel } from '@/models/profile';

interface IntroductionProps {
  introduction: IntroductionModel | null;
}

export function Introduction({ introduction }: IntroductionProps) {
  const hasIntro =
    !!introduction && (!!introduction.title || !!introduction.body);

  return (
    <section>
      <h2 className="text-2xl font-bold text-purple-400 mb-4">
        Introduction
      </h2>

      {hasIntro ? (
        <>
          <h3 className="text-4xl font-bold">
            {introduction.title || 'Introduction'}
          </h3>
          <p className="mt-4 text-gray-400 whitespace-pre-line">
            {introduction.body}
          </p>
        </>
      ) : (
        <p className="mt-4 text-gray-500">
          아직 소개글이 작성되지 않았어요. ✏️ 프로필 편집에서 소개를 추가해보세요.
        </p>
      )}
    </section>
  );
}
