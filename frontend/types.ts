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
  principalName?: string; // Legacy

  // New Mapped Fields
  board?: string; // "1-CBSE" etc
  studentBoys?: number;
  studentGirls?: number;

  infraDetails?: {
    classrooms_good: number;
    classrooms_major_repair: number;
    smart_boards: number;
    projectors: number;
    computers: number;
    toilets_boys: number;
    toilets_girls: number;
    drinking_water: boolean;
    electricity: boolean;
    library: boolean;
    playground: boolean;
  };

  teacherDetails?: {
    total: number;
    regular: number;
    contract: number;
    graduate_above: number;
    post_graduate_above: number;
    trained: number;
  };

  images?: {
    main: string | null;
    gallery: string[];
  };

  // Derivative Data (from school_search_index)
  badge_academic_elite?: boolean;
  badge_value_for_money?: boolean;
  location_string?: string;
  optimized_tuition_fee?: number;

  // Derived Metrics (Optional because they come from school_stats, not raw)
  student_teacher_ratio?: number;
  gender_parity_index?: number;
  bed_qualification_pct?: number;
  regular_teacher_pct?: number;
  students_per_classroom?: number;
  girls_toilets_per_1000?: number;
  boys_toilets_per_1000?: number;
  teacher_training_pct?: number;
  instructional_days_pct?: number;
  furniture_availability_pct?: number;
}

export interface FilterState {
  location: string; // Keep for search text legacy
  state: string; // New State Dropdown
  district: string; // New Dropdown
  blocks: string[]; // New Multi-select
  maxFee: number;
  board: string[];
  grade: string;
  smartClass: boolean;
  qualifiedStaff: boolean;
  securePerimeter: boolean;
  disabilityFriendly: boolean;
  rteCompliant: boolean;
  genderBalanced: boolean;
}