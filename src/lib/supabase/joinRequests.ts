"use client";

import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { Project } from "@/types/project";
import { Profile } from "@/types/profile";

const supabase = createClient();

export interface JoinRequest {
  id: number;
  project_id: number;
  user_id: string;
  message: string | null;
  status: "pending" | "approved" | "rejected";
  created_at: string;
  updated_at: string;
  reviewed_by: string | null;
  reviewed_at: string | null;
  projects: Project;
  requester: Profile; // Aliased join will return a 'requester' object
}

export const getSentJoinRequests = async (userId: string): Promise<JoinRequest[]> => {
  const { data, error } = await supabase
    .from("join_requests")
    // Explicitly join profiles via user_id and alias the result as 'requester'
    .select("*, projects(*), requester:profiles!join_requests_user_id_fkey(*)")
    .eq("user_id", userId);

  if (error) {
    console.error("Error fetching sent join requests:", JSON.stringify(error, null, 2));
    toast.error("Failed to fetch sent join requests. Check console for details.");
    return [];
  }
  return data || [];
};

export const getReceivedJoinRequests = async (leaderId: string): Promise<JoinRequest[]> => {
  const { data: leaderProjects, error: projectsError } = await supabase
    .from("projects")
    .select("id")
    .eq("leader", leaderId);

  if (projectsError) {
    console.error("Error fetching leader projects:", JSON.stringify(projectsError, null, 2));
    toast.error("Failed to fetch your projects. Check console for details.");
    return [];
  }

  const projectIds = leaderProjects.map((p) => p.id);

  if (projectIds.length === 0) {
    return [];
  }

  const { data, error } = await supabase
    .from("join_requests")
    // Explicitly join profiles via user_id and alias the result as 'requester'
    .select("*, projects(*), requester:profiles!join_requests_user_id_fkey(*)")
    .in("project_id", projectIds)
    .eq("status", "pending");

  if (error) {
    console.error("Error fetching received join requests:", JSON.stringify(error, null, 2));
    toast.error("Failed to fetch received join requests. Check console for details.");
    return [];
  }
  return data || [];
};

export const updateJoinRequestStatus = async (
  requestId: number,
  status: "approved" | "rejected",
  reviewedBy: string
) => {
  const { data, error } = await supabase
    .from("join_requests")
    .update({
      status,
      reviewed_by: reviewedBy,
      reviewed_at: new Date().toISOString(),
    })
    .eq("id", requestId)
    .select();

  if (error) {
    toast.error(`Failed to ${status === "approved" ? "approve" : "reject"} request`);
    throw error;
  }

  toast.success(`Request ${status === "approved" ? "approved" : "rejected"}`);
  return data;
};