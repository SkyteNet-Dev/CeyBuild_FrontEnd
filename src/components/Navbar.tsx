"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { HiMenu, HiX, HiOutlineSearch } from "react-icons/hi";
import { useAuth } from "@/contexts/AuthContext";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import toast from "react-hot-toast";
import { useI18n } from "@/i18n/I18nProvider";
import LanguageSwitcher from "./LanguageSwitcher";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { user } = useAuth();
  const { t } = useI18n();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  const toggleMenu = () => setIsOpen(!isOpen);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setIsOpen(false);
      toast.success(t("nav.logoutSuccess") || "Successfully logged out!");
    } catch (error) {
      toast.error(t("nav.logoutError") || "Failed to log out.");
    }
  };

  const navLinks = [
    { href: "/", label: t("nav.home") },
    { href: "/services", label: t("nav.services") },
    { href: "/free-tools", label: t("nav.freeTools") || "Free Tools" },
    { href: "/about", label: t("nav.about") },
    { href: "/contact", label: t("nav.contact") },
  ];

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? "bg-white/90 backdrop-blur-xl shadow-[0_1px_3px_rgba(0,0,0,0.06)] border-b border-gray-100/50"
            : "bg-white/60 backdrop-blur-md"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 lg:h-[68px] items-center">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 shrink-0">
              <img src="/logo.png" alt="CeyBuild" className="h-14 w-14 object-contain" />
              <span className="text-lg font-extrabold text-primary tracking-tight">CeyBuild</span>
            </Link>

            {/* Desktop Nav */}
            <div className="hidden lg:flex items-center gap-0.5">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="relative px-4 py-2 text-[15px] font-medium text-gray-500 hover:text-gray-900 rounded-lg hover:bg-gray-100/60 transition-all duration-200"
                >
                  {link.label}
                </Link>
              ))}
            </div>

            {/* Desktop Right */}
            <div className="hidden lg:flex items-center gap-2">
              <Link
                href="/search"
                className="p-2.5 text-gray-400 hover:text-gray-900 hover:bg-gray-100/60 rounded-xl transition-all duration-200"
                title={t("nav.search") || "Search"}
              >
                <HiOutlineSearch className="w-5 h-5" />
              </Link>

              <div className="w-px h-6 bg-gray-200 mx-1" />

              <LanguageSwitcher />

              {user ? (
                <div className="flex items-center gap-2 ml-1">
                  <Link
                    href="/dashboard"
                    className="px-5 py-2 bg-gray-900 text-white text-sm font-semibold rounded-full hover:bg-gray-800 transition-colors duration-200 shadow-sm"
                  >
                    {t("nav.dashboard")}
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="px-4 py-2 text-sm font-medium text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-all duration-200"
                  >
                    {t("nav.logout")}
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2 ml-1">
                  <Link
                    href="/auth/login"
                    className="px-5 py-2 text-sm font-semibold text-gray-600 hover:text-gray-900 hover:bg-gray-100/60 rounded-full transition-all duration-200"
                  >
                    {t("nav.login")}
                  </Link>
                  <Link
                    href="/auth/register"
                    className="px-5 py-2 bg-primary text-white text-sm font-semibold rounded-full hover:bg-primary-hover shadow-md shadow-primary/15 hover:shadow-lg hover:shadow-primary/20 transition-all duration-200"
                  >
                    {t("nav.register")}
                  </Link>
                </div>
              )}
            </div>

            {/* Mobile Right */}
            <div className="flex lg:hidden items-center gap-1.5">
              <LanguageSwitcher />
              <button
                onClick={toggleMenu}
                className="p-2 text-gray-500 hover:text-gray-900 hover:bg-gray-100/60 rounded-xl transition-all duration-200"
                aria-label="Toggle menu"
              >
                {isOpen ? <HiX className="h-6 w-6" /> : <HiMenu className="h-6 w-6" />}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      <div
        className={`lg:hidden fixed inset-0 z-40 bg-black/20 backdrop-blur-sm transition-opacity duration-300 ${
          isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        onClick={toggleMenu}
      />

      {/* Mobile Menu */}
      <div
        className={`lg:hidden fixed top-16 left-0 right-0 z-50 bg-white/95 backdrop-blur-xl shadow-xl transition-all duration-300 ${
          isOpen
            ? "opacity-100 translate-y-0 pointer-events-auto"
            : "opacity-0 -translate-y-4 pointer-events-none"
        }`}
      >
        <div className="px-5 py-5 space-y-1 max-h-[calc(100vh-80px)] overflow-y-auto">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={toggleMenu}
              className="block px-4 py-3 text-[15px] font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100/60 rounded-xl transition-all duration-200"
            >
              {link.label}
            </Link>
          ))}
          <Link
            href="/search"
            onClick={toggleMenu}
            className="block px-4 py-3 text-[15px] font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100/60 rounded-xl transition-all duration-200"
          >
            {t("nav.search") || "Search Workers"}
          </Link>

          <div className="border-t border-gray-100 my-3" />

          {user ? (
            <div className="space-y-2">
              <Link
                href="/dashboard"
                onClick={toggleMenu}
                className="block px-4 py-3.5 bg-gray-900 text-white font-semibold rounded-xl text-center hover:bg-gray-800 transition-colors"
              >
                {t("nav.dashboard")}
              </Link>
              <button
                onClick={handleLogout}
                className="block w-full text-left px-4 py-3 text-red-600 font-medium hover:bg-red-50 rounded-xl transition-all"
              >
                {t("nav.logout")}
              </button>
            </div>
          ) : (
            <div className="flex gap-3 pt-2">
              <Link
                href="/auth/login"
                onClick={toggleMenu}
                className="flex-1 px-4 py-3.5 text-center text-gray-700 font-semibold border border-gray-200 rounded-xl hover:bg-gray-50 transition-all"
              >
                {t("nav.login")}
              </Link>
              <Link
                href="/auth/register"
                onClick={toggleMenu}
                className="flex-1 px-4 py-3.5 text-center bg-primary text-white font-semibold rounded-xl hover:bg-primary-hover shadow-md transition-all"
              >
                {t("nav.register")}
              </Link>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
