"use client";

import React, { Suspense } from 'react';
import { useParams } from 'next/navigation';
import VerificationPage from '../page';

function VerificationDetailContent() {
  const params = useParams();
  const id = params?.id as string;

  return <VerificationPage initialEnquiryId={id} />;
}

export default function VerificationDetailPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <VerificationDetailContent />
    </Suspense>
  );
}
