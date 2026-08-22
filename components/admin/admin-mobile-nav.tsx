"use client";

import { useState } from "react";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { AdminNavLinks } from "@/components/admin/admin-nav-links";

export function AdminMobileNav() {
  const [open, setOpen] = useState(false);

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          aria-label="Open navigation"
        >
          <Menu className="h-5 w-5" />
        </Button>
      </DrawerTrigger>
      <DrawerContent side="left" className="overflow-y-auto">
        <DrawerTitle className="text-foreground mb-4 px-1 font-serif text-lg font-semibold">
          Ink &amp; Paper
        </DrawerTitle>
        <AdminNavLinks onNavigate={() => setOpen(false)} />
      </DrawerContent>
    </Drawer>
  );
}
