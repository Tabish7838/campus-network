import Loader from '../../components/Loader/Loader.jsx';
import { useRole } from '../../context/RoleContext.jsx';
import StudentProfile from './StudentProfile.jsx';
import AdminProfile from './AdminProfile.jsx';
import StartupProfile from './StartupProfile.jsx';

const Profile = () => {
  const { role, roleLoading } = useRole();

  if (roleLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader label="Loading profile" />
      </div>
    );
  }

  if (role === 'admin' || role === 'organizer' || role === 'club') {
    return <AdminProfile />;
  }

  if (role === 'startup') {
    return <StartupProfile />;
  }

  return <StudentProfile />;
};

export default Profile;
