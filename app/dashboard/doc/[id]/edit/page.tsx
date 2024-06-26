import Form from '@/app/ui/doc/edit-form';
import Breadcrumbs from '@/app/ui/meeting/breadcrumbs';
import { fetchFilteredUsers, fetchMeetingById } from '@/app/lib/data';
import { notFound } from 'next/navigation';
import { MetaData } from '@lobehub/ui';


export const metadata: MetaData = {
  title: 'Edit Document',
};
 
export default async function Page({ params }: { params: { id: string } }) {
    const meeting_id = params.id;  
    const [meeting, users] = await Promise.all([
        fetchMeetingById(meeting_id),
        fetchFilteredUsers(''),
    ]);
    if (!meeting) {
      notFound();
    }
    return (
    <main>
      <Breadcrumbs
        breadcrumbs={[
          { label: 'Docs', href: '/dashboard/doc' },
          {
            label: 'Edit Document',
            href: `/dashboard/doc/${meeting_id}/edit`,
            active: true,
          },
        ]}
      />
      <Form meeting={meeting} users={users} />
    </main>
  );
}