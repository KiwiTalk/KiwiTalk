import { createResource } from 'solid-js';
import { Profile } from '../components/profile';
import { meProfile } from '../../api/api';

export const LogonProfile = () => {
  const [profile] = createResource(meProfile);

  return <Profile
    profileImageURL={profile()?.profile.profileUrl}
    name={profile()?.nickname || 'Loading...'}
    contact={profile()?.email || ''}
  />;
};
