export default function PageWithSidebar({ children }) {
  return (
    <div className="flex h-full flex-col px-4 py-5">
      {children}
    </div>
  );
}