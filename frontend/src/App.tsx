import { Toaster } from "@/components/ui/sonner";
import { IncidentTable } from "@/components/incidents/IncidentTable";

export default function App() {
    return (
        <div className="min-h-screen bg-background">
            <header className="border-b border-border">
                <div className="max-w-7xl mx-auto px-6 py-4 flex items-center gap-3">
                    <div className="size-7 rounded-lg bg-primary flex items-center justify-center">
                        <span className="text-primary-foreground text-xs font-bold">I</span>
                    </div>
                    <h1 className="text-base font-semibold text-foreground tracking-tight">Incident Manager</h1>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-6 py-8">
                <div className="mb-6">
                    <h2 className="text-xl font-semibold text-foreground">Incidents</h2>
                    <p className="text-muted-foreground text-sm mt-1">Track, manage and resolve incidents in real time.</p>
                </div>
                <IncidentTable />
            </main>

            <Toaster richColors position="bottom-right" />
        </div>
    );
}
