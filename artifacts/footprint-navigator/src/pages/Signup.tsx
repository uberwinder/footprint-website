import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { motion } from "framer-motion";
import { Link } from "wouter";
import { CheckCircle2, ChevronRight } from "lucide-react";

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

const signupSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  company: z.string().min(2, "Company name is required"),
  role: z.string().min(2, "Role is required"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

type SignupFormValues = z.infer<typeof signupSchema>;

export default function Signup() {
  const [isSuccess, setIsSuccess] = useState(false);

  const form = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      name: "",
      email: "",
      company: "",
      role: "",
      password: "",
    },
  });

  function onSubmit(data: SignupFormValues) {
    console.log("Signup successful", data);
    setIsSuccess(true);
  }

  return (
    <div className="flex min-h-[calc(100vh-4rem)] bg-background items-center justify-center p-8">
      <div className="w-full" style={{ maxWidth: "480px", margin: "0 auto" }}>
          <div className="mb-10 text-center sm:text-left">
            <h1 className="text-3xl font-bold mb-3">Create your account</h1>
            <p className="text-muted-foreground">Join thousands of professionals mastering document control.</p>
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
              <h2 className="text-2xl font-bold mb-4">Registration Successful!</h2>
              <p className="text-muted-foreground mb-8">
                Welcome to Footprint Navigator. Please check your email to verify your account and start your trial.
              </p>
              <Button className="w-full" asChild>
                <Link href="/">Return to Home</Link>
              </Button>
            </motion.div>
          ) : (
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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

                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="••••••••" className="bg-background" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button type="submit" className="w-full h-12 text-base mt-4" data-testid="button-submit-signup">
                  Create Account <ChevronRight className="ml-2" size={18} />
                </Button>
                
                <p className="text-center text-sm text-muted-foreground mt-6">
                  By registering, you agree to our <a href="#" className="text-primary hover:underline">Terms of Service</a> and <a href="#" className="text-primary hover:underline">Privacy Policy</a>.
                </p>
              </form>
            </Form>
          )}
      </div>
    </div>
  );
}
