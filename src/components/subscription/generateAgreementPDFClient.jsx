import { base44 } from '@/api/base44Client';

const PLAN_LABELS = {
  teddy_basic: "Teddy Basic (Dogs) - 89 ILS/month",
  teddy_plus: "Teddy Plus (Dogs) - 129 ILS/month",
  teddy_platinum: "Teddy Platinum (Dogs) - 169 ILS/month",
  teddy_royal: "Teddy Royal (Cats) - 79 ILS/month",
  teddy_insured: "Teddy Insured (Private Insurance) - 79 ILS/month",
};

const PLAN_LABELS_HE = {
  teddy_basic: "טדי בייסיק (כלבים) - ₪89/חודש",
  teddy_plus: "טדי פלוס (כלבים) - ₪129/חודש",
  teddy_platinum: "טדי פלטינום (כלבים) - ₪169/חודש",
  teddy_royal: "טדי רויאל (חתולים) - ₪79/חודש",
  teddy_insured: "טדי בטוח (ביטוח פרטי) - ₪79/חודש",
};

function reverseHebrew(text) {
  if (!text) return '';
  // Reverse the string so RTL Hebrew renders correctly in LTR canvas
  return text.split('').reverse().join('');
}

export async function generatePDFClientSide(agreementId) {
  const agreement = await base44.entities.SubscriptionAgreement.get(agreementId);
  if (!agreement) throw new Error('הסכם לא נמצא');

  // Use dynamic import to avoid issues
  const { jsPDF } = await import('jspdf');

  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const pageW = 210;
  const pageH = 297;
  const margin = 15;
  const contentW = pageW - margin * 2;
  let y = 0;

  // ---- HEADER ----
  doc.setFillColor(120, 80, 180);
  doc.rect(0, 0, pageW, 32, 'F');
  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(255, 255, 255);
  doc.text('Teddy Vets', pageW / 2, 14, { align: 'center' });
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('Subscription Agreement', pageW / 2, 24, { align: 'center' });
  y = 44;

  // ---- TITLE ----
  doc.setFontSize(15);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(60, 40, 100);
  doc.text('Agreement to Join the Membership Program', pageW / 2, y, { align: 'center' });
  y += 6;
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(130, 130, 130);
  doc.text('Teddy Vets Properties Ltd / Teddy Vets Holon Ltd  |  Version 12/2025', pageW / 2, y, { align: 'center' });
  y += 6;
  doc.setDrawColor(180, 140, 220);
  doc.line(margin, y, pageW - margin, y);
  y += 8;

  // Helper: section header
  const sectionHeader = (title) => {
    doc.setFillColor(245, 243, 252);
    doc.roundedRect(margin, y - 4, contentW, 10, 2, 2, 'F');
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(80, 50, 140);
    doc.text(title, margin + 4, y + 3);
    y += 12;
  };

  // Helper: field row
  const fieldRow = (label, value, shade) => {
    if (shade) {
      doc.setFillColor(250, 249, 255);
      doc.rect(margin, y - 4, contentW, 8, 'F');
    }
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(80, 80, 110);
    doc.text(label, margin + 4, y);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(40, 40, 40);
    doc.text(String(value || '-'), margin + 55, y);
    y += 8;
  };

  // ---- PART A ----
  sectionHeader('Part A - Agreement Details');
  fieldRow('Party A (Network):', 'Teddy Vets Properties Ltd / Teddy Vets Holon Ltd', false);
  fieldRow('Party B (Client):', agreement.owner_name || '-', true);
  fieldRow('ID Number:', agreement.owner_id_number || '-', false);
  fieldRow('Phone:', agreement.owner_phone || '-', true);
  fieldRow('Email:', agreement.owner_email || '-', false);
  fieldRow('Address:', agreement.owner_address || '-', true);
  y += 4;

  // ---- PET DETAILS ----
  sectionHeader('1. Pet Details');
  fieldRow('Pet Name:', agreement.pet_name || '-', false);
  fieldRow('Type:', agreement.pet_type || '-', true);
  fieldRow('Breed:', agreement.pet_breed || '-', false);
  fieldRow('Microchip:', agreement.pet_microchip || '-', true);
  y += 4;

  // ---- PLAN ----
  sectionHeader('2. Selected Plan');
  const planEn = PLAN_LABELS[agreement.selected_plan] || agreement.selected_plan || '-';
  const planHe = PLAN_LABELS_HE[agreement.selected_plan] || '';
  doc.setFillColor(248, 244, 255);
  doc.setDrawColor(180, 140, 220);
  doc.roundedRect(margin, y - 2, contentW, 20, 3, 3, 'FD');
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(100, 50, 160);
  doc.text(planEn, pageW / 2, y + 6, { align: 'center' });
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(80, 80, 80);
  const paymentLabel = agreement.payment_frequency === 'annual'
    ? 'Annual prepayment (includes 1 free month)'
    : 'Monthly standing order';
  doc.text(`Payment: ${paymentLabel}`, pageW / 2, y + 14, { align: 'center' });
  y += 26;

  // ---- TERMS ----
  sectionHeader('3. Terms & Declarations');
  const terms = [
    'Eligibility: Each subscription is valid for one pet only and is non-transferable.',
    'Cancellation: Written notice required at least 14 days in advance.',
    'Unused services do not accumulate and are non-refundable.',
    'The subscription does not guarantee prevention of illness.',
    'Terms may be updated with 30 days advance notice.',
    'Jurisdiction: Tel Aviv courts only.',
  ];
  terms.forEach(term => {
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(60, 60, 80);
    doc.text(`\u2022 ${term}`, margin + 4, y, { maxWidth: contentW - 8 });
    y += 7;
  });
  y += 4;

  // ---- SIGNATURE ----
  sectionHeader('4. Digital Signature');
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(80, 80, 110);
  doc.text('Signatory:', margin + 4, y);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(40, 40, 40);
  doc.text(agreement.owner_name || '-', margin + 30, y);
  y += 8;

  if (agreement.signature_data) {
    try {
      const sigData = agreement.signature_data;
      const base64 = sigData.includes(',') ? sigData.split(',')[1] : sigData;
      doc.addImage(base64, 'PNG', margin + 4, y, 70, 28);
      y += 32;
    } catch (_) {
      doc.setFontSize(8);
      doc.setTextColor(120, 120, 120);
      doc.text('[Digital signature on file]', margin + 4, y);
      y += 10;
    }
  }

  if (agreement.signed_at) {
    doc.setFontSize(8);
    doc.setTextColor(110, 110, 110);
    doc.text(`Signing date: ${new Date(agreement.signed_at).toLocaleString('en-IL')}`, margin + 4, y);
    y += 6;
  }
  if (agreement.signature_ip) {
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text(`IP Address: ${agreement.signature_ip}`, margin + 4, y);
    y += 6;
  }

  // ---- FOOTER ----
  doc.setFillColor(120, 80, 180);
  doc.rect(0, pageH - 16, pageW, 16, 'F');
  doc.setFontSize(8);
  doc.setTextColor(255, 255, 255);
  doc.text('Teddy Vets Network | www.teddyvets.co.il | This document was digitally generated', pageW / 2, pageH - 6, { align: 'center' });

  const safeName = (agreement.owner_name || agreementId).replace(/[^a-zA-Z0-9]/g, '_');
  doc.save(`subscription_agreement_${safeName}.pdf`);
}