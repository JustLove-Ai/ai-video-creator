"use client";

import { VideoEditor } from "@/components/VideoEditor";
import { useParams } from "next/navigation";

export default function EditorPage() {
  const params = useParams();
  const projectId = params.projectId as string;

  return <VideoEditor projectId={projectId} />;
}
