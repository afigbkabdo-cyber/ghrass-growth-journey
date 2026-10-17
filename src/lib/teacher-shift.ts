import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useServerFn } from '@tanstack/react-start';
import { teacherAttendance, recordTeacherAttendance } from './attendance.functions';
import { attendanceDate, attendanceTime } from './attendance';
export type ShiftStatus = 'absent' | 'checked_in' | 'completed';
export const shiftStatusLabels = { absent:'لم يُسجل', checked_in:'حاضرة', completed:'مكتمل' };
export const shiftStatusTone = { absent:'pink', checked_in:'yellow', completed:'green' } as const;
export function useTeacherShift() {
 const fetch = useServerFn(teacherAttendance); const record = useServerFn(recordTeacherAttendance); const qc = useQueryClient();
 const query = useQuery({ queryKey:['teacher-attendance'], queryFn:()=>fetch({}), refetchInterval:30000 });
 const row = query.data?.find(r=>r.log_date===attendanceDate());
 const shift = { checkIn: attendanceTime(row?.check_in ?? null,'en-GB'), checkOut:attendanceTime(row?.check_out ?? null,'en-GB') };
 const status: ShiftStatus = row?.check_out ? 'completed' : row?.check_in ? 'checked_in' : 'absent';
 const save = async (action:'in'|'out') => { const saved=await record({ data:{action} }); await qc.invalidateQueries({queryKey:['teacher-attendance']}); return attendanceTime(action==='in' ? saved.check_in : saved.check_out,'en-GB'); };
 return { shift,status,hydrated:query.isSuccess,checkIn:()=>save('in'),checkOut:()=>save('out') };
}
