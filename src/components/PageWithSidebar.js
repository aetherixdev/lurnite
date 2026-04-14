import Sidebar from "./Sidebar";

export default function PageWithSidebar({ children }) {
  return (
    <div className="flex h-screen dark:bg-gray-900 dark:text-white overflow-hidden">
      <Sidebar />
      <div className="flex-1 m-2 rounded-xl bg-white/00 px-4 py-5 shadow-none dark:bg-black overflow-hidden flex flex-col">
        {children}
      </div>
    </div>
  );
}
// bg-linear-135 from-[#F8FAFC] via-[#EEF2FF] to-[#ECFEFF]