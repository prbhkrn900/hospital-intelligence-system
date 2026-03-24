import type { Appointment, Patient } from "@/backend";
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
import { useBackend } from "@/hooks/useBackend";
import { useInternetIdentity } from "@/hooks/useInternetIdentity";
import {
  AlertTriangle,
  History,
  Loader2,
  Pencil,
  Plus,
  Search,
  Trash2,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

const EMPTY_FORM = {
  name: "",
  age: "",
  gender: "",
  contact: "",
  disease: "",
  treatment: "",
  admissionDate: "",
};

const SKELETON_ROWS = ["r1", "r2", "r3", "r4", "r5"];
const SKELETON_COLS = ["c1", "c2", "c3", "c4", "c5", "c6", "c7", "c8"];

const diseaseBadgeColor = (disease: string) => {
  const colors = [
    { bg: "#EFF6FF", color: "#2563EB", border: "#BFDBFE" },
    { bg: "#F0FDF4", color: "#16A34A", border: "#BBF7D0" },
    { bg: "#FAF5FF", color: "#7C3AED", border: "#DDD6FE" },
    { bg: "#FFFBEB", color: "#D97706", border: "#FDE68A" },
    { bg: "#FFF1F2", color: "#E11D48", border: "#FECDD3" },
  ];
  const idx = disease.length % colors.length;
  return colors[idx];
};

export default function Patients() {
  const { backend, isLoading: actorLoading } = useBackend();
  const { identity } = useInternetIdentity();
  const isLoggedIn = !!identity && !identity.getPrincipal().isAnonymous();

  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editPatient, setEditPatient] = useState<Patient | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [historyPatient, setHistoryPatient] = useState<Patient | null>(null);
  const [history, setHistory] = useState<Appointment[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [deleteId, setDeleteId] = useState<bigint | null>(null);
  const [deleting, setDeleting] = useState(false);

  const loadPatients = useCallback(() => {
    if (!backend) return;
    setLoading(true);
    backend
      .getAllPatients()
      .then(setPatients)
      .catch(() => toast.error("Failed to load patients"))
      .finally(() => setLoading(false));
  }, [backend]);

  useEffect(() => {
    if (backend && !actorLoading) loadPatients();
  }, [backend, actorLoading, loadPatients]);

  const openAdd = () => {
    setEditPatient(null);
    setForm(EMPTY_FORM);
    setModalOpen(true);
  };

  const openEdit = (p: Patient) => {
    setEditPatient(p);
    setForm({
      name: p.name,
      age: String(Number(p.age)),
      gender: p.gender,
      contact: p.contact,
      disease: p.disease,
      treatment: p.treatment,
      admissionDate: p.admissionDate,
    });
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!isLoggedIn) {
      toast.error("Please log in first");
      return;
    }
    if (!backend) {
      toast.error("System is initializing, please try again in a moment.");
      return;
    }
    if (!form.name || !form.age || !form.gender) {
      toast.error("Name, age, and gender are required");
      return;
    }
    setSaving(true);
    try {
      if (editPatient) {
        await backend.updatePatient({
          ...editPatient,
          name: form.name,
          age: BigInt(form.age),
          gender: form.gender,
          contact: form.contact,
          disease: form.disease,
          treatment: form.treatment,
          admissionDate: form.admissionDate,
        });
        toast.success("Patient updated");
      } else {
        await backend.createPatient({
          id: 0n,
          name: form.name,
          age: BigInt(form.age),
          gender: form.gender,
          contact: form.contact,
          disease: form.disease,
          treatment: form.treatment,
          admissionDate: form.admissionDate,
          deleted: false,
          lastUpdate: 0n,
        });
        toast.success("Patient added");
      }
      setModalOpen(false);
      loadPatients();
    } catch {
      toast.error("Failed to save patient");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: bigint) => {
    if (!backend) return;
    setDeleting(true);
    try {
      await backend.deletePatient(id);
      toast.success("Patient deleted");
      setDeleteId(null);
      loadPatients();
    } catch {
      toast.error("Failed to delete patient");
    } finally {
      setDeleting(false);
    }
  };

  const openHistory = (p: Patient) => {
    setHistoryPatient(p);
    setHistoryOpen(true);
    setHistoryLoading(true);
    backend
      ?.getAppointmentsByPatient(p.id)
      .then(setHistory)
      .catch(() => toast.error("Failed to load history"))
      .finally(() => setHistoryLoading(false));
  };

  const filtered = patients.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.disease.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="space-y-4">
      {!isLoggedIn && (
        <div
          data-ocid="patients.login_warning"
          className="flex items-start gap-3 rounded-xl border px-4 py-3"
          style={{
            background: "#FFFBEB",
            borderColor: "#FDE68A",
            color: "#92400E",
          }}
        >
          <AlertTriangle
            className="mt-0.5 h-5 w-5 flex-shrink-0"
            style={{ color: "#D97706" }}
          />
          <p className="text-sm font-medium">
            You must be logged in to manage patients. Use the{" "}
            <span className="font-bold">Login</span> button in the top-right
            corner.
          </p>
        </div>
      )}

      <div className="flex items-center justify-between gap-4">
        <div className="relative w-72">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            data-ocid="patients.search_input"
            placeholder="Search patients or disease..."
            className="pl-9 bg-card shadow-sm"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Button
          data-ocid="patients.add_button"
          onClick={openAdd}
          className="gap-2 font-semibold"
          disabled={!isLoggedIn}
          style={
            !isLoggedIn
              ? {}
              : {
                  background: "linear-gradient(135deg, #0EA5E9, #0284C7)",
                  border: "none",
                  boxShadow: "0 4px 12px rgba(14,165,233,0.35)",
                }
          }
        >
          <Plus className="h-4 w-4" /> Add Patient
        </Button>
      </div>

      <div className="rounded-xl border border-border bg-card shadow-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow
              style={{
                background: "linear-gradient(to right, #F8FAFF, #F0F6FF)",
              }}
            >
              <TableHead className="font-semibold text-foreground">
                Name
              </TableHead>
              <TableHead className="font-semibold text-foreground">
                Age
              </TableHead>
              <TableHead className="font-semibold text-foreground">
                Gender
              </TableHead>
              <TableHead className="font-semibold text-foreground">
                Contact
              </TableHead>
              <TableHead className="font-semibold text-foreground">
                Disease
              </TableHead>
              <TableHead className="font-semibold text-foreground">
                Treatment
              </TableHead>
              <TableHead className="font-semibold text-foreground">
                Admission Date
              </TableHead>
              <TableHead className="text-right font-semibold text-foreground">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              SKELETON_ROWS.map((rk) => (
                <TableRow key={rk} data-ocid="patients.table.loading_state">
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
                  colSpan={8}
                  className="h-32 text-center text-muted-foreground"
                  data-ocid="patients.table.empty_state"
                >
                  No patients found
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((p, idx) => {
                const badge = diseaseBadgeColor(p.disease || "a");
                return (
                  <TableRow
                    key={String(p.id)}
                    data-ocid={`patients.item.${idx + 1}`}
                    className="hover:bg-muted/30 transition-colors"
                  >
                    <TableCell className="font-semibold text-foreground">
                      {p.name}
                    </TableCell>
                    <TableCell>{String(p.age)}</TableCell>
                    <TableCell>{p.gender}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {p.contact}
                    </TableCell>
                    <TableCell>
                      <span
                        className="rounded-full px-2.5 py-0.5 text-xs font-semibold border"
                        style={{
                          background: badge.bg,
                          color: badge.color,
                          borderColor: badge.border,
                        }}
                      >
                        {p.disease || "—"}
                      </span>
                    </TableCell>
                    <TableCell className="max-w-[140px] truncate text-muted-foreground">
                      {p.treatment || "—"}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {p.admissionDate || "—"}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          data-ocid={`patients.edit_button.${idx + 1}`}
                          size="sm"
                          variant="ghost"
                          onClick={() => openEdit(p)}
                          className="h-7 w-7 p-0 hover:text-primary"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          data-ocid={`patients.history_button.${idx + 1}`}
                          size="sm"
                          variant="ghost"
                          onClick={() => openHistory(p)}
                          className="h-7 w-7 p-0 text-muted-foreground hover:text-primary"
                        >
                          <History className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          data-ocid={`patients.delete_button.${idx + 1}`}
                          size="sm"
                          variant="ghost"
                          onClick={() => setDeleteId(p.id)}
                          className="h-7 w-7 p-0 text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* Add/Edit Modal */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="sm:max-w-lg" data-ocid="patients.modal">
          <DialogHeader>
            <DialogTitle className="font-display text-lg">
              {editPatient ? "Edit Patient" : "Add New Patient"}
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label
                  htmlFor="p-name"
                  className="text-xs font-semibold uppercase tracking-wide text-muted-foreground"
                >
                  Full Name *
                </Label>
                <Input
                  id="p-name"
                  data-ocid="patients.name.input"
                  value={form.name}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, name: e.target.value }))
                  }
                  placeholder="John Doe"
                  className="bg-muted/30"
                />
              </div>
              <div className="space-y-1.5">
                <Label
                  htmlFor="p-age"
                  className="text-xs font-semibold uppercase tracking-wide text-muted-foreground"
                >
                  Age *
                </Label>
                <Input
                  id="p-age"
                  data-ocid="patients.age.input"
                  type="number"
                  value={form.age}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, age: e.target.value }))
                  }
                  placeholder="35"
                  className="bg-muted/30"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Gender *
                </Label>
                <Select
                  value={form.gender}
                  onValueChange={(v) => setForm((f) => ({ ...f, gender: v }))}
                >
                  <SelectTrigger
                    data-ocid="patients.gender.select"
                    className="bg-muted/30"
                  >
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Male">Male</SelectItem>
                    <SelectItem value="Female">Female</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label
                  htmlFor="p-contact"
                  className="text-xs font-semibold uppercase tracking-wide text-muted-foreground"
                >
                  Contact
                </Label>
                <Input
                  id="p-contact"
                  data-ocid="patients.contact.input"
                  value={form.contact}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, contact: e.target.value }))
                  }
                  placeholder="+1 555 000 0000"
                  className="bg-muted/30"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label
                  htmlFor="p-disease"
                  className="text-xs font-semibold uppercase tracking-wide text-muted-foreground"
                >
                  Disease
                </Label>
                <Input
                  id="p-disease"
                  data-ocid="patients.disease.input"
                  value={form.disease}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, disease: e.target.value }))
                  }
                  placeholder="Hypertension"
                  className="bg-muted/30"
                />
              </div>
              <div className="space-y-1.5">
                <Label
                  htmlFor="p-admission"
                  className="text-xs font-semibold uppercase tracking-wide text-muted-foreground"
                >
                  Admission Date
                </Label>
                <Input
                  id="p-admission"
                  data-ocid="patients.admissionDate.input"
                  type="date"
                  value={form.admissionDate}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, admissionDate: e.target.value }))
                  }
                  className="bg-muted/30"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label
                htmlFor="p-treatment"
                className="text-xs font-semibold uppercase tracking-wide text-muted-foreground"
              >
                Treatment Plan
              </Label>
              <Input
                id="p-treatment"
                data-ocid="patients.treatment.input"
                value={form.treatment}
                onChange={(e) =>
                  setForm((f) => ({ ...f, treatment: e.target.value }))
                }
                placeholder="Describe the treatment plan"
                className="bg-muted/30"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              data-ocid="patients.modal.cancel_button"
              onClick={() => setModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              data-ocid="patients.modal.submit_button"
              onClick={handleSave}
              disabled={saving || actorLoading || !backend}
              style={{
                background: "linear-gradient(135deg, #0EA5E9, #0284C7)",
                border: "none",
              }}
            >
              {actorLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Connecting...
                </>
              ) : saving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {editPatient ? "Updating..." : "Adding..."}
                </>
              ) : editPatient ? (
                "Update Patient"
              ) : (
                "Add Patient"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirm */}
      <Dialog
        open={deleteId !== null}
        onOpenChange={(o) => !o && setDeleteId(null)}
      >
        <DialogContent
          className="sm:max-w-sm"
          data-ocid="patients.delete_confirm.dialog"
        >
          <DialogHeader>
            <DialogTitle className="font-display">Delete Patient</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Are you sure you want to delete this patient? This action cannot be
            undone.
          </p>
          <DialogFooter>
            <Button
              variant="outline"
              data-ocid="patients.delete_confirm.cancel_button"
              onClick={() => setDeleteId(null)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              data-ocid="patients.delete_confirm.confirm_button"
              disabled={deleting}
              onClick={() => deleteId !== null && handleDelete(deleteId)}
            >
              {deleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* History Modal */}
      <Dialog open={historyOpen} onOpenChange={setHistoryOpen}>
        <DialogContent
          className="sm:max-w-lg"
          data-ocid="patients.history.dialog"
        >
          <DialogHeader>
            <DialogTitle className="font-display">
              Appointment History — {historyPatient?.name}
            </DialogTitle>
          </DialogHeader>
          {historyLoading ? (
            <div
              className="space-y-2"
              data-ocid="patients.history.loading_state"
            >
              {["h1", "h2", "h3"].map((k) => (
                <Skeleton key={k} className="h-10 w-full" />
              ))}
            </div>
          ) : history.length === 0 ? (
            <p
              className="text-sm text-muted-foreground text-center py-8"
              data-ocid="patients.history.empty_state"
            >
              No appointments found for this patient.
            </p>
          ) : (
            <div className="divide-y divide-border rounded-xl border border-border overflow-hidden">
              {history.map((appt, idx) => (
                <div
                  key={String(appt.id)}
                  data-ocid={`patients.history.item.${idx + 1}`}
                  className="flex items-center justify-between px-4 py-3 hover:bg-muted/30 transition-colors"
                >
                  <div>
                    <p className="text-sm font-semibold">
                      {appt.date} at {appt.time}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {appt.notes || "No notes"}
                    </p>
                  </div>
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      appt.status === "booked"
                        ? "bg-blue-100 text-blue-700"
                        : appt.status === "completed"
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                    }`}
                  >
                    {appt.status}
                  </span>
                </div>
              ))}
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              data-ocid="patients.history.close_button"
              onClick={() => setHistoryOpen(false)}
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
