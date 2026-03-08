'use client'

import { usePathname } from 'next/navigation'
import Link from "next/link";

export default function SidebarLink({ href, label, children }) {
  const pathname = usePathname()
  const isActive = pathname === href
  const activeStyle = isActive ? 'bg-gray-200 dark:bg-gray-800 text-sky-700 dark:text-sky-300 hover:text-sky-800 dark:hover:text-sky-200 font-medium' : ''

  return (
    <Link href={href}>
        <div className={`p-2 hover:bg-gray-200 dark:hover:bg-gray-800 active:bg-gray-300 dark:active:bg-gray-700 text-gray-700 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-200 transition-all duration-200 rounded-lg flex items-center space-x-6 ${activeStyle}`}>
            <div className="h-full max-w-2">
                {children}
            </div>
            <div className="">
               <p>{label}</p>
            </div>
        </div>
    </Link>
  );
}