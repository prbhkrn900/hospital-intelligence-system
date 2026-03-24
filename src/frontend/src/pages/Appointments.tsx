import type { Appointment, Doctor, Patient } from "@/backend";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { useBackend } from "@/hooks/useBackend";
import {
  CalendarClock,
  CheckCircle,
  Loader2,
  Plus,
  XCircle,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

const EMPTY_FORM = {
  patientId: "",
  doctorId: "",
  date: "",
  time: "",
  notes: "",
};

const RESCHEDULE_EMPTY = { date: "", time: "" };
const SKELETON_ROWS = ["r1", "r2", "r3", "r4", "r5"];
const SKELETON_COLS = ["c1", "c2", "c3", "c4", "c5", "c6", "c7"];

export default function Appointments() {
  const { backend, isLoading: actorLoading } = useBackend();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [cancelId, setCancelId] = useState<bigint | null>(null);
  const [cancelling, setCancelling] = useState(false);
  const [rescheduleAppt, setRescheduleAppt] = useState<Appointment | null>(
    null,
  );
  const [rescheduleForm, setRescheduleForm] = useState(RESCHEDULE_EMPTY);
  const [rescheduling, setRescheduling] = useState(false);

  const loadData = useCallback(() => {
    if (!backend) return;
    setLoading(true);
    Promise.all([
      backend.getAllAppointments(),
      backend.getAllPatients(),
      backend.getAllDoctors(),
    ])
      .then(([appts, pats, docs]) => {
        setAppointments(appts);
        setPatients(pats);
        setDoctors(docs);
      })
      .catch(() => toast.error("Failed to load data"))
      .finally(() => setLoading(false));
  }, [backend]);

  useEffect(() => {
    if (backend && !actorLoading) loadData();
  }, [backend, actorLoading, loadData]);

  const patientName = (id: bigint) =>
    patients.find((p) => p.id === id)?.name ?? `#${id}`;
  const doctorName = (id: bigint) =>
    doctors.find((d) => d.id === id)?.name ?? `#${id}`;

  const filtered = appointments.filter((a) => {
    const matchStatus = statusFilter === "all" || a.status === statusFilter;
    const matchDate = !dateFilter || a.date === dateFilter;
    return matchStatus && matchDate;
  });

  const handleBook = async () => {
    if (!backend) return;
    if (!form.patientId || !form.doctorId || !form.date || !form.time) {
      toast.error("Patient, doctor, date and time are required");
      return;
    }
    setSaving(true);
    try {
      await backend.createAppointment({
        id: 0n,
        patientId: BigInt(form.patientId),
        doctorId: BigInt(form.doctorId),
        date: form.date,
        time: form.time,
        notes: form.notes,
        status: "booked",
        deleted: false,
        lastUpdate: 0n,
      });
      toast.success("Appointment booked");
      setModalOpen(false);
      setForm(EMPTY_FORM);
      loadData();
    } catch {
      toast.error("Failed to book appointment");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = async (id: bigint) => {
    if (!backend) return;
    setCancelling(true);
    try {
      await backend.cancelAppointment(id);
      toast.success("Appointment cancelled");
      setCancelId(null);
      loadData();
    } catch {
      toast.error("Failed to cancel appointment");
    } finally {
      setCancelling(false);
    }
  };

  const handleReschedule = async () => {
    if (!backend || !rescheduleAppt) return;
    if (!rescheduleForm.date || !rescheduleForm.time) {
      toast.error("Date and time are required");
      return;
    }
    setRescheduling(true);
    try {
      await backend.rescheduleAppointment(
        rescheduleAppt.id,
        rescheduleForm.date,
        rescheduleForm.time,
      );
      toast.success("Appointment rescheduled");
      setRescheduleAppt(null);
      loadData();
    } catch {
      toast.error("Failed to reschedule appointment");
    } finally {
      setRescheduling(false);
    }
  };

  const statusBadge = (status: string) => {
    const styles: Record<string, string> = {
      booked: "bg-blue-100 text-blue-700",
      completed: "bg-green-100 text-green-700",
      cancelled: "bg-red-100 text-red-700",
    };
    return (
      <span
        className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${styles[status] ?? "bg-gray-100 text-gray-700"}`}
      >
        {status}
      </span>
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger
              data-ocid="appointments.status_filter.select"
              className="w-36 bg-card"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="booked">Booked</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
          <Input
            data-ocid="appointments.date_filter.input"
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="w-44 bg-card"
          />
          {dateFilter && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setDateFilter("")}
              className="text-xs text-muted-foreground"
            >
              Clear
            </Button>
          )}
        </div>
        <Button
          data-ocid="appointments.book_button"
          onClick={() => {
            setForm(EMPTY_FORM);
            setModalOpen(true);
          }}
          className="gap-2"
        >
          <Plus className="h-4 w-4" /> Book Appointment
        </Button>
      </div>

      <div className="rounded-xl border border-border bg-card shadow-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead>Patient</TableHead>
              <TableHead>Doctor</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Time</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Notes</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              SKELETON_ROWS.map((rk) => (
                <TableRow key={rk} data-ocid="appointments.table.loading_state">
                  {SKELETON_COLS.map((ck) => (
                    <TableCell key={ck}>
                      <Skeleton className="h-4 w-full" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : filtered.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="h-32 text-center text-muted-foreground"
                  data-ocid="appointments.table.empty_state"
                >
                  No appointments found
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((a, idx) => (
                <TableRow
                  key={String(a.id)}
                  data-ocid={`appointments.item.${idx + 1}`}
                  className="hover:bg-muted/30"
                >
                  <TableCell className="font-medium">
                    {patientName(a.patientId)}
                  </TableCell>
                  <TableCell>{doctorName(a.doctorId)}</TableCell>
                  <TableCell>{a.date}</TableCell>
                  <TableCell>{a.time}</TableCell>
                  <TableCell>{statusBadge(a.status)}</TableCell>
                  <TableCell className="max-w-[120px] truncate text-sm text-muted-foreground">
                    {a.notes || "—"}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      {a.status === "booked" && (
                        <>
                          <Button
                            data-ocid={`appointments.complete_button.${idx + 1}`}
                            size="sm"
                            variant="ghost"
                            className="h-7 w-7 p-0 text-success"
                            onClick={() =>
                              toast.info("Mark complete feature coming soon")
                            }
                          >
                            <CheckCircle className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            data-ocid={`appointments.reschedule_button.${idx + 1}`}
                            size="sm"
                            variant="ghost"
                            className="h-7 w-7 p-0 text-primary"
                            onClick={() => {
                              setRescheduleAppt(a);
                              setRescheduleForm({ date: a.date, time: a.time });
                            }}
                          >
                            <CalendarClock className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            data-ocid={`appointments.cancel_button.${idx + 1}`}
                            size="sm"
                            variant="ghost"
                            className="h-7 w-7 p-0 text-destructive hover:text-destructive"
                            onClick={() => setCancelId(a.id)}
                          >
                            <XCircle className="h-3.5 w-3.5" />
                          </Button>
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent
          className="sm:max-w-md"
          data-ocid="appointments.book.modal"
        >
          <DialogHeader>
            <DialogTitle>Book New Appointment</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="space-y-1.5">
              <Label>Patient *</Label>
              <Select
                value={form.patientId}
                onValueChange={(v) => setForm((f) => ({ ...f, patientId: v }))}
              >
                <SelectTrigger data-ocid="appointments.book.patient.select">
                  <SelectValue placeholder="Select patient" />
                </SelectTrigger>
                <SelectContent>
                  {patients.map((p) => (
                    <SelectItem key={String(p.id)} value={String(p.id)}>
                      {p.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Doctor *</Label>
              <Select
                value={form.doctorId}
                onValueChange={(v) => setForm((f) => ({ ...f, doctorId: v }))}
              >
                <SelectTrigger data-ocid="appointments.book.doctor.select">
                  <SelectValue placeholder="Select doctor" />
                </SelectTrigger>
                <SelectContent>
                  {doctors.map((d) => (
                    <SelectItem key={String(d.id)} value={String(d.id)}>
                      {d.name} — {d.specialization}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="a-date">Date *</Label>
                <Input
                  id="a-date"
                  data-ocid="appointments.book.date.input"
                  type="date"
                  value={form.date}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, date: e.target.value }))
                  }
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="a-time">Time *</Label>
                <Input
                  id="a-time"
                  data-ocid="appointments.book.time.input"
                  type="time"
                  value={form.time}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, time: e.target.value }))
                  }
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="a-notes">Notes</Label>
              <Textarea
                id="a-notes"
                data-ocid="appointments.book.notes.textarea"
                value={form.notes}
                onChange={(e) =>
                  setForm((f) => ({ ...f, notes: e.target.value }))
                }
                placeholder="Additional notes..."
                rows={2}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              data-ocid="appointments.book.cancel_button"
              onClick={() => setModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              data-ocid="appointments.book.submit_button"
              onClick={handleBook}
              disabled={saving}
            >
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Book
              Appointment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={cancelId !== null}
        onOpenChange={(o) => !o && setCancelId(null)}
      >
        <DialogContent
          className="sm:max-w-sm"
          data-ocid="appointments.cancel_confirm.dialog"
        >
          <DialogHeader>
            <DialogTitle>Cancel Appointment</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Are you sure you want to cancel this appointment?
          </p>
          <DialogFooter>
            <Button
              variant="outline"
              data-ocid="appointments.cancel_confirm.cancel_button"
              onClick={() => setCancelId(null)}
            >
              Keep
            </Button>
            <Button
              variant="destructive"
              data-ocid="appointments.cancel_confirm.confirm_button"
              disabled={cancelling}
              onClick={() => cancelId !== null && handleCancel(cancelId)}
            >
              {cancelling && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}{" "}
              Yes, Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={rescheduleAppt !== null}
        onOpenChange={(o) => !o && setRescheduleAppt(null)}
      >
        <DialogContent
          className="sm:max-w-sm"
          data-ocid="appointments.reschedule.dialog"
        >
          <DialogHeader>
            <DialogTitle>Reschedule Appointment</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="r-date">New Date *</Label>
              <Input
                id="r-date"
                data-ocid="appointments.reschedule.date.input"
                type="date"
                value={rescheduleForm.date}
                onChange={(e) =>
                  setRescheduleForm((f) => ({ ...f, date: e.target.value }))
                }
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="r-time">New Time *</Label>
              <Input
                id="r-time"
                data-ocid="appointments.reschedule.time.input"
                type="time"
                value={rescheduleForm.time}
                onChange={(e) =>
                  setRescheduleForm((f) => ({ ...f, time: e.target.value }))
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              data-ocid="appointments.reschedule.cancel_button"
              onClick={() => setRescheduleAppt(null)}
            >
              Cancel
            </Button>
            <Button
              data-ocid="appointments.reschedule.confirm_button"
              onClick={handleReschedule}
              disabled={rescheduling}
            >
              {rescheduling && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}{" "}
              Reschedule
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
