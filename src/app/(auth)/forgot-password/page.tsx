"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { api } from "@/lib/api/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Loader2, Mail, ArrowLeft } from "lucide-react";
import Link from "next/link";

const forgotPasswordSchema = z.object({
  email: z.string().email("Invalid email address"),
});

type ForgotPasswordValues = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [isPending, setIsPending] = React.useState(false);

  const form = useForm<ForgotPasswordValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = async (values: ForgotPasswordValues) => {
    setIsPending(true);
    try {
      await api.post("/auth/forgot-password", {
        email: values.email,
      });

      toast.success("If the email exists, an OTP has been sent!");
      router.push(`/reset-password?email=${encodeURIComponent(values.email)}`);
    } catch (error: any) {
      const message = error.response?.data?.message || "Something went wrong. Please try again.";
      toast.error(message);
    } finally {
      setIsPending(false);
    }
  };

  return (
    <Card className="border-border/50 bg-card/60 backdrop-blur-md shadow-xl">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold tracking-tight text-center">Forgot Password</CardTitle>
        <CardDescription className="text-center text-muted-foreground">
          Enter your email address and we will send you a 6-digit OTP to reset your password
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
                        disabled={isPending}
                        {...field}
                      />
                    </div>
                  </FormControl>
                  <FormMessage className="text-destructive text-xs mt-1" />
                </FormItem>
              )}
            />

            <Button
              type="submit"
              size="lg"
              className="w-full h-10 mt-2 bg-primary text-primary-foreground hover:bg-primary/95 flex items-center justify-center font-semibold"
              disabled={isPending}
            >
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending OTP...
                </>
              ) : (
                "Send OTP"
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
