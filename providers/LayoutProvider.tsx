"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

function LayoutProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isPublicRoute = ["/sign-in", "/sign-up"].includes(pathname);

  const getNavbar = () => {
    if (isPublicRoute) return null;
    return <Navbar />;
  };

  const getFooter = () => {
    if (isPublicRoute) return null;
    return <Footer />;
  };

  useEffect(() => {
    if (!isPublicRoute) {
      // Fetch current user or perform any other side effects here
    }
  }, [isPublicRoute]);

  return (
    <div className="min-h-screen bg-secondary flex flex-col justify-between">
      {getNavbar()}
      <main>{children}</main>
      {getFooter()}
    </div>
  );
}

export default LayoutProvider;
