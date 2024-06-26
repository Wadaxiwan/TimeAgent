import Form from '@/app/ui/meeting/edit-form';
import Breadcrumbs from '@/app/ui/meeting/breadcrumbs';
import { fetchFilteredUsers, fetchMeetingById } from '@/app/lib/data';
import { notFound } from 'next/navigation';
import { MetaData } from '@lobehub/ui';
import { auth } from '@/auth';


export const metadata: MetaData = {
  title: 'Edit Meeting',
};
 
export default async function Page({ params }: { params: { id: string } }) {
    const meeting_id = params.id;  
    const session = await auth();
    if(!session){
      return;
    }
    const [meeting, users] = await Promise.all([
        fetchMeetingById(meeting_id, session.user.id),
        fetchFilteredUsers(''),
    ]);
    if (!meeting) {
      notFound();
    }
    return (
    <main>
      <Breadcrumbs
        breadcrumbs={[
          { label: 'Meetings', href: '/dashboard/meeting' },
          {
            label: 'Edit Meeting',
            href: `/dashboard/meeting/${meeting_id}/edit`,
            active: true,
          },
        ]}
      />
      <Form meeting={meeting} users={users} user={session.user}/>
    </main>
  );
}