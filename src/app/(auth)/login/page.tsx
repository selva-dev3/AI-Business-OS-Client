"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod"; 
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"; 
import Link from "next/link";
import { toast } from "sonner";
import { Loader2, Lock, Mail, Eye, EyeOff } from "lucide-react";

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  rememberMe: z.boolean().optional(),
});

type LoginValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [isPending, setIsPending] = React.useState(false);
  const [showPassword, setShowPassword] = React.useState(false);

  const form = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
      rememberMe: false,
    },
  });

  const onSubmit = async (values: LoginValues) => {
    setIsPending(true);
    try {
      await login({
        email: values.email,
        password: values.password,
      });

      toast.success("Successfully logged in!");
      router.push("/");
    } catch (error: any) {
      toast.error(error.message || "Invalid credentials. Please try again.");
    } finally {
      setIsPending(false);
    }
  };

  return (
    <Card className="border-border/50 bg-card/60 backdrop-blur-md shadow-xl">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold tracking-tight text-center">Sign In</CardTitle>
        <CardDescription className="text-center text-muted-foreground">
          Enter your email and password to access your account
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
                        placeholder="name@company.com"
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

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <div className="flex items-center justify-between">
                    <FormLabel className="text-foreground/80 font-medium">Password</FormLabel>
                    <Link
                      href="/forgot-password"
                      className="text-xs text-primary hover:underline font-medium"
                    >
                      Forgot password?
                    </Link>
                  </div>
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
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </FormControl>
                  <FormMessage className="text-destructive text-xs mt-1" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="rememberMe"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-2 space-y-0 py-1">
                  <FormControl>
                    <input
                      type="checkbox"
                      checked={field.value}
                      onChange={field.onChange}
                      disabled={isPending}
                      className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary accent-primary"
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel className="text-xs text-muted-foreground cursor-pointer select-none">
                      Remember me on this device
                    </FormLabel>
                  </div>
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
                  Signing In...
                </>
              ) : (
                "Sign In"
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
      <CardFooter className="flex flex-col items-center justify-center border-t border-border/20 bg-muted/20 py-4 text-center rounded-b-xl">
        <p className="text-xs text-muted-foreground">
          Don&apos;t have an account?{" "}
          <Link href="/register" className="text-primary hover:underline font-semibold">
            Create an account
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}
