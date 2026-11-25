import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { availableBookingActions, consultationIntervalsOverlap } from '../lib/consultations/booking-policy.ts';
import { consultationDayBounds, parseConsultationLocalDateTime } from '../lib/consultations/slot-time.ts';
import {validConsultationSlotWindow,isBookableConsultationSlot,verifiedConsultationPractitioner,validOptionalConsultationBirth} from '../lib/consultations/slot-contract.ts';
let count = 0;
const check = (name, fn) => { fn(); count++; console.log('BOOKING_RELIABILITY_PASS '+name); };
check('IST midnight is independent of process timezone', () => {
  const a = consultationDayBounds(new Date('2026-11-04T18:29:59.999Z'));
  const b = consultationDayBounds(new Date('2026-11-04T18:30:00.000Z'));
  assert.equal(a.start.toISOString(), '2026-11-03T18:30:00.000Z');
  assert.equal(b.start.toISOString(), '2026-11-04T18:30:00.000Z');
  assert.equal(a.end.toISOString(), b.start.toISOString());
});
check('leap and year boundaries', () => {
  assert.equal(consultationDayBounds(new Date('2028-02-29T19:00Z')).end.toISOString(),'2028-03-01T18:30:00.000Z');
  assert.equal(consultationDayBounds(new Date('2026-12-31T19:00Z')).start.toISOString(),'2026-12-31T18:30:00.000Z');
  assert.throws(() => consultationDayBounds(new Date('invalid')));
});
check('datetime-local is explicitly IST and validates real dates', () => {
  assert.equal(parseConsultationLocalDateTime('2027-01-05T00:15').toISOString(),'2027-01-04T18:45:00.000Z');
  for (const value of ['2026-02-31T10:00','2026-11-04T25:00','junk','2026-11-04T10:00Z']) assert.equal(parseConsultationLocalDateTime(value),null);
});
check('closed bookings cannot be reopened in controls', () => {
  for (const status of ['COMPLETED','REJECTED','CANCELED','unrecognized']) assert.deepEqual(availableBookingActions(status,'PAID'),[]);
});
check('unpaid cannot accept or complete and accepted cannot be reaccepted', () => {
  assert.deepEqual(availableBookingActions('REQUESTED','PENDING'),['REJECT']);
  assert.ok(!availableBookingActions('CONFIRMED','PAID').includes('ACCEPT'));
  assert.ok(!availableBookingActions('REQUESTED','PAID').includes('COMPLETE'));
});
check('overlap covers different starts and permits adjacent half-open intervals', () => {
  const start = new Date('2027-01-05T04:30Z');
  assert.ok(consultationIntervalsOverlap(start,30,new Date('2027-01-05T04:45Z'),30));
  assert.ok(!consultationIntervalsOverlap(start,30,new Date('2027-01-05T05:00Z'),30));
  assert.throws(() => consultationIntervalsOverlap(start,0,start,30));
});
check('creation and reschedule use identical locking and interval checks', () => {
  for (const file of ['app/api/astrologer/bookings/action/route.ts','app/api/consultation-bookings/route.ts']) {
    const text=readFileSync(file,'utf8');
    assert.ok(text.includes('hasConsultationConflict(')); assert.ok(text.includes('lockConsultationCalendar('));
    assert.ok(text.includes('TransactionIsolationLevel.Serializable'));
  }
});
check('async controls recover without blind retry and reload confirmed state', () => {
  const text=readFileSync('components/astrologer-booking-actions.tsx','utf8');
  for (const marker of ['finally {','clearTimeout(timeout)','setBusy(false)','window.location.reload()','inFlight.current','controller.abort()','New consultation date and time in IST']) assert.ok(text.includes(marker));
  assert.ok(text.includes('booking.id !== bookingId'));
  assert.ok(text.includes('expectedStatuses.includes(booking.status)'));
  assert.ok(text.includes('mounted.current && !committed'));
  assert.ok(readFileSync('lib/security/csrf.ts','utf8').includes('getCsrfToken(init.signal)'));
});
check('slot windows are real civil times and fit a complete session',()=>{
 const slot={dayOfWeek:2,startTime:"10:00",endTime:"10:30",isActive:true,isHoliday:false,consultationType:"CHAT"};
 assert.equal(isBookableConsultationSlot(slot),true);
 for(const patch of [{dayOfWeek:2.5},{startTime:"24:00"},{startTime:"10:60"},{endTime:"10:29"},{endTime:"10:00"},{endTime:"09:59"},{consultationType:"UNKNOWN"}])assert.equal(validConsultationSlotWindow({...slot,...patch}),false);
 assert.equal(isBookableConsultationSlot({...slot,isActive:false}),false);
 assert.equal(isBookableConsultationSlot({...slot,isHoliday:true}),false);
 assert.equal(validOptionalConsultationBirth("1990-02-30","10:00"),false);
 assert.equal(validOptionalConsultationBirth("1990-02-28","24:00"),false);
 assert.equal(validOptionalConsultationBirth("1990-02-28","10:00"),true);
 assert.equal(validOptionalConsultationBirth("",""),true);
 const profile={status:"APPROVED",user:{role:"ASTROLOGER",emailVerified:new Date(),emailVerifiedAt:null}};
 assert.equal(verifiedConsultationPractitioner(profile),true);
 assert.equal(verifiedConsultationPractitioner({...profile,status:"PENDING_REVIEW"}),false);
 assert.equal(verifiedConsultationPractitioner({...profile,user:{...profile.user,emailVerified:null}}),false);
 assert.equal(verifiedConsultationPractitioner({...profile,user:{...profile.user,role:"USER"}}),false);
});
check('availability mutation and booking admission share calendar locks',()=>{
 const availability=readFileSync('app/api/astrologer/availability/route.ts','utf8');
 assert.equal((availability.match(/await lockConsultationCalendar/g)||[]).length,3);
 const booking=readFileSync('app/api/consultation-bookings/route.ts','utf8');
 assert.ok(booking.includes('isBookableConsultationSlot(freshSlot)')&&booking.includes('verifiedConsultationPractitioner(fresh)')&&booking.includes('FOR UPDATE'));
});
console.log('BOOKING_RELIABILITY='+count+'/'+count+'_PASS');
