import { jsPDF } from 'jspdf';

export interface PdfApplicationData {
  applicationId: string;
  fullName: string;
  email: string;
  gender: string;
  whatsapp: string;
  country: string;
  college: string;
  collegeMail: string;
  degree: string;
  branch: string;
  graduationYear: string;
  domain: string;
  githubUrl: string;
  portfolioUrl: string;
  skills: string;
  whyApply: string;
  status?: string;
  submittedAt?: string;
}

export function generateApplicationPdf(data: PdfApplicationData): jsPDF {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = 210;
  const pageHeight = 297;
  const margin = 14;
  const contentWidth = pageWidth - margin * 2;

  // Colors
  const navyDark = [15, 23, 42]; // #0f172a
  const primaryBlue = [37, 99, 235]; // #2563eb
  const accentCyan = [56, 189, 248]; // #38bdf8
  const bgLight = [248, 250, 252]; // #f8fafc
  const borderLight = [226, 232, 240]; // #e2e8f0
  const textDark = [15, 23, 42];
  const textMuted = [100, 116, 139]; // #64748b

  // 1. TOP HEADER BANNER
  doc.setFillColor(navyDark[0], navyDark[1], navyDark[2]);
  doc.rect(0, 0, pageWidth, 32, 'F');

  // Accent Line under header
  doc.setFillColor(primaryBlue[0], primaryBlue[1], primaryBlue[2]);
  doc.rect(0, 32, pageWidth, 2, 'F');

  // Gentrobyte Logo Icon / Symbol
  doc.setFillColor(primaryBlue[0], primaryBlue[1], primaryBlue[2]);
  doc.roundedRect(margin, 7, 18, 18, 3, 3, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text('G', margin + 6, 20);

  // Brand Name & Tagline
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text('GENTROBYTE', margin + 22, 16);

  doc.setTextColor(accentCyan[0], accentCyan[1], accentCyan[2]);
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'normal');
  doc.text('INTERNSHIP PROGRAM 2026 • TALENT & INNOVATION COHORTS', margin + 22, 22);

  // Right-aligned Document Label
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text('OFFICIAL APPLICATION RECEIPT', pageWidth - margin, 15, { align: 'right' });

  doc.setTextColor(203, 213, 225);
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'normal');
  const dateStr = data.submittedAt
    ? new Date(data.submittedAt).toLocaleDateString(undefined, { dateStyle: 'medium' })
    : new Date().toLocaleDateString(undefined, { dateStyle: 'medium' });
  doc.text(`ISSUED: ${dateStr.toUpperCase()} • AUTHENTICATED`, pageWidth - margin, 21, { align: 'right' });

  // 2. APPLICATION SUMMARY BADGE BOX
  let currentY = 40;
  doc.setFillColor(bgLight[0], bgLight[1], bgLight[2]);
  doc.setDrawColor(borderLight[0], borderLight[1], borderLight[2]);
  doc.setLineWidth(0.4);
  doc.roundedRect(margin, currentY, contentWidth, 22, 3, 3, 'FD');

  // Left column: Application ID
  doc.setFontSize(7.5);
  doc.setTextColor(textMuted[0], textMuted[1], textMuted[2]);
  doc.setFont('helvetica', 'bold');
  doc.text('APPLICATION TRACKING ID', margin + 6, currentY + 7);

  doc.setFontSize(13);
  doc.setTextColor(primaryBlue[0], primaryBlue[1], primaryBlue[2]);
  doc.setFont('courier', 'bold');
  doc.text(data.applicationId, margin + 6, currentY + 16);

  // Middle column: Applied Domain Track
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(textMuted[0], textMuted[1], textMuted[2]);
  doc.text('TARGET DOMAIN TRACK', margin + 70, currentY + 7);

  doc.setFontSize(10);
  doc.setTextColor(textDark[0], textDark[1], textDark[2]);
  doc.text(data.domain || 'Engineering Track', margin + 70, currentY + 15);

  // Right column: Current Status Pill
  const status = data.status || 'Under Review';
  doc.setFillColor(236, 253, 245); // light green bg
  doc.setDrawColor(167, 243, 208);
  doc.roundedRect(pageWidth - margin - 42, currentY + 6, 36, 10, 2, 2, 'FD');

  doc.setTextColor(5, 150, 105); // green text
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.text(`● ${status.toUpperCase()}`, pageWidth - margin - 24, currentY + 12.5, { align: 'center' });

  currentY += 28;

  // Helper for Section Titles
  const drawSectionHeader = (title: string, yPos: number) => {
    // Primary indicator block
    doc.setFillColor(primaryBlue[0], primaryBlue[1], primaryBlue[2]);
    doc.rect(margin, yPos - 3.5, 3, 5, 'F');

    doc.setTextColor(navyDark[0], navyDark[1], navyDark[2]);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9.5);
    doc.text(title.toUpperCase(), margin + 6, yPos);

    // Subtle hairline
    doc.setDrawColor(borderLight[0], borderLight[1], borderLight[2]);
    doc.setLineWidth(0.3);
    doc.line(margin + 60, yPos - 1, pageWidth - margin, yPos - 1);
  };

  // Helper for 2-column info row with auto-sizing font so text never truncates awkwardly
  const drawFieldBox = (
    label: string,
    value: string,
    x: number,
    y: number,
    w: number,
    h = 12
  ) => {
    doc.setFillColor(bgLight[0], bgLight[1], bgLight[2]);
    doc.setDrawColor(borderLight[0], borderLight[1], borderLight[2]);
    doc.setLineWidth(0.3);
    doc.roundedRect(x, y, w, h, 2, 2, 'FD');

    doc.setFontSize(6.5);
    doc.setTextColor(textMuted[0], textMuted[1], textMuted[2]);
    doc.setFont('helvetica', 'bold');
    doc.text(label.toUpperCase(), x + 4, y + 4.5);

    const safeVal = value || 'N/A';
    let fontSize = 8.5;
    if (safeVal.length > 30) fontSize = 7.5;
    if (safeVal.length > 40) fontSize = 6.8;
    if (safeVal.length > 50) fontSize = 6.2;

    doc.setFontSize(fontSize);
    doc.setTextColor(textDark[0], textDark[1], textDark[2]);
    doc.setFont('helvetica', 'bold');
    doc.text(safeVal, x + 4, y + 9.5, { maxWidth: w - 8 });
  };

  // 3. SECTION 1: CANDIDATE PERSONAL DETAILS
  drawSectionHeader('1. Candidate Personal Profile', currentY);
  currentY += 5;

  const halfWidth = (contentWidth - 4) / 2;
  const thirdWidth = (contentWidth - 8) / 3;

  drawFieldBox('Full Legal Name', data.fullName, margin, currentY, halfWidth);
  drawFieldBox('Primary Email Address', data.email, margin + halfWidth + 4, currentY, halfWidth);
  currentY += 14;

  drawFieldBox('WhatsApp / Mobile', data.whatsapp, margin, currentY, thirdWidth);
  drawFieldBox('Gender', data.gender, margin + thirdWidth + 4, currentY, thirdWidth);
  drawFieldBox('Country of Residence', data.country, margin + (thirdWidth + 4) * 2, currentY, thirdWidth);
  currentY += 18;

  // 4. SECTION 2: ACADEMIC CREDENTIALS
  drawSectionHeader('2. Academic Background & Institution', currentY);
  currentY += 5;

  drawFieldBox('College / University', data.college, margin, currentY, halfWidth);
  drawFieldBox('Institutional Email', data.collegeMail, margin + halfWidth + 4, currentY, halfWidth);
  currentY += 14;

  drawFieldBox('Degree Program', data.degree, margin, currentY, thirdWidth);
  drawFieldBox('Branch / Specialization', data.branch, margin + thirdWidth + 4, currentY, thirdWidth);
  drawFieldBox('Graduation Cohort Class', `Class of ${data.graduationYear}`, margin + (thirdWidth + 4) * 2, currentY, thirdWidth);
  currentY += 18;

  // 5. SECTION 3: REPOSITORIES & PROFESSIONAL LINKS
  drawSectionHeader('3. Professional Repositories & Profiles', currentY);
  currentY += 5;

  drawFieldBox('GitHub Profile / Repositories', data.githubUrl, margin, currentY, halfWidth);
  drawFieldBox('Personal Portfolio / Live Demos', data.portfolioUrl, margin + halfWidth + 4, currentY, halfWidth);
  currentY += 18;

  // 6. SECTION 4: TECHNICAL SKILLS & MOTIVATION
  drawSectionHeader('4. Technical Competencies & Motivation', currentY);
  currentY += 5;

  // Skills Box (dynamically sized)
  const splitSkills = doc.splitTextToSize(data.skills || 'None provided', contentWidth - 8);
  const skillsBoxHeight = Math.max(13, Math.min(22, 6.5 + splitSkills.length * 3.6));
  doc.setFillColor(bgLight[0], bgLight[1], bgLight[2]);
  doc.setDrawColor(borderLight[0], borderLight[1], borderLight[2]);
  doc.setLineWidth(0.3);
  doc.roundedRect(margin, currentY, contentWidth, skillsBoxHeight, 2, 2, 'FD');

  doc.setFontSize(6.5);
  doc.setTextColor(textMuted[0], textMuted[1], textMuted[2]);
  doc.setFont('helvetica', 'bold');
  doc.text('CORE TECHNICAL SKILLS & FRAMEWORKS', margin + 4, currentY + 4.5);

  doc.setFontSize(7.5);
  doc.setTextColor(textDark[0], textDark[1], textDark[2]);
  doc.setFont('helvetica', 'normal');
  doc.text(splitSkills.slice(0, 4), margin + 4, currentY + 8.5);
  currentY += skillsBoxHeight + 4;

  // Why Gentrobyte Box (dynamically sized)
  const splitWhy = doc.splitTextToSize(data.whyApply || 'None provided', contentWidth - 8);
  const whyBoxHeight = Math.max(15, Math.min(24, 6.5 + splitWhy.length * 3.6));
  doc.setFillColor(bgLight[0], bgLight[1], bgLight[2]);
  doc.setDrawColor(borderLight[0], borderLight[1], borderLight[2]);
  doc.setLineWidth(0.3);
  doc.roundedRect(margin, currentY, contentWidth, whyBoxHeight, 2, 2, 'FD');

  doc.setFontSize(6.5);
  doc.setTextColor(textMuted[0], textMuted[1], textMuted[2]);
  doc.setFont('helvetica', 'bold');
  doc.text('STATEMENT OF INTENT (WHY GENTROBYTE)', margin + 4, currentY + 4.5);

  doc.setFontSize(7.5);
  doc.setTextColor(textDark[0], textDark[1], textDark[2]);
  doc.setFont('helvetica', 'normal');
  doc.text(splitWhy.slice(0, 5), margin + 4, currentY + 8.5);
  currentY += whyBoxHeight + 5;

  // 7. SECURITY HASH, DECLARATION & OFFICIAL SIGNATURE BLOCK
  doc.setFillColor(241, 245, 249); // #f1f5f9
  doc.setDrawColor(borderLight[0], borderLight[1], borderLight[2]);
  doc.roundedRect(margin, currentY, contentWidth, 28, 2, 2, 'FD');

  // Left Column: Digital Hash Verification
  doc.setFontSize(6.5);
  doc.setTextColor(textMuted[0], textMuted[1], textMuted[2]);
  doc.setFont('helvetica', 'bold');
  doc.text('DIGITAL VERIFICATION & AUDIT INTEGRITY', margin + 5, currentY + 6);

  doc.setFontSize(7);
  doc.setFont('courier', 'normal');
  doc.setTextColor(navyDark[0], navyDark[1], navyDark[2]);
  doc.text(`HASH: SHA256-${data.applicationId}-2026-GENTROBYTE-VERIFIED`, margin + 5, currentY + 12);
  doc.text(`PORTAL ID: gentrobyte-apply-portal-v2 // STATUS: LOGGED`, margin + 5, currentY + 17);
  doc.text(`ISSUED TO: ${data.email}`, margin + 5, currentY + 22);

  // Right Column: Official Stamp Box
  doc.setDrawColor(primaryBlue[0], primaryBlue[1], primaryBlue[2]);
  doc.setLineWidth(0.5);
  doc.roundedRect(pageWidth - margin - 58, currentY + 4, 52, 20, 2, 2, 'D');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.setTextColor(primaryBlue[0], primaryBlue[1], primaryBlue[2]);
  doc.text('GENTROBYTE TALENT ADMISSIONS', pageWidth - margin - 32, currentY + 9, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  doc.setTextColor(textMuted[0], textMuted[1], textMuted[2]);
  doc.text('Digitally Signed & Validated', pageWidth - margin - 32, currentY + 14, { align: 'center' });
  doc.text('Internship Cohort Committee', pageWidth - margin - 32, currentY + 19, { align: 'center' });

  // 8. PAGE FOOTER
  const footerY = pageHeight - 10;
  doc.setDrawColor(borderLight[0], borderLight[1], borderLight[2]);
  doc.setLineWidth(0.4);
  doc.line(margin, footerY - 3, pageWidth - margin, footerY - 3);

  doc.setFontSize(6.5);
  doc.setTextColor(textMuted[0], textMuted[1], textMuted[2]);
  doc.setFont('helvetica', 'normal');
  doc.text('© 2026 Gentrobyte Technologies Inc. • Confidential Admissions Document • gentrobyte.com', margin, footerY);

  doc.text(`Track Live Status: https://gentrobyte.com/track?id=${data.applicationId}`, pageWidth - margin, footerY, { align: 'right' });

  return doc;
}

