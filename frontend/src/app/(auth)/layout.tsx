import Link from 'next/link';
import { HardHat } from 'lucide-react';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-amber-50 flex flex-col">
      {/* Header */}
      <div className="p-6">
        <Link href="/" className="inline-flex items-center gap-2 font-bold text-xl text-primary-600">
          <div className="bg-primary-500 rounded-lg p-1.5">
            <HardHat className="h-5 w-5 text-white" />
          </div>
          MHAO
        </Link>
      </div>

      {/* Content */}
      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          {children}
        </div>
      </div>

      {/* Footer */}
      <div className="p-6 text-center text-sm text-gray-400">
        © 2024 MHAO — Marketplace Habitat Afrique de l&apos;Ouest
      </div>
    </div>
  );
}
