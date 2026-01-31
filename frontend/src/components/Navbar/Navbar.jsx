import { NavLink } from 'react-router-dom';
import clsx from 'clsx';
import { useRole } from '../../context/RoleContext.jsx';

const navItems = [
  { to: '/', label: 'Home', icon: '🏠', roles: ['student', 'admin'] },
  { to: '/internships', label: 'Internships', icon: '🎓', roles: ['student'] },
  { to: '/hire', label: 'Hire', icon: '🧑‍💼', roles: ['admin'] },
  { to: '/admin/startups', label: 'Startups', icon: '🚀', roles: ['admin'] },
  { to: '/events', label: 'Events', icon: '🎉', roles: ['student', 'admin'] },
  { to: '/chat', label: 'Chat', icon: '🤖', roles: ['student', 'admin'] },
  { to: '/profile', label: 'Profile', icon: '👤', roles: ['student', 'admin'] },
];

const Navbar = () => {
  const { role } = useRole();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-card/95 backdrop-blur">
      <div className="mx-auto flex max-w-screen-md items-center justify-between px-6 py-3">
        {navItems
          .filter((item) => !item.roles || item.roles.includes(role))
          .map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                clsx(
                  'flex flex-col items-center gap-1 text-xs font-medium transition',
                  isActive ? 'text-primary' : 'text-muted hover:text-body',
                )
              }
            >
              <span className="text-lg">{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
      </div>
    </nav>
  );
};

export default Navbar;
