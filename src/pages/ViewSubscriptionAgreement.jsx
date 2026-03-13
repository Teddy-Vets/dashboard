import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Printer, ArrowRight, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { he } from "date-fns/locale";
import { Link } from "react-router-dom";

const PLAN_LABELS = {
  teddy_basic: "טדי בייסיק (כלבים) - ₪89/חודש",
  teddy_plus: "טדי פלוס (כלבים) - ₪129/חודש",
  teddy_platinum: "טדי פלטינום (כלבים) - ₪169/חודש",
  teddy_royal: "טדי רויאל (חתולים) - ₪79/חודש",
  teddy_insured: "טדי בטוח (לבעלי ביטוח פרטי) - ₪79/חודש",
};

export default function ViewSubscriptionAgreement() {
  const [agreement, setAgreement] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get("id");
    if (id) {
      base44.entities.SubscriptionAgreement.get(id)
        .then(setAgreement)
        .finally(() => setIsLoading(false));
    } else {
      setIsLoading(false);
    }
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
      </div>
    );
  }

  if (!agreement) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <p className="text-slate-600">הסכם לא נמצא</p>
        <Link to="/SubscriptionAgreements">
          <Button variant="outline"><ArrowRight className="w-4 h-4 ml-2" />חזור לרשימה</Button>
        </Link>
      </div>
    );
  }

  return (
    <div dir="rtl" className="min-h-screen bg-gray-100 p-4 md:p-8">
      {/* Toolbar – hidden on print */}
      <div className="max-w-4xl mx-auto mb-4 flex items-center gap-3 print:hidden">
        <Link to="/SubscriptionAgreements">
          <Button variant="outline" size="sm"><ArrowRight className="w-4 h-4 ml-1" />חזור</Button>
        </Link>
        <Button
          onClick={() => window.print()}
          className="bg-purple-600 hover:bg-purple-700 text-white"
        >
          <Printer className="w-4 h-4 ml-2" />
          הדפס / שמור PDF
        </Button>
      </div>

      {/* Printable content */}
      <div id="print-area" className="max-w-4xl mx-auto bg-white shadow-md rounded-xl p-8 print:shadow-none print:rounded-none print:p-6">

        {/* Header */}
        <div className="text-center mb-8 pb-6 border-b border-gray-200">
          <img
            src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/687b78971cad562073ed5929/d7815950c_Yourparagraphtext1.png"
            alt="טדי וטס"
            className="mx-auto mb-4 w-48 h-auto object-contain"
          />
          <h1 className="text-2xl font-bold text-slate-800">הסכם הצטרפות לתוכנית המנויים</h1>
          <p className="text-slate-500 text-sm mt-1">רשת מרפאות Teddy Vets · גרסה 12/2025</p>
        </div>

        {/* Part A – Parties */}
        <section className="mb-6">
          <h2 className="text-lg font-bold text-purple-700 mb-3 pb-1 border-b border-purple-100">חלק א׳ – פרטי ההסכם</h2>
          <div className="grid md:grid-cols-2 gap-3 text-sm">
            <Row label="צד א׳ (הרשת)" value="טדי וטס נכסים בע״מ / טדי וטס חולון בע״מ" />
            <Row label="צד ב׳ (הלקוח)" value={agreement.owner_name} />
            {agreement.owner_id_number && <Row label="ת.ז." value={agreement.owner_id_number} />}
            {agreement.owner_phone && <Row label="טלפון" value={agreement.owner_phone} />}
            {agreement.owner_email && <Row label="מייל" value={agreement.owner_email} />}
            {agreement.owner_address && <Row label="כתובת" value={agreement.owner_address} full />}
          </div>
        </section>

        {/* Pet */}
        <section className="mb-6">
          <h2 className="text-lg font-bold text-orange-600 mb-3 pb-1 border-b border-orange-100">1. פרטי חיית המחמד</h2>
          <div className="grid md:grid-cols-2 gap-3 text-sm">
            <Row label="שם" value={agreement.pet_name} />
            <Row label="סוג" value={agreement.pet_type} />
            {agreement.pet_breed && <Row label="גזע" value={agreement.pet_breed} />}
            {agreement.pet_microchip && <Row label="מספר שבב" value={agreement.pet_microchip} />}
          </div>
        </section>

        {/* Plan */}
        <section className="mb-6">
          <h2 className="text-lg font-bold text-purple-700 mb-3 pb-1 border-b border-purple-100">2. מסלול נבחר</h2>
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 text-sm">
            <p className="font-bold text-purple-800 text-base">{PLAN_LABELS[agreement.selected_plan] || agreement.selected_plan}</p>
            <p className="text-slate-600 mt-1">
              תשלום: <span className="font-semibold">{agreement.payment_frequency === 'annual' ? 'שנתי מראש (כולל חודש מתנה)' : 'הוראת קבע חודשית'}</span>
            </p>
          </div>
        </section>

        {/* Signature */}
        <section className="mb-6">
          <h2 className="text-lg font-bold text-slate-700 mb-3 pb-1 border-b border-slate-200">3. חתימה דיגיטלית</h2>
          <div className="grid md:grid-cols-2 gap-4 text-sm mb-4">
            <Row label="חותם/ת" value={agreement.owner_name} />
            {agreement.signed_at && <Row label="תאריך חתימה" value={format(new Date(agreement.signed_at), "d בMMMM yyyy, HH:mm", { locale: he })} />}
            {agreement.signature_ip && <Row label="כתובת IP" value={agreement.signature_ip} />}
            {agreement.signature_hash && <Row label="Hash חתימה" value={agreement.signature_hash.slice(0, 32) + '...'} />}
          </div>
          {agreement.signature_data && (
            <div className="border border-slate-200 rounded-lg p-3 bg-gray-50 inline-block">
              <p className="text-xs text-slate-500 mb-2">חתימה:</p>
              <img src={agreement.signature_data} alt="חתימה" className="max-h-24 max-w-xs" />
            </div>
          )}
        </section>

        {/* Footer */}
        <div className="mt-8 pt-4 border-t border-gray-200 text-center text-xs text-gray-400">
          <p>מסמך זה נוצר דיגיטלית · Teddy Vets Network · www.teddyvets.co.il</p>
          {agreement.created_date && (
            <p className="mt-1">נוצר: {format(new Date(agreement.created_date), "d בMMMM yyyy, HH:mm", { locale: he })}</p>
          )}
        </div>
      </div>

      <style>{`
        @media print {
          body * { visibility: hidden; }
          #print-area, #print-area * { visibility: visible; }
          #print-area { position: absolute; top: 0; right: 0; width: 100%; }
        }
      `}</style>
    </div>
  );
}

function Row({ label, value, full }) {
  return (
    <div className={full ? "md:col-span-2" : ""}>
      <span className="font-semibold text-slate-600">{label}: </span>
      <span className="text-slate-800">{value || '-'}</span>
    </div>
  );
}