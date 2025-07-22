"use client";

import React, { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  getSentJoinRequests,
  getReceivedJoinRequests,
  updateJoinRequestStatus,
  JoinRequest,
} from "@/lib/supabase/joinRequests";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Link from "next/link";
import { User } from "@supabase/supabase-js";

const NotificationsPage = () => {
  const [user, setUser] = useState<User | null>(null);
  const [sentRequests, setSentRequests] = useState<JoinRequest[]>([]);
  const [receivedRequests, setReceivedRequests] = useState<JoinRequest[]>([]);
  const [loading, setLoading] = useState(true);

  const supabase = createClient();

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user);
    };
    getUser();
  }, [supabase]);

  const fetchRequests = useCallback(async () => {
    if (user) {
      setLoading(true);
      try {
        const [sent, received] = await Promise.all([
          getSentJoinRequests(user.id),
          getReceivedJoinRequests(user.id),
        ]);
        setSentRequests(sent);
        setReceivedRequests(received);
      } catch (error) {
        console.error("An error occurred during fetchRequests:", error);
        toast.error("An unexpected error occurred while fetching requests.");
      } finally {
        setLoading(false);
      }
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchRequests();
    }
  }, [user, fetchRequests]);

  const handleRequestAction = async (
    requestId: number,
    status: "approved" | "rejected"
  ) => {
    if (!user) return;
    try {
      await updateJoinRequestStatus(requestId, status, user.id);
      // Refresh the lists after the action
      await fetchRequests();
    } catch (error) {
      // Error toast is already handled in the update function
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="secondary">Pending</Badge>;
      case "approved":
        return <Badge variant="default">Approved</Badge>;
      case "rejected":
        return <Badge variant="destructive">Rejected</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-4 text-center">Loading...</div>
    );
  }

  return (
    <div className="container mx-auto p-4 space-y-8">
      <h1 className="text-3xl font-bold">Notifications</h1>

      {/* Received Requests */}
      <Card>
        <CardHeader>
          <CardTitle>Received Join Requests</CardTitle>
        </CardHeader>
        <CardContent>
          {!receivedRequests || receivedRequests.length === 0 ? (
            <p>You have no new join requests.</p>
          ) : (
            <ul className="space-y-4">
              {receivedRequests.map((req) => (
                <li
                  key={req.id}
                  className="flex items-center justify-between p-3 bg-card rounded-lg shadow"
                >
                  <div className="flex items-center space-x-4">
                    <Avatar>
                      <AvatarImage
                        src={req.requester?.avatar_url || ""}
                        alt={req.requester?.name || "User Avatar"}
                      />
                      <AvatarFallback>
                        {req.requester?.name?.[0]?.toUpperCase() || "U"}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p>
                        <span className="font-semibold">
                          {req.requester?.name || "A user"}
                        </span>{" "}
                        wants to join your project:{" "}
                        <Link
                          href={`/protected/projects/${req.project_id}`}
                          className="font-semibold hover:underline"
                        >
                          {req.projects?.title || "your project"}
                        </Link>
                      </p>
                      {req.message && (
                        <p className="text-sm text-muted-foreground mt-1">
                          Message: {req.message}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      size="sm"
                      onClick={() => handleRequestAction(req.id, "approved")}
                    >
                      Approve
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleRequestAction(req.id, "rejected")}
                    >
                      Reject
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      {/* Sent Requests */}
      <Card>
        <CardHeader>
          <CardTitle>Sent Join Requests</CardTitle>
        </CardHeader>
        <CardContent>
          {!sentRequests || sentRequests.length === 0 ? (
            <p>You have not sent any join requests.</p>
          ) : (
            <ul className="space-y-4">
              {sentRequests.map((req) => (
                <li
                  key={req.id}
                  className="flex items-center justify-between p-3 bg-card rounded-lg shadow"
                >
                  <div>
                    <p>
                      Your request to join{" "}
                      <Link
                        href={`/protected/projects/${req.project_id}`}
                        className="font-semibold hover:underline"
                      >
                        {req.projects?.title || "a project"}
                      </Link>
                    </p>
                  </div>
                  {getStatusBadge(req.status)}
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default NotificationsPage;