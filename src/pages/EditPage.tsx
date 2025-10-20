import { Outlet } from "react-router-dom";
import EditSidebar from "@/feature-edit/EditSidebar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";

const EditPage = () => {
  return (
    <SidebarProvider>
      <EditSidebar />
      <SidebarTrigger />
      <main className="w-full col-span-10 row-span-11 col-start-3 row-start-2 overflow-y-scroll p-2">
        <Outlet />
      </main>
    </SidebarProvider>
  );
};

export default EditPage;
