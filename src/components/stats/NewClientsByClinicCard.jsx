import React from 'react';
import ClientsFunnelTable from '@/components/stats/ClientsFunnelTable';

export default function NewClientsByClinicCard({ rows = [], periodLabel }) {
  return (
    <ClientsFunnelTable
      title="לקוחות חדשים — כל המרפאות"
      description="לקוחות חדשים, משלוח טפסי היכרות, החזרה על ידי הלקוח ובדיקות המרפאה בתקופה הנבחרת"
      periodLabel={periodLabel}
      rows={rows}
      iconClassName="text-blue-500"
      fileName="לקוחות-חדשים-כל-המרפאות.csv"
    />
  );
}