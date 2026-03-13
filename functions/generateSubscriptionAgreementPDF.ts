import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';
import { jsPDF } from 'npm:jspdf@4.0.0';

const PLAN_LABELS = {
  teddy_basic: "טדי בייסיק (כלבים) - ₪89/חודש",
  teddy_plus: "טדי פלוס (כלבים) - ₪129/חודש",
  teddy_platinum: "טדי פלטינום (כלבים) - ₪169/חודש",
  teddy_royal: "טדי רויאל (חתולים) - ₪79/חודש",
  teddy_insured: "טדי בטוח (לבעלי ביטוח פרטי) - ₪79/חודש",
};

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { agreement_id } = await req.json();
    if (!agreement_id) return Response.json({ error: 'Missing agreement_id' }, { status: 400 });

    const agreement = await base44.entities.SubscriptionAgreement.get(agreement_id);
    if (!agreement) return Response.json({ error: 'Agreement not found' }, { status: 404 });

    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    const pageW = 210;
    const pageH = 297;
    const margin = 20;
    const contentW = pageW - margin * 2;
    let y = margin;

    const addText = (text, x, yPos, options = {}) => {
      doc.setFontSize(options.size || 11);
      doc.setFont('helvetica', options.style || 'normal');
      if (options.color) doc.setTextColor(...options.color);
      else doc.setTextColor(40, 40, 40);
      doc.text(text, x, yPos, { align: options.align || 'left' });
    };

    const addLine = (yPos, color = [200, 200, 200]) => {
      doc.setDrawColor(...color);
      doc.line(margin, yPos, pageW - margin, yPos);
    };

    const addSection = (title, yPos) => {
      doc.setFillColor(245, 245, 250);
      doc.roundedRect(margin, yPos - 5, contentW, 10, 2, 2, 'F');
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(80, 60, 140);
      doc.text(title, pageW - margin, yPos + 2, { align: 'right' });
      return yPos + 12;
    };

    // --- Header ---
    doc.setFillColor(120, 80, 180);
    doc.rect(0, 0, pageW, 30, 'F');
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(255, 255, 255);
    doc.text('Teddy Vets', pageW / 2, 13, { align: 'center' });
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('Subscription Agreement', pageW / 2, 22, { align: 'center' });

    y = 42;

    // Title
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(60, 40, 100);
    doc.text('Agreement to Join the Membership Program', pageW / 2, y, { align: 'center' });
    y += 6;
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(120, 120, 120);
    doc.text('Teddy Vets Properties Ltd / Teddy Vets Holon Ltd  |  Version 12/2025', pageW / 2, y, { align: 'center' });
    y += 10;
    addLine(y, [180, 140, 220]);
    y += 8;

    // --- Part A: Agreement Details ---
    y = addSection('Part A - Agreement Details', y);

    const fields = [
      ['Party A (Network):', 'Teddy Vets Properties Ltd / Teddy Vets Holon Ltd'],
      ['Party B (Client):', agreement.owner_name || '-'],
      ['ID Number:', agreement.owner_id_number || '-'],
      ['Phone:', agreement.owner_phone || '-'],
      ['Email:', agreement.owner_email || '-'],
      ['Address:', agreement.owner_address || '-'],
    ];

    fields.forEach(([label, value]) => {
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(80, 80, 100);
      doc.text(label, pageW - margin, y, { align: 'right' });
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(40, 40, 40);
      doc.text(value, pageW - margin - 45, y, { align: 'right' });
      y += 7;
    });

    y += 4;

    // --- Section 1: Pet Details ---
    y = addSection('1. Pet Details', y);
    const petFields = [
      ['Pet Name:', agreement.pet_name || '-'],
      ['Type:', agreement.pet_type || '-'],
      ['Breed:', agreement.pet_breed || '-'],
      ['Microchip:', agreement.pet_microchip || '-'],
    ];
    petFields.forEach(([label, value]) => {
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(80, 80, 100);
      doc.text(label, pageW - margin, y, { align: 'right' });
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(40, 40, 40);
      doc.text(value, pageW - margin - 35, y, { align: 'right' });
      y += 7;
    });

    y += 4;

    // --- Section 2: Selected Plan ---
    y = addSection('2. Selected Plan', y);
    doc.setFillColor(248, 245, 255);
    doc.roundedRect(margin, y, contentW, 22, 3, 3, 'F');
    doc.setDrawColor(180, 140, 220);
    doc.roundedRect(margin, y, contentW, 22, 3, 3, 'S');
    doc.setFontSize(13);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(100, 60, 160);
    doc.text(PLAN_LABELS[agreement.selected_plan] || agreement.selected_plan || '-', pageW - margin - 5, y + 8, { align: 'right' });
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(80, 80, 80);
    const paymentLabel = agreement.payment_frequency === 'annual' ? 'Annual prepayment (includes 1 free month)' : 'Monthly standing order';
    doc.text(`Payment: ${paymentLabel}`, pageW - margin - 5, y + 16, { align: 'right' });
    y += 30;

    // Terms bullets
    y = addSection('3. Terms & Declarations', y);
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
      doc.text(`• ${term}`, pageW - margin, y, { align: 'right', maxWidth: contentW - 5 });
      y += 7;
    });

    y += 6;

    // --- Section 4: Digital Signature ---
    y = addSection('4. Digital Signature', y);

    if (agreement.signature_data && agreement.signature_data.startsWith('data:image')) {
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(60, 60, 80);
      doc.text(`Signatory Name: ${agreement.owner_name || '-'}`, pageW - margin, y, { align: 'right' });
      y += 8;

      try {
        doc.addImage(agreement.signature_data, 'PNG', margin, y, 80, 30);
      } catch (_) {}
      y += 35;
    } else {
      doc.setFontSize(10);
      doc.setTextColor(180, 60, 60);
      doc.text('No digital signature on file.', pageW - margin, y, { align: 'right' });
      y += 10;
    }

    if (agreement.signed_at) {
      doc.setFontSize(9);
      doc.setTextColor(100, 100, 100);
      const signedDate = new Date(agreement.signed_at).toLocaleString('he-IL');
      doc.text(`Signing Date & Time: ${signedDate}`, pageW - margin, y, { align: 'right' });
      y += 7;
    }
    if (agreement.signature_ip) {
      doc.setFontSize(9);
      doc.setTextColor(130, 130, 130);
      doc.text(`IP Address: ${agreement.signature_ip}`, pageW - margin, y, { align: 'right' });
      y += 7;
    }

    // --- Footer ---
    doc.setFillColor(120, 80, 180);
    doc.rect(0, pageH - 18, pageW, 18, 'F');
    doc.setFontSize(8);
    doc.setTextColor(255, 255, 255);
    doc.text('Teddy Vets Network | www.teddyvets.co.il | This document was digitally generated', pageW / 2, pageH - 7, { align: 'center' });

    const pdfBytes = doc.output('arraybuffer');
    const filename = `subscription_agreement_${agreement.owner_name || agreement_id}.pdf`;

    return new Response(pdfBytes, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});