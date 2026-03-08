import Sidebar from "./Sidebar";

export default function PageWithSidebar({ children }) {
  return (
    <div className="flex bg-gray-100 dark:bg-gray-900 dark:text-white">
        <Sidebar />
        <div className="my-2 mr-2 w-full bg-white dark:bg-black px-4 py-5 rounded-xl shadow">
      {children}
    </div>
    </div>
  );
}