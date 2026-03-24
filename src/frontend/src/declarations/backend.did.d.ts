import type { Principal } from '@icp-sdk/core/types';
import type { ActorMethod } from '@icp-sdk/core/actor';
import type { IDL } from '@icp-sdk/core/candid';

export type UserRole = { 'admin' : null } |
  { 'user' : null } |
  { 'guest' : null };
export type Time = bigint;
export interface Appointment {
  'id' : bigint,
  'status' : string,
  'doctorId' : bigint,
  'deleted' : boolean,
  'patientId' : bigint,
  'date' : string,
  'time' : string,
  'lastUpdate' : Time,
  'notes' : string,
}
export interface Doctor {
  'id' : bigint,
  'patientIds' : Array<bigint>,
  'deleted' : boolean,
  'name' : string,
  'lastUpdate' : Time,
  'availability' : boolean,
  'specialization' : string,
  'department' : string,
  'photoUrl' : string,
}
export interface Patient {
  'id' : bigint,
  'age' : bigint,
  'deleted' : boolean,
  'contact' : string,
  'admissionDate' : string,
  'name' : string,
  'treatment' : string,
  'lastUpdate' : Time,
  'gender' : string,
  'disease' : string,
}
export interface UserProfile { 'name' : string }
export interface DashboardTotals {
  'totalPatients' : bigint,
  'todaysAppointments' : bigint,
  'totalDoctors' : bigint,
  'totalAppointments' : bigint,
}
export interface _SERVICE {
  '_initializeAccessControlWithSecret' : ActorMethod<[string], undefined>,
  'assignCallerUserRole' : ActorMethod<[Principal, UserRole], undefined>,
  'cancelAppointment' : ActorMethod<[bigint], undefined>,
  'createAppointment' : ActorMethod<[Appointment], bigint>,
  'createDoctor' : ActorMethod<[Doctor], bigint>,
  'createPatient' : ActorMethod<[Patient], bigint>,
  'deleteDoctor' : ActorMethod<[bigint], undefined>,
  'deletePatient' : ActorMethod<[bigint], undefined>,
  'getAdmissionsByDate' : ActorMethod<[], Array<[string, bigint]>>,
  'getAllAppointments' : ActorMethod<[], Array<Appointment>>,
  'getAllDoctors' : ActorMethod<[], Array<Doctor>>,
  'getAllPatients' : ActorMethod<[], Array<Patient>>,
  'getAppointmentsByDoctor' : ActorMethod<[bigint], Array<Appointment>>,
  'getAppointmentsByPatient' : ActorMethod<[bigint], Array<Appointment>>,
  'getCallerUserProfile' : ActorMethod<[], [] | [UserProfile]>,
  'getCallerUserRole' : ActorMethod<[], UserRole>,
  'getDashboardTotals' : ActorMethod<[string], DashboardTotals>,
  'getDiseaseFrequency' : ActorMethod<[], Array<[string, bigint]>>,
  'getDoctorAppointmentCounts' : ActorMethod<[], Array<[bigint, bigint]>>,
  'getUserProfile' : ActorMethod<[Principal], [] | [UserProfile]>,
  'isCallerAdmin' : ActorMethod<[], boolean>,
  'readDoctor' : ActorMethod<[bigint], Doctor>,
  'readPatient' : ActorMethod<[bigint], Patient>,
  'rescheduleAppointment' : ActorMethod<[bigint, string, string], undefined>,
  'saveCallerUserProfile' : ActorMethod<[UserProfile], undefined>,
  'updateDoctor' : ActorMethod<[Doctor], undefined>,
  'updatePatient' : ActorMethod<[Patient], undefined>,
}
export declare const idlFactory: IDL.InterfaceFactory;
export declare const init: (args: { IDL: typeof IDL }) => IDL.Type[];
