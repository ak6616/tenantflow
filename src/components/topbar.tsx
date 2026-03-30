"use client";

import { Bell, Search, Plus, LogOut } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/lib/auth-context";

export function TopBar() {
  const { user, logout } = useAuth();

  return (
    <header className="flex h-14 items-center justify-between border-b border-border bg-card px-6">
      <div className="relative w-72">
        <Search
          size={16}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
        />
        <Input placeholder="Search..." className="pl-9" />
      </div>

      <div className="flex items-center gap-2">
        <Button variant="default" size="sm">
          <Plus size={16} />
          New Lead
        </Button>
        <button className="relative rounded-(--radius-md) p-2 text-muted-foreground hover:bg-accent">
          <Bell size={18} />
        </button>
        <Avatar name={user?.name || "User"} />
        <button
          onClick={logout}
          className="rounded-(--radius-md) p-2 text-muted-foreground hover:bg-accent"
          title="Sign out"
        >
          <LogOut size={18} />
        </button>
      </div>
    </header>
  );
}
