import { NavLink } from "react-router-dom";
import {
  Sidebar,
  SidebarFooter,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Camera, Image, Settings, HelpCircle, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";

const items = [
  { title: "Live View", url: "live", icon: Camera },
  { title: "Gallery", url: "editor", icon: Image },
  { title: "Settings", url: "settings", icon: Settings },
  { title: "Help & Support", url: "help", icon: HelpCircle },
];

type SidebarLinkProps = {
  to: string;
  icon: React.ElementType;
  title: string;
};

const SidebarLink = ({ to, icon: Icon, title }: SidebarLinkProps) => (
  <NavLink
    to={to}
    className={({ isActive }) =>
      cn(
        "w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm transition",
        isActive
          ? "bg-yellow-400 text-black font-semibold"
          : "text-gray-400 hover:text-yellow-400 hover:bg-zinc-800"
      )
    }
  >
    <Icon size={18} />
    <span>{title}</span>
  </NavLink>
);

const EditSidebar = () => {
  return (
    <Sidebar className="bg-black text-gray-100 border-r border-zinc-800 flex flex-col">
      <SidebarHeader className="bg-black">
        <div className="flex gap-2 p-5 border-b border-zinc-800">
          <span className="p-1 bg-yellow-400 rounded-md">📸</span>
          <h1 className="font-bold text-lg text-yellow-400">PhotoSnap</h1>
        </div>
      </SidebarHeader>

      <SidebarGroupContent className="flex-1 p-3 space-y-2 overflow-y-auto bg-black">
        <SidebarMenu>
          {items.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarLink to={item.url} icon={item.icon} title={item.title} />
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>

      <SidebarFooter className="bg-black flex justify-between items-center p-3 border-t border-zinc-800 text-sm">
        <button className="flex items-center gap-2 text-gray-400 hover:text-red-500 transition">
          <LogOut size={16} />
          Logout
        </button>
        <span className="text-xs text-gray-600">v1.0.0</span>
      </SidebarFooter>
    </Sidebar>
  );
};

export default EditSidebar;
