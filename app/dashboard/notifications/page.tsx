import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Bell, CheckCheck, Clock, AlertTriangle, Info, ShieldAlert, ArrowRight } from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function NotificationsPage() {
  const notifications = await prisma.notification.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      customer: true,
      user: true,
    },
    take: 50,
  });

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Bell className="h-6 w-6 text-primary" />
            System Notifications & Alerts
          </h1>
          <p className="text-sm text-muted-foreground">
            Real-time feed of billing runs, payment events, subscription state changes, and automated dunning alerts.
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="bg-card/50 backdrop-blur border-border/50">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
              <Bell className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-medium">Total Activity Events</p>
              <p className="text-xl font-bold text-foreground">{notifications.length}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card/50 backdrop-blur border-border/50">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-500">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-medium">Unread Alerts</p>
              <p className="text-xl font-bold text-amber-400">{unreadCount}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card/50 backdrop-blur border-border/50">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-500">
              <CheckCheck className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-medium">System Health</p>
              <p className="text-xl font-bold text-emerald-400">Optimal (100%)</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Notifications List */}
      <Card className="bg-card/40 border-border/60">
        <CardHeader className="pb-3 border-b border-border/40">
          <CardTitle className="text-base font-semibold">Notification Activity Feed</CardTitle>
        </CardHeader>
        <CardContent className="p-0 divide-y divide-border/40">
          {notifications.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground">
              <Bell className="h-10 w-10 mx-auto text-muted-foreground/40 mb-3" />
              <p>No notifications recorded yet.</p>
            </div>
          ) : (
            notifications.map((n) => {
              const isUrgent = n.notificationType.includes("CANCEL") || n.notificationType.includes("OVERDUE") || n.notificationType.includes("FAILED");

              return (
                <div
                  key={n.id}
                  className={`p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-muted/10 transition-colors ${
                    !n.isRead ? "bg-primary/5" : ""
                  }`}
                >
                  <div className="flex items-start gap-3.5">
                    <div
                      className={`h-9 w-9 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                        isUrgent
                          ? "bg-rose-500/10 text-rose-400"
                          : "bg-primary/10 text-primary"
                      }`}
                    >
                      {isUrgent ? (
                        <ShieldAlert className="h-4 w-4" />
                      ) : (
                        <Info className="h-4 w-4" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-foreground text-sm">
                          {n.title}
                        </span>
                        {!n.isRead && (
                          <span className="h-2 w-2 rounded-full bg-primary" />
                        )}
                        <Badge variant="outline" className="text-[10px] uppercase font-mono">
                          {n.notificationType}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1 max-w-2xl leading-relaxed">
                        {n.message}
                      </p>
                      <div className="flex items-center gap-3 text-[11px] text-muted-foreground/70 mt-1.5">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {formatDate(n.createdAt)}
                        </span>
                        {n.customer && (
                          <span>Target: {n.customer.companyName}</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {n.linkUrl && (
                    <Link
                      href={n.linkUrl}
                      className="inline-flex items-center gap-1 text-xs text-primary font-medium hover:underline shrink-0"
                    >
                      View Details
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  )}
                </div>
              );
            })
          )}
        </CardContent>
      </Card>
    </div>
  );
}
