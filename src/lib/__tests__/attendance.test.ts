import { describe,it,expect } from 'vitest';
import { attendanceCounts,attendanceStatus,attendanceDate,attendanceTime } from '../attendance';
describe('actual attendance rules',()=>{
 it('does not infer presence without a recorded check-in',()=>expect(attendanceStatus({check_in:null,status:'present'})).toBe('unrecorded'));
 it('counts only explicit absences and actual check-ins',()=>expect(attendanceCounts([{status:'absent',check_in:null},{status:'present',check_in:null},{status:'present',check_in:'2026-10-17T05:00:00Z'}])).toEqual({present:1,absent:1}));
 it('does not invent a missing checkout time',()=>expect(attendanceTime(null,'en-GB')).toBeNull());
 it('uses the nursery date in Riyadh across UTC midnight',()=>expect(attendanceDate(new Date('2026-10-17T22:00:00Z'))).toBe('2026-10-18'));
});
