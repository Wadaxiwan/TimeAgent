import Form from '@/app/ui/doc/edit-form';
import Breadcrumbs from '@/app/ui/meeting/breadcrumbs';
import { fetchFilteredUsers, fetchDocumentById } from '@/app/lib/data';
import { notFound } from 'next/navigation';
import { MetaData } from '@lobehub/ui';
import { auth } from '@/auth';


export const metadata: MetaData = {
  title: 'Edit Document',
};
 
export default async function Page({ params }: { params: { id: string } }) {
    const document_id = params.id;  
    const session = await auth();
    if(!session){
      return;
    }
    const [document, users] = await Promise.all([
        fetchDocumentById(document_id, session.user.id),
        fetchFilteredUsers(''),
    ]);
    if (!document) {
      notFound();
    }
    return (
    <main>
      <Breadcrumbs
        breadcrumbs={[
          { label: 'Documents', href: '/dashboard/doc' },
          {
            label: 'Edit Document',
            href: `/dashboard/doc/${document_id}/edit`,
            active: true,
          },
        ]}
      />
      <Form document={document} users={users} user={session.user}/>
    </main>
  );
}