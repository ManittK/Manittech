import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { auth, db } from '../lib/firebase';
import { onAuthStateChanged, signOut, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { UserProfile } from '../types';
import { handleFirestoreError, OperationType } from '../lib/firebase';
import { Button, buttonVariants } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuGroup,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Menu, X, LogIn, Shield, User, LogOut, Briefcase } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function Navbar() {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      if (user) {
        const docRef = doc(db, 'users', user.uid);
        const docSnap = await getDoc(docRef);
        
        // Hardcoded admin check
        const isHardcodedAdmin = user.email?.toLowerCase() === 'manitt.kedia@gmail.com';
        
        try {
          if (docSnap.exists()) {
            const data = docSnap.data() as UserProfile;
            if (isHardcodedAdmin && data.role !== 'admin') {
              await updateDoc(docRef, { role: 'admin' });
              setProfile({ ...data, role: 'admin' });
            } else {
              setProfile(data);
            }
          } else {
            // Create new profile
            const referralCode = Math.random().toString(36).substring(2, 8).toUpperCase();
            const newProfile: UserProfile = {
              uid: user.uid,
              name: user.displayName || 'User',
              email: user.email || '',
              role: isHardcodedAdmin ? 'admin' : 'customer',
              referralCode,
              credits: 0,
              isWorkerActive: false,
              createdAt: serverTimestamp() as any,
            };
            await setDoc(docRef, newProfile);
            setProfile(newProfile);
          }
        } catch (error) {
          handleFirestoreError(error, OperationType.WRITE, `users/${user.uid}`);
        }
      } else {
        setProfile(null);
      }
    });
    return () => unsubscribe();
  }, []);

  const toggleWorkerMode = async () => {
    if (!profile || !user) return;
    const newStatus = !profile.isWorkerActive;
    try {
      await setDoc(doc(db, 'users', user.uid), { isWorkerActive: newStatus }, { merge: true });
      setProfile({ ...profile, isWorkerActive: newStatus });
      if (newStatus) {
        navigate('/worker-portal');
      } else {
        navigate('/dashboard');
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `users/${user.uid}`);
    }
  };

  const handleLogin = async () => {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error('Login failed', error);
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    navigate('/');
  };

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'About', path: '/about' },
    { name: 'Services', path: '/services' },
    { name: 'Tools', path: '/tools' },
    { name: 'AI Tools', path: '/ai-tools' },
  ];

  return (
    <nav className="h-16 sticky top-0 z-50 w-full bg-white border-b border-slate-200 flex items-center justify-between px-4 md:px-8 flex-shrink-0">
      <div className="container mx-auto flex h-full items-center justify-between">
        <div className="flex items-center gap-8">
          <Link to="/" className="text-2xl font-black tracking-tighter text-primary">
            MANIT<span className="text-slate-900">TECH</span>
          </Link>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex gap-6 text-sm font-medium text-slate-500">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                className="hover:text-slate-900 transition-colors"
              >
                {link.name}
              </Link>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-4">
          {profile ? (
            <DropdownMenu>
              <DropdownMenuTrigger className={cn(buttonVariants({ variant: "ghost" }), "relative h-8 w-8 rounded-full")}>
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user?.photoURL} alt={profile.name} />
                  <AvatarFallback>{profile.name.charAt(0)}</AvatarFallback>
                </Avatar>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end">
                <DropdownMenuGroup>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{profile.name}</p>
                      <p className="text-xs leading-none text-muted-foreground">{profile.email}</p>
                    </div>
                  </DropdownMenuLabel>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={toggleWorkerMode}>
                  <Briefcase className="mr-2 h-4 w-4" />
                  <span>{profile.isWorkerActive ? 'Switch to Customer View' : 'Become a Worker'}</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <Link to="/dashboard" className="flex w-full items-center">
                    <User className="mr-2 h-4 w-4" />
                    <span>Dashboard</span>
                  </Link>
                </DropdownMenuItem>
                {(profile.isWorkerActive || profile.role === 'worker') && (
                  <DropdownMenuItem>
                    <Link to="/worker-portal" className="flex w-full items-center">
                      <Briefcase className="mr-2 h-4 w-4" />
                      <span>Worker Portal</span>
                    </Link>
                  </DropdownMenuItem>
                )}
                {(profile.role === 'admin' && profile.email?.toLowerCase() === 'manitt.kedia@gmail.com') && (
                  <DropdownMenuItem>
                    <Link to="/admin" className="flex w-full items-center">
                      <Shield className="mr-2 h-4 w-4" />
                      <span>Admin Dashboard</span>
                    </Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button onClick={handleLogin} variant="default" size="sm" className="hidden md:flex gap-2">
              <LogIn className="h-4 w-4" />
              Sign In
            </Button>
          )}

          {/* Mobile Menu Toggle */}
          <button
            className="md:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="md:hidden border-t p-4 flex flex-col gap-4 bg-background">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              to={link.path}
              className="text-sm font-medium transition-colors hover:text-primary"
              onClick={() => setIsMenuOpen(false)}
            >
              {link.name}
            </Link>
          ))}
          {!profile && (
            <Button onClick={handleLogin} variant="default" size="sm" className="w-full gap-2">
              <LogIn className="h-4 w-4" />
              Sign In
            </Button>
          )}
        </div>
      )}
    </nav>
  );
}
