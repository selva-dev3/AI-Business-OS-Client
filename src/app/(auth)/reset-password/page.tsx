"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { api } from "@/lib/api/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Loader2, Lock, Mail, KeyRound, Eye, EyeOff, ArrowLeft } from "lucide-react";
import Link from "next/link";

const resetPasswordSchema = z.object({
  email: z.string().email("Invalid email address"),
  otp: z.string().length(6, "OTP must be exactly 6 digits").regex(/^\d+$/, "OTP must contain only digits"),
  newPassword: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[a-z]/, "Must contain at least one lowercase letter")
    .regex(/[A-Z]/, "Must contain at least one uppercase letter")
    .regex(/\d/, "Must contain at least one number"),
  confirmPassword: z.string().min(8, "Confirm password is required"),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

type ResetPasswordValues = z.infer<typeof resetPasswordSchema>;

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, setIsPending] = React.useState(false);
  const [showPassword, setShowPassword] = React.useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false);

  const emailFromUrl = searchParams?.get("email") || "";

  const form = useForm<ResetPasswordValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      email: emailFromUrl,
      otp: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  // Keep email field updated if url search param updates
  React.useEffect(() => {
    if (emailFromUrl) {
      form.setValue("email", emailFromUrl);
    }
  }, [emailFromUrl, form]);

  const onSubmit = async (values: ResetPasswordValues) => {
    setIsPending(true);
    try {
      await api.post("/auth/reset-password", {
        email: values.email,
        otp: values.otp,
        newPassword: values.newPassword,
      });

      toast.success("Password reset successfully! Please login with your new password.");
      router.push("/login");
    } catch (error: any) {
      const message = error.response?.data?.message || "Failed to reset password. Please verify the details.";
      toast.error(message);
    } finally {
      setIsPending(false);
    }
  };

  return (
    <Card className="border-border/50 bg-card/60 backdrop-blur-md shadow-xl">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold tracking-tight text-center">Reset Password</CardTitle>
        <CardDescription className="text-center text-muted-foreground">
          Enter the OTP sent to your email and your new password below
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-foreground/80 font-medium">Email Address</FormLabel>
                  <FormControl>
                    <div className="relative flex items-center">
                      <Mail className="absolute left-3 h-4 w-4 text-muted-foreground pointer-events-none" />
                      <Input
                        type="email"
                        placeholder="john@company.com"
                        className="pl-9 h-10 w-full"
                        disabled={isPending || !!emailFromUrl}
                        {...field}
                      />
                    </div>
                  </FormControl>
                  <FormMessage className="text-destructive text-xs mt-1" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="otp"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-foreground/80 font-medium">6-Digit OTP</FormLabel>
                  <FormControl>
                    <div className="relative flex items-center">
                      <KeyRound className="absolute left-3 h-4 w-4 text-muted-foreground pointer-events-none" />
                      <Input
                        placeholder="123456"
                        maxLength={6}
                        className="pl-9 h-10 w-full tracking-widest font-mono"
                        disabled={isPending}
                        {...field}
                      />
                    </div>
                  </FormControl>
                  <FormMessage className="text-destructive text-xs mt-1" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="newPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-foreground/80 font-medium">New Password</FormLabel>
                  <FormControl>
                    <div className="relative flex items-center">
                      <Lock className="absolute left-3 h-4 w-4 text-muted-foreground pointer-events-none" />
                      <Input
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        className="pl-9 pr-9 h-10 w-full"
                        disabled={isPending}
                        {...field}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 text-muted-foreground hover:text-foreground focus:outline-none"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </FormControl>
                  <FormMessage className="text-destructive text-xs mt-1" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-foreground/80 font-medium">Confirm New Password</FormLabel>
                  <FormControl>
                    <div className="relative flex items-center">
                      <Lock className="absolute left-3 h-4 w-4 text-muted-foreground pointer-events-none" />
                      <Input
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="••••••••"
                        className="pl-9 pr-9 h-10 w-full"
                        disabled={isPending}
                        {...field}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 text-muted-foreground hover:text-foreground focus:outline-none"
                      >
                        {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </FormControl>
                  <FormMessage className="text-destructive text-xs mt-1" />
                </FormItem>
              )}
            />

            <Button
              type="submit"
              size="lg"
              className="w-full h-10 mt-4 bg-primary text-primary-foreground hover:bg-primary/95 flex items-center justify-center font-semibold"
              disabled={isPending}
            >
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Resetting Password...
                </>
              ) : (
                "Reset Password"
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
      <CardFooter className="flex flex-col items-center justify-center border-t border-border/20 bg-muted/20 py-4 text-center rounded-b-xl">
        <Link href="/login" className="text-xs text-primary hover:underline font-semibold flex items-center gap-1.5">
          <ArrowLeft className="h-3.5 w-3.5" /> Back to login
        </Link>
      </CardFooter>
    </Card>
  );
}

export default function ResetPasswordPage() {
  return (
    <React.Suspense fallback={
      <Card className="border-border/50 bg-card/60 backdrop-blur-md shadow-xl flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </Card>
    }>
      <ResetPasswordForm />
    </React.Suspense>
  );
}
