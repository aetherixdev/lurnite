export default function Button({ children, className, onClick, textColor }) {
  return (
    <button 
       className={
        `bg-blue-600 cursor-pointer hover:bg-blue-700 active:bg-blue-800 transition-all duration-200 text-white px-5 py-3 rounded-md ${className}`} 
       onClick={onClick}
      >
      <span className={textColor}>{children}</span>
    </button>
  );
}