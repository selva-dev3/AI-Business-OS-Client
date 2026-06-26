export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted p-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold tracking-tight">AI Business OS</h1>
          <p className="text-muted-foreground mt-2">Enterprise management platform</p>
        </div>
        {children}
      </div>
    </div>
  );
}
