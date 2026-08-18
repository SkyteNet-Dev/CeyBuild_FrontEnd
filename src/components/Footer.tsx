"use client";

import Link from "next/link";
import { HiOutlineMail, HiOutlinePhone, HiOutlineArrowRight } from "react-icons/hi";

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-400 mt-auto">
      {/* Main footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 lg:gap-8">
          {/* Brand */}
          <div className="lg:col-span-2 space-y-5">
            <Link href="/" className="flex items-center gap-2">
              <img src="/logo.png" alt="CeyBuild" className="h-14 w-14 object-contain" />
              <span className="text-lg font-extrabold text-primary tracking-tight">CeyBuild</span>
            </Link>
            <p className="text-gray-400 max-w-sm text-sm leading-relaxed">
              Connecting customers with skilled workers and service professionals
              for construction, repair, maintenance, and home-service needs.
            </p>
            <div className="space-y-2.5">
              <a href="mailto:infoceybuild@gmail.com" className="flex items-center gap-2.5 text-sm text-gray-400 hover:text-white transition-colors group">
                <HiOutlineMail className="w-4 h-4 text-primary" />
                infoceybuild@gmail.com
                <HiOutlineArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
              </a>
              <a href="tel:0722233196" className="flex items-center gap-2.5 text-sm text-gray-400 hover:text-white transition-colors group">
                <HiOutlinePhone className="w-4 h-4 text-primary" />
                072 223 3196
                <HiOutlineArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
              </a>
            </div>
          </div>

          {/* Services */}
          <div>
            <h3 className="font-bold text-white mb-5 tracking-wide uppercase text-xs">Services</h3>
            <ul className="space-y-3">
              <li><Link href="/services" className="text-sm hover:text-white transition-colors">All Services</Link></li>
              <li><Link href="/search" className="text-sm hover:text-white transition-colors">Find Workers</Link></li>
              <li><Link href="/free-tools" className="text-sm hover:text-white transition-colors">Free Tools</Link></li>
              <li><Link href="/how-it-works" className="text-sm hover:text-white transition-colors">How It Works</Link></li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="font-bold text-white mb-5 tracking-wide uppercase text-xs">Company</h3>
            <ul className="space-y-3">
              <li><Link href="/about" className="text-sm hover:text-white transition-colors">About Us</Link></li>
              <li><Link href="/contact" className="text-sm hover:text-white transition-colors">Contact</Link></li>
              <li><Link href="/auth/register?role=worker" className="text-sm hover:text-white transition-colors">Become a Worker</Link></li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="font-bold text-white mb-5 tracking-wide uppercase text-xs">Legal & Support</h3>
            <ul className="space-y-3">
              <li><Link href="/terms-and-conditions" className="text-sm hover:text-white transition-colors">Terms &amp; Conditions</Link></li>
              <li><Link href="/privacy-policy" className="text-sm hover:text-white transition-colors">Privacy Policy</Link></li>
              <li><Link href="/refund-policy" className="text-sm hover:text-white transition-colors">Refund &amp; Cancellation</Link></li>
              <li><Link href="/contact" className="text-sm hover:text-white transition-colors">Help &amp; Support</Link></li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex flex-col md:flex-row justify-between items-center gap-3">
          <p className="text-gray-500 text-sm">
            &copy; {new Date().getFullYear()} CeyBuild.com. All rights reserved.
          </p>
          <div className="flex gap-5 text-sm text-gray-500">
            <Link href="/terms-and-conditions" className="hover:text-white transition-colors">Terms</Link>
            <Link href="/privacy-policy" className="hover:text-white transition-colors">Privacy</Link>
            <Link href="/refund-policy" className="hover:text-white transition-colors">Refunds</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
