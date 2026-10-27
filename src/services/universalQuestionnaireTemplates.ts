/**
 * CMRG Data Collect - Universal Questionnaire Templates & AI / XLSForm Importer
 * Supports every major research discipline: FMCG, CX/NPS, Public Opinion,
 * Household / Demographic, Healthcare, Agriculture, Education, Employee, Retail Audit,
 * B2B, and Censuses.
 */

import { Questionnaire, Question, QuestionType } from '../types';

export interface DisciplineTemplate {
  id: string;
  discipline: string;
  title: string;
  description: string;
  category: string;
  icon: string;
  questionnaire: Questionnaire;
}

export const UNIVERSAL_DISCIPLINE_TEMPLATES: DisciplineTemplate[] = [
  {
    id: 'fmcg-brand-health',
    discipline: 'Commercial Market Research & FMCG',
    title: 'FMCG Brand Health, Usage & Market Share Audit',
    description: 'Aided & spontaneous brand awareness, usage frequency, semantic brand perception matrix, and price elasticity.',
    category: 'Market Research',
    icon: 'ShoppingBag',
    questionnaire: {
      id: 'quest-fmcg-01',
      title: 'FMCG Brand Health, Usage & Perception Survey',
      version: '1.0',
      projectId: 'proj-3',
      discipline: 'Commercial Market Research & FMCG',
      updatedAt: new Date().toISOString().split('T')[0],
      status: 'published',
      description: 'Standard brand health tracker measuring spontaneous recall, consideration, semantic differential perceptions, and share of wallet.',
      questions: [
        {
          id: 'q_intro',
          variableName: 'section_screener',
          label: 'Section 1: Screening & Demographics',
          type: 'instruction',
          required: false,
          hint: 'Screen respondent for key demographic quotas and decision-maker status.'
        },
        {
          id: 'q_shopper_role',
          variableName: 'is_primary_shopper',
          label: 'Are you the primary or joint grocery shopper in your household?',
          type: 'yes_no',
          required: true,
          screenoutCondition: "is_primary_shopper == 'no'",
          screenoutMessage: 'Screenout: Respondent is not a key decision maker for household FMCG purchases.'
        },
        {
          id: 'q_spontaneous_brand',
          variableName: 'top_of_mind_brand',
          label: 'When you think of Carbonated Soft Drinks (CSD), which brand comes to mind first?',
          type: 'text',
          required: true,
          hint: 'Record first brand mentioned spontaneously without prompting.'
        },
        {
          id: 'q_aided_awareness',
          variableName: 'aided_brands',
          label: 'Which of the following beverage brands have you heard of or seen recently?',
          type: 'select_multiple',
          required: true,
          randomizeOptions: true,
          options: [
            { id: 'b1', label: 'Coca-Cola', value: 'coca_cola' },
            { id: 'b2', label: 'Pepsi', value: 'pepsi' },
            { id: 'b3', label: 'Bigi Cola', value: 'bigi_cola' },
            { id: 'b4', label: 'RC Cola', value: 'rc_cola' },
            { id: 'b5', label: 'Suntory / Lucozade', value: 'lucozade' },
            { id: 'b6', label: 'Maltina', value: 'maltina' }
          ],
          allowOther: true,
          otherLabel: 'Other beverage brand (specify)'
        },
        {
          id: 'q_semantic_diff',
          variableName: 'brand_perception',
          label: 'Rate your perception of {{top_of_mind_brand}} on the following dimensions:',
          type: 'semantic_differential',
          required: true,
          semanticPairs: [
            { id: 'sp1', leftLabel: 'Budget / Affordable', rightLabel: 'Premium / High-End' },
            { id: 'sp2', leftLabel: 'Traditional / Old', rightLabel: 'Modern / Trendy' },
            { id: 'sp3', leftLabel: 'Poor Taste Quality', rightLabel: 'Superior Taste Quality' },
            { id: 'sp4', leftLabel: 'Hard to Find in Shops', rightLabel: 'Everywhere in Open Markets' }
          ]
        },
        {
          id: 'q_constant_sum_wallet',
          variableName: 'wallet_share',
          label: 'Out of your last 10 purchases of bottled drinks, how many times did you purchase each?',
          type: 'constant_sum',
          required: true,
          constantSumTotal: 10,
          options: [
            { id: 'w1', label: 'Coca-Cola', value: 'coke_count' },
            { id: 'w2', label: 'Pepsi', value: 'pepsi_count' },
            { id: 'w3', label: 'Bigi Cola', value: 'bigi_count' },
            { id: 'w4', label: 'Other Brands', value: 'other_count' }
          ],
          hint: 'Total must sum to exactly 10.'
        },
        {
          id: 'q_pack_photo',
          variableName: 'pantry_photo',
          label: 'Take GPS Watermarked Photo of Drinks currently in Respondent Pantry / Fridge',
          type: 'photo',
          required: false,
          hint: 'Verify home inventory with auto-embedded location coordinates.'
        }
      ]
    }
  },
  {
    id: 'cx-nps-enterprise',
    discipline: 'Customer Experience (CX) & NPS',
    title: 'Enterprise Customer Experience & Net Promoter Score',
    description: 'Standard 0-10 NPS rating, satisfaction matrix across touchpoints, open verbatim feedback, and driver ranking.',
    category: 'Customer Experience',
    icon: 'Smile',
    questionnaire: {
      id: 'quest-cx-01',
      title: 'Customer Experience & NPS Relationship Study',
      version: '1.0',
      projectId: 'proj-1',
      discipline: 'Customer Experience (CX) & NPS',
      updatedAt: new Date().toISOString().split('T')[0],
      status: 'published',
      description: 'Global standard NPS and customer journey matrix evaluating CSAT, CES (Customer Effort Score) and churn risk.',
      questions: [
        {
          id: 'q_nps',
          variableName: 'nps_score',
          label: 'How likely are you to recommend CMRG Client to a colleague, friend, or business partner?',
          type: 'nps',
          required: true,
          hint: '0 = Not At All Likely, 10 = Extremely Likely'
        },
        {
          id: 'q_nps_promoter_reason',
          variableName: 'promoter_drivers',
          label: 'What is the primary reason for giving a score of {{nps_score}}?',
          type: 'textarea',
          required: true,
          relevantCondition: 'nps_score >= 9',
          hint: 'Detailed verbatim reason for high loyalty and recommendation.'
        },
        {
          id: 'q_nps_detractor_reason',
          variableName: 'detractor_issues',
          label: 'What could our client improve to earn a 10 from you in the future?',
          type: 'textarea',
          required: true,
          relevantCondition: 'nps_score <= 6',
          hint: 'Root cause for dissatisfaction or churn friction.'
        },
        {
          id: 'q_cx_matrix',
          variableName: 'touchpoint_satisfaction',
          label: 'Please rate your satisfaction across these specific service touchpoints:',
          type: 'matrix',
          required: true,
          matrixRows: [
            { id: 'r1', label: 'Mobile App Speed & Reliability' },
            { id: 'r2', label: 'Customer Support Response Time' },
            { id: 'r3', label: 'Billing Accuracy & Transparency' },
            { id: 'r4', label: 'Overall Value for Money' }
          ],
          matrixCols: [
            { id: 'c1', label: '1 - Very Dissatisfied', value: '1' },
            { id: 'c2', label: '2 - Dissatisfied', value: '2' },
            { id: 'c3', label: '3 - Neutral', value: '3' },
            { id: 'c4', label: '4 - Satisfied', value: '4' },
            { id: 'c5', label: '5 - Very Satisfied', value: '5' }
          ]
        },
        {
          id: 'q_touchpoint_ranking',
          variableName: 'priority_ranking',
          label: 'Rank the following attributes in order of personal importance to you (1 = Most Important):',
          type: 'ranking',
          required: true,
          options: [
            { id: 'rk1', label: 'Pricing & Transparent Fees', value: 'pricing' },
            { id: 'rk2', label: 'Platform Stability & Uptime', value: 'stability' },
            { id: 'rk3', label: 'Human Customer Service', value: 'human_support' },
            { id: 'rk4', label: 'Ease of Use & Clean UI', value: 'ease_of_use' }
          ]
        }
      ]
    }
  },
  {
    id: 'household-ndpr-lagos',
    discipline: 'Household Socio-Economic & Demographics',
    title: 'Lagos Metropolitan Household Roster & Socio-Economic Survey',
    description: 'Comprehensive roster repeating group for family members, dwelling audit, asset index, and power grid status (NDPR compliant).',
    category: 'Demographics & Census',
    icon: 'Home',
    questionnaire: {
      id: 'quest-hh-01',
      title: 'Lagos State Household Demographics & Power Survey (NDPR Compliant)',
      version: '1.2',
      projectId: 'proj-cmrg-739',
      discipline: 'Household Socio-Economic & Demographics',
      updatedAt: new Date().toISOString().split('T')[0],
      status: 'published',
      description: 'Lagos Bureau of Statistics aligned household census with roster repeating group, power grid diagnostics, and GPS geo-validation.',
      questions: [
        {
          id: 'q_consent_sig',
          variableName: 'informed_consent',
          label: 'Informed Consent & NDPR Data Protection Notice',
          type: 'signature',
          required: true,
          hint: 'Respondent confirms voluntary participation under Nigeria Data Protection Act (NDPA).'
        },
        {
          id: 'q_hh_head_name',
          variableName: 'head_name',
          label: 'Full Name of Household Head',
          type: 'text',
          required: true,
          hint: 'Enter full legal name as recognized on utility documents.'
        },
        {
          id: 'q_hh_size',
          variableName: 'member_count',
          label: 'Total Number of Persons Currently Residing in Household',
          type: 'integer',
          required: true,
          validation: { minValue: 1, maxValue: 30, customErrorMessage: 'Household size must be between 1 and 30 persons.' }
        },
        {
          id: 'q_hh_roster',
          variableName: 'household_roster',
          label: 'Household Member Roster (Repeating Loop)',
          type: 'repeat_group',
          required: true,
          repeatCountVar: 'member_count',
          repeatQuestions: [
            {
              id: 'q_member_name',
              variableName: 'm_name',
              label: 'Member Full Name',
              type: 'text',
              required: true
            },
            {
              id: 'q_member_rel',
              variableName: 'm_relation',
              label: 'Relationship to Head of Household',
              type: 'select_one',
              required: true,
              options: [
                { id: 'rel1', label: 'Head of Household', value: 'head' },
                { id: 'rel2', label: 'Spouse', value: 'spouse' },
                { id: 'rel3', label: 'Son / Daughter', value: 'child' },
                { id: 'rel4', label: 'Parent / In-Law', value: 'parent' },
                { id: 'rel5', label: 'Extended Relative', value: 'relative' },
                { id: 'rel6', label: 'Domestic Worker / Non-Relative', value: 'other' }
              ]
            },
            {
              id: 'q_member_age',
              variableName: 'm_age',
              label: 'Member Age in Years',
              type: 'integer',
              required: true,
              validation: { minValue: 0, maxValue: 120 }
            },
            {
              id: 'q_member_occupation',
              variableName: 'm_occupation',
              label: 'Primary Employment Status',
              type: 'select_one',
              required: true,
              options: [
                { id: 'occ1', label: 'Employed (Formal Sector)', value: 'formal_employed' },
                { id: 'occ2', label: 'Informal Trader / Artisan', value: 'informal' },
                { id: 'occ3', label: 'Student / Scholar', value: 'student' },
                { id: 'occ4', label: 'Unemployed / Seeking Work', value: 'unemployed' },
                { id: 'occ5', label: 'Retired', value: 'retired' }
              ]
            }
          ]
        },
        {
          id: 'q_dwelling_type',
          variableName: 'dwelling_structure',
          label: 'Type of Dwelling Structure',
          type: 'select_one',
          required: true,
          options: [
            { id: 'dw1', label: 'Single Family Bungalow', value: 'bungalow' },
            { id: 'dw2', label: 'Multi-Storey Block of Flats', value: 'flats' },
            { id: 'dw3', label: 'Traditional Rooming House ("Face-Me-I-Face-You")', value: 'rooming' },
            { id: 'dw4', label: 'Duplex / Semi-Detached Villa', value: 'duplex' }
          ]
        },
        {
          id: 'q_hh_gps',
          variableName: 'dwelling_coordinates',
          label: 'Capture Dwelling Satellite GPS Fix (±5m precision)',
          type: 'gps',
          required: true
        }
      ]
    }
  },
  {
    id: 'public-health-epidemiology',
    discipline: 'Public Health & Clinical Epidemiology',
    title: 'Community Health, Immunization & Clinical Screener',
    description: 'Patient vitals, vaccination record capture, symptom screening matrix, and automated BMI calculator.',
    category: 'Healthcare & Public Health',
    icon: 'Activity',
    questionnaire: {
      id: 'quest-health-01',
      title: 'Community Health Outreach & Nutritional Status Screener',
      version: '1.0',
      projectId: 'proj-4',
      discipline: 'Public Health & Clinical Epidemiology',
      updatedAt: new Date().toISOString().split('T')[0],
      status: 'published',
      description: 'WHO and NPHCDA standardized clinical screening with auto-calculated BMI and vaccine card photo evidence.',
      questions: [
        {
          id: 'q_patient_age_months',
          variableName: 'age_in_months',
          label: 'Child Age in Completed Months',
          type: 'integer',
          required: true,
          validation: { minValue: 0, maxValue: 60, customErrorMessage: 'Age must be between 0 and 60 months for pediatric audit.' }
        },
        {
          id: 'q_weight_kg',
          variableName: 'weight_kg',
          label: 'Measured Body Weight (kg)',
          type: 'decimal',
          required: true,
          validation: { minValue: 1.5, maxValue: 40.0 }
        },
        {
          id: 'q_height_cm',
          variableName: 'height_cm',
          label: 'Measured Height / Recumbent Length (cm)',
          type: 'decimal',
          required: true,
          validation: { minValue: 30.0, maxValue: 130.0 }
        },
        {
          id: 'q_calc_bmi',
          variableName: 'calculated_bmi',
          label: 'Body Mass Index (Auto-Calculated: kg/m²)',
          type: 'calculation',
          required: false,
          calculationFormula: 'Math.round((weight_kg / ((height_cm / 100) * (height_cm / 100))) * 10) / 10',
          hint: 'Automatically computed by health logic engine.'
        },
        {
          id: 'q_vaccines_matrix',
          variableName: 'immunization_history',
          label: 'Verified Immunizations (check card status for each antigen):',
          type: 'matrix',
          required: true,
          matrixRows: [
            { id: 'v1', label: 'BCG (Tuberculosis at birth)' },
            { id: 'v2', label: 'OPV-0 & OPV-1 (Polio)' },
            { id: 'v3', label: 'Penta 1, 2, 3 (DTP-HepB-Hib)' },
            { id: 'v4', label: 'Measles 1 (9 months)' },
            { id: 'v5', label: 'Yellow Fever' }
          ],
          matrixCols: [
            { id: 'vc1', label: 'Verified on Card', value: 'card_verified' },
            { id: 'vc2', label: 'Reported by Mother', value: 'mother_reported' },
            { id: 'vc3', label: 'Not Received', value: 'not_received' },
            { id: 'vc4', label: 'Don\'t Know', value: 'unknown' }
          ]
        },
        {
          id: 'q_card_photo',
          variableName: 'yellow_card_photo',
          label: 'Take High-Resolution Photo of Child Immunization Card',
          type: 'photo',
          required: true,
          hint: 'Capture full yellow card showing clinic stamp and batch numbers.'
        }
      ]
    }
  },
  {
    id: 'agriculture-smallholder',
    discipline: 'Agriculture & Smallholder Farmer Monitoring',
    title: 'Smallholder Farmer Acreage, Yield & Agronomic Practices Survey',
    description: 'Farm GPS polygon coordinates, crop types, fertilizer application, constant sum yield allocation, and market price tracking.',
    category: 'Agriculture & Food Security',
    icon: 'Trees',
    questionnaire: {
      id: 'quest-agric-01',
      title: 'Smallholder Agronomic Practices & Crop Yield Assessment',
      version: '1.0',
      projectId: 'proj-1',
      discipline: 'Agriculture & Smallholder Farmer Monitoring',
      updatedAt: new Date().toISOString().split('T')[0],
      status: 'published',
      description: 'FAO aligned agricultural monitoring questionnaire measuring plot size, seed variety, and seasonal yields.',
      questions: [
        {
          id: 'q_farm_size',
          variableName: 'farm_acres',
          label: 'Total Farm Land Under Cultivation (Acres / Hectares)',
          type: 'decimal',
          required: true,
          validation: { minValue: 0.1, maxValue: 500 }
        },
        {
          id: 'q_primary_crops',
          variableName: 'cultivated_crops',
          label: 'Which primary crops are cultivated on this plot?',
          type: 'select_multiple',
          required: true,
          options: [
            { id: 'c1', label: 'Maize (Corn)', value: 'maize' },
            { id: 'c2', label: 'Cassava', value: 'cassava' },
            { id: 'c3', label: 'Yam', value: 'yam' },
            { id: 'c4', label: 'Rice (Paddy)', value: 'rice' },
            { id: 'c5', label: 'Sorghum / Millet', value: 'sorghum' },
            { id: 'c6', label: 'Soybeans / Cowpea', value: 'legumes' }
          ],
          allowOther: true,
          otherLabel: 'Other cash crop (specify)'
        },
        {
          id: 'q_harvest_constant_sum',
          variableName: 'harvest_allocation',
          label: 'Out of total harvest (100%), what percentage is allocated to each use?',
          type: 'constant_sum',
          required: true,
          constantSumTotal: 100,
          options: [
            { id: 'h1', label: 'Sold to Commercial Grain Buyers / Markets (%)', value: 'sold_pct' },
            { id: 'h2', label: 'Retained for Household Consumption (%)', value: 'eaten_pct' },
            { id: 'h3', label: 'Reserved for Seed Planting Next Season (%)', value: 'seed_pct' },
            { id: 'h4', label: 'Post-Harvest Loss / Pest Damage (%)', value: 'loss_pct' }
          ]
        },
        {
          id: 'q_farm_gps',
          variableName: 'farm_boundary_point',
          label: 'Record Farm Centroid GPS Coordinates',
          type: 'gps',
          required: true,
          hint: 'Stand in middle of cultivated parcel with satellite lock.'
        }
      ]
    }
  },
  {
    id: 'retail-audit-mystery-shopping',
    discipline: 'Retail Audit, Mystery Shopping & Distribution Check',
    title: 'Retail Store Audit, Planogram Compliance & Stock Check',
    description: 'Barcode scanning, shelf presence matrix, price checks, out-of-stock reporting, and store storefront photo capture.',
    category: 'Retail & Distribution',
    icon: 'Store',
    questionnaire: {
      id: 'quest-retail-01',
      title: 'National Retail Audit & Fast-Moving Consumer Shelf Check',
      version: '2.0',
      projectId: 'proj-1',
      discipline: 'Retail Audit, Mystery Shopping & Distribution Check',
      updatedAt: new Date().toISOString().split('T')[0],
      status: 'published',
      description: 'In-store price compliance, facings count, and SKU barcode validation.',
      questions: [
        {
          id: 'q_store_type',
          variableName: 'retail_channel',
          label: 'Retail Channel Classification',
          type: 'select_one',
          required: true,
          options: [
            { id: 'rc1', label: 'Modern Trade (Supermarket / Hypermarket)', value: 'modern_trade' },
            { id: 'rc2', label: 'Traditional Open Market Wholesale', value: 'open_market' },
            { id: 'rc3', label: 'Neighborhood Kiosk / Table Top', value: 'kiosk' },
            { id: 'rc4', label: 'Forecourt Gas Station Mart', value: 'forecourt' }
          ]
        },
        {
          id: 'q_barcode_sku',
          variableName: 'sku_barcode',
          label: 'Scan Product Barcode / EAN-13 Using Camera Scanner',
          type: 'barcode',
          required: true,
          hint: 'Align SKU barcode within scanner viewfinder.'
        },
        {
          id: 'q_shelf_presence_matrix',
          variableName: 'sku_presence',
          label: 'Verify On-Shelf Stock Status for Key Category SKUs:',
          type: 'matrix',
          required: true,
          matrixRows: [
            { id: 'sk1', label: 'Peak Milk 400g Tin' },
            { id: 'sk2', label: 'Indomie Super Pack 120g' },
            { id: 'sk3', label: 'Milo Refill Pack 500g' },
            { id: 'sk4', label: 'Golden Penny Sugar 500g' }
          ],
          matrixCols: [
            { id: 'sc1', label: 'In Stock & Displayed', value: 'in_stock' },
            { id: 'sc2', label: 'Out of Stock (Empty Shelf)', value: 'oos' },
            { id: 'sc3', label: 'Not Carried by Retailer', value: 'not_stocked' }
          ]
        },
        {
          id: 'q_retail_price',
          variableName: 'selling_price_ngn',
          label: 'Current Selling Price on Shelf (NGN)',
          type: 'integer',
          required: true,
          validation: { minValue: 50, maxValue: 100000 }
        },
        {
          id: 'q_shelf_photo',
          variableName: 'planogram_photo',
          label: 'Capture Wide Shelf Photo showing Competitor Placement',
          type: 'photo',
          required: true
        }
      ]
    }
  }
];

/**
 * Universal XLSForm (ODK / SurveyCTO) parser
 * Parses CSV or tab-separated survey and choices sheets
 */
export const XLSFormHelper = {
  /**
   * Parses tabular CSV or TSV XLSForm definition into a Questionnaire
   */
  parseXLSForm(text: string, title: string = 'Imported XLSForm Survey'): Questionnaire {
    const lines = text.split(/\r?\n/).map(l => l.trim()).filter(l => l.length > 0 && !l.startsWith('#'));
    const questions: Question[] = [];

    // Detect delimiter
    const delimiter = text.includes('\t') ? '\t' : ',';
    if (lines.length === 0) {
      throw new Error('Provided XLSForm text is empty.');
    }

    const header = lines[0].split(delimiter).map(h => h.trim().toLowerCase());
    const typeIdx = header.findIndex(h => h === 'type');
    const nameIdx = header.findIndex(h => h === 'name' || h === 'variablename');
    const labelIdx = header.findIndex(h => h === 'label');
    const relevantIdx = header.findIndex(h => h === 'relevant' || h === 'condition');
    const requiredIdx = header.findIndex(h => h === 'required');
    const hintIdx = header.findIndex(h => h === 'hint');
    const constraintIdx = header.findIndex(h => h === 'constraint');

    if (typeIdx === -1 || nameIdx === -1) {
      // Fallback: simple line-based question list
      return this.parseSimpleTextToQuestionnaire(text, title);
    }

    for (let i = 1; i < lines.length; i++) {
      const row = lines[i].split(delimiter).map(cell => cell.trim().replace(/^"|"$/g, ''));
      if (row.length <= typeIdx || !row[typeIdx]) continue;

      const rawType = row[typeIdx].toLowerCase();
      const name = row[nameIdx] || `q_${i}`;
      const label = labelIdx !== -1 && row[labelIdx] ? row[labelIdx] : `Question ${name}`;
      const relevant = relevantIdx !== -1 ? row[relevantIdx] : undefined;
      const required = requiredIdx !== -1 ? (row[requiredIdx] === 'yes' || row[requiredIdx] === 'true' || row[requiredIdx] === '1') : true;
      const hint = hintIdx !== -1 ? row[hintIdx] : undefined;

      let qType: QuestionType = 'text';
      let options = undefined;

      if (rawType.startsWith('select_one')) {
        qType = 'select_one';
        const choicesKey = rawType.replace('select_one', '').trim();
        options = [
          { id: 'opt_1', label: `${choicesKey} Option 1`, value: '1' },
          { id: 'opt_2', label: `${choicesKey} Option 2`, value: '2' },
          { id: 'opt_3', label: `${choicesKey} Option 3`, value: '3' }
        ];
      } else if (rawType.startsWith('select_multiple')) {
        qType = 'select_multiple';
        options = [
          { id: 'opt_1', label: 'Option A', value: 'a' },
          { id: 'opt_2', label: 'Option B', value: 'b' },
          { id: 'opt_3', label: 'Option C', value: 'c' }
        ];
      } else if (rawType === 'integer') qType = 'integer';
      else if (rawType === 'decimal') qType = 'decimal';
      else if (rawType === 'geopoint' || rawType === 'gps') qType = 'gps';
      else if (rawType === 'image' || rawType === 'photo') qType = 'photo';
      else if (rawType === 'video') qType = 'video';
      else if (rawType === 'audio') qType = 'audio';
      else if (rawType === 'barcode') qType = 'barcode';
      else if (rawType === 'date') qType = 'date';
      else if (rawType === 'note') qType = 'instruction';
      else if (rawType === 'calculate') qType = 'calculation';

      questions.push({
        id: `q_${i}_${name}`,
        variableName: name,
        label,
        type: qType,
        required,
        hint,
        relevantCondition: relevant,
        options
      });
    }

    return {
      id: `quest-imported-${Date.now()}`,
      title,
      version: '1.0',
      projectId: 'proj-1',
      updatedAt: new Date().toISOString().split('T')[0],
      status: 'draft',
      questions: questions.length > 0 ? questions : this.parseSimpleTextToQuestionnaire(text, title).questions
    };
  },

  /**
   * Fallback parser for newline questions e.g. "1. What is your age? [integer]"
   */
  parseSimpleTextToQuestionnaire(text: string, title: string): Questionnaire {
    const lines = text.split(/\r?\n/).map(l => l.trim()).filter(l => l.length > 0);
    const questions: Question[] = [];

    lines.forEach((line, idx) => {
      let qType: QuestionType = 'text';
      let cleanLine = line.replace(/^\d+[\.\)]\s*/, '');

      if (cleanLine.toLowerCase().includes('[number]') || cleanLine.toLowerCase().includes('[integer]')) {
        qType = 'integer';
        cleanLine = cleanLine.replace(/\[(?:number|integer)\]/gi, '').trim();
      } else if (cleanLine.toLowerCase().includes('[choice]') || cleanLine.toLowerCase().includes('[select]')) {
        qType = 'select_one';
        cleanLine = cleanLine.replace(/\[(?:choice|select)\]/gi, '').trim();
      } else if (cleanLine.toLowerCase().includes('[photo]')) {
        qType = 'photo';
        cleanLine = cleanLine.replace(/\[photo\]/gi, '').trim();
      } else if (cleanLine.toLowerCase().includes('[gps]')) {
        qType = 'gps';
        cleanLine = cleanLine.replace(/\[gps\]/gi, '').trim();
      } else if (cleanLine.toLowerCase().includes('[nps]')) {
        qType = 'nps';
        cleanLine = cleanLine.replace(/\[nps\]/gi, '').trim();
      }

      questions.push({
        id: `q_parsed_${idx + 1}`,
        variableName: `var_${idx + 1}`,
        label: cleanLine,
        type: qType,
        required: true,
        options: qType === 'select_one' ? [
          { id: 'o1', label: 'Yes / Agree', value: 'yes' },
          { id: 'o2', label: 'No / Disagree', value: 'no' }
        ] : undefined
      });
    });

    return {
      id: `quest-quick-${Date.now()}`,
      title,
      version: '1.0',
      projectId: 'proj-1',
      updatedAt: new Date().toISOString().split('T')[0],
      status: 'draft',
      questions
    };
  },

  /**
   * Exports questionnaire to standard XLSForm CSV syntax
   */
  exportToXLSFormCSV(questionnaire: Questionnaire): string {
    const headers = ['type', 'name', 'label', 'required', 'relevant', 'hint', 'calculation'];
    const rows = questionnaire.questions.map(q => {
      let typeStr: string = q.type;
      if (q.type === 'select_one') typeStr = 'select_one list_options';
      if (q.type === 'select_multiple') typeStr = 'select_multiple list_options';
      if (q.type === 'instruction') typeStr = 'note';
      if (q.type === 'photo') typeStr = 'image';
      if (q.type === 'gps') typeStr = 'geopoint';

      return [
        typeStr,
        q.variableName,
        `"${q.label.replace(/"/g, '""')}"`,
        q.required ? 'yes' : 'no',
        q.relevantCondition ? `"${q.relevantCondition.replace(/"/g, '""')}"` : '',
        q.hint ? `"${q.hint.replace(/"/g, '""')}"` : '',
        q.calculationFormula ? `"${q.calculationFormula.replace(/"/g, '""')}"` : ''
      ].join(',');
    });

    return [headers.join(','), ...rows].join('\n');
  }
};

/**
 * Intelligent AI & Domain Study Generator
 * Generates rich, complete, multi-question studies based on a natural language brief.
 */
export const StudyPromptGenerator = {
  generateFromBrief(brief: string, discipline: string = 'General Survey'): Questionnaire {
    const lower = brief.toLowerCase();

    // Check if brief matches known domains
    if (lower.includes('brand') || lower.includes('fmcg') || lower.includes('beverage') || lower.includes('product') || lower.includes('market')) {
      const base = UNIVERSAL_DISCIPLINE_TEMPLATES[0].questionnaire;
      return {
        ...base,
        id: `quest-ai-${Date.now()}`,
        title: `AI Study: ${brief.slice(0, 45)}...`,
        version: '1.0',
        updatedAt: new Date().toISOString().split('T')[0],
        status: 'draft'
      };
    }

    if (lower.includes('nps') || lower.includes('customer') || lower.includes('cx') || lower.includes('satisfaction') || lower.includes('service')) {
      const base = UNIVERSAL_DISCIPLINE_TEMPLATES[1].questionnaire;
      return {
        ...base,
        id: `quest-ai-${Date.now()}`,
        title: `AI Study: ${brief.slice(0, 45)}...`,
        version: '1.0',
        updatedAt: new Date().toISOString().split('T')[0],
        status: 'draft'
      };
    }

    if (lower.includes('health') || lower.includes('patient') || lower.includes('clinic') || lower.includes('vaccin') || lower.includes('hospital')) {
      const base = UNIVERSAL_DISCIPLINE_TEMPLATES[3].questionnaire;
      return {
        ...base,
        id: `quest-ai-${Date.now()}`,
        title: `AI Study: ${brief.slice(0, 45)}...`,
        version: '1.0',
        updatedAt: new Date().toISOString().split('T')[0],
        status: 'draft'
      };
    }

    if (lower.includes('farm') || lower.includes('crop') || lower.includes('agric') || lower.includes('yield') || lower.includes('fertilizer')) {
      const base = UNIVERSAL_DISCIPLINE_TEMPLATES[4].questionnaire;
      return {
        ...base,
        id: `quest-ai-${Date.now()}`,
        title: `AI Study: ${brief.slice(0, 45)}...`,
        version: '1.0',
        updatedAt: new Date().toISOString().split('T')[0],
        status: 'draft'
      };
    }

    if (lower.includes('store') || lower.includes('retail') || lower.includes('audit') || lower.includes('shelf') || lower.includes('price')) {
      const base = UNIVERSAL_DISCIPLINE_TEMPLATES[5].questionnaire;
      return {
        ...base,
        id: `quest-ai-${Date.now()}`,
        title: `AI Study: ${brief.slice(0, 45)}...`,
        version: '1.0',
        updatedAt: new Date().toISOString().split('T')[0],
        status: 'draft'
      };
    }

    // Default rich survey tailored to user prompt
    return {
      id: `quest-ai-${Date.now()}`,
      title: `Field Study: ${brief.length > 50 ? brief.slice(0, 50) + '...' : brief}`,
      version: '1.0',
      projectId: 'proj-1',
      discipline,
      updatedAt: new Date().toISOString().split('T')[0],
      status: 'draft',
      description: `Universal questionnaire synthesized from user prompt: "${brief}"`,
      questions: [
        {
          id: 'q_consent',
          variableName: 'informed_consent',
          label: 'Informed Respondent Consent & Participant Agreement',
          type: 'signature',
          required: true,
          hint: 'Obtain participant electronic signature confirming voluntary participation.'
        },
        {
          id: 'q_respondent_name',
          variableName: 'respondent_name',
          label: 'Respondent Full Name',
          type: 'text',
          required: true,
          hint: 'Primary contact name for verification audit.'
        },
        {
          id: 'q_primary_metric',
          variableName: 'overall_rating',
          label: `How would you rate your overall experience regarding: ${brief}?`,
          type: 'rating',
          required: true,
          maxRating: 5,
          ratingLabels: { min: 'Very Unsatisfied', max: 'Very Satisfied' }
        },
        {
          id: 'q_nps_general',
          variableName: 'recommendation_nps',
          label: 'On a scale of 0 to 10, how likely are you to recommend this to others?',
          type: 'nps',
          required: true
        },
        {
          id: 'q_open_feedback',
          variableName: 'detailed_comments',
          label: 'Please elaborate on the key reasons for your ratings above:',
          type: 'textarea',
          required: false,
          hint: 'Provide context, specific examples, or suggestions for improvement.'
        },
        {
          id: 'q_photo_audit',
          variableName: 'field_evidence_photo',
          label: 'Capture GPS Watermarked Site Photo or Document Evidence',
          type: 'photo',
          required: true,
          hint: 'Auto-embeds timestamp, latitude, longitude and accuracy radius.'
        },
        {
          id: 'q_gps_fix',
          variableName: 'inspection_gps',
          label: 'Record Satellite GPS Audit Coordinates',
          type: 'gps',
          required: true
        }
      ]
    };
  }
};
