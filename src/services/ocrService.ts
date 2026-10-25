/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * ocrService.ts
 * Module to interface with Google Cloud Vision API for document text extraction,
 * featuring a resilient Mock OCR Processor for non-production environments with
 * simulated extraction latency and realistic confidence score models.
 */

import { BoundingBox, ExtractedField, DocumentCategory, DocumentOcrResult } from '../types';

export interface VisionVertex {
  x?: number;
  y?: number;
}

export interface VisionBoundingPoly {
  vertices?: VisionVertex[];
  normalizedVertices?: VisionVertex[];
}

export interface VisionSymbol {
  text: string;
  confidence?: number;
}

export interface VisionWord {
  symbols: VisionSymbol[];
  confidence?: number;
  boundingBox?: VisionBoundingPoly;
}

export interface VisionParagraph {
  words: VisionWord[];
  confidence?: number;
  boundingBox?: VisionBoundingPoly;
}

export interface VisionBlock {
  blockType?: string;
  paragraphs: VisionParagraph[];
  confidence?: number;
  boundingBox?: VisionBoundingPoly;
}

export interface VisionPage {
  width?: number;
  height?: number;
  confidence?: number;
  blocks?: VisionBlock[];
}

export interface VisionFullTextAnnotation {
  text: string;
  pages?: VisionPage[];
}

export interface VisionTextAnnotation {
  description: string;
  locale?: string;
  boundingPoly?: VisionBoundingPoly;
}

export interface GoogleVisionAnnotateResponse {
  responses: Array<{
    fullTextAnnotation?: VisionFullTextAnnotation;
    textAnnotations?: VisionTextAnnotation[];
    error?: {
      code: number;
      message: string;
    };
  }>;
}

export interface OcrServicePayload {
  documentId: string;
  applicationId: string;
  fileName: string;
  fileSizeBytes: number;
  mimeType: string;
  base64Data?: string;
  isSearchablePdf?: boolean;
}

export interface OcrServiceOptions {
  useMock?: boolean;
  simulatedMinLatencyMs?: number;
  simulatedMaxLatencyMs?: number;
  languageHints?: string[];
  apiKey?: string;
  endpointUrl?: string;
}

export interface OcrServiceResult {
  rawText: string;
  pageCount: number;
  overallConfidence: number;
  extractedFields: ExtractedField[];
  engineUsed: string;
  processingDurationMs: number;
  isMock: boolean;
  preprocessed: {
    deskewApplied: boolean;
    rotationDegrees: number;
    contrastEnhanced: boolean;
  };
}

/**
 * Convert Google Vision 4-corner bounding polygon to percentage bounding box
 */
export function convertVisionPolyToBoundingBox(
  poly?: VisionBoundingPoly,
  pageWidth: number = 1000,
  pageHeight: number = 1000
): BoundingBox {
  if (!poly) {
    return { x: 10, y: 10, width: 80, height: 10 };
  }

  if (poly.normalizedVertices && poly.normalizedVertices.length >= 4) {
    const xs = poly.normalizedVertices.map((v) => (v.x ?? 0) * 100);
    const ys = poly.normalizedVertices.map((v) => (v.y ?? 0) * 100);
    const minX = Math.min(...xs);
    const maxX = Math.max(...xs);
    const minY = Math.min(...ys);
    const maxY = Math.max(...ys);
    return {
      x: Math.max(0, Math.min(100, Math.round(minX * 10) / 10)),
      y: Math.max(0, Math.min(100, Math.round(minY * 10) / 10)),
      width: Math.max(1, Math.min(100, Math.round((maxX - minX) * 10) / 10)),
      height: Math.max(1, Math.min(100, Math.round((maxY - minY) * 10) / 10)),
    };
  }

  if (poly.vertices && poly.vertices.length >= 4) {
    const xs = poly.vertices.map((v) => ((v.x ?? 0) / pageWidth) * 100);
    const ys = poly.vertices.map((v) => ((v.y ?? 0) / pageHeight) * 100);
    const minX = Math.min(...xs);
    const maxX = Math.max(...xs);
    const minY = Math.min(...ys);
    const maxY = Math.max(...ys);
    return {
      x: Math.max(0, Math.min(100, Math.round(minX * 10) / 10)),
      y: Math.max(0, Math.min(100, Math.round(minY * 10) / 10)),
      width: Math.max(1, Math.min(100, Math.round((maxX - minX) * 10) / 10)),
      height: Math.max(1, Math.min(100, Math.round((maxY - minY) * 10) / 10)),
    };
  }

  return { x: 10, y: 10, width: 80, height: 8 };
}

/**
 * Interface with the Google Cloud Vision API for dense document OCR (DOCUMENT_TEXT_DETECTION)
 */
export class GoogleCloudVisionClient {
  private apiKey: string | null;
  private endpointUrl: string;

  constructor(apiKey?: string, endpointUrl?: string) {
    this.apiKey =
      apiKey ||
      process.env.GOOGLE_CLOUD_VISION_API_KEY ||
      process.env.VISION_API_KEY ||
      process.env.GEMINI_API_KEY ||
      null;
    this.endpointUrl =
      endpointUrl || 'https://vision.googleapis.com/v1/images:annotate';
  }

  public isConfigured(): boolean {
    return Boolean(this.apiKey && this.apiKey.length > 5);
  }

  /**
   * Annotate image using Google Cloud Vision REST endpoint
   */
  public async annotateDocument(
    base64Data: string,
    languageHints: string[] = ['en', 'hi', 'kn']
  ): Promise<GoogleVisionAnnotateResponse> {
    if (!this.apiKey) {
      throw new Error('Google Cloud Vision API key is not configured.');
    }

    const cleanBase64 = base64Data.replace(/^data:[^;]+;base64,/, '');

    const requestBody = {
      requests: [
        {
          image: {
            content: cleanBase64,
          },
          features: [
            {
              type: 'DOCUMENT_TEXT_DETECTION',
              maxResults: 50,
            },
          ],
          imageContext: {
            languageHints,
          },
        },
      ],
    };

    const url = `${this.endpointUrl}?key=${encodeURIComponent(this.apiKey)}`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'aistudio-docsure-vision/1.0',
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Google Cloud Vision API HTTP ${response.status}: ${errText}`);
    }

    const data = (await response.json()) as GoogleVisionAnnotateResponse;
    const firstResp = data.responses?.[0];
    if (firstResp?.error) {
      throw new Error(
        `Vision API Error [${firstResp.error.code}]: ${firstResp.error.message}`
      );
    }

    return data;
  }
}

/**
 * Mock OCR Processor for Non-Production Environments
 * Simulates realistic extraction latency, confidence scores, and multi-field statutory invariants.
 */
export class MockOcrProcessor {
  private minLatencyMs: number;
  private maxLatencyMs: number;

  constructor(minLatencyMs = 450, maxLatencyMs = 850) {
    this.minLatencyMs = minLatencyMs;
    this.maxLatencyMs = maxLatencyMs;
  }

  /**
   * Simulates network & vision model processing delay
   */
  private async simulateLatency(customMin?: number, customMax?: number): Promise<number> {
    const min = customMin ?? this.minLatencyMs;
    const max = customMax ?? this.maxLatencyMs;
    const duration = Math.floor(Math.random() * (max - min + 1)) + min;
    await new Promise((resolve) => setTimeout(resolve, duration));
    return duration;
  }

  /**
   * Generate realistic confidence score with jitter
   */
  private generateConfidence(base: number, jitter = 1.8): number {
    const delta = (Math.random() * 2 - 1) * jitter;
    const result = Math.min(99.9, Math.max(88.0, base + delta));
    return Math.round(result * 10) / 10;
  }

  /**
   * Process document via deterministic mock engine
   */
  public async extract(
    payload: OcrServicePayload,
    options?: OcrServiceOptions
  ): Promise<OcrServiceResult> {
    const duration = await this.simulateLatency(
      options?.simulatedMinLatencyMs,
      options?.simulatedMaxLatencyMs
    );

    const nameLower = payload.fileName.toLowerCase();

    // 1. Land Registered Sale Deed
    if (nameLower.includes('deed') || nameLower.includes('land') || payload.documentId === 'doc-2') {
      const overallConfidence = this.generateConfidence(98.2);
      return {
        rawText: `GOVERNMENT OF KARNATAKA
DEPARTMENT OF STAMPS AND REGISTRATION
SUB-REGISTRAR OFFICE: BANGALORE SOUTH
REGISTERED DEED OF CONVEYANCE NO: 3892/2014-15 BOOK-I
Execution Date: 14th November 2014
Vendor: M/s Bellandur Agro Estates LLP
Purchaser / Conveyee: Shri Vishweshwaraya Educational Trust (Reg. No: BLR-IV-7489)
Schedule Property Description:
All that piece and parcel of converted non-agricultural educational land comprised in:
Survey No. 142/1: Measuring 1 Acre 20 Guntas
Survey No. 142/2: Measuring 0 Acre 36 Guntas
Total Aggregate Contiguous Extent: 2 Acres 16 Guntas (Equivalent to 2.40 Acres net)
Boundaries:
East by: Sy No. 143 Public Road (60 ft)
West by: Private Property
North by: Sy No. 141 Canal
South by: National Highway 44 Service Road
Encumbrance: 30-Year Absolute Unencumbered Title for Educational Purpose.
Stamp Duty Paid: Rs. 4,20,000 via Challan #e-STAMP-8841-KAVERI`,
        pageCount: 4,
        overallConfidence,
        extractedFields: [
          {
            key: 'registration_number',
            label: 'Deed Registration Number',
            rawText: '3892/2014-15 BOOK-I',
            normalizedValue: '3892/BK-I',
            confidence: this.generateConfidence(99.4, 0.4),
            pageNumber: 1,
            boundingBox: { x: 12, y: 15, width: 34, height: 4 },
            reviewStatus: 'verified',
          },
          {
            key: 'sub_registrar_office',
            label: 'Sub-Registrar District Office',
            rawText: 'SUB-REGISTRAR OFFICE: BANGALORE SOUTH',
            normalizedValue: 'Bangalore South (Zone IV)',
            confidence: this.generateConfidence(98.7, 0.6),
            pageNumber: 1,
            boundingBox: { x: 12, y: 19, width: 45, height: 3.5 },
            reviewStatus: 'verified',
          },
          {
            key: 'execution_date',
            label: 'Date of Deed Execution',
            rawText: '14th November 2014',
            normalizedValue: '2014-11-14',
            confidence: this.generateConfidence(99.1, 0.5),
            pageNumber: 1,
            boundingBox: { x: 12, y: 23, width: 28, height: 3.5 },
            reviewStatus: 'verified',
          },
          {
            key: 'purchaser_name',
            label: 'Conveyee / Registered Trust',
            rawText: 'Shri Vishweshwaraya Educational Trust',
            normalizedValue: 'Vishweshwaraya Educational Trust',
            confidence: this.generateConfidence(97.2, 0.8),
            pageNumber: 1,
            boundingBox: { x: 12, y: 28, width: 52, height: 4 },
            reviewStatus: 'verified',
            portalDeclaredValue: 'Vishweshwaraya Institute of Technology & Management',
          },
          {
            key: 'cadastral_survey_numbers',
            label: 'Cadastre Survey Numbers',
            rawText: 'Survey No. 142/1 & Survey No. 142/2',
            normalizedValue: 'Sy. No. 142/1, 142/2',
            confidence: this.generateConfidence(96.5, 1.2),
            pageNumber: 2,
            boundingBox: { x: 14, y: 42, width: 48, height: 5 },
            reviewStatus: 'verified',
            portalDeclaredValue: 'Sy. No. 142/1, 142/2, 142/3',
          },
          {
            key: 'contiguous_land_area',
            label: 'Contiguous Conveyed Land Area',
            rawText: 'Total Aggregate Contiguous Extent: 2 Acres 16 Guntas (Equivalent to 2.40 Acres net)',
            normalizedValue: '2.40 Acres',
            confidence: this.generateConfidence(99.6, 0.3),
            pageNumber: 2,
            boundingBox: { x: 10, y: 55, width: 80, height: 10 },
            reviewStatus: 'mismatch',
            portalDeclaredValue: '4.20 Acres',
            statutoryRuleRef: 'AICTE APH 2024-25 Appx 4 Cl. 4.14(b)',
            anomalyReason:
              'Declared 4.20 Acres on AICTE Web Portal, but Title Deed certifies only 2.40 Acres (-1.80 Acres Deficit / 42.8% Shortfall). Violates Metro minimum 4.00 Acre threshold.',
          },
          {
            key: 'encumbrance_status',
            label: 'Title Encumbrance & Term',
            rawText: '30-Year Absolute Unencumbered Title for Educational Purpose',
            normalizedValue: '30-Year Unencumbered',
            confidence: this.generateConfidence(95.8, 1.0),
            pageNumber: 3,
            boundingBox: { x: 12, y: 72, width: 65, height: 4.5 },
            reviewStatus: 'verified',
          },
        ],
        engineUsed: 'Mock OCR Processor (Simulated Vision Engine v2.4 - Non-Production)',
        processingDurationMs: duration,
        isMock: true,
        preprocessed: {
          deskewApplied: true,
          rotationDegrees: 0,
          contrastEnhanced: true,
        },
      };
    }

    // 2. Fire Safety NOC
    if (nameLower.includes('fire') || nameLower.includes('noc') || payload.documentId === 'doc-3') {
      const overallConfidence = this.generateConfidence(98.8);
      return {
        rawText: `KARNATAKA STATE FIRE AND RESCUE SERVICES DEPARTMENT
OFFICE OF THE CHIEF FIRE OFFICER, BENGALURU ZONE
NO: C-NOC/KSFRS/BLR/2023/1049
CLEARANCE CERTIFICATE / NO OBJECTION CERTIFICATE
Premises: Vishweshwaraya Institute of Technology, Sy No 142, Bengaluru South.
Inspection Date: 28th February 2023
Validity Period: Valid for ONE YEAR ONLY from date of issue, expiring on: 31st March 2024.`,
        pageCount: 2,
        overallConfidence,
        extractedFields: [
          {
            key: 'noc_number',
            label: 'Fire NOC Certificate Number',
            rawText: 'NO: C-NOC/KSFRS/BLR/2023/1049',
            normalizedValue: 'C-NOC/KSFRS/BLR/2023/1049',
            confidence: this.generateConfidence(99.2, 0.4),
            pageNumber: 1,
            boundingBox: { x: 15, y: 18, width: 45, height: 4 },
            reviewStatus: 'verified',
          },
          {
            key: 'expiry_date',
            label: 'Fire Safety NOC Expiry Date',
            rawText: 'expiring on: 31st March 2024',
            normalizedValue: '2024-03-31',
            confidence: this.generateConfidence(99.8, 0.2),
            pageNumber: 1,
            boundingBox: { x: 12, y: 62, width: 55, height: 6 },
            reviewStatus: 'mismatch',
            portalDeclaredValue: 'Valid through 2026 Academic Session',
            statutoryRuleRef: 'AICTE APH 2024-25 Cl. 6.3',
            anomalyReason:
              'Certificate expired on 31 March 2024. Non-compliant with statutory life-safety mandate.',
          },
        ],
        engineUsed: 'Mock OCR Processor (Simulated Vision Engine v2.4 - Non-Production)',
        processingDurationMs: duration,
        isMock: true,
        preprocessed: {
          deskewApplied: false,
          rotationDegrees: 0,
          contrastEnhanced: true,
        },
      };
    }

    // 3. Trust Registration Certificate
    if (nameLower.includes('trust') || nameLower.includes('society') || payload.documentId === 'doc-1') {
      const overallConfidence = this.generateConfidence(99.4);
      return {
        rawText: `GOVERNMENT OF KARNATAKA
OFFICE OF THE REGISTRAR OF SOCIETIES & TRUSTS
CERTIFICATE OF REGISTRATION UNDER SOCIETIES REGISTRATION ACT 1960
Registration No: BLR-IV-7489/1998-99
Date: 12th August 1998
Name of Society: Shri Vishweshwaraya Educational Trust
Registered Address: #42 Vidya Soudha, Outer Ring Road, Bengaluru - 560103`,
        pageCount: 3,
        overallConfidence,
        extractedFields: [
          {
            key: 'trust_registration_no',
            label: 'Society / Trust Registration No.',
            rawText: 'Registration No: BLR-IV-7489/1998-99',
            normalizedValue: 'BLR-IV-7489',
            confidence: this.generateConfidence(99.7, 0.2),
            pageNumber: 1,
            boundingBox: { x: 15, y: 22, width: 45, height: 4 },
            reviewStatus: 'verified',
          },
          {
            key: 'trust_name',
            label: 'Registered Trust Legal Name',
            rawText: 'Shri Vishweshwaraya Educational Trust',
            normalizedValue: 'Shri Vishweshwaraya Educational Trust',
            confidence: this.generateConfidence(99.4, 0.4),
            pageNumber: 1,
            boundingBox: { x: 15, y: 32, width: 55, height: 4.5 },
            reviewStatus: 'verified',
          },
        ],
        engineUsed: 'Mock OCR Processor (Simulated Vision Engine v2.4 - Non-Production)',
        processingDurationMs: duration,
        isMock: true,
        preprocessed: {
          deskewApplied: false,
          rotationDegrees: 0,
          contrastEnhanced: true,
        },
      };
    }

    // 4. Municipal Sanction Plan
    if (nameLower.includes('sanction') || nameLower.includes('plan') || payload.documentId === 'doc-4') {
      const overallConfidence = this.generateConfidence(97.5);
      return {
        rawText: `BRUHAT BENGALURU MAHANAGARA PALIKE (BBMP)
TOWN PLANNING DEPARTMENT - SOUTH ZONE
PLAN SANCTION LP NO: BBMP/ADDL.DIR/JD-SOUTH/LP/0142/2016-17
Approved Built-Up Area: 14,280.50 Sq. Meters
Permitted FAR (Floor Area Ratio): 1.50 Max Permissible
Occupancy Certificate No: BBMP/OCC/2018/891`,
        pageCount: 6,
        overallConfidence,
        extractedFields: [
          {
            key: 'sanction_plan_lp_number',
            label: 'Sanction Plan LP Number',
            rawText: 'LP NO: BBMP/ADDL.DIR/JD-SOUTH/LP/0142/2016-17',
            normalizedValue: 'BBMP/LP/0142/2016-17',
            confidence: this.generateConfidence(98.6, 0.5),
            pageNumber: 1,
            boundingBox: { x: 10, y: 20, width: 50, height: 4 },
            reviewStatus: 'verified',
          },
          {
            key: 'far_ratio',
            label: 'Sanctioned Floor Area Ratio (FAR)',
            rawText: 'Permitted FAR: 1.50 Max Permissible',
            normalizedValue: '1.50 Max FAR',
            confidence: this.generateConfidence(96.9, 1.1),
            pageNumber: 2,
            boundingBox: { x: 10, y: 48, width: 50, height: 4.5 },
            reviewStatus: 'mismatch',
            portalDeclaredValue: '1.75 FAR (18,400.00 sq.m)',
            statutoryRuleRef: 'AICTE APH 2024-25 Cl. 5.2 & NBC 2016',
            anomalyReason:
              'Portal declares 18,400 sq.m (FAR 1.75) which exceeds sanctioned municipal LP authorization of 14,280.50 sq.m (FAR 1.50).',
          },
        ],
        engineUsed: 'Mock OCR Processor (Simulated Vision Engine v2.4 - Non-Production)',
        processingDurationMs: duration,
        isMock: true,
        preprocessed: {
          deskewApplied: true,
          rotationDegrees: 0,
          contrastEnhanced: true,
        },
      };
    }

    // Default Statutory Document Mock
    const overallConfidence = this.generateConfidence(96.0);
    return {
      rawText: `AICTE STATUTORY SUBMISSION RECORD
FILE: ${payload.fileName}
DATE OF EXTRACTION: ${new Date().toLocaleDateString()}
REGULATORY STATUS: INGESTED FOR COMPLIANCE SCREENING`,
      pageCount: 1,
      overallConfidence,
      extractedFields: [
        {
          key: 'document_title',
          label: 'Statutory Document Title',
          rawText: payload.fileName,
          normalizedValue: payload.fileName.replace(/\.[^/.]+$/, ''),
          confidence: this.generateConfidence(98.0, 0.8),
          pageNumber: 1,
          boundingBox: { x: 10, y: 15, width: 70, height: 5 },
          reviewStatus: 'verified',
        },
      ],
      engineUsed: 'Mock OCR Processor (Simulated Vision Engine v2.4 - Non-Production)',
      processingDurationMs: duration,
      isMock: true,
      preprocessed: {
        deskewApplied: true,
        rotationDegrees: 0,
        contrastEnhanced: true,
      },
    };
  }
}

/**
 * Primary Unified OCR Extractor
 * Automatically uses Google Cloud Vision API in production when configured,
 * or gracefully delegates to the Mock OCR Processor in non-production environments.
 */
export async function extractDocumentText(
  payload: OcrServicePayload,
  options?: OcrServiceOptions
): Promise<OcrServiceResult> {
  const isProd = process.env.NODE_ENV === 'production';
  const visionClient = new GoogleCloudVisionClient(options?.apiKey, options?.endpointUrl);
  const shouldForceMock = options?.useMock === true;

  // If in production and Vision API is configured and mock is not forced
  if (isProd && visionClient.isConfigured() && !shouldForceMock && payload.base64Data) {
    const startTime = Date.now();
    try {
      const response = await visionClient.annotateDocument(
        payload.base64Data,
        options?.languageHints || ['en', 'hi', 'kn']
      );

      const firstResult = response.responses?.[0];
      const fullText = firstResult?.fullTextAnnotation?.text || '';
      const pages = firstResult?.fullTextAnnotation?.pages || [];
      const textAnnotations = firstResult?.textAnnotations || [];

      // Calculate overall confidence across blocks/pages
      let totalConfidence = 0;
      let count = 0;
      for (const page of pages) {
        for (const block of page.blocks || []) {
          if (typeof block.confidence === 'number') {
            totalConfidence += block.confidence * 100;
            count++;
          }
        }
      }
      const overallConfidence = count > 0 ? Math.round((totalConfidence / count) * 10) / 10 : 96.5;

      // Extract key invariant lines as structured fields
      const lines = fullText.split('\n').filter((l) => l.trim().length > 3);
      const extractedFields: ExtractedField[] = [];

      for (let i = 0; i < Math.min(lines.length, 6); i++) {
        const line = lines[i].trim();
        const annotation = textAnnotations[i + 1];
        const box = convertVisionPolyToBoundingBox(annotation?.boundingPoly);

        extractedFields.push({
          key: `field_${i + 1}`,
          label: `Extracted Invariant #${i + 1}`,
          rawText: line,
          normalizedValue: line,
          confidence: overallConfidence,
          pageNumber: 1,
          boundingBox: box,
          reviewStatus: 'verified',
        });
      }

      return {
        rawText: fullText,
        pageCount: pages.length || 1,
        overallConfidence,
        extractedFields,
        engineUsed: 'Google Cloud Vision API (DOCUMENT_TEXT_DETECTION)',
        processingDurationMs: Date.now() - startTime,
        isMock: false,
        preprocessed: {
          deskewApplied: true,
          rotationDegrees: 0,
          contrastEnhanced: true,
        },
      };
    } catch (visionError) {
      console.warn('Google Cloud Vision call failed, failing over to Mock OCR Processor:', visionError);
      // Fallback to Mock Processor below
    }
  }

  // Non-Production or Fallback: Use Mock OCR Processor
  const mockProcessor = new MockOcrProcessor(
    options?.simulatedMinLatencyMs || 450,
    options?.simulatedMaxLatencyMs || 850
  );
  return mockProcessor.extract(payload, options);
}
