import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { processDocumentOcr, SAMPLE_OCR_DATASETS } from './src/server/ocrEngine';
import { extractDocumentText } from './src/services/ocrService';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  app.use(express.json({ limit: '60mb' }));
  app.use(express.urlencoded({ limit: '60mb', extended: true }));

  // API Routes
  app.post('/api/ocr/extract', async (req, res) => {
    try {
      const payload = req.body;
      if (!payload || !payload.fileName) {
        return res.status(400).json({ success: false, error: 'Document payload missing required fields.' });
      }
      const result = await processDocumentOcr(payload);
      return res.json({ success: true, result });
    } catch (error: any) {
      console.error('OCR Extraction error:', error);
      return res.status(400).json({ success: false, error: error.message || 'OCR processing failed' });
    }
  });

  // Direct Google Cloud Vision / Mock OCR interface endpoint
  app.post('/api/ocr/vision', async (req, res) => {
    try {
      const { payload, options } = req.body;
      if (!payload || !payload.fileName) {
        return res.status(400).json({ success: false, error: 'Payload missing document data.' });
      }
      const result = await extractDocumentText(payload, options);
      return res.json({ success: true, result });
    } catch (error: any) {
      console.error('Vision OCR processing error:', error);
      return res.status(400).json({ success: false, error: error.message || 'Vision OCR failed' });
    }
  });

  app.get('/api/ocr/sample-documents', (_req, res) => {
    return res.json({
      success: true,
      samples: [
        {
          id: 'sample-trust-cert',
          name: 'Trust_Society_Registration_BLR-IV-7489.pdf',
          type: 'Searchable PDF',
          size: '2.4 MB',
          docId: 'doc-1',
          category: 'trust_registration',
          title: 'Trust/Society Registration Certificate (Compliant - 100% Match)',
        },
        {
          id: 'sample-deed-3892',
          name: 'Land_Sale_Deed_Registered_3892_BK-I.pdf',
          type: 'Scanned Deed PDF',
          size: '14.8 MB',
          docId: 'doc-2',
          category: 'land_sale_deed',
          title: 'Land Sale Deed #3892/BK-I (Deficit: 2.40 Ac vs 4.20 Ac declared)',
        },
        {
          id: 'sample-fire-noc',
          name: 'Karnataka_Fire_Services_NOC_2023.pdf',
          type: 'Scanned Certificate',
          size: '1.1 MB',
          docId: 'doc-3',
          category: 'fire_safety_noc',
          title: 'State Fire & Rescue NOC (Expired 31 March 2024)',
        },
        {
          id: 'sample-sanction-plan',
          name: 'BBMP_Sanction_Building_Plan_LP-0142.pdf',
          type: 'Architectural Blueprint',
          size: '8.5 MB',
          docId: 'doc-4',
          category: 'building_sanction_plan',
          title: 'Municipal Building Sanction & Occupancy (FAR 1.50 vs 1.75 Discrepancy)',
        },
        {
          id: 'sample-corrupted',
          name: 'Damaged_Registry_Index_Encrypted.pdf',
          type: 'Encrypted / Corrupted',
          size: '3.2 MB',
          docId: 'doc-corrupted',
          category: 'unclassified_statutory',
          title: 'Corrupted / Password-Encrypted Sample (Error Handling Test)',
        },
      ],
    });
  });

  // Vite dev middleware or production static files
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
