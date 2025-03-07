import React from "react";

export const dynamic = "force-dynamic";

const Layout = async ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="flex min-h-screen flex-col">
      <main className="flex-1 bg-gray-50">
        <div className="container mx-auto px-4 py-8 mt-16">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;