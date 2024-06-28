import Form from '@/app/ui/meeting/create-form';
import Breadcrumbs from '@/app/ui/meeting/breadcrumbs';
import { fetchFilteredUsers } from '@/app/lib/data';
import { MetaData } from '@lobehub/ui';
import { auth } from "@/auth"

export const metadata: MetaData = {
  title: 'Create Meeting',
};


export default async function Page() {

  const users = await fetchFilteredUsers('');
  const session = await auth();

  if (!session.user) return null
   
  return (
    <main>
      <Breadcrumbs
        breadcrumbs={[
          { label: 'Meetings', href: '/dashboard/meeting' },
          {
            label: 'Create Meeting',
            href: '/dashboard/meeting/create',
            active: true,
          },
        ]}
      />
      <Form users={users} user={session.user}/>
    </main>
  );
}