import React from 'react';
import { Building2, ChevronRight, Search, Bell, Settings2 } from 'lucide-react';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';

export const Header = () => {
  return (
    <header className="h-14 border-b bg-card flex items-center justify-between px-4 lg:px-6 shrink-0 shadow-sm z-10">
      <div className="flex items-center gap-4 flex-1">
        <div className="hidden md:flex items-center gap-2 text-sm font-medium text-muted-foreground border-r pr-4 h-6">
          <Building2 className="h-4 w-4" />
          Global HQ
          <ChevronRight className="h-4 w-4" />
          <span className="text-foreground">Information Security</span>
        </div>
        <div className="relative max-w-md flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search globally..." className="pl-9 bg-muted/50 border-transparent focus-visible:bg-background focus-visible:border-input" />
          <div className="absolute right-2.5 top-2.5 flex gap-1">
            <kbd className="hidden sm:inline-flex h-4 items-center gap-1 rounded border bg-card px-1.5 font-mono text-[10px] font-medium text-muted-foreground shadow-sm">⌘K</kbd>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-3 ml-4">
        <Button variant="ghost" size="icon" className="relative text-muted-foreground hover:text-foreground">
          <Bell className="h-4 w-4" />
          <span className="absolute top-2 right-2 w-2 h-2 bg-destructive rounded-full border-2 border-card" />
        </Button>
        <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
          <Settings2 className="h-4 w-4" />
        </Button>
      </div>
    </header>
  );
};
