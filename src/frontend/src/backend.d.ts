import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface Patient {
    id: bigint;
    age: bigint;
    deleted: boolean;
    contact: string;
    admissionDate: string;
    name: string;
    treatment: string;
    lastUpdate: Time;
    gender: string;
    disease: string;
}
export type Time = bigint;
export interface Doctor {
    id: bigint;
    patientIds: Array<bigint>;
    deleted: boolean;
    name: string;
    lastUpdate: Time;
    availability: boolean;
    specialization: string;
    department: string;
    photoUrl: string;
}
export interface Appointment {
    id: bigint;
    status: string;
    doctorId: bigint;
    deleted: boolean;
    patientId: bigint;
    date: string;
    time: string;
    lastUpdate: Time;
    notes: string;
}
export interface DashboardTotals {
    totalPatients: bigint;
    todaysAppointments: bigint;
    totalDoctors: bigint;
    totalAppointments: bigint;
}
export interface UserProfile {
    name: string;
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    cancelAppointment(appointmentId: bigint): Promise<void>;
    createAppointment(appointment: Appointment): Promise<bigint>;
    createDoctor(doctor: Doctor): Promise<bigint>;
    createPatient(patient: Patient): Promise<bigint>;
    deleteDoctor(doctorId: bigint): Promise<void>;
    deletePatient(patientId: bigint): Promise<void>;
    getAdmissionsByDate(): Promise<Array<[string, bigint]>>;
    getAllAppointments(): Promise<Array<Appointment>>;
    getAllDoctors(): Promise<Array<Doctor>>;
    getAllPatients(): Promise<Array<Patient>>;
    getAppointmentsByDoctor(doctorId: bigint): Promise<Array<Appointment>>;
    getAppointmentsByPatient(patientId: bigint): Promise<Array<Appointment>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getDashboardTotals(today: string): Promise<DashboardTotals>;
    getDiseaseFrequency(): Promise<Array<[string, bigint]>>;
    getDoctorAppointmentCounts(): Promise<Array<[bigint, bigint]>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    readDoctor(doctorId: bigint): Promise<Doctor>;
    readPatient(patientId: bigint): Promise<Patient>;
    rescheduleAppointment(appointmentId: bigint, newDate: string, newTime: string): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    updateDoctor(doctor: Doctor): Promise<void>;
    updatePatient(patient: Patient): Promise<void>;
}
