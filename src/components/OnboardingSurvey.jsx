import React, { useState } from "react";
import { api } from "@/api/client";
import { Button } from "@/components/ui/button";
import { showError } from "@/lib/errorToast";
import { ClipboardList, Loader2 } from "lucide-react";

const ROLE_OPTIONS = [
  "Mobile diesel mechanic",
  "Mobile mechanic – gas & diesel",
  "Shop-based diesel mechanic",
  "Fleet mechanic / technician",
  "Heavy equipment mechanic",
  "Truck & trailer repair",
  "Shop owner / business owner",
  "Fleet owner / operator",
];

const WORKS_ON_OPTIONS = [
  "Class 7–8 / semi trucks",
  "Medium-duty trucks (M2, International MV, Hino, etc.)",
  "Diesel pickup trucks",
  "Trailers",
  "Construction / heavy equipment",
  "Agricultural equipment",
  "Generators / industrial equipment",
  "Automotive / light-duty",
];

const HOW_YOU_WORK_OPTIONS = [
  "Independent / one-man operation",
  "Independent with employees",
  "Work for a mobile repair company",
  "Work for a repair shop",
  "Fleet mechanic",
  "I own/manage a repair business",
];

const YEARS_OPTIONS = ["Less than 1 year", "1–3 years", "4–7 years", "8–15 years", "16–25 years", "25+ years"];

const AGE_OPTIONS = ["18–24", "25–34", "35–44", "45–54", "55–64", "65+", "Prefer not to say"];

const SIZE_OPTIONS = ["Just me", "2–3 people", "4–10 people", "11–25 people", "25+ people"];

const KEEPS_RUNNING_OPTIONS = [
  "Good diagnostics",
  'Expensive tools I definitely "needed"',
  "YouTube University",
  "Coffee & energy drinks",
  "Zip ties & brake cleaner",
  "Pure stubbornness",
  '"I know a guy"',
  "All of the above",
];

const TRACKING_OPTIONS = [
  "Pen & paper",
  "Notes on my phone",
  "Excel / spreadsheets",
  "QuickBooks",
  "Shopmonkey",
  "Fullbay",
  "Other shop management software",
  "Multiple apps / systems",
  "Mostly from memory",
  "I don't really have a system",
];

const EMPTY_FORM = {
  location: "",
  roles: [],
  roleOther: "",
  worksOn: [],
  worksOnOther: "",
  howYouWork: [],
  howYouWorkOther: "",
  yearsExperience: "",
  ageRange: "",
  operationSize: "",
  whatKeepsRunning: [],
  trackingMethods: [],
  trackingMethodsOther: "",
};

function toggle(arr, value) {
  return arr.includes(value) ? arr.filter((v) => v !== value) : [...arr, value];
}

// Mandatory one-time onboarding survey -- no close button, no click-outside
// or Escape dismissal (deliberately not built on the Dialog primitive,
// which allows both). Rendered by Layout.jsx on every authenticated page
// until GET /api/survey/me comes back non-null, so there's no route the
// user can navigate to instead of answering it.
export default function OnboardingSurvey({ onDone }) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const toggleIn = (k, v) => setForm((f) => ({ ...f, [k]: toggle(f[k], v) }));

  const missing = [];
  if (!form.location.trim()) missing.push("location");
  if (form.roles.length === 0) missing.push("role");
  if (form.worksOn.length === 0) missing.push("what you work on");
  if (form.howYouWork.length === 0) missing.push("how you work");
  if (!form.yearsExperience) missing.push("years of experience");
  if (!form.ageRange) missing.push("age range");
  if (!form.operationSize) missing.push("operation size");
  if (form.whatKeepsRunning.length === 0) missing.push("what keeps your operation running");
  if (form.trackingMethods.length === 0) missing.push("how you track jobs");

  const submit = async (e) => {
    e.preventDefault();
    if (missing.length > 0) {
      setError(`Please answer: ${missing.join(", ")}.`);
      return;
    }
    setError("");
    setSubmitting(true);
    try {
      await api.survey.submit(form);
      onDone();
    } catch (err) {
      showError(err, "Could not submit the survey.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] overflow-y-auto bg-background/95 backdrop-blur-sm">
      <div className="mx-auto my-6 w-[calc(100%-2rem)] max-w-2xl rounded-2xl border border-white/10 bg-card p-5 shadow-xl sm:p-8">
        <div className="mb-6 text-center">
          <div className="mx-auto mb-3 grid h-12 w-12 place-items-center rounded-2xl bg-primary">
            <ClipboardList className="h-6 w-6 text-primary-foreground" />
          </div>
          <h1 className="font-display text-2xl font-bold uppercase tracking-wide text-foreground">
            Quick intro before you start
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            9 quick questions so we can build PitStop around mechanics like you. Takes about a minute.
          </p>
        </div>

        {error && (
          <div className="mb-4 rounded-lg border border-red-500/40 bg-red-950/40 p-3 text-sm text-red-200">{error}</div>
        )}

        <form onSubmit={submit} className="space-y-6">
          <Question n={1} label="Where are you located?">
            <input
              className="input-base"
              placeholder="City, State/Province, Country"
              value={form.location}
              onChange={(e) => set("location", e.target.value)}
            />
          </Question>

          <Question n={2} label="What best describes what you do?" hint="Select all that apply">
            <CheckboxGrid options={ROLE_OPTIONS} value={form.roles} onToggle={(v) => toggleIn("roles", v)} />
            <OtherInput value={form.roleOther} onChange={(v) => set("roleOther", v)} />
          </Question>

          <Question n={3} label="What do you normally work on?" hint="Select all that apply">
            <CheckboxGrid options={WORKS_ON_OPTIONS} value={form.worksOn} onToggle={(v) => toggleIn("worksOn", v)} />
            <OtherInput value={form.worksOnOther} onChange={(v) => set("worksOnOther", v)} />
          </Question>

          <Question n={4} label="How do you currently work?" hint="Select all that apply">
            <CheckboxGrid options={HOW_YOU_WORK_OPTIONS} value={form.howYouWork} onToggle={(v) => toggleIn("howYouWork", v)} />
            <OtherInput value={form.howYouWorkOther} onChange={(v) => set("howYouWorkOther", v)} />
          </Question>

          <Question n={5} label="How many years have you been turning wrenches? 🔧">
            <RadioGrid options={YEARS_OPTIONS} value={form.yearsExperience} onChange={(v) => set("yearsExperience", v)} />
          </Question>

          <Question n={6} label="What's your age range?">
            <RadioGrid options={AGE_OPTIONS} value={form.ageRange} onChange={(v) => set("ageRange", v)} />
          </Question>

          <Question n={7} label="How big is your operation?">
            <RadioGrid options={SIZE_OPTIONS} value={form.operationSize} onChange={(v) => set("operationSize", v)} />
          </Question>

          <Question n={8} label="Be honest… what actually keeps your operation running?" hint="Select all that apply">
            <CheckboxGrid
              options={KEEPS_RUNNING_OPTIONS}
              value={form.whatKeepsRunning}
              onToggle={(v) => toggleIn("whatKeepsRunning", v)}
            />
          </Question>

          <Question n={9} label="How do you currently keep track of your jobs and customers?" hint="Select all that apply">
            <CheckboxGrid
              options={TRACKING_OPTIONS}
              value={form.trackingMethods}
              onToggle={(v) => toggleIn("trackingMethods", v)}
            />
            <OtherInput value={form.trackingMethodsOther} onChange={(v) => set("trackingMethodsOther", v)} />
          </Question>

          <Button type="submit" className="w-full h-12 font-medium" disabled={submitting}>
            {submitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Submitting...
              </>
            ) : (
              "Submit & continue"
            )}
          </Button>
        </form>
      </div>
    </div>
  );
}

function Question({ n, label, hint, children }) {
  return (
    <div className="border-t border-white/10 pt-5 first:border-t-0 first:pt-0">
      <p className="field-label">
        {n}. {label}
      </p>
      {hint && <p className="mb-2 text-xs text-muted-foreground/70">{hint}</p>}
      <div className="mt-2">{children}</div>
    </div>
  );
}

function CheckboxGrid({ options, value, onToggle }) {
  return (
    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
      {options.map((opt) => (
        <label
          key={opt}
          className="flex items-start gap-2.5 rounded-md border border-white/10 px-3 py-2.5 text-sm cursor-pointer hover:bg-white/5"
        >
          <input
            type="checkbox"
            className="mt-0.5 h-4 w-4 shrink-0 rounded border-white/20 accent-primary"
            checked={value.includes(opt)}
            onChange={() => onToggle(opt)}
          />
          <span className="text-foreground">{opt}</span>
        </label>
      ))}
    </div>
  );
}

function RadioGrid({ options, value, onChange }) {
  return (
    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
      {options.map((opt) => (
        <label
          key={opt}
          className="flex items-start gap-2.5 rounded-md border border-white/10 px-3 py-2.5 text-sm cursor-pointer hover:bg-white/5"
        >
          <input
            type="radio"
            className="mt-0.5 h-4 w-4 shrink-0 border-white/20 accent-primary"
            checked={value === opt}
            onChange={() => onChange(opt)}
          />
          <span className="text-foreground">{opt}</span>
        </label>
      ))}
    </div>
  );
}

function OtherInput({ value, onChange }) {
  return (
    <input
      className="input-base mt-2"
      placeholder="Other (optional)"
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
  );
}
