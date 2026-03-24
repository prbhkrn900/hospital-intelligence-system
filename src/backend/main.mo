import Text "mo:core/Text";
import Nat "mo:core/Nat";
import Map "mo:core/Map";
import Array "mo:core/Array";
import Iter "mo:core/Iter";
import Time "mo:core/Time";
import Runtime "mo:core/Runtime";
import Order "mo:core/Order";
import Principal "mo:core/Principal";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";
import MixinBlobStorage "blob-storage/Mixin";

actor {
  // Legacy Doctor type (v1) — kept for stable migration compatibility.
  // The on-chain stable variable `doctors` uses this shape; Motoko loads it
  // successfully, and postupgrade migrates entries to `doctorsV2`.
  type OldDoctor = {
    id : Nat;
    name : Text;
    specialization : Text;
    availability : Bool;
    department : Text;
    patientIds : [Nat];
    lastUpdate : Time.Time;
    deleted : Bool;
  };

  // Current Doctor type (v2) — adds photoUrl.
  type Doctor = {
    id : Nat;
    name : Text;
    specialization : Text;
    availability : Bool;
    department : Text;
    patientIds : [Nat];
    photoUrl : Text;
    lastUpdate : Time.Time;
    deleted : Bool;
  };

  module Doctor {
    public func compare(d1 : Doctor, d2 : Doctor) : Order.Order {
      Nat.compare(d1.id, d2.id);
    };
  };

  type Patient = {
    id : Nat;
    name : Text;
    age : Nat;
    gender : Text;
    contact : Text;
    disease : Text;
    treatment : Text;
    admissionDate : Text;
    lastUpdate : Time.Time;
    deleted : Bool;
  };

  module Patient {
    public func compare(p1 : Patient, p2 : Patient) : Order.Order {
      Nat.compare(p1.id, p2.id);
    };
  };

  type Appointment = {
    id : Nat;
    patientId : Nat;
    doctorId : Nat;
    date : Text;
    time : Text;
    status : Text;
    notes : Text;
    lastUpdate : Time.Time;
    deleted : Bool;
  };

  module Appointment {
    public func compare(a1 : Appointment, a2 : Appointment) : Order.Order {
      Nat.compare(a1.id, a2.id);
    };
  };

  type DashboardTotals = {
    totalPatients : Nat;
    totalDoctors : Nat;
    totalAppointments : Nat;
    todaysAppointments : Nat;
  };

  public type UserProfile = {
    name : Text;
  };

  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);
  include MixinBlobStorage();

  // ── Stable state ──────────────────────────────────────────────────────────
  // `doctors` keeps the OLD type so the upgrade is backward-compatible.
  // Business logic reads/writes `doctorsV2` which holds the new Doctor type.
  let doctors    = Map.empty<Nat, OldDoctor>(); // legacy — populated only during first post-upgrade migration
  let doctorsV2  = Map.empty<Nat, Doctor>();     // current — used by all business logic
  let patients   = Map.empty<Nat, Patient>();
  let appointments = Map.empty<Nat, Appointment>();
  let userProfiles = Map.empty<Principal, UserProfile>();
  var nextPatientId    = 1;
  var nextDoctorId     = 1;
  var nextAppointmentId = 1;

  // Migrate legacy doctors -> doctorsV2 on upgrade.
  system func postupgrade() {
    for ((k, v) in doctors.entries()) {
      if (doctorsV2.get(k) == null) {
        doctorsV2.add(k, {
          id           = v.id;
          name         = v.name;
          specialization = v.specialization;
          availability = v.availability;
          department   = v.department;
          patientIds   = v.patientIds;
          photoUrl     = "";
          lastUpdate   = v.lastUpdate;
          deleted      = v.deleted;
        });
      };
    };
  };

  ///////////////////////////////
  // User Profile Management
  ///////////////////////////////

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (caller.isAnonymous()) Runtime.trap("Unauthorized: Must be logged in");
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller.isAnonymous()) Runtime.trap("Unauthorized: Must be logged in");
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (caller.isAnonymous()) Runtime.trap("Unauthorized: Must be logged in");
    userProfiles.add(caller, profile);
  };

  ///////////////////////////////
  // Patient Management
  ///////////////////////////////

  public shared ({ caller }) func createPatient(patient : Patient) : async Nat {
    if (caller.isAnonymous()) Runtime.trap("Unauthorized: Must be logged in");
    let newId = nextPatientId;
    nextPatientId += 1;
    patients.add(newId, { patient with id = newId; lastUpdate = Time.now(); deleted = false });
    newId;
  };

  public shared ({ caller }) func readPatient(patientId : Nat) : async Patient {
    if (caller.isAnonymous()) Runtime.trap("Unauthorized: Must be logged in");
    switch (patients.get(patientId)) {
      case (null) { Runtime.trap("Patient does not exist") };
      case (?p)   { if (p.deleted) Runtime.trap("Patient does not exist"); p };
    };
  };

  public shared ({ caller }) func updatePatient(patient : Patient) : async () {
    if (caller.isAnonymous()) Runtime.trap("Unauthorized: Must be logged in");
    switch (patients.get(patient.id)) {
      case (null) { Runtime.trap("Patient does not exist") };
      case (?existing) {
        if (existing.deleted) Runtime.trap("Patient does not exist");
        patients.add(patient.id, { patient with lastUpdate = Time.now() });
      };
    };
  };

  public shared ({ caller }) func deletePatient(patientId : Nat) : async () {
    if (caller.isAnonymous()) Runtime.trap("Unauthorized: Must be logged in");
    switch (patients.get(patientId)) {
      case (null) { Runtime.trap("Patient does not exist") };
      case (?p) {
        if (p.deleted) Runtime.trap("Patient does not exist");
        patients.add(patientId, { p with deleted = true });
      };
    };
  };

  ///////////////////////////////
  // Doctor Management  (uses doctorsV2)
  ///////////////////////////////

  public shared ({ caller }) func createDoctor(doctor : Doctor) : async Nat {
    if (caller.isAnonymous()) Runtime.trap("Unauthorized: Must be logged in");
    let newId = nextDoctorId;
    nextDoctorId += 1;
    doctorsV2.add(newId, { doctor with id = newId; patientIds = []; lastUpdate = Time.now(); deleted = false });
    newId;
  };

  public shared ({ caller }) func readDoctor(doctorId : Nat) : async Doctor {
    if (caller.isAnonymous()) Runtime.trap("Unauthorized: Must be logged in");
    switch (doctorsV2.get(doctorId)) {
      case (null) { Runtime.trap("Doctor does not exist") };
      case (?d)   { if (d.deleted) Runtime.trap("Doctor does not exist"); d };
    };
  };

  public shared ({ caller }) func updateDoctor(doctor : Doctor) : async () {
    if (caller.isAnonymous()) Runtime.trap("Unauthorized: Must be logged in");
    switch (doctorsV2.get(doctor.id)) {
      case (null) { Runtime.trap("Doctor does not exist") };
      case (?existing) {
        if (existing.deleted) Runtime.trap("Doctor does not exist");
        doctorsV2.add(doctor.id, { doctor with lastUpdate = Time.now() });
      };
    };
  };

  public shared ({ caller }) func deleteDoctor(doctorId : Nat) : async () {
    if (caller.isAnonymous()) Runtime.trap("Unauthorized: Must be logged in");
    switch (doctorsV2.get(doctorId)) {
      case (null) { Runtime.trap("Doctor does not exist") };
      case (?d) {
        if (d.deleted) Runtime.trap("Doctor does not exist");
        doctorsV2.add(doctorId, { d with deleted = true });
      };
    };
  };

  ///////////////////////////////
  // Appointment Management
  ///////////////////////////////

  public shared ({ caller }) func createAppointment(appointment : Appointment) : async Nat {
    if (caller.isAnonymous()) Runtime.trap("Unauthorized: Must be logged in");
    let newId = nextAppointmentId;
    nextAppointmentId += 1;
    appointments.add(newId, { appointment with id = newId; lastUpdate = Time.now(); deleted = false });
    newId;
  };

  public shared ({ caller }) func cancelAppointment(appointmentId : Nat) : async () {
    if (caller.isAnonymous()) Runtime.trap("Unauthorized: Must be logged in");
    switch (appointments.get(appointmentId)) {
      case (null) { Runtime.trap("Appointment does not exist") };
      case (?a) {
        if (a.deleted) Runtime.trap("Appointment does not exist");
        appointments.add(appointmentId, { a with status = "cancelled"; lastUpdate = Time.now() });
      };
    };
  };

  public shared ({ caller }) func rescheduleAppointment(appointmentId : Nat, newDate : Text, newTime : Text) : async () {
    if (caller.isAnonymous()) Runtime.trap("Unauthorized: Must be logged in");
    switch (appointments.get(appointmentId)) {
      case (null) { Runtime.trap("Appointment does not exist") };
      case (?a) {
        if (a.deleted) Runtime.trap("Appointment does not exist");
        appointments.add(appointmentId, { a with date = newDate; time = newTime; lastUpdate = Time.now() });
      };
    };
  };

  public query ({ caller }) func getAppointmentsByPatient(patientId : Nat) : async [Appointment] {
    if (caller.isAnonymous()) Runtime.trap("Unauthorized: Must be logged in");
    appointments.values().toArray().filter(func(a) { a.patientId == patientId and not a.deleted });
  };

  public query ({ caller }) func getAppointmentsByDoctor(doctorId : Nat) : async [Appointment] {
    if (caller.isAnonymous()) Runtime.trap("Unauthorized: Must be logged in");
    appointments.values().toArray().filter(func(a) { a.doctorId == doctorId and not a.deleted });
  };

  ///////////////////////////////
  // Analytics
  ///////////////////////////////

  public query ({ caller }) func getDiseaseFrequency() : async [(Text, Nat)] {
    if (caller.isAnonymous()) Runtime.trap("Unauthorized: Must be logged in");
    let frequency = Map.empty<Text, Nat>();
    for (p in patients.values()) {
      if (not p.deleted) {
        switch (frequency.get(p.disease)) {
          case (null)    { frequency.add(p.disease, 1) };
          case (?count)  { frequency.add(p.disease, count + 1) };
        };
      };
    };
    frequency.toArray();
  };

  public query ({ caller }) func getAdmissionsByDate() : async [(Text, Nat)] {
    if (caller.isAnonymous()) Runtime.trap("Unauthorized: Must be logged in");
    let admissions = Map.empty<Text, Nat>();
    for (p in patients.values()) {
      if (not p.deleted) {
        switch (admissions.get(p.admissionDate)) {
          case (null)   { admissions.add(p.admissionDate, 1) };
          case (?count) { admissions.add(p.admissionDate, count + 1) };
        };
      };
    };
    admissions.toArray();
  };

  public query ({ caller }) func getDoctorAppointmentCounts() : async [(Nat, Nat)] {
    if (caller.isAnonymous()) Runtime.trap("Unauthorized: Must be logged in");
    let counts = Map.empty<Nat, Nat>();
    for (a in appointments.values()) {
      if (not a.deleted) {
        switch (counts.get(a.doctorId)) {
          case (null)   { counts.add(a.doctorId, 1) };
          case (?count) { counts.add(a.doctorId, count + 1) };
        };
      };
    };
    counts.toArray();
  };

  public query ({ caller }) func getDashboardTotals(today : Text) : async DashboardTotals {
    if (caller.isAnonymous()) Runtime.trap("Unauthorized: Must be logged in");
    {
      totalPatients     = patients.values().toArray().filter(func(p) { not p.deleted }).size();
      totalDoctors      = doctorsV2.values().toArray().filter(func(d) { not d.deleted }).size();
      totalAppointments = appointments.values().toArray().filter(func(a) { not a.deleted }).size();
      todaysAppointments = appointments.values().toArray().filter(func(a) { a.date == today and not a.deleted }).size();
    };
  };

  ///////////////////////////////
  // Helper Queries
  ///////////////////////////////

  public query ({ caller }) func getAllPatients() : async [Patient] {
    if (caller.isAnonymous()) Runtime.trap("Unauthorized: Must be logged in");
    patients.values().toArray().filter(func(p) { not p.deleted }).sort();
  };

  public query ({ caller }) func getAllDoctors() : async [Doctor] {
    if (caller.isAnonymous()) Runtime.trap("Unauthorized: Must be logged in");
    doctorsV2.values().toArray().filter(func(d) { not d.deleted }).sort();
  };

  public query ({ caller }) func getAllAppointments() : async [Appointment] {
    if (caller.isAnonymous()) Runtime.trap("Unauthorized: Must be logged in");
    appointments.values().toArray().filter(func(a) { not a.deleted }).sort();
  };
};
