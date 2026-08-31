# FaciliTrack — Quick QA & Refinement Prompt

**Check if completed. If not, fix, modify, and add.**

## CRITICAL REVISIONS (DO FIRST)

1. **Remove Password Column from Superadmin Manage Admin Table**
   - Superadmin should NOT see admin passwords
   - Delete password column entirely
   - Keep: Name | Username | Facility Assign | Status | Actions

2. **Space Edit & Delete Buttons**
   - Add 16–24px gap between Edit (pencil) and Delete (trash) icons
   - Apply to all action button pairs (prevent accidental clicks)

---

## VERIFICATION (Spot Check)

**Non-Functional:**
- [ ] Loading spinner on page load/data fetch
- [ ] Toast notifications (top-right, auto-dismiss 4s)
- [ ] Login lockout: 3 wrong passwords → 5 min timer + "Forgot Password?" prompt
- [ ] Responsive: Mobile (375px), Tablet (768px), Desktop (1440px) — no UI breaks

**Login Screen:**
- [ ] Username, Password, Forgot Password link, Sign In button
- [ ] Error messages & lockout timer visible

**Superadmin:**
- [ ] Dashboard: Admin counts, 7-day chart, recent activity list (Date | Action badge | Name)
- [ ] Manage Admin: Search, Create button, Admin list table (WITHOUT password column), Edit/Delete with spacing
- [ ] Settings: About, Change Password, Text Size scale (slider, not radio buttons), Help/FAQ

**Admin:**
- [ ] Dashboard: Welcome + role badge, 4 stats cards, usage history table
- [ ] Facilities: Hierarchical list (facility name + count badge → indented rooms with status)
  - Comlab (SP 203, 204, 205)
  - Science & Physics Lab (OLC 206, FLC 212, FLC 213)
  - Tertiary Classroom (MM 101–111, 201–203, 301–307)
  - HRM (First Floor - Restaurant, Second Floor - Event Venue, Third Floor - Hotel)
  - Gymnasium
- [ ] Request Reservation: Accordion cards (Email, Accountability Name, Dept, Grade/Course, Phone No., Date Filed, Date Needed, Time Needed, Facility, Subject, Students), Accept/Decline/Back buttons with spacing
- [ ] Settings: About, Change Password, Text Size scale, Help/FAQ

**Colors:** Eco-green (#1B4D3E, #2D7A4F, #7BC043)  
**Icons:** Lucide (thin)

---

**If any item unchecked → implement it. Keep all completed work, only add/fix gaps.**
