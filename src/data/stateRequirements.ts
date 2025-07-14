export interface CourtContact {
  name: string;
  address: string;
  phone: string;
  website: string;
  hours: string;
  notes?: string;
}

export interface DocumentRequirement {
  name: string;
  required: boolean;
  description: string;
  template?: string;
  notes?: string;
}

export interface StateRequirements {
  state: string;
  stateCode: string;
  jurisdiction: string;
  
  // Basic Information
  probateCourtName: string;
  lettersOfAdministrationName: string; // Some states call it different things
  
  // Court Information
  probateCourts: CourtContact[];
  
  // Document Requirements
  requiredDocuments: DocumentRequirement[];
  
  // Process Information
  filingFee: {
    amount: string;
    notes: string;
  };
  
  processingTime: {
    typical: string;
    expedited?: string;
    notes: string;
  };
  
  // Legal Requirements
  residencyRequirements: string[];
  bondRequirements: string;
  noticeRequirements: string[];
  
  // Special Notes
  specialConsiderations: string[];
  helpfulLinks: {
    name: string;
    url: string;
    description: string;
  }[];
}

// Sample state data - California (comprehensive example)
export const STATE_REQUIREMENTS: Record<string, StateRequirements> = {
  CA: {
    state: "California",
    stateCode: "CA",
    jurisdiction: "Superior Court",
    probateCourtName: "Superior Court of California",
    lettersOfAdministrationName: "Letters of Administration",
    
    probateCourts: [
      {
        name: "Los Angeles County Superior Court - Probate Division",
        address: "111 N. Hill Street, Los Angeles, CA 90012",
        phone: "(213) 974-5726",
        website: "https://www.lacourt.org/division/probate/PRO.aspx",
        hours: "Monday-Friday 8:00 AM - 4:30 PM",
        notes: "Main probate division for LA County"
      },
      {
        name: "San Francisco County Superior Court - Probate Department",
        address: "400 McAllister Street, San Francisco, CA 94102",
        phone: "(415) 551-4000",
        website: "https://www.sf.gov/departments/superior-court-california",
        hours: "Monday-Friday 8:00 AM - 4:00 PM"
      }
    ],
    
    requiredDocuments: [
      {
        name: "Petition for Probate (Form DE-111)",
        required: true,
        description: "Main petition to open probate proceedings and request Letters of Administration",
        template: "DE-111"
      },
      {
        name: "Original Death Certificate",
        required: true,
        description: "Certified copy of death certificate from vital records office"
      },
      {
        name: "Duties and Liabilities of Personal Representative (Form DE-147)",
        required: true,
        description: "Acknowledgment of duties form that must be filed with petition"
      },
      {
        name: "Will (if any)",
        required: false,
        description: "Original will and any codicils, if deceased left a will",
        notes: "Must be submitted even if will doesn't name an executor"
      },
      {
        name: "Bond (if required)",
        required: false,
        description: "Surety bond may be required depending on estate value and will provisions"
      }
    ],
    
    filingFee: {
      amount: "$435 - $800",
      notes: "Fee varies by county. Additional fees for certified copies and publication notices."
    },
    
    processingTime: {
      typical: "4-6 months",
      notes: "Timeline depends on estate complexity and court schedule. Simple estates may be faster."
    },
    
    residencyRequirements: [
      "No residency requirement for personal representative",
      "Out-of-state representatives must appoint California agent for service of process",
      "Court may prefer in-state representatives for convenience"
    ],
    
    bondRequirements: "Bond required unless waived by will or all heirs consent. Amount typically 1.5x estate value.",
    
    noticeRequirements: [
      "Notice to heirs and beneficiaries by mail within 60 days",
      "Publication in local newspaper for 3 consecutive weeks",
      "Notice to creditors published and mailed to known creditors"
    ],
    
    specialConsiderations: [
      "California has simplified procedures for small estates under $166,250",
      "Digital assets may require special attention under recent legislation",
      "Community property rules apply to married couples",
      "Consider whether estate qualifies for summary procedures"
    ],
    
    helpfulLinks: [
      {
        name: "California Probate Code",
        url: "https://leginfo.legislature.ca.gov/faces/codes_displayexpandedbranch.xhtml?tocCode=PROB",
        description: "Official California probate statutes"
      },
      {
        name: "Judicial Council Forms",
        url: "https://www.courts.ca.gov/forms.htm",
        description: "Official court forms including probate forms"
      },
      {
        name: "California Courts Self-Help",
        url: "https://selfhelp.courts.ca.gov/probate",
        description: "Step-by-step guidance for probate proceedings"
      }
    ]
  },

  TX: {
    state: "Texas",
    stateCode: "TX", 
    jurisdiction: "County Court",
    probateCourtName: "County Court at Law",
    lettersOfAdministrationName: "Letters of Administration",
    
    probateCourts: [
      {
        name: "Harris County Probate Court",
        address: "201 Caroline Street, Houston, TX 77002",
        phone: "(713) 755-6400",
        website: "https://www.hctx.net/courts/probate",
        hours: "Monday-Friday 8:00 AM - 4:30 PM"
      }
    ],
    
    requiredDocuments: [
      {
        name: "Application for Letters of Administration",
        required: true,
        description: "Formal application to be appointed as administrator of the estate"
      },
      {
        name: "Death Certificate",
        required: true,
        description: "Certified copy of death certificate"
      },
      {
        name: "Citation",
        required: true,
        description: "Legal notice that must be posted and published"
      }
    ],
    
    filingFee: {
      amount: "$300 - $500",
      notes: "Varies by county. Additional costs for publication and service."
    },
    
    processingTime: {
      typical: "3-5 months",
      notes: "Texas has streamlined probate processes for many estates"
    },
    
    residencyRequirements: [
      "No strict residency requirement",
      "Court may require bond for non-resident administrators",
      "Preference given to residents of Texas"
    ],
    
    bondRequirements: "Bond required unless waived. Amount set by court based on estate value.",
    
    noticeRequirements: [
      "Citation posted at courthouse for 10 days",
      "Publication in local newspaper",
      "Notice to interested parties"
    ],
    
    specialConsiderations: [
      "Texas has independent administration option for faster process",
      "Small estate affidavit available for estates under $75,000",
      "Community property state - affects spouse's rights",
      "Homestead exemptions may apply"
    ],
    
    helpfulLinks: [
      {
        name: "Texas Estates Code",
        url: "https://statutes.capitol.texas.gov/Docs/ES/htm/ES.htm",
        description: "Texas probate and estate laws"
      },
      {
        name: "Texas Courts Online",
        url: "https://www.txcourts.gov/",
        description: "Texas court system information"
      }
    ]
  },

  NY: {
    state: "New York",
    stateCode: "NY",
    jurisdiction: "Surrogate's Court",
    probateCourtName: "Surrogate's Court",
    lettersOfAdministrationName: "Letters of Administration",
    
    probateCourts: [
      {
        name: "New York County Surrogate's Court",
        address: "31 Chambers Street, New York, NY 10007",
        phone: "(646) 386-5000",
        website: "https://ww2.nycourts.gov/courts/1jd/surrogates/",
        hours: "Monday-Friday 9:00 AM - 5:00 PM"
      }
    ],
    
    requiredDocuments: [
      {
        name: "Petition for Letters of Administration",
        required: true,
        description: "Formal petition to be appointed administrator"
      },
      {
        name: "Death Certificate",
        required: true,
        description: "Certified copy from Department of Health"
      },
      {
        name: "Renunciation/Consent forms",
        required: true,
        description: "Forms from other potential administrators"
      }
    ],
    
    filingFee: {
      amount: "$45 - $1,250",
      notes: "Fee based on estate value. Under $10,000 = $45, over $500,000 = $1,250"
    },
    
    processingTime: {
      typical: "4-8 months",
      notes: "NYC courts may take longer due to volume"
    },
    
    residencyRequirements: [
      "No residency requirement",
      "Non-resident administrators may need to post additional bond",
      "Must have process agent in New York"
    ],
    
    bondRequirements: "Bond required unless waived by will. Amount typically 2x estate value plus one year's income.",
    
    noticeRequirements: [
      "Citation served on interested parties",
      "Publication in designated newspaper",
      "Notice to Attorney General for certain estates"
    ],
    
    specialConsiderations: [
      "New York has voluntary administration for small estates",
      "SCPA Article 13 provides simplified procedures",
      "Real property may require additional procedures",
      "Tax clearances may be required"
    ],
    
    helpfulLinks: [
      {
        name: "NY Surrogate's Court Procedure Act",
        url: "https://www.nysenate.gov/legislation/laws/SCP",
        description: "New York probate procedures"
      },
      {
        name: "NY Courts System",
        url: "https://ww2.nycourts.gov/",
        description: "Official court information"
      }
    ]
  },

  FL: {
    state: "Florida",
    stateCode: "FL",
    jurisdiction: "Circuit Court",
    probateCourtName: "Circuit Court - Probate Division",
    lettersOfAdministrationName: "Letters of Administration",
    
    probateCourts: [
      {
        name: "Miami-Dade Circuit Court - Probate Division",
        address: "73 W. Flagler Street, Miami, FL 33130",
        phone: "(305) 349-7000",
        website: "https://www.jud11.flcourts.org/",
        hours: "Monday-Friday 8:00 AM - 4:30 PM"
      }
    ],
    
    requiredDocuments: [
      {
        name: "Petition for Administration",
        required: true,
        description: "Initial petition to open probate proceedings"
      },
      {
        name: "Death Certificate",
        required: true,
        description: "Certified copy from Florida Department of Health"
      },
      {
        name: "Oath of Personal Representative",
        required: true,
        description: "Sworn statement accepting appointment"
      }
    ],
    
    filingFee: {
      amount: "$235 - $400",
      notes: "Base filing fee plus additional costs for notices and certified copies"
    },
    
    processingTime: {
      typical: "3-6 months",
      notes: "Florida has streamlined many probate procedures"
    },
    
    residencyRequirements: [
      "Personal representative must be Florida resident OR related to decedent",
      "Non-resident relatives can serve as personal representative",
      "Non-resident, non-relatives generally cannot serve"
    ],
    
    bondRequirements: "Bond may be required depending on will provisions and estate circumstances.",
    
    noticeRequirements: [
      "Notice to beneficiaries within 3 months",
      "Publication in newspaper for 2 consecutive weeks",
      "Notice to creditors by publication and mail"
    ],
    
    specialConsiderations: [
      "Florida has formal and summary administration options",
      "Summary administration available for estates under $75,000",
      "Disposition without administration for very small estates",
      "Homestead property has special protections"
    ],
    
    helpfulLinks: [
      {
        name: "Florida Probate Code",
        url: "http://www.leg.state.fl.us/statutes/index.cfm?App_mode=Display_Statute&URL=0700-0799/0731/0731.html",
        description: "Florida probate statutes"
      },
      {
        name: "Florida Courts",
        url: "https://www.flcourts.org/",
        description: "Florida court system information"
      }
    ]
  }
};

export const US_STATES = [
  { code: 'AL', name: 'Alabama' },
  { code: 'AK', name: 'Alaska' },
  { code: 'AZ', name: 'Arizona' },
  { code: 'AR', name: 'Arkansas' },
  { code: 'CA', name: 'California' },
  { code: 'CO', name: 'Colorado' },
  { code: 'CT', name: 'Connecticut' },
  { code: 'DE', name: 'Delaware' },
  { code: 'FL', name: 'Florida' },
  { code: 'GA', name: 'Georgia' },
  { code: 'HI', name: 'Hawaii' },
  { code: 'ID', name: 'Idaho' },
  { code: 'IL', name: 'Illinois' },
  { code: 'IN', name: 'Indiana' },
  { code: 'IA', name: 'Iowa' },
  { code: 'KS', name: 'Kansas' },
  { code: 'KY', name: 'Kentucky' },
  { code: 'LA', name: 'Louisiana' },
  { code: 'ME', name: 'Maine' },
  { code: 'MD', name: 'Maryland' },
  { code: 'MA', name: 'Massachusetts' },
  { code: 'MI', name: 'Michigan' },
  { code: 'MN', name: 'Minnesota' },
  { code: 'MS', name: 'Mississippi' },
  { code: 'MO', name: 'Missouri' },
  { code: 'MT', name: 'Montana' },
  { code: 'NE', name: 'Nebraska' },
  { code: 'NV', name: 'Nevada' },
  { code: 'NH', name: 'New Hampshire' },
  { code: 'NJ', name: 'New Jersey' },
  { code: 'NM', name: 'New Mexico' },
  { code: 'NY', name: 'New York' },
  { code: 'NC', name: 'North Carolina' },
  { code: 'ND', name: 'North Dakota' },
  { code: 'OH', name: 'Ohio' },
  { code: 'OK', name: 'Oklahoma' },
  { code: 'OR', name: 'Oregon' },
  { code: 'PA', name: 'Pennsylvania' },
  { code: 'RI', name: 'Rhode Island' },
  { code: 'SC', name: 'South Carolina' },
  { code: 'SD', name: 'South Dakota' },
  { code: 'TN', name: 'Tennessee' },
  { code: 'TX', name: 'Texas' },
  { code: 'UT', name: 'Utah' },
  { code: 'VT', name: 'Vermont' },
  { code: 'VA', name: 'Virginia' },
  { code: 'WA', name: 'Washington' },
  { code: 'WV', name: 'West Virginia' },
  { code: 'WI', name: 'Wisconsin' },
  { code: 'WY', name: 'Wyoming' },
  { code: 'DC', name: 'District of Columbia' }
];