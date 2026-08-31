export type UserRole = "superadmin" | "admin";

export interface User {
  id?: string;
  name: string;
  username: string;
  role: UserRole;
  facility?: string;
}

export type SuperadminTab = "dashboard" | "manage-admin" | "settings";
export type AdminTab = "dashboard" | "facilities" | "reservations" | "settings";

export interface Admin {
  id: string;
  name: string;
  username: string;
  password: string;
  facilities: string[];
  status: "Active" | "Inactive";
}

export type FacilityAdminAssignment =
  | "Computer Laboratory"
  | "Science & Physics Lab"
  | "Tertiary Classroom"
  | "Hotel Restaurant Management"
  | "Gymnasium";

export interface Room {
  id: string;
  name: string;
  status: "Available" | "Occupied";
  timeSlot?: string;
  department?: string;
  gradeOrCourse?: string;
  students?: number;
}

export interface ReservationRequest {
  id: string;
  email: string;
  phone?: string;
  dateFiled: string;
  dateNeeded: string;
  timeNeeded: string;
  facility: string;
  accountabilityName: string;
  department: string;
  gradeOrCourse: string;
  subject: string;
  totalStudents: number;
  status: "Pending" | "Accepted" | "Declined";
}

export interface Toast {
  id: string;
  type: "success" | "error" | "info";
  message: string;
}
