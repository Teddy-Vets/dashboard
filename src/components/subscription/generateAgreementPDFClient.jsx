import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { base44 } from '@/api/base44Client';

const PLAN_LABELS = {
  teddy_basic: "טדי בייסיק (כלבים) - ₪89/חודש",
  teddy_plus: "טדי פלוס (כלבים) - ₪129/חודש",
  teddy_platinum: "טדי פלטינום (כלבים) - ₪169/חודש",
  teddy_royal: "טדי רויאל (חתולים) - ₪79/חודש",
  teddy_insured: "טדי בטוח (לבעלי ביטוח פרטי) - ₪79/חודש",
};

function buildHTML(agreement) {
  const planLabel = PLAN_LABELS[agreement.selected_plan] || agreement.selected_plan || '-';
  const paymentLabel = agreement.payment_frequency === 'annual' ? 'תשלום שנתי מראש (כולל חודש מתנה)' : 'הוראת קבע חודשית';
  const signedDate = agreement.signed_at
    ? new Date(agreement.signed_at).toLocaleString('he-IL')
    : '-';

  return `
    <div style="
      font-family: 'Noto Sans Hebrew', Arial, sans-serif;
      direction: rtl;
      width: 780px;
      background: white;
      color: #222;
      padding: 0;
    ">
      <!-- Header -->
      <div style="background: #7850b4; color: white; padding: 20px 30px; text-align: center;">
        <div style="font-size: 26px; font-weight: bold;">Teddy Vets</div>
        <div style="font-size: 12px; margin-top: 4px;">הסכם מנוי</div>
      </div>

      <div style="padding: 28px 40px;">
        <!-- Title -->
        <h2 style="text-align: center; color: #3c2864; font-size: 20px; margin-bottom: 4px;">הסכם הצטרפות לתוכנית המנויים</h2>
        <p style="text-align: center; color: #888; font-size: 11px; margin-bottom: 20px;">
          טדי וטס פרופרטיס בע"מ / טדי וטס חולון בע"מ | גרסה 12/2025
        </p>

        <hr style="border: 1px solid #c8a0e0; margin-bottom: 20px;" />

        <!-- Part A -->
        <div style="background: #f5f5fa; border-radius: 6px; padding: 8px 14px; margin-bottom: 12px;">
          <span style="font-weight: bold; color: #503c8c; font-size: 13px;">חלק א' - פרטי ההסכם</span>
        </div>

        <table style="width: 100%; border-collapse: collapse; margin-bottom: 16px; font-size: 12px;">
          <tr>
            <td style="padding: 5px 8px; font-weight: bold; color: #505064; width: 35%; text-align: right;">צד א' (הרשת):</td>
            <td style="padding: 5px 8px; text-align: right;">טדי וטס פרופרטיס בע"מ / טדי וטס חולון בע"מ</td>
          </tr>
          <tr style="background: #fafafa;">
            <td style="padding: 5px 8px; font-weight: bold; color: #505064; text-align: right;">צד ב' (לקוח):</td>
            <td style="padding: 5px 8px; text-align: right;">${agreement.owner_name || '-'}</td>
          </tr>
          <tr>
            <td style="padding: 5px 8px; font-weight: bold; color: #505064; text-align: right;">תעודת זהות:</td>
            <td style="padding: 5px 8px; text-align: right;">${agreement.owner_id_number || '-'}</td>
          </tr>
          <tr style="background: #fafafa;">
            <td style="padding: 5px 8px; font-weight: bold; color: #505064; text-align: right;">טלפון:</td>
            <td style="padding: 5px 8px; text-align: right;">${agreement.owner_phone || '-'}</td>
          </tr>
          <tr>
            <td style="padding: 5px 8px; font-weight: bold; color: #505064; text-align: right;">אימייל:</td>
            <td style="padding: 5px 8px; text-align: right;">${agreement.owner_email || '-'}</td>
          </tr>
          <tr style="background: #fafafa;">
            <td style="padding: 5px 8px; font-weight: bold; color: #505064; text-align: right;">כתובת:</td>
            <td style="padding: 5px 8px; text-align: right;">${agreement.owner_address || '-'}</td>
          </tr>
        </table>

        <!-- Pet Details -->
        <div style="background: #f5f5fa; border-radius: 6px; padding: 8px 14px; margin-bottom: 12px;">
          <span style="font-weight: bold; color: #503c8c; font-size: 13px;">1. פרטי החיה</span>
        </div>
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 16px; font-size: 12px;">
          <tr>
            <td style="padding: 5px 8px; font-weight: bold; color: #505064; width: 35%; text-align: right;">שם חיית המחמד:</td>
            <td style="padding: 5px 8px; text-align: right;">${agreement.pet_name || '-'}</td>
          </tr>
          <tr style="background: #fafafa;">
            <td style="padding: 5px 8px; font-weight: bold; color: #505064; text-align: right;">סוג:</td>
            <td style="padding: 5px 8px; text-align: right;">${agreement.pet_type || '-'}</td>
          </tr>
          <tr>
            <td style="padding: 5px 8px; font-weight: bold; color: #505064; text-align: right;">גזע:</td>
            <td style="padding: 5px 8px; text-align: right;">${agreement.pet_breed || '-'}</td>
          </tr>
          <tr style="background: #fafafa;">
            <td style="padding: 5px 8px; font-weight: bold; color: #505064; text-align: right;">מספר שבב:</td>
            <td style="padding: 5px 8px; text-align: right;">${agreement.pet_microchip || '-'}</td>
          </tr>
        </table>

        <!-- Selected Plan -->
        <div style="background: #f5f5fa; border-radius: 6px; padding: 8px 14px; margin-bottom: 12px;">
          <span style="font-weight: bold; color: #503c8c; font-size: 13px;">2. מסלול נבחר</span>
        </div>
        <div style="border: 1px solid #c8a0e0; border-radius: 6px; background: #f8f5ff; padding: 14px; margin-bottom: 16px; text-align: center;">
          <div style="font-size: 16px; font-weight: bold; color: #6432a0;">${planLabel}</div>
          <div style="font-size: 11px; color: #666; margin-top: 6px;">${paymentLabel}</div>
        </div>

        <!-- Terms -->
        <div style="background: #f5f5fa; border-radius: 6px; padding: 8px 14px; margin-bottom: 12px;">
          <span style="font-weight: bold; color: #503c8c; font-size: 13px;">3. תנאים והצהרות</span>
        </div>
        <ul style="font-size: 11px; color: #404050; line-height: 1.8; margin: 0 0 16px 0; padding-right: 16px;">
          <li>זכאות: כל מנוי תקף לחיה אחת בלבד ואינו ניתן להעברה.</li>
          <li>ביטול: נדרשת הודעה בכתב לפחות 14 יום מראש.</li>
          <li>שירותים שלא נוצלו אינם מצטברים ואינם ניתנים להחזר.</li>
          <li>המנוי אינו מבטיח מניעת מחלה.</li>
          <li>התנאים עשויים להתעדכן עם הודעה של 30 יום מראש.</li>
          <li>סמכות שיפוט: בתי משפט בתל אביב בלבד.</li>
        </ul>

        <!-- Signature -->
        <div style="background: #f5f5fa; border-radius: 6px; padding: 8px 14px; margin-bottom: 12px;">
          <span style="font-weight: bold; color: #503c8c; font-size: 13px;">4. חתימה דיגיטלית</span>
        </div>
        <div style="margin-bottom: 8px; font-size: 12px;">
          <strong>שם החותם:</strong> ${agreement.owner_name || '-'}
        </div>
        ${agreement.signature_data ? `
        <div style="border: 1px solid #ddd; border-radius: 6px; padding: 8px; display: inline-block; background: white; margin-bottom: 10px;">
          <img src="${agreement.signature_data}" style="height: 70px; max-width: 250px;" />
        </div>
        ` : '<div style="color: #b03c3c; font-size: 11px; margin-bottom: 10px;">אין חתימה דיגיטלית במערכת.</div>'}
        ${agreement.signed_at ? `<div style="font-size: 10px; color: #888; margin-bottom: 4px;">תאריך ושעת חתימה: ${signedDate}</div>` : ''}
        ${agreement.signature_ip ? `<div style="font-size: 10px; color: #aaa;">כתובת IP: ${agreement.signature_ip}</div>` : ''}

      </div>

      <!-- Footer -->
      <div style="background: #7850b4; color: white; padding: 10px 30px; text-align: center; font-size: 9px; margin-top: 20px;">
        רשת טדי וטס | www.teddyvets.co.il | מסמך זה נוצר דיגיטלית
      </div>
    </div>
  `;
}

export async function generatePDFClientSide(agreementId) {
  // Fetch agreement data
  const agreement = await base44.entities.SubscriptionAgreement.get(agreementId);
  if (!agreement) throw new Error('הסכם לא נמצא');

  // Build HTML and mount off-screen
  const container = document.createElement('div');
  container.style.position = 'fixed';
  container.style.left = '-9999px';
  container.style.top = '0';
  container.style.zIndex = '-1';
  container.innerHTML = buildHTML(agreement);
  document.body.appendChild(container);

  // Load Noto Sans Hebrew font
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = 'https://fonts.googleapis.com/css2?family=Noto+Sans+Hebrew:wght@400;700&display=swap';
  document.head.appendChild(link);

  // Wait for font load
  await new Promise(r => setTimeout(r, 600));

  const canvas = await html2canvas(container.firstChild, {
    scale: 2,
    useCORS: true,
    backgroundColor: '#ffffff',
    logging: false,
  });

  document.body.removeChild(container);

  const imgData = canvas.toDataURL('image/jpeg', 0.95);
  const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const pageW = 210;
  const pageH = 297;
  const imgW = pageW;
  const imgH = (canvas.height * pageW) / canvas.width;

  let posY = 0;
  if (imgH <= pageH) {
    pdf.addImage(imgData, 'JPEG', 0, 0, imgW, imgH);
  } else {
    // Multi-page
    let remaining = imgH;
    while (remaining > 0) {
      pdf.addImage(imgData, 'JPEG', 0, posY, imgW, imgH);
      remaining -= pageH;
      posY -= pageH;
      if (remaining > 0) pdf.addPage();
    }
  }

  const ownerSafe = (agreement.owner_name || agreementId).replace(/[^a-zA-Z0-9\u0590-\u05FF]/g, '_');
  pdf.save(`subscription_agreement_${ownerSafe}.pdf`);
}