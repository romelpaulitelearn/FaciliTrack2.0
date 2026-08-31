export interface FacilityRoom {
  id: string;
  name: string;
  status: "Available" | "Occupied";
  timeSlot?: string;
  department?: string;
  gradeOrCourse?: string;
  students?: number;
}

export interface Facility {
  id: string;
  name: string;
  rooms: FacilityRoom[];
}

export const FACILITIES_DATA: Facility[] = [
  {
    id: "computer-laboratory",
    name: "Computer Laboratory",
    rooms: [
      { id: "sp203", name: "SP 203", status: "Occupied", timeSlot: "8:00 AM – 11:00 AM", department: "Tertiary", gradeOrCourse: "BSCS 4", students: 15 },
      { id: "sp204", name: "SP 204", status: "Available" },
      { id: "sp205", name: "SP 205", status: "Occupied", timeSlot: "1:30 PM – 4:30 PM", department: "Tertiary", gradeOrCourse: "BSIT 3", students: 22 },
    ],
  },
  {
    id: "science-physics-lab",
    name: "Science & Physics Lab",
    rooms: [
      { id: "olc206", name: "OLC 206", status: "Available" },
      { id: "flc212", name: "FLC 212", status: "Occupied", timeSlot: "10:00 AM – 12:00 PM", department: "Secondary", gradeOrCourse: "Grade 10", students: 30 },
      { id: "flc213", name: "FLC 213", status: "Available" },
    ],
  },
  {
    id: "tertiary-classroom",
    name: "Tertiary Classroom",
    rooms: [
      { id: "mm101", name: "MM 101", status: "Occupied", timeSlot: "7:30 AM – 9:00 AM", department: "Tertiary", gradeOrCourse: "BSBA 1", students: 35 },
      { id: "mm102", name: "MM 102", status: "Available" },
      { id: "mm103", name: "MM 103", status: "Available" },
      { id: "mm104", name: "MM 104", status: "Occupied", timeSlot: "9:00 AM – 10:30 AM", department: "Tertiary", gradeOrCourse: "BSED 2", students: 28 },
      { id: "mm105", name: "MM 105", status: "Available" },
      { id: "mm106", name: "MM 106", status: "Available" },
      { id: "mm107", name: "MM 107", status: "Available" },
      { id: "mm108", name: "MM 108", status: "Occupied", timeSlot: "1:00 PM – 2:30 PM", department: "Tertiary", gradeOrCourse: "BSN 3", students: 40 },
      { id: "mm109", name: "MM 109", status: "Available" },
      { id: "mm110", name: "MM 110", status: "Available" },
      { id: "mm111", name: "MM 111", status: "Available" },
      { id: "mm201", name: "MM 201", status: "Available" },
      { id: "mm202", name: "MM 202", status: "Occupied", timeSlot: "2:30 PM – 4:00 PM", department: "Tertiary", gradeOrCourse: "BSCS 2", students: 32 },
      { id: "mm203", name: "MM 203", status: "Available" },
      { id: "mm301", name: "MM 301", status: "Available" },
      { id: "mm302", name: "MM 302", status: "Available" },
      { id: "mm303", name: "MM 303", status: "Occupied", timeSlot: "10:30 AM – 12:00 PM", department: "Tertiary", gradeOrCourse: "BSIT 1", students: 25 },
      { id: "mm304", name: "MM 304", status: "Available" },
      { id: "mm305", name: "MM 305", status: "Available" },
      { id: "mm306", name: "MM 306", status: "Available" },
      { id: "mm307", name: "MM 307", status: "Available" },
    ],
  },
  {
    id: "hrm",
    name: "Hotel Restaurant Management",
    rooms: [
      { id: "hrm-f1", name: "First Floor - Restaurant", status: "Occupied", timeSlot: "11:00 AM – 2:00 PM", department: "Tertiary", gradeOrCourse: "BSHM 3", students: 20 },
      { id: "hrm-f2", name: "Second Floor - Event Venue", status: "Available" },
      { id: "hrm-f3", name: "Third Floor - Hotel", status: "Available" },
    ],
  },
  {
    id: "gymnasium",
    name: "Gymnasium",
    rooms: [
      { id: "gym-main", name: "Main Gymnasium", status: "Available" },
    ],
  },
];

export const ADMIN_FACILITY_MAP: Record<string, string> = {
  admin1: "Computer Laboratory",
  admin2: "Science & Physics Lab",
  admin3: "Tertiary Classroom",
  admin4: "Hotel Restaurant Management",
  admin5: "Gymnasium",
};

export function normalizeFacilityName(value?: string) {
  return (value ?? "")
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function getFacilityByName(facilityName?: string): Facility | undefined {
  const normalizedInput = normalizeFacilityName(facilityName);
  if (!normalizedInput) return undefined;

  return FACILITIES_DATA.find((facility) => {
    const normalizedFacility = normalizeFacilityName(facility.name);
    return normalizedFacility === normalizedInput
      || normalizedFacility.includes(normalizedInput)
      || normalizedInput.includes(normalizedFacility);
  });
}

export function getRoomsForFacility(facilityName?: string) {
  return getFacilityByName(facilityName)?.rooms ?? [];
}
