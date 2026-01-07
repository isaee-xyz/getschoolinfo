export interface FeeDetails {
  admissionFeeInRupees: number;
  tuitionFeeInRupees: number;
  yearlyDevelopmentChargesInRupees: number;
  annualMonthlyOtherChargesForOtherFacilitiesInRupees?: number;
}

export interface FeeStructure {
  primary?: FeeDetails;
  middle?: FeeDetails;
  secondary?: FeeDetails;
  seniorSecondary?: FeeDetails;
}

export interface Leadership {
  principal: {
    name: string;
    contactNumber?: string;
    email?: string;
    retirementDate?: string;
  };
  emergencyContactPerson?: {
    name: string;
    contactNumber: string;
    email: string;
  };
  sexualHarassmentCommitteeHead: {
    name: string;
    designation?: string;
    contactNumber?: string;
    email?: string;
  };
}

export interface School {
  id: string;
  name: string;
  udiseCode?: string; // Optional because legacy cards might not have it in MOCK
  slug?: string; // New field for URLs
  image: string;

  // Location
  state: string;
  district: string;
  block: string;
  village: string;
  pincode: string;
  address: string;
  lat: number;
  lng: number;

  // Basic Info
  schoolStatusName: "Operational" | "Closed";
  yearDesc: string;
  estdYear?: string;
  boardSecName: "CBSE" | "ICSE" | "State Board" | "IB";
  schTypeDesc: "Co-educational" | "Boys" | "Girls";
  schMgmtDesc?: string;
  lowClass: number;
  highClass: number;
  bldStatus: "Private" | "Government" | "Aided";
  mediumOfInstrName1: string;
  mediumOfInstrName2?: string;

  // Infrastructure Numbers
  clsrmsGd: number; // Good condition classrooms
  clsrmsMaj: number; // Needs major repair
  digiBoardTot: number;
  projectorTot: number;
  desktopFun: number;
  laptopTot: number;
  internetYnDesc: "Yes" | "No";
  electricityYnDesc: "Yes" | "No";
  libraryYnDesc: "Yes" | "No";
  playgroundYnDesc: "Yes" | "No";
  auditoriumYn: boolean;

  // Safety & Hygiene
  bndrywallType: "Pucca" | "Barbed wire" | "No Boundary" | "Partial";
  fireSafetyYn: 1 | 0;
  medchkYnDesc: "Yes" | "No";
  rampsYn: 1 | 0;
  handrailsYn: 1 | 0;
  toiletbFun: number;
  toiletbCwsnFun: number;
  toiletgFun: number;

  // Staff & Students (Extended for Derivative Metrics)
  totalTeacher: number;
  totTchPgraduateAbove: number;
  tchReg: number;
  tchCont: number;
  rowTotal: number;
  rowGirlTotal: number;
  rowBoyTotal?: number; // Added
  profQual3?: number; // B.Ed Qualified count
  tchRecvdServiceTrng?: number; // Teachers trained
  stusHvFurnt?: number; // Students with furniture
  instructionalDays?: number;

  // Fees & Leadership (New Structures)
  feeStructure?: FeeStructure;

  // Legacy flat fee fields (kept for backward compatibility with cards)
  admissionFeeInRupees: number;
  tuitionFeeInRupees: number;
  yearlyDevelopmentChargesInRupees: number;
  annualMonthlyOtherCharges: number;

  leadership: Leadership;
  principalName: string; // Legacy field
}

export interface FilterState {
  location: string;
  maxFee: number;
  board: string[];
  grade: string;
  smartClass: boolean;
  qualifiedStaff: boolean;
  securePerimeter: boolean;
  disabilityFriendly: boolean;
  rteCompliant: boolean; // New
  genderBalanced: boolean; // New
}