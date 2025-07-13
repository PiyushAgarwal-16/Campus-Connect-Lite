
"use client";

import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { BookUser, Calendar, LogOut, PlusCircle, User as UserIcon, Building2, Ticket, ScanLine } from "lucide-react";
import { useRouter } from "next/navigation";

const Header = () => {
  const { user, logout, loading } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  const getInitials = (name: string = "") => {
    return name.split(' ').map(n => n[0]).join('');
  };

  return (
    <header className="bg-card border-b shadow-sm sticky top-0 z-40">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2 text-xl font-bold font-headline text-primary">
            <Building2 className="h-6 w-6" />
            <span>CampusConnect Lite</span>
          </Link>

          <nav className="hidden md:flex items-center gap-4">
            <Button variant="ghost" asChild>
              <Link href="/">Events</Link>
            </Button>
            <Button variant="ghost" asChild>
              <Link href="/calendar">Calendar</Link>
            </Button>
            {user?.role === 'organizer' && (
              <>
                <Button variant="ghost" asChild>
                  <Link href="/create-event">Create Event</Link>
                </Button>
                <Button variant="ghost" asChild>
                  <Link href="/scan">Scan Ticket</Link>
                </Button>
              </>
            )}
          </nav>

          <div className="flex items-center gap-4">
            {loading ? (
              <div className="h-10 w-24 bg-muted rounded-md animate-pulse" />
            ) : user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={`https://placehold.co/100x100.png`} alt={user.name} data-ai-hint="profile avatar" />
                      <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{user.name}</p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {user.email}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild className="cursor-pointer">
                    <Link href="/profile">
                      <UserIcon className="mr-2 h-4 w-4" />
                      <span>Profile</span>
                    </Link>
                  </DropdownMenuItem>
                   {user.role === 'student' && (
                    <DropdownMenuItem asChild className="cursor-pointer">
                        <Link href="/profile#my-tickets">
                            <Ticket className="mr-2 h-4 w-4" />
                            <span>My Tickets</span>
                        </Link>
                    </DropdownMenuItem>
                  )}
                  {user.role === 'organizer' && (
                    <>
                      <DropdownMenuItem asChild className="cursor-pointer md:hidden">
                        <Link href="/create-event">
                          <PlusCircle className="mr-2 h-4 w-4" />
                          <span>Create Event</span>
                        </Link>
                      </DropdownMenuItem>
                       <DropdownMenuItem asChild className="cursor-pointer md:hidden">
                        <Link href="/scan">
                          <ScanLine className="mr-2 h-4 w-4" />
                          <span>Scan Ticket</span>
                        </Link>
                      </DropdownMenuItem>
                    </>
                  )}
                  <DropdownMenuItem onClick={handleLogout} className="cursor-pointer">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button asChild>
                <Link href="/login">Login</Link>
              </Button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
