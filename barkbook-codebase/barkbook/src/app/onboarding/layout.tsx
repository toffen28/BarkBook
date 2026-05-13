export default function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <div className="py-8 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-[#2D9CDB]">🐕 BarkBook</h1>
            <p className="text-gray-600 mt-2">Get started in under 5 minutes</p>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}