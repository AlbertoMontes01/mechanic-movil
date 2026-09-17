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
