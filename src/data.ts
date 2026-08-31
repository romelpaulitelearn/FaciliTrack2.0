import type { Admin, Room, ReservationRequest } from "./types";
import { FACILITIES_DATA } from "./facilityData";

export const MOCK_ADMINS: Admin[] = [
  { id: "1", name: "Admin One", username: "admin1", password: "ChangeMe123!", facilities: ["Computer Laboratory"], status: "Active" },
  { id: "2", name: "Admin Two", username: "admin2", password: "ChangeMe123!", facilities: ["Science & Physics Lab"], status: "Active" },
  { id: "3", name: "Admin Three", username: "admin3", password: "ChangeMe123!", facilities: ["Tertiary Classroom"], status: "Active" },
  { id: "4", name: "Admin Four", username: "admin4", password: "ChangeMe123!", facilities: ["Hotel Restaurant Management"], status: "Active" },
  { id: "5", name: "Admin Five", username: "admin5", password: "ChangeMe123!", facilities: ["Gymnasium"], status: "Active" },
];

export const MOCK_ROOMS: Room[] = FACILITIES_DATA.flatMap((facility) =>
  facility.rooms.map((room) => ({
    id: room.id,
    name: room.name,
    status: room.status,
    timeSlot: room.timeSlot,
    department: room.department,
    gradeOrCourse: room.gradeOrCourse,
    students: room.students,
  }))
);

export const MOCK_RESERVATIONS: ReservationRequest[] = [
  {
    id: "1", email: "josejimenez@spusm.edu.ph", phone: "09171234567", dateFiled: "August 22, 2026",
    dateNeeded: "August 26, 2026", timeNeeded: "8:00 AM - 11:00 AM",
    facility: "Computer Laboratory", accountabilityName: "Jose Jimenez",
    department: "Tertiary", gradeOrCourse: "BSCS 4", subject: "Software Engineering 2",
    totalStudents: 15, status: "Pending"
  },
  {
    id: "2", email: "lcruz@spusm.edu.ph", phone: "09289876543", dateFiled: "August 22, 2026",
    dateNeeded: "August 27, 2026", timeNeeded: "1:00 PM - 4:00 PM",
    facility: "Computer Laboratory", accountabilityName: "Lara Cruz",
    department: "Tertiary", gradeOrCourse: "BSIT 2", subject: "Web Development",
    totalStudents: 20, status: "Pending"
  },
  {
    id: "3", email: "rmendoza@spusm.edu.ph", phone: "09351122334", dateFiled: "August 21, 2026",
    dateNeeded: "August 28, 2026", timeNeeded: "9:00 AM - 12:00 PM",
    facility: "Science & Physics Lab", accountabilityName: "Ramon Mendoza",
    department: "Secondary", gradeOrCourse: "Grade 11", subject: "ICT",
    totalStudents: 35, status: "Pending"
  },
  {
    id: "4", email: "sdejesus@spusm.edu.ph", phone: "09350011223", dateFiled: "August 23, 2026",
    dateNeeded: "August 29, 2026", timeNeeded: "1:00 PM - 3:00 PM",
    facility: "Tertiary Classroom", accountabilityName: "Sarah De Jesus",
    department: "Tertiary", gradeOrCourse: "BSBA 2", subject: "Business Communication",
    totalStudents: 24, status: "Pending"
  },
  {
    id: "5", email: "apadilla@spusm.edu.ph", phone: "09167778888", dateFiled: "August 23, 2026",
    dateNeeded: "August 30, 2026", timeNeeded: "9:00 AM - 12:00 PM",
    facility: "Hotel Restaurant Management", accountabilityName: "Ari Padilla",
    department: "Tertiary", gradeOrCourse: "BSHM 4", subject: "Hotel Operations",
    totalStudents: 18, status: "Pending"
  },
  {
    id: "6", email: "rlopez@spusm.edu.ph", phone: "09183334444", dateFiled: "August 24, 2026",
    dateNeeded: "August 31, 2026", timeNeeded: "2:00 PM - 5:00 PM",
    facility: "Gymnasium", accountabilityName: "Rina Lopez",
    department: "Tertiary", gradeOrCourse: "PE 2", subject: "Athletics",
    totalStudents: 12, status: "Pending"
  },
];

export const WEEKLY_ADMINS = [
  { day: "Mon", count: 3 },
  { day: "Tue", count: 4 },
  { day: "Wed", count: 4 },
  { day: "Thu", count: 3 },
  { day: "Fri", count: 4 },
  { day: "Sat", count: 1 },
  { day: "Sun", count: 0 },
];

export const USAGE_HISTORY = [
  { date: "Aug 21, 2026", time: "1:30 PM - 4:30 PM", room: "SP 205", department: "Tertiary", course: "BSCS 2", students: 15 },
  { date: "Aug 21, 2026", time: "8:00 AM - 11:00 AM", room: "SP 203", department: "Tertiary", course: "BSIT 3", students: 22 },
  { date: "Aug 20, 2026", time: "2:00 PM - 5:00 PM", room: "SP 207", department: "Secondary", course: "Grade 10", students: 30 },
  { date: "Aug 20, 2026", time: "9:00 AM - 12:00 PM", room: "SP 202", department: "Tertiary", course: "BSCS 3", students: 18 },
  { date: "Aug 19, 2026", time: "1:00 PM - 4:00 PM", room: "SP 204", department: "Primary", course: "Grade 6", students: 12 },
  { date: "Aug 19, 2026", time: "8:00 AM - 11:00 AM", room: "SP 206", department: "Tertiary", course: "BSIT 1", students: 25 },
];

export const AUDIT_LOG = [
  { date: "Aug 22, 2026", action: "Created", admin: "Jefferson Gabriel", details: "Computer Lab Admin" },
  { date: "Aug 21, 2026", action: "Updated", admin: "Maria Santos", details: "Facilities assigned: Auditorium" },
  { date: "Aug 20, 2026", action: "Deactivated", admin: "Carlos Rivera", details: "Library Admin" },
  { date: "Aug 19, 2026", action: "Created", admin: "Ana Reyes", details: "Gym Admin" },
  { date: "Aug 18, 2026", action: "Password Reset", admin: "Jefferson Gabriel", details: "By Superadmin" },
];
