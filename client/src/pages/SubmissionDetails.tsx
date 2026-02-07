import { useQuery } from "@tanstack/react-query";
import { useParams, useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Mail, LayoutDashboard, Landmark, Wallet, ExternalLink, ArrowLeft, Calendar } from "lucide-react";
import type { Submission } from "@shared/schema";

export default function SubmissionDetails() {
  const { id } = useParams();
  const [, setLocation] = useLocation();

  const { data: submissions, isLoading } = useQuery<Submission[]>({
    queryKey: ["/api/admin/submissions"],
  });

  const submission = submissions?.find((s) => s.id === Number(id));

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-zinc-950 text-white">
        <p>Loading submission details...</p>
      </div>
    );
  }

  if (!submission) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-zinc-950 text-white gap-4">
        <p className="text-xl">Submission not found</p>
        <Button onClick={() => setLocation("/")}>Go Back</Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-6 pb-12">
        <Button 
          variant="ghost" 
          className="gap-2 text-zinc-400 hover:text-white"
          onClick={() => window.history.back()}
        >
          <ArrowLeft className="h-4 w-4" /> Back to Dashboard
        </Button>

        <Card className="bg-zinc-900 border-white/10 overflow-hidden">
          <CardHeader className="border-b border-white/10 bg-zinc-900/50">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <CardTitle className="text-3xl font-bold">{submission.name}</CardTitle>
                <CardDescription className="text-zinc-400 mt-1 flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Submitted on {submission.createdAt ? new Date(submission.createdAt).toLocaleString() : "N/A"}
                </CardDescription>
              </div>
              <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-medium">
                ID: #{submission.id}
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="p-6 md:p-8 space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <DetailSection 
                  label="Contact Information" 
                  icon={<Mail className="h-5 w-5 text-primary" />}
                  items={[
                    { label: "Full Name", value: submission.name },
                    { label: "Email Address", value: submission.email }
                  ]}
                />
                <DetailSection 
                  label="Case Context" 
                  icon={<LayoutDashboard className="h-5 w-5 text-primary" />}
                  items={[
                    { label: "Platform Involved", value: submission.platform },
                    { label: "Total Amount Lost", value: submission.amountLost }
                  ]}
                />
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-2 text-primary">
                  <Wallet className="h-5 w-5" />
                  <h3 className="font-bold uppercase tracking-widest text-xs">Financial Details</h3>
                </div>
                <div className="bg-zinc-950 p-4 rounded-lg border border-white/5 space-y-4">
                  <div>
                    <label className="text-[10px] text-zinc-500 uppercase font-bold block mb-1">Wallet Address / Destination</label>
                    <code className="text-sm text-zinc-300 break-all">{submission.walletAddress || "Not provided"}</code>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-2 text-primary">
                  <Landmark className="h-5 w-5" />
                  <h3 className="font-bold uppercase tracking-widest text-xs">Description of Case</h3>
                </div>
                <div className="bg-zinc-950 p-6 rounded-lg border border-white/5">
                  <p className="text-zinc-300 whitespace-pre-wrap leading-relaxed">
                    {submission.description}
                  </p>
                </div>
              </div>

              {submission.evidenceFiles && submission.evidenceFiles.length > 0 && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-primary">
                    <ExternalLink className="h-5 w-5" />
                    <h3 className="font-bold uppercase tracking-widest text-xs">Attached Evidence</h3>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {submission.evidenceFiles.map((file, i) => (
                      <a 
                        key={i} 
                        href={file} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 p-4 rounded-xl bg-zinc-800 border border-white/5 hover:bg-zinc-700 hover:border-primary/30 transition-all group"
                      >
                        <div className="p-2 rounded-lg bg-zinc-900 text-primary group-hover:scale-110 transition-transform">
                          <ExternalLink className="h-4 w-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium truncate text-zinc-200">Document {i + 1}</p>
                          <p className="text-[10px] text-zinc-500">Click to view</p>
                        </div>
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function DetailSection({ label, icon, items }: { label: string; icon: React.ReactNode; items: { label: string; value?: string | null }[] }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-primary">
        {icon}
        <h3 className="font-bold uppercase tracking-widest text-xs">{label}</h3>
      </div>
      <div className="space-y-3">
        {items.map((item, idx) => (
          <div key={idx}>
            <label className="text-[10px] text-zinc-500 uppercase font-bold block mb-1">{item.label}</label>
            <p className="text-sm font-medium text-zinc-200 bg-zinc-950 p-3 rounded-lg border border-white/5">
              {item.value || "Not provided"}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
