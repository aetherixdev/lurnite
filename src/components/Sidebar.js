import SidebarLink from "./SidebarLink";
import HomeIcon from '../icons/home.svg';
import CalendarIcon from '../icons/calendar.svg';
import SettingsIcon from '../icons/settings.svg';

export default function Sidebar() {
  return (
    <div className="h-screen w-50 flex flex-col justify-between py-5 px-3">
      <div className="flex items-center justify-center p-2">
        <p className="font-bold text-lg text-sky-950">LEARN STUDIO</p>
      </div>
      <div className="flex flex-col space-y-2">
        <SidebarLink href="/" label="Home"><HomeIcon className="fill-current" /></SidebarLink>
        <SidebarLink href="/calendar" label="Calender"><CalendarIcon className="fill-current" /></SidebarLink>
      </div>
      <div>
        <SidebarLink href="/settings" label="Settings"><SettingsIcon className="fill-current" /></SidebarLink>
      </div>
    </div>
  );
}