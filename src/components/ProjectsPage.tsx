"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Plus,
  Search,
  Trash2,
  Copy,
  Edit2,
  Video,
  Calendar,
  Sparkles,
  Clock,
  Download,
  Play,
} from "lucide-react";
import {
  getProjects,
  createProject,
  updateProject,
  deleteProject,
  type VideoProjectWithScenes,
} from "@/app/actions/projects";
import { duplicateScene } from "@/app/actions/scenes";
import { toast } from "sonner";

export function ProjectsPage() {
  const router = useRouter();
  const [projects, setProjects] = useState<VideoProjectWithScenes[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [showNewProjectDialog, setShowNewProjectDialog] = useState(false);
  const [newProjectName, setNewProjectName] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      const allProjects = await getProjects();
      setProjects(allProjects);
    } catch (error) {
      console.error("Failed to load projects:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateProject = async () => {
    if (!newProjectName.trim()) return;

    setIsCreating(true);
    try {
      const newProject = await createProject(newProjectName);
      setShowNewProjectDialog(false);
      setNewProjectName("");
      // Navigate to the editor with the new project
      router.push(`/editor/${newProject.id}`);
    } catch (error) {
      console.error("Failed to create project:", error);
      toast.error("Failed to create project", {
        description: "Please try again."
      });
    } finally{
      setIsCreating(false);
    }
  };

  const handleDeleteProject = async (projectId: string, projectName: string) => {
    if (!confirm(`Are you sure you want to delete "${projectName}"? This cannot be undone.`)) {
      return;
    }

    try {
      await deleteProject(projectId);
      setProjects(projects.filter((p) => p.id !== projectId));
    } catch (error) {
      console.error("Failed to delete project:", error);
      toast.error("Failed to delete project", {
        description: "Please try again."
      });
    }
  };

  const handleDuplicateProject = async (project: VideoProjectWithScenes) => {
    try {
      const duplicatedProject = await createProject(`${project.title} (Copy)`);

      // Duplicate all scenes from the original project
      for (const scene of project.scenes) {
        await duplicateScene(scene.id);
      }

      loadProjects(); // Reload to show the new project
    } catch (error) {
      console.error("Failed to duplicate project:", error);
      toast.error("Failed to duplicate project", {
        description: "Please try again."
      });
    }
  };

  const handleOpenProject = (projectId: string) => {
    router.push(`/editor/${projectId}`);
  };

  const filteredProjects = projects.filter((project) =>
    project.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <div className="text-muted-foreground">Loading projects...</div>
        </div>
      </div>
    );
  }

  const totalScenes = projects.reduce((acc, p) => acc + p.scenes.length, 0);
  const recentProjects = projects.slice(0, 5);

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Hero Section */}
      <div className="border-b border-border bg-gradient-to-br from-background via-muted/20 to-background">
        <div className="max-w-6xl mx-auto px-6 py-16 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-orange-600 rounded-xl flex items-center justify-center shadow-lg">
                <Sparkles className="h-6 w-6 text-white" />
              </div>
              <h1 className="text-4xl font-bold">AI Video Creator</h1>
            </div>
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
              Create stunning videos with AI-powered tools. Generate scripts, images, and voiceovers in minutes.
            </p>
            <Button
              onClick={() => setShowNewProjectDialog(true)}
              size="lg"
              className="gap-2 text-base px-8 py-6 h-auto shadow-lg hover:shadow-xl transition-shadow"
            >
              <Plus className="h-5 w-5" />
              Create Video Now
            </Button>
          </motion.div>
        </div>
      </div>

      {/* Dashboard Stats */}
      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            <Card className="p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Video className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <div className="text-2xl font-bold">{projects.length}</div>
                  <div className="text-sm text-muted-foreground">Total Videos</div>
                </div>
              </div>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
          >
            <Card className="p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-orange-500/10 rounded-lg flex items-center justify-center">
                  <Play className="h-6 w-6 text-orange-500" />
                </div>
                <div>
                  <div className="text-2xl font-bold">{totalScenes}</div>
                  <div className="text-sm text-muted-foreground">Total Scenes</div>
                </div>
              </div>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.3 }}
          >
            <Card className="p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-green-500/10 rounded-lg flex items-center justify-center">
                  <Download className="h-6 w-6 text-green-500" />
                </div>
                <div>
                  <div className="text-2xl font-bold">0</div>
                  <div className="text-sm text-muted-foreground">Exported</div>
                </div>
              </div>
            </Card>
          </motion.div>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search videos..."
              className="pl-10"
            />
          </div>
        </div>

        {/* Projects List */}
        <div className="space-y-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Your Videos</h2>
            <div className="text-sm text-muted-foreground">
              {filteredProjects.length} {filteredProjects.length === 1 ? 'video' : 'videos'}
            </div>
          </div>

          {filteredProjects.length === 0 ? (
            <Card className="p-12 text-center">
              <Video className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                {searchQuery ? "No videos found" : "No videos yet"}
              </h3>
              <p className="text-muted-foreground mb-6">
                {searchQuery
                  ? "Try a different search term"
                  : "Create your first AI-powered video to get started"}
              </p>
              {!searchQuery && (
                <Button
                  onClick={() => setShowNewProjectDialog(true)}
                  className="gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Create Your First Video
                </Button>
              )}
            </Card>
          ) : (
            <div className="space-y-3">
              {filteredProjects.map((project, index) => (
                <motion.div
                  key={project.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                >
                  <Card className="group hover:shadow-md transition-all duration-200 overflow-hidden">
                    <div className="flex items-center gap-4 p-4">
                      {/* Thumbnail */}
                      <div
                        onClick={() => handleOpenProject(project.id)}
                        className="w-40 h-24 flex-shrink-0 bg-gradient-to-br from-muted to-muted/50 rounded-lg flex items-center justify-center cursor-pointer group-hover:from-primary/10 group-hover:to-primary/5 transition-colors"
                      >
                        <Video className="h-10 w-10 text-muted-foreground group-hover:text-primary transition-colors" />
                      </div>

                      {/* Details */}
                      <div className="flex-1 min-w-0">
                        <h3
                          onClick={() => handleOpenProject(project.id)}
                          className="font-semibold text-lg mb-2 cursor-pointer hover:text-primary transition-colors line-clamp-1"
                        >
                          {project.title}
                        </h3>
                        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1.5">
                            <Play className="h-4 w-4" />
                            {project.scenes.length} scene{project.scenes.length !== 1 ? "s" : ""}
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Calendar className="h-4 w-4" />
                            {new Date(project.updatedAt).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric'
                            })}
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Clock className="h-4 w-4" />
                            {project.scenes.reduce((acc, s) => acc + s.duration, 0)}s total
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <Button
                          variant="default"
                          size="sm"
                          onClick={() => handleOpenProject(project.id)}
                          className="gap-1.5"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                          Edit
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDuplicateProject(project);
                          }}
                          title="Duplicate"
                        >
                          <Copy className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-destructive hover:text-destructive hover:bg-destructive/10"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteProject(project.id, project.title);
                          }}
                          title="Delete"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* New Project Dialog */}
      {showNewProjectDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-card border border-border rounded-lg shadow-xl p-6 w-full max-w-md mx-4"
          >
            <h2 className="text-xl font-semibold mb-4">Create New Video</h2>
            <Input
              value={newProjectName}
              onChange={(e) => setNewProjectName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleCreateProject();
                if (e.key === "Escape") {
                  setShowNewProjectDialog(false);
                  setNewProjectName("");
                }
              }}
              placeholder="Enter video name..."
              className="mb-4"
              autoFocus
            />
            <div className="flex gap-3 justify-end">
              <Button
                variant="outline"
                onClick={() => {
                  setShowNewProjectDialog(false);
                  setNewProjectName("");
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={handleCreateProject}
                disabled={!newProjectName.trim() || isCreating}
                className="gap-2"
              >
                {isCreating ? (
                  <>
                    <div className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4" />
                    Create Video
                  </>
                )}
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
