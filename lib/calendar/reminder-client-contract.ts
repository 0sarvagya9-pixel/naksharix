import {REMINDER_CONSENT_VERSION,reminderDueAt,type ReferenceEvent} from "@/lib/calendar/reminder-contract";
const record=(value:unknown):value is Record<string,unknown>=>!!value&&typeof value==="object"&&!Array.isArray(value);
const text=(value:unknown,max=160):value is string=>typeof value==="string"&&!!value.trim()&&value.length<=max;
const civil=(value:unknown):value is string=>typeof value==="string"&&/^2027-\d{2}-\d{2}$/.test(value)&&Number.isFinite(Date.parse(value+"T00:00:00Z"))&&new Date(value+"T00:00:00Z").toISOString().slice(0,10)===value;
const timestamp=(value:unknown):value is string=>typeof value==="string"&&Number.isFinite(Date.parse(value));
export const reminderStates=["SCHEDULED","CLAIMED","ACCEPTED","CANCELED","SKIPPED","UNKNOWN"] as const;
export type ReminderRow={id:string;orderId:string;eventId:string;eventDate:string;leadDays:1|7;dueAt:string;status:typeof reminderStates[number]};
export type ReminderAccount={available:boolean;orders:{id:string}[];events:ReferenceEvent[];reminders:ReminderRow[];consentVersion:typeof REMINDER_CONSENT_VERSION};
export function readReminder(value:unknown):ReminderRow|null{if(!record(value)||!text(value.id,100)||!text(value.orderId,100)||!text(value.eventId)||!civil(value.eventDate)||![1,7].includes(value.leadDays as number)||!timestamp(value.dueAt)||!reminderStates.includes(value.status as ReminderRow["status"]))return null;return {id:value.id,orderId:value.orderId,eventId:value.eventId,eventDate:value.eventDate,leadDays:value.leadDays as 1|7,dueAt:value.dueAt,status:value.status as ReminderRow["status"]};}
export function readReminderAccount(value:unknown):ReminderAccount|null{
 if(!record(value)||typeof value.available!=="boolean"||value.consentVersion!==REMINDER_CONSENT_VERSION||!Array.isArray(value.orders)||value.orders.length>20||!value.orders.every(row=>record(row)&&text(row.id,100))||!Array.isArray(value.events)||value.events.length>100||!Array.isArray(value.reminders)||value.reminders.length>100)return null;
 const events:ReferenceEvent[]=[];for(const row of value.events){if(!record(row)||!text(row.id)||!civil(row.date)||!text(row.name,240)||!text(row.sourceUrl,1000))return null;events.push({id:row.id,date:row.date,name:row.name,sourceUrl:row.sourceUrl});}
 const reminders=value.reminders.map(readReminder);if(reminders.some(row=>!row)||new Set(reminders.map(row=>row!.id)).size!==reminders.length||new Set(events.map(row=>row.id)).size!==events.length||new Set(value.orders.map(row=>row.id)).size!==value.orders.length)return null;
 return {available:value.available,orders:value.orders as {id:string}[],events,reminders:reminders as ReminderRow[],consentVersion:REMINDER_CONSENT_VERSION};
}
export function scheduledReminderMatches(value:unknown,orderId:string,event:ReferenceEvent,leadDays:1|7){const row=readReminder(value);return !!row&&row.orderId===orderId&&row.eventId===event.id&&row.eventDate===event.date&&row.leadDays===leadDays&&row.status==="SCHEDULED"&&Date.parse(row.dueAt)===reminderDueAt(event,leadDays).getTime();}
