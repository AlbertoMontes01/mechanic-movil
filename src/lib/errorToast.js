import { toast } from "@/components/ui/use-toast";

// A save/delete/upload that fails needs to actually tell the user why --
// several forms previously had no catch block at all around their API
// call, so a failed request just silently left the UI sitting there with
// no explanation. Call this from every catch block instead of doing
// nothing (or an ad-hoc alert()), so it's consistent everywhere.
export function showError(err, fallback = "Something went wrong. Please try again.") {
  toast({
    title: "Something went wrong",
    description: err?.message || fallback,
    className: "border-red-500/40 bg-red-950/95",
  });
}

// Companion to showError -- a save/create/delete that succeeds silently
// reads the same as one that did nothing, especially for an upsert like a
// testimonial where clicking twice looks identical to it never having
// worked the first time. Call this from every successful mutation, the
// same way showError is called from every failed one.
export function showSuccess(message) {
  toast({
    title: message,
    className: "border-primary/40 bg-primary/10",
  });
}
