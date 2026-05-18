import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { motion } from "framer-motion";
import { CheckCircle2, ChevronDown, ChevronRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

const COMPANY_SIZES = [
  "1–9 employees",
  "10–99 employees",
  "100–999 employees",
  "1,000+ employees",
] as const;

const signupSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  company: z.string().min(2, "Company name is required"),
  role: z.string().min(2, "Role is required"),
  phone: z.string().optional(),
  companySize: z.enum(COMPANY_SIZES, { required_error: "Please select a company size" }),
  earlyAccess: z.enum(["yes", "no"], { required_error: "Please select an option" }),
});

type SignupFormValues = z.infer<typeof signupSchema>;

export default function Signup() {
  const [isSuccess, setIsSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const form = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      name: "",
      email: "",
      company: "",
      role: "",
      phone: "",
      companySize: undefined,
      earlyAccess: undefined,
    },
  });

  async function onSubmit(data: SignupFormValues) {
    setSubmitError("");
    setIsSubmitting(true);
    try {
      await fetch("https://footprint-api.onrender.com/api/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: data.name,
          company: data.company,
          email: data.email,
          role: data.role,
          phone: data.phone ?? "",
          companySize: data.companySize,
          earlyAccess: data.earlyAccess === "yes" ? "Yes" : "No",
        }),
      });
    } catch {
      // Non-fatal — show success regardless so user isn't blocked
    } finally {
      setIsSubmitting(false);
    }
    setIsSuccess(true);
    form.reset();
  }

  return (
    <div className="flex min-h-[calc(100vh-4rem)] bg-background items-center justify-center p-8">
      <div className="w-full" style={{ maxWidth: "480px", margin: "0 auto" }}>

        <div className="mb-10">
          <h1 className="text-3xl font-bold mb-4">Request Early Access</h1>
          <p className="text-muted-foreground leading-relaxed">
            Footprint Navigator launches July 1, 2026. Sign up now to get early access, help shape the product, and lock in lifetime discounts.
          </p>
        </div>

        {isSuccess ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-card border border-primary/30 rounded-xl p-8 text-center shadow-lg shadow-primary/5"
          >
            <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="text-primary" size={32} />
            </div>
            <p className="text-xl font-semibold" style={{ color: "hsl(var(--primary))" }}>
              Thank you! We will be in touch before the July 1st launch.
            </p>
          </motion.div>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">

              {/* Row 1: Full Name + Company */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name</FormLabel>
                      <FormControl>
                        <Input placeholder="John Doe" className="bg-background" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="company"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Company</FormLabel>
                      <FormControl>
                        <Input placeholder="Acme Construction" className="bg-background" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Row 2: Work Email + Job Role */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Work Email</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="john@company.com" className="bg-background" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="role"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Job Role</FormLabel>
                      <FormControl>
                        <Input placeholder="Project Manager" className="bg-background" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Row 3: Phone Number + Company Size */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone Number <span className="text-muted-foreground font-normal">(optional)</span></FormLabel>
                      <FormControl>
                        <Input type="tel" placeholder="(555) 555-5555" className="bg-background" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="companySize"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Company Size</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <select
                            value={field.value ?? ""}
                            onChange={(e) => field.onChange(e.target.value || undefined)}
                            className="w-full h-10 rounded-md border border-input bg-background px-3 pr-8 text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-primary"
                          >
                            <option value="" disabled>Select company size</option>
                            {COMPANY_SIZES.map((s) => (
                              <option key={s} value={s}>{s}</option>
                            ))}
                          </select>
                          <ChevronDown className="absolute right-2.5 top-2.5 h-4 w-4 text-muted-foreground pointer-events-none" />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Early Access toggle */}
              <FormField
                control={form.control}
                name="earlyAccess"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium leading-snug">
                      Are you willing to participate in early access testing and help us debug the product?
                    </FormLabel>
                    <FormControl>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                        <button
                          type="button"
                          onClick={() => field.onChange("yes")}
                          className="text-left rounded-lg border p-4 transition-all duration-150 focus:outline-none"
                          style={{
                            borderColor: field.value === "yes" ? "hsl(var(--primary))" : "hsl(var(--border))",
                            backgroundColor: field.value === "yes" ? "hsl(var(--primary) / 0.1)" : "transparent",
                            boxShadow: field.value === "yes" ? "0 0 0 1px hsl(var(--primary))" : "none",
                          }}
                        >
                          <span className="block font-semibold mb-1 text-sm" style={{ color: field.value === "yes" ? "hsl(var(--primary))" : "inherit" }}>Yes</span>
                          <span className="block text-xs text-muted-foreground leading-snug">I want early access and am happy to provide feedback</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => field.onChange("no")}
                          className="text-left rounded-lg border p-4 transition-all duration-150 focus:outline-none"
                          style={{
                            borderColor: field.value === "no" ? "hsl(var(--primary))" : "hsl(var(--border))",
                            backgroundColor: field.value === "no" ? "hsl(var(--primary) / 0.1)" : "transparent",
                            boxShadow: field.value === "no" ? "0 0 0 1px hsl(var(--primary))" : "none",
                          }}
                        >
                          <span className="block font-semibold mb-1 text-sm" style={{ color: field.value === "no" ? "hsl(var(--primary))" : "inherit" }}>No</span>
                          <span className="block text-xs text-muted-foreground leading-snug">Just notify me when it launches</span>
                        </button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {submitError && <p className="text-sm text-red-500">{submitError}</p>}

              <Button type="submit" className="w-full h-12 text-base mt-2" disabled={isSubmitting} data-testid="button-submit-signup">
                {isSubmitting ? "Submitting…" : <>Submit <ChevronRight className="ml-2" size={18} /></>}
              </Button>
            </form>
          </Form>
        )}
      </div>
    </div>
  );
}
