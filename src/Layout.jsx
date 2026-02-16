import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { createPageUrl } from "@/components/utils/urlHelpers";
import {
  LayoutDashboard,
  ClipboardCheck,
  HeartPulse,
  Smile,
  Stethoscope,
  BookUser,
  LogOut,
  LogIn,
  Menu,
  Building2 as ClinicIcon,
  Calendar,
  Megaphone,
  Settings,
  TrendingUp,
  Users
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import userService from "@/components/services/userService";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import { base44 } from "@/api/base44Client";
import TestEnvBanner from "@/components/common/TestEnvBanner";
import { Toaster } from "sonner";

const GlobalStyles = () => (
  <style>
    {`
      @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+Hebrew:wght@100..900&display=swap');
      body, .font-sans, h1, h2, h3, h4, h5, h6, p, a, button, input, select, textarea, span, div, label {
        font-family: 'Noto Sans Hebrew', sans-serif !important;
      }
    `}
  </style>
);

const AccessibilityStyles = () => (
  <style>{`
    /* --- גלובלי: שיפור נגישות --- */
    
    /* 1. הוספת טבעת פוקוס ברורה לכל האלמנטים האינטראקטיביים */
    *:focus-visible {
      outline: 2px solid hsl(var(--ring)) !important;
      outline-offset: 2px;
      box-shadow: 0 0 0 3px hsla(var(--ring), 0.3) !important;
    }

    /* 2. הסרת טבעות ברירת מחדל כדי למנע כפילות */
    button:focus, a:focus, input:focus, select:focus, textarea:focus {
      outline: none;
    }
  `}</style>
);

// Updated navigation items - removed surgery, spay/neuter, and dental care instructions
const navItems = [
  { href: "/Dashboard", icon: LayoutDashboard, label: "דשבורד", roles: ['admin', 'user'] },
  { href: "/ManageAppointments", icon: Calendar, label: "ניהול תורים", roles: ['admin', 'user'] },
  { type: 'divider', label: 'טפסים והנחיות' },
  { href: "/IntakeFormsList", icon: ClipboardCheck, label: "טפסי היכרות", roles: ['admin', 'user'] },
  { href: "/ConsentForms", icon: ClipboardCheck, label: "טפסי הסכמה", roles: ['admin', 'user'] },
  { type: 'divider', label: 'ניהול' },
  { href: "/SystemManagement", icon: TrendingUp, label: "ניהול המערכת", roles: ['admin'] },
  { href: "/UserManagement", icon: Users, label: "ניהול משתמשים", roles: ['admin'] },
  { href: "/Clinics", icon: ClinicIcon, label: "מרפאות", roles: ['admin'] },
  { href: "/ClinicSettings", icon: Settings, label: "הגדרות סנכרון", roles: ['admin'] },
  { href: "/UserManual", icon: BookUser, label: "מדריך למשתמש", roles: ['admin', 'user'] },
  { href: "/MarketingMaterials", icon: Megaphone, label: "חומרי שיווק", roles: ['admin'] },
];

function NavItem({ item, isActive, onNavigate }) {
  return (
    <Link to={item.href} onClick={onNavigate}>
      <Button
        variant={isActive ? "default" : "ghost"}
        className={`w-full justify-start gap-2 transition-all duration-300 ${
          isActive
            ? 'bg-gradient-to-r from-blue-500 to-teal-500 text-white shadow-lg hover:from-blue-600 hover:to-teal-600'
            : 'text-slate-600 hover:bg-blue-50 hover:text-blue-700'
        }`}
      >
        <item.icon className="w-4 h-4" />
        <span className="font-medium">{item.label}</span>
      </Button>
    </Link>
  );
}

// Navigation component now accepts user-related props from Layout
function Navigation({ currentPath, onNavigate, currentUser, isLoadingUser, handleLogin, handleLogout }) {
  const getVisibleNavItems = () => {
    if (!currentUser) return [];
    
    const isAdmin = currentUser.role === 'admin';
    
    return navItems.filter(item => {
      if (item.type === 'divider') return true;
      if (!item.roles || item.roles.length === 0) return false;
      
      if (isAdmin) {
        return item.roles.includes('admin') || item.roles.includes('user');
      }
      
      return item.roles.includes('user');
    });
  };

  if (isLoadingUser) {
    return (
      <div className="flex justify-center py-4">
        <LoadingSpinner />
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="pt-4 mt-4">
        <Button
          onClick={handleLogin}
          className="w-full justify-start gap-2 bg-blue-600 hover:bg-blue-700 text-white"
        >
          <LogIn className="w-4 h-4" />
          <span className="font-medium">התחבר</span>
        </Button>
      </div>
    );
  }

  const visibleNavItems = getVisibleNavItems();

  return (
    <div className="space-y-2">
      <div className="px-3 py-2 mb-4 bg-slate-50 rounded-lg">
        <p className="text-sm font-medium text-slate-700">{currentUser.full_name}</p>
        <p className="text-xs text-slate-500">{currentUser.email}</p>
        {currentUser.role === 'admin' && (
          <span className="inline-block mt-1 px-2 py-0.5 text-xs bg-blue-100 text-blue-800 rounded">
            מנהל מערכת
          </span>
        )}
      </div>

      {visibleNavItems.map((item, index) => {
        if (item.type === 'divider') {
          return (
            <p key={`divider-${index}`} className="px-3 py-2 text-xs font-semibold uppercase text-slate-400 mt-4 border-t pt-4 border-slate-200">
              {item.label}
            </p>
          );
        }
        const isActive = currentPath === item.href;
        return (
          <NavItem
            key={item.href}
            item={item}
            isActive={isActive}
            onNavigate={onNavigate}
          />
        );
      })}

      <div className="pt-4 mt-4 border-t border-slate-200">
        <Button
          variant="ghost"
          onClick={handleLogout}
          className="w-full justify-start gap-2 text-red-600 hover:bg-red-50 hover:text-red-700"
        >
          <LogOut className="w-4 h-4" />
          <span className="font-medium">התנתק</span>
        </Button>
      </div>
    </div>
  );
}

export default function Layout({ children, currentPageName }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoadingUser, setIsLoadingUser] = useState(true);

  useEffect(() => {
    const loadCurrentUser = async () => {
      setIsLoadingUser(true);
      try {
        const user = await userService.getCurrentUser();
        setCurrentUser(user);
      } catch (error) {
        console.error('[Layout] Error loading user:', error);
        setCurrentUser(null);
      } finally {
        setIsLoadingUser(false);
      }
    };
    loadCurrentUser();
  }, []);

  const handleLogout = async () => {
    try {
      await userService.logout();
      setCurrentUser(null);
      window.location.href = '/';
    } catch (error) {
      console.error('Error during logout:', error);
      alert('שגיאה במהלך ההתנתקות.');
    }
  };

  const handleLogin = async () => {
    try {
      const callbackUrl = window.location.origin + '/Dashboard';
      await base44.auth.redirectToLogin(callbackUrl);
    } catch (error) {
      console.error('Login failed', error);
    }
  };

  useEffect(() => {
    const adminOnlyPages = ["/MarketingMaterials", "/SystemManagement", "/Clinics"];
    
    if (!isLoadingUser) {
      if (adminOnlyPages.includes(location.pathname)) {
        if (!currentUser || currentUser.role !== "admin") {
          console.warn(`User tried to access ${location.pathname}. Redirecting.`);
          navigate("/Dashboard");
        }
      }
    }
  }, [currentUser, isLoadingUser, location.pathname, navigate]);

  // Public pages
  const publicPages = ['PublicForm', 'PublicConsentForm', 'PublicViewIntakeForm', 'AppointmentBooking', 'PublicAnxietyQuestionnaire', 'PublicEmergencyTriage'];
  const publicPaths = ['/PublicForm', '/PublicConsentForm', '/PublicViewIntakeForm', '/AppointmentBooking', '/PublicAnxietyQuestionnaire', '/PublicEmergencyTriage'];

  const isPublicPage = publicPages.includes(currentPageName) || publicPaths.includes(location.pathname);

  if (isPublicPage) {
    return (
      <>
        <TestEnvBanner />
        <AccessibilityStyles />
      <Toaster richColors position="top-center" />
        <div dir="rtl">
          <GlobalStyles />
          {children}
        </div>
      </>
    );
  }

  return (
    <>
      <TestEnvBanner />
      <AccessibilityStyles />
      <Toaster richColors position="top-center" />
      <div dir="rtl" className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-teal-50">
        <GlobalStyles />
        <div className="flex">
          {/* Desktop Sidebar */}
          <div className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0">
            <div className="flex flex-col h-full bg-white/90 backdrop-blur-md border-l border-blue-100 shadow-xl">
              <div className="p-6 border-b border-blue-100 flex-shrink-0">
                <Link to="/Dashboard" className="flex items-center gap-3">
                  <div className="w-full flex items-center justify-center">
                    <img
                      src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/687b78971cad562073ed5929/d7815950c_Yourparagraphtext1.png"
                      alt="טדי וטס"
                      className="w-40 h-auto object-contain"
                    />
                  </div>
                </Link>
              </div>

              <div className="flex-1 p-6 overflow-y-auto">
                <Navigation
                  currentPath={location.pathname}
                  onNavigate={() => {}}
                  currentUser={currentUser}
                  isLoadingUser={isLoadingUser}
                  handleLogin={handleLogin}
                  handleLogout={handleLogout}
                />
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:mr-64 flex-1">
            <header className="lg:hidden bg-white/90 backdrop-blur-md border-b border-blue-100 px-4 py-4 shadow-sm sticky top-0 z-50">
              <div className="flex items-center justify-between">
                <Link to="/Dashboard" className="flex items-center gap-3">
                  <div className="flex items-center justify-center">
                    <img
                      src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/687b78971cad562073ed5929/d7815950c_Yourparagraphtext1.png"
                      alt="טדי וטס"
                      className="w-32 h-auto object-contain"
                    />
                  </div>
                </Link>

                <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
                  <SheetTrigger asChild>
                    <Button
                      variant="outline"
                      size="icon"
                      className="border-slate-200"
                    >
                      <Menu className="w-5 h-5" />
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="right" className="w-80 p-0 flex flex-col h-full">
                    <div className="p-6 border-b border-blue-100 flex-shrink-0">
                      <Link
                        to="/Dashboard"
                        className="flex items-center justify-between"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        <div className="flex items-center gap-3">
                          <img
                            src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/687b78971cad562073ed5929/d7815950c_Yourparagraphtext1.png"
                            alt="טדי וטס"
                            className="w-32 h-auto object-contain"
                          />
                        </div>
                      </Link>
                    </div>
                    <div className="flex-1 overflow-y-auto p-6">
                      <Navigation
                        currentPath={location.pathname}
                        onNavigate={() => setIsMobileMenuOpen(false)}
                        currentUser={currentUser}
                        isLoadingUser={isLoadingUser}
                        handleLogin={handleLogin}
                        handleLogout={handleLogout}
                      />
                    </div>
                  </SheetContent>
                </Sheet>
              </div>
            </header>

            <main className="flex-1">
              {children}
            </main>
          </div>
        </div>
      </div>
    </>
  );
}