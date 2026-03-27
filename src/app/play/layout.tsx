'use client';

import { usePathname } from 'next/navigation';
import StepIndicator from '@/components/layout/StepIndicator';
import Header from '@/components/layout/Header';

const STEPS = [
  { path: '/play', label: 'Build Team' },
  { path: '/play/arrange', label: 'Arrange Order' },
  { path: '/play/battle', label: 'Battle' },
] as const;

export default function PlayLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const currentStepIndex = STEPS.findIndex((s) => s.path === pathname);
  const activeStep = currentStepIndex >= 0 ? currentStepIndex : 0;

  return (
    <div className="flex flex-col flex-1">
      <Header />
      <StepIndicator
        steps={STEPS.map((s) => s.label)}
        activeStep={activeStep}
      />
      <main className="flex-1 max-w-[1200px] w-full mx-auto px-4 pb-8">
        {children}
      </main>
    </div>
  );
}
