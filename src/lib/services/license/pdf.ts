import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import QRCode from 'qrcode';

interface LicenseData {
    licenseKey: string;
    projectName: string;
    userName: string;
    trackTitle: string;
    artistName: string;
    usageType: string;
    createdAt: string;
}

export const PDFService = {
    /**
     * Generates a branded PDF License Certificate
     */
    async generateLicensePDF(data: LicenseData): Promise<Uint8Array> {
        const pdfDoc = await PDFDocument.create();
        const page = pdfDoc.addPage([600, 800]);
        const { width, height } = page.getSize();
        
        const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
        const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);

        // 1. Header (Branding)
        page.drawRectangle({
            x: 0,
            y: height - 100,
            width: width,
            height: 100,
            color: rgb(0.06, 0.09, 0.16), // Slate 900
        });

        page.drawText('SONARAURA', {
            x: 50,
            y: height - 60,
            size: 30,
            font: fontBold,
            color: rgb(0.98, 0.45, 0.09), // Orange 500
        });

        page.drawText('CERTIFICATE OF COMMERCIAL LICENSE', {
            x: 50,
            y: height - 85,
            size: 10,
            font: fontRegular,
            color: rgb(1, 1, 1),
        });

        // 2. License Details
        const startY = height - 180;
        const lineSpacing = 30;

        const details = [
            { label: 'License Key:', value: data.licenseKey },
            { label: 'Project Name:', value: data.projectName },
            { label: 'Licensee:', value: data.userName },
            { label: 'Track Title:', value: data.trackTitle },
            { label: 'Artist:', value: data.artistName },
            { label: 'Usage Type:', value: data.usageType.toUpperCase() },
            { label: 'Issued On:', value: new Date(data.createdAt).toLocaleDateString() },
        ];

        details.forEach((item, index) => {
            const y = startY - (index * lineSpacing);
            page.drawText(item.label, { x: 50, y, size: 12, font: fontBold, color: rgb(0.3, 0.3, 0.3) });
            page.drawText(item.value, { x: 180, y, size: 12, font: fontRegular, color: rgb(0, 0, 0) });
        });

        // 3. QR Code Verification
        const qrDataUrl = await QRCode.toDataURL(`https://sonaraura.ai/verify/${data.licenseKey}`);
        const qrImage = await pdfDoc.embedPng(qrDataUrl);
        
        page.drawImage(qrImage, {
            x: width - 150,
            y: 50,
            width: 100,
            height: 100,
        });

        page.drawText('Scan to Verify License', {
            x: width - 155,
            y: 40,
            size: 8,
            font: fontRegular,
            color: rgb(0.5, 0.5, 0.5),
        });

        // 4. Legal Disclaimer
        page.drawText('This document confirms the commercial rights for the specified project. Unauthorized distribution of the audio file outside the project scope is prohibited.', {
            x: 50,
            y: 150,
            size: 9,
            font: fontRegular,
            color: rgb(0.4, 0.4, 0.4),
            maxWidth: 400,
        });

        return await pdfDoc.save();
    }
};
