import { Metadata } from 'next';
import { GoalsClient } from './_components/goals-client';

export const metadata: Metadata = {
  title: 'Quản lý Kế hoạch | Gia Kế',
  description: 'Quản lý các kế hoạch và mục tiêu tài chính dài hạn',
};

export default function GoalsPage({
  searchParams,
}: {
  searchParams: { allocate?: string };
}) {
  const isAllocate = searchParams.allocate === 'true';

  return <GoalsClient isAllocate={isAllocate} />;
}
