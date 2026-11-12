import React from 'react';
import ClientsFunnelTable from '@/components/stats/ClientsFunnelTable';

export default function LastWeekClientsCard({ lastWeek }) {
  return (
    <ClientsFunnelTable
      title="לקוחות חדשים — השבוע האחרון"
      description="כל המרפאות, השבוע האחרון בלבד: לקוחות חדשים, משלוח טפסי היכרות, החזרה על ידי הלקוח ובדיקות המרפאה"
      periodLabel={lastWeek?.label ? `שבוע ${lastWeek.label}` : ''}
      rows={lastWeek?.rows || []}
      iconClassName="text-teal-500"
      fileName="לקוחות-חדשים-השבוע-האחרון.csv"
      emptyText="אין נתוני לקוחות חדשים לשבוע האחרון"
    />
  );
}