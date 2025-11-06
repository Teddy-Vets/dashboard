import React, { useState } from 'react';
import SendLinksDialog from '@/components/widgets/SendLinksDialog';
import { Button } from '@/components/ui/button';
import { Share2 } from 'lucide-react';
import userService from '../services/userService';

const ShareFormDialog = () => {
  const [clinicId, setClinicId] = useState(null);

  // This is a bit of a hack to get the user's clinic ID on button click
  // A better solution would use a global state/context
  const handleOpen = async () => {
    try {
      const user = await userService.getCurrentUser();
      setClinicId(user?.clinic_id || 'מודיעין'); // fallback to a default
    } catch {
      setClinicId('מודיעין');
    }
  };

  return (
    <div onClick={handleOpen}>
      <SendLinksDialog defaultClinicId={clinicId} />
    </div>
  );
}

// Replace the existing PageHeader action button with this component.
// For example, in `Dashboard.jsx`:
/*
<PageHeader
  ...
  actionComponent={<ShareFormDialog />}
/>
Instead of `actionLabel` and `onAction`.
This will require a small change in PageHeader component to accept `actionComponent` prop.
*/

export default ShareFormDialog;