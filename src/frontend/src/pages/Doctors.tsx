import type { Doctor, Patient } from "@/backend";
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
import { Switch } from "@/components/ui/switch";
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
  Camera,
  Loader2,
  Pencil,
  Plus,
  Trash2,
  UserPlus,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";

// Extended Doctor type to include photoUrl (backend field)
type DoctorWithPhoto = Doctor & { photoUrl?: string };

const EMPTY_FORM = {
  name: "",
  specialization: "",
  department: "",
  availability: true,
  photoUrl: "",
};

const SKELETON_ROWS = ["r1", "r2", "r3", "r4"];
const SKELETON_COLS = ["c1", "c2", "c3", "c4", "c5", "c6", "c7"];

const specializationColor = (spec: string) => {
  const colors = [
    {
      bg: "#EFF6FF",
      color: "#2563EB",
      border: "#BFDBFE",
      grad: "#2563EB, #0EA5E9",
    },
    {
      bg: "#F0FDF4",
      color: "#16A34A",
      border: "#BBF7D0",
      grad: "#16A34A, #0D9488",
    },
    {
      bg: "#FAF5FF",
      color: "#7C3AED",
      border: "#DDD6FE",
      grad: "#7C3AED, #DB2777",
    },
    {
      bg: "#FFFBEB",
      color: "#D97706",
      border: "#FDE68A",
      grad: "#D97706, #EA580C",
    },
    {
      bg: "#FFF1F2",
      color: "#E11D48",
      border: "#FECDD3",
      grad: "#E11D48, #9333EA",
    },
  ];
  const idx = (spec.charCodeAt(0) || 0) % colors.length;
  return colors[idx];
};

function getInitials(name: string): string {
  const parts = name.trim().split(" ");
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

interface AvatarCircleProps {
  photoUrl?: string;
  name: string;
  size?: number;
  fontSize?: string;
  gradient?: string;
}

function AvatarCircle({
  photoUrl,
  name,
  size = 40,
  fontSize = "text-sm",
  gradient,
}: AvatarCircleProps) {
  const defaultGrad = gradient || "linear-gradient(135deg, #0EA5E9, #0284C7)";
  if (photoUrl) {
    return (
      <img
        src={photoUrl}
        alt={name}
        style={{
          width: size,
          height: size,
          borderRadius: "50%",
          objectFit: "cover",
          border: "2px solid #e2e8f0",
          flexShrink: 0,
        }}
      />
    );
  }
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        background: defaultGrad,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
        border: "2px solid rgba(255,255,255,0.6)",
        boxShadow: "0 2px 8px rgba(14,165,233,0.25)",
      }}
      className={`${fontSize} font-bold text-white`}
    >
      {getInitials(name || "??")}
    </div>
  );
}

export default function Doctors() {
  const { backend, isLoading: actorLoading } = useBackend();
  const { identity } = useInternetIdentity();
  const isLoggedIn = !!identity && !identity.getPrincipal().isAnonymous();

  const [doctors, setDoctors] = useState<DoctorWithPhoto[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editDoctor, setEditDoctor] = useState<DoctorWithPhoto | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [photoPreview, setPhotoPreview] = useState("");
  const [photoUploading, setPhotoUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<bigint | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [assignOpen, setAssignOpen] = useState(false);
  const [assignDoctor, setAssignDoctor] = useState<DoctorWithPhoto | null>(
    null,
  );
  const [assignPatientId, setAssignPatientId] = useState("");
  const [assigning, setAssigning] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadData = useCallback(() => {
    if (!backend) return;
    setLoading(true);
    Promise.all([backend.getAllDoctors(), backend.getAllPatients()])
      .then(([docs, pats]) => {
        setDoctors(docs as DoctorWithPhoto[]);
        setPatients(pats);
      })
      .catch(() => toast.error("Failed to load data"))
      .finally(() => setLoading(false));
  }, [backend]);

  useEffect(() => {
    if (backend && !actorLoading) loadData();
  }, [backend, actorLoading, loadData]);

  const openAdd = () => {
    setEditDoctor(null);
    setForm(EMPTY_FORM);
    setPhotoPreview("");
    setModalOpen(true);
  };

  const openEdit = (d: DoctorWithPhoto) => {
    setEditDoctor(d);
    setForm({
      name: d.name,
      specialization: d.specialization,
      department: d.department,
      availability: d.availability,
      photoUrl: d.photoUrl || "",
    });
    setPhotoPreview(d.photoUrl || "");
    setModalOpen(true);
  };

  const handlePhotoSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Photo must be under 5MB");
      return;
    }

    setPhotoUploading(true);
    try {
      const reader = new FileReader();
      const dataUrl = await new Promise<string>((resolve, reject) => {
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
      setPhotoPreview(dataUrl);
      setForm((f) => ({ ...f, photoUrl: dataUrl }));
    } catch {
      toast.error("Failed to process photo");
    } finally {
      setPhotoUploading(false);
      // Reset file input
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
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
    if (!form.name || !form.specialization) {
      toast.error("Name and specialization are required");
      return;
    }
    setSaving(true);
    try {
      if (editDoctor) {
        await backend.updateDoctor({
          ...editDoctor,
          name: form.name,
          specialization: form.specialization,
          department: form.department,
          availability: form.availability,
          photoUrl: form.photoUrl,
        } as Doctor);
        toast.success("Doctor updated");
      } else {
        await backend.createDoctor({
          id: 0n,
          name: form.name,
          specialization: form.specialization,
          department: form.department,
          availability: form.availability,
          patientIds: [],
          deleted: false,
          lastUpdate: 0n,
          photoUrl: form.photoUrl,
        } as Doctor);
        toast.success("Doctor added");
      }
      setModalOpen(false);
      loadData();
    } catch {
      toast.error("Failed to save doctor");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: bigint) => {
    if (!backend) return;
    setDeleting(true);
    try {
      await backend.deleteDoctor(id);
      toast.success("Doctor deleted");
      setDeleteId(null);
      loadData();
    } catch {
      toast.error("Failed to delete doctor");
    } finally {
      setDeleting(false);
    }
  };

  const openAssign = (d: DoctorWithPhoto) => {
    setAssignDoctor(d);
    setAssignPatientId("");
    setAssignOpen(true);
  };

  const handleAssign = async () => {
    if (!backend || !assignDoctor || !assignPatientId) {
      toast.error("Select a patient to assign");
      return;
    }
    const pid = BigInt(assignPatientId);
    if (assignDoctor.patientIds.includes(pid)) {
      toast.error("Patient already assigned to this doctor");
      return;
    }
    setAssigning(true);
    try {
      await backend.updateDoctor({
        ...assignDoctor,
        patientIds: [...assignDoctor.patientIds, pid],
      } as Doctor);
      toast.success("Patient assigned");
      setAssignOpen(false);
      loadData();
    } catch {
      toast.error("Failed to assign patient");
    } finally {
      setAssigning(false);
    }
  };

  return (
    <div className="space-y-4">
      {!isLoggedIn && (
        <div
          data-ocid="doctors.login_warning"
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
            You must be logged in to manage doctors. Use the{" "}
            <span className="font-bold">Login</span> button in the top-right
            corner.
          </p>
        </div>
      )}

      <div className="flex items-center justify-end">
        <Button
          data-ocid="doctors.add_button"
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
          <Plus className="h-4 w-4" /> Add Doctor
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
              <TableHead className="font-semibold text-foreground w-16">
                Photo
              </TableHead>
              <TableHead className="font-semibold text-foreground">
                Name
              </TableHead>
              <TableHead className="font-semibold text-foreground">
                Specialization
              </TableHead>
              <TableHead className="font-semibold text-foreground">
                Department
              </TableHead>
              <TableHead className="font-semibold text-foreground">
                Availability
              </TableHead>
              <TableHead className="font-semibold text-foreground">
                Patients Assigned
              </TableHead>
              <TableHead className="text-right font-semibold text-foreground">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              SKELETON_ROWS.map((rk) => (
                <TableRow key={rk} data-ocid="doctors.table.loading_state">
                  {SKELETON_COLS.map((ck) => (
                    <TableCell key={ck}>
                      <Skeleton className="h-4 w-full" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : doctors.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="h-32 text-center text-muted-foreground"
                  data-ocid="doctors.table.empty_state"
                >
                  No doctors found
                </TableCell>
              </TableRow>
            ) : (
              doctors.map((d: DoctorWithPhoto, idx) => {
                const badge = specializationColor(d.specialization);
                return (
                  <TableRow
                    key={String(d.id)}
                    data-ocid={`doctors.item.${idx + 1}`}
                    className="hover:bg-muted/30 transition-colors"
                  >
                    <TableCell>
                      <AvatarCircle
                        photoUrl={d.photoUrl || undefined}
                        name={d.name}
                        size={40}
                        fontSize="text-sm"
                        gradient={`linear-gradient(135deg, ${badge.grad})`}
                      />
                    </TableCell>
                    <TableCell className="font-semibold text-foreground">
                      {d.name}
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
                        {d.specialization}
                      </span>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {d.department || "—"}
                    </TableCell>
                    <TableCell>
                      <span
                        className="rounded-full px-2.5 py-0.5 text-xs font-semibold border"
                        style={
                          d.availability
                            ? {
                                background: "#F0FDF4",
                                color: "#16A34A",
                                borderColor: "#BBF7D0",
                              }
                            : {
                                background: "#F9FAFB",
                                color: "#6B7280",
                                borderColor: "#E5E7EB",
                              }
                        }
                      >
                        {d.availability ? "Available" : "Unavailable"}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="font-semibold text-foreground">
                        {d.patientIds.length}
                      </span>
                      <span className="text-muted-foreground text-xs ml-1">
                        patients
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          data-ocid={`doctors.assign_button.${idx + 1}`}
                          size="sm"
                          variant="ghost"
                          onClick={() => openAssign(d)}
                          className="h-7 w-7 p-0 text-primary hover:text-primary"
                        >
                          <UserPlus className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          data-ocid={`doctors.edit_button.${idx + 1}`}
                          size="sm"
                          variant="ghost"
                          onClick={() => openEdit(d)}
                          className="h-7 w-7 p-0 hover:text-primary"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          data-ocid={`doctors.delete_button.${idx + 1}`}
                          size="sm"
                          variant="ghost"
                          onClick={() => setDeleteId(d.id)}
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
        <DialogContent className="sm:max-w-md" data-ocid="doctors.modal">
          <DialogHeader>
            <DialogTitle className="font-display text-lg">
              {editDoctor ? "Edit Doctor" : "Add New Doctor"}
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            {/* Photo Upload Section */}
            <div className="flex flex-col items-center gap-3">
              <div className="relative group">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="cursor-pointer border-0 bg-transparent p-0"
                  style={{ position: "relative" }}
                >
                  <AvatarCircle
                    photoUrl={photoPreview || undefined}
                    name={form.name || "??"}
                    size={80}
                    fontSize="text-xl"
                  />
                  {/* Overlay on hover */}
                  <div
                    style={{
                      position: "absolute",
                      inset: 0,
                      borderRadius: "50%",
                      background: "rgba(0,0,0,0.45)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      opacity: 0,
                      transition: "opacity 0.2s",
                    }}
                    className="group-hover:opacity-100"
                  >
                    {photoUploading ? (
                      <Loader2 className="h-5 w-5 text-white animate-spin" />
                    ) : (
                      <Camera className="h-5 w-5 text-white" />
                    )}
                  </div>
                </button>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                data-ocid="doctors.photo.upload_button"
                onClick={() => fileInputRef.current?.click()}
                disabled={photoUploading}
                className="gap-1.5 text-xs h-7 px-3"
                style={{ borderStyle: "dashed" }}
              >
                {photoUploading ? (
                  <>
                    <Loader2 className="h-3 w-3 animate-spin" /> Uploading...
                  </>
                ) : (
                  <>
                    <Camera className="h-3 w-3" />{" "}
                    {photoPreview ? "Change Photo" : "Upload Photo"}
                  </>
                )}
              </Button>
              {photoPreview && (
                <button
                  type="button"
                  onClick={() => {
                    setPhotoPreview("");
                    setForm((f) => ({ ...f, photoUrl: "" }));
                  }}
                  className="text-xs text-muted-foreground hover:text-destructive transition-colors"
                >
                  Remove photo
                </button>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                data-ocid="doctors.photo.dropzone"
                className="hidden"
                onChange={handlePhotoSelect}
              />
            </div>

            <div className="space-y-1.5">
              <Label
                htmlFor="d-name"
                className="text-xs font-semibold uppercase tracking-wide text-muted-foreground"
              >
                Full Name *
              </Label>
              <Input
                id="d-name"
                data-ocid="doctors.name.input"
                value={form.name}
                onChange={(e) =>
                  setForm((f) => ({ ...f, name: e.target.value }))
                }
                placeholder="Dr. Jane Smith"
                className="bg-muted/30"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label
                  htmlFor="d-spec"
                  className="text-xs font-semibold uppercase tracking-wide text-muted-foreground"
                >
                  Specialization *
                </Label>
                <Input
                  id="d-spec"
                  data-ocid="doctors.specialization.input"
                  value={form.specialization}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, specialization: e.target.value }))
                  }
                  placeholder="Cardiology"
                  className="bg-muted/30"
                />
              </div>
              <div className="space-y-1.5">
                <Label
                  htmlFor="d-dept"
                  className="text-xs font-semibold uppercase tracking-wide text-muted-foreground"
                >
                  Department
                </Label>
                <Input
                  id="d-dept"
                  data-ocid="doctors.department.input"
                  value={form.department}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, department: e.target.value }))
                  }
                  placeholder="ICU"
                  className="bg-muted/30"
                />
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-xl border border-border bg-muted/30 px-4 py-3">
              <Switch
                data-ocid="doctors.availability.switch"
                checked={form.availability}
                onCheckedChange={(v) =>
                  setForm((f) => ({ ...f, availability: v }))
                }
              />
              <div>
                <Label className="text-sm font-medium">
                  Available for Appointments
                </Label>
                <p className="text-xs text-muted-foreground">
                  {form.availability
                    ? "Doctor is currently accepting patients"
                    : "Doctor is not available"}
                </p>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              data-ocid="doctors.modal.cancel_button"
              onClick={() => setModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              data-ocid="doctors.modal.submit_button"
              onClick={handleSave}
              disabled={saving || actorLoading || !backend}
              style={{
                background: "linear-gradient(135deg, #0EA5E9, #0284C7)",
                border: "none",
              }}
            >
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {editDoctor ? "Update Doctor" : "Add Doctor"}
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
          data-ocid="doctors.delete_confirm.dialog"
        >
          <DialogHeader>
            <DialogTitle className="font-display">Delete Doctor</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Are you sure you want to delete this doctor?
          </p>
          <DialogFooter>
            <Button
              variant="outline"
              data-ocid="doctors.delete_confirm.cancel_button"
              onClick={() => setDeleteId(null)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              data-ocid="doctors.delete_confirm.confirm_button"
              disabled={deleting}
              onClick={() => deleteId !== null && handleDelete(deleteId)}
            >
              {deleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}{" "}
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Assign Patient */}
      <Dialog open={assignOpen} onOpenChange={setAssignOpen}>
        <DialogContent
          className="sm:max-w-sm"
          data-ocid="doctors.assign.dialog"
        >
          <DialogHeader>
            <DialogTitle className="font-display">
              Assign Patient — {assignDoctor?.name}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Select Patient
            </Label>
            <Select value={assignPatientId} onValueChange={setAssignPatientId}>
              <SelectTrigger
                data-ocid="doctors.assign.patient.select"
                className="bg-muted/30"
              >
                <SelectValue placeholder="Choose a patient" />
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
          <DialogFooter>
            <Button
              variant="outline"
              data-ocid="doctors.assign.cancel_button"
              onClick={() => setAssignOpen(false)}
            >
              Cancel
            </Button>
            <Button
              data-ocid="doctors.assign.confirm_button"
              onClick={handleAssign}
              disabled={assigning}
              style={{
                background: "linear-gradient(135deg, #0EA5E9, #0284C7)",
                border: "none",
              }}
            >
              {assigning && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}{" "}
              Assign Patient
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
