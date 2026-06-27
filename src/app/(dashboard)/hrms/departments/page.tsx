"use client";

import * as React from "react";
import {
  Building,
  Users,
  UserCheck,
  UserMinus,
  Search,
  Plus,
  Edit2,
  Trash2,
  FolderOpen,
  ChevronDown,
  ChevronRight,
  Folder,
  ArrowRight,
  Mail,
  User,
  ExternalLink,
  Save,
  Grid,
  GitPullRequest,
  CheckCircle,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

// Import hooks and types
import {
  useDepartments,
  useCreateDepartment,
  useUpdateDepartment,
  useDeleteDepartment,
} from "@/hooks/queries/hrms/departments/departments.hooks";
import { Department } from "@/hooks/queries/hrms/departments/departments.types";

// Mock Employee database for assignments and department heads
interface TeamMember {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  designation: string;
  departmentId: string | null;
  avatar?: string;
}

export default function DepartmentsPage() {
  const [activeTab, setActiveTab] = React.useState<"grid" | "tree" | "assignment">("grid");
  const [searchQuery, setSearchQuery] = React.useState("");

  // Modals state
  const [isFormOpen, setIsFormOpen] = React.useState(false);
  const [isMembersOpen, setIsMembersOpen] = React.useState(false);
  const [formMode, setFormMode] = React.useState<"create" | "edit">("create");

  // Selected details
  const [selectedDept, setSelectedDept] = React.useState<Department | null>(null);

  // Form input states
  const [formValues, setFormValues] = React.useState({
    name: "",
    description: "",
    parentId: "" as string,
    headId: "" as string,
  });

  // Query Hooks
  const { data: serverDepts, isLoading: deptsLoading, refetch } = useDepartments();
  const createDeptMutation = useCreateDepartment();
  const updateDeptMutation = useUpdateDepartment();
  const deleteDeptMutation = useDeleteDepartment();

  // Mock static employees list for managers and assignment
  const fallbackEmployees: TeamMember[] = React.useMemo(() => [
    { id: "emp-1", firstName: "John", lastName: "Doe", email: "john.doe@company.com", designation: "Principal Engineer", departmentId: "dept-1" },
    { id: "emp-2", firstName: "Jane", lastName: "Smith", email: "jane.smith@company.com", designation: "Product Director", departmentId: "dept-2" },
    { id: "emp-3", firstName: "Robert", lastName: "Chen", email: "robert.chen@company.com", designation: "Talent Partner", departmentId: "dept-4" },
    { id: "emp-4", firstName: "Emily", lastName: "Watson", email: "emily.watson@company.com", designation: "Marketing Specialist", departmentId: "dept-3" },
    { id: "emp-5", firstName: "Alex", lastName: "Rivera", email: "alex.r@company.com", designation: "DevOps Lead", departmentId: "dept-1" },
    { id: "emp-6", firstName: "Michael", lastName: "Chang", email: "m.chang@company.com", designation: "Backend Lead", departmentId: "dept-1" },
    { id: "emp-7", firstName: "Sophia", lastName: "Lark", email: "sophia.l@company.com", designation: "UI/UX Designer", departmentId: "dept-2" },
    { id: "emp-8", firstName: "David", lastName: "Miller", email: "d.miller@company.com", designation: "HR Coordinator", departmentId: "dept-4" },
    { id: "emp-9", firstName: "Oliver", lastName: "Stone", email: "o.stone@company.com", designation: "Junior Frontend Developer", departmentId: null },
    { id: "emp-10", firstName: "Lily", lastName: "Grace", email: "l.grace@company.com", designation: "Growth Hacker", departmentId: null },
  ], []);

  const [employees, setEmployees] = React.useState<TeamMember[]>([]);
  React.useEffect(() => {
    setEmployees(fallbackEmployees);
  }, [fallbackEmployees]);

  // High-fidelity fallback departments database
  const fallbackDepts: Department[] = React.useMemo(() => [
    {
      id: "dept-1",
      name: "Engineering",
      description: "Software development, QA automation, DevOps infrastructure, and architecture.",
      headId: "emp-1",
      head: { id: "emp-1", firstName: "John", lastName: "Doe", email: "john.doe@company.com" },
      employeeCount: 3,
      createdAt: "2026-01-10T09:00:00Z",
      updatedAt: "2026-01-10T09:00:00Z",
    },
    {
      id: "dept-1-1",
      name: "Frontend Team",
      description: "Client application development, UI layout systems, and rendering optimization.",
      parentId: "dept-1",
      headId: "emp-5",
      head: { id: "emp-5", firstName: "Alex", lastName: "Rivera", email: "alex.r@company.com" },
      employeeCount: 1,
      createdAt: "2026-02-15T10:00:00Z",
      updatedAt: "2026-02-15T10:00:00Z",
    },
    {
      id: "dept-1-2",
      name: "DevOps & SRE",
      description: "Cloud hosting, CI/CD pipes automation, logging clusters, and deployments.",
      parentId: "dept-1",
      employeeCount: 1,
      createdAt: "2026-03-01T11:00:00Z",
      updatedAt: "2026-03-01T11:00:00Z",
    },
    {
      id: "dept-2",
      name: "Product & Design",
      description: "Product management specifications, UI/UX prototyping, and user testing surveys.",
      headId: "emp-2",
      head: { id: "emp-2", firstName: "Jane", lastName: "Smith", email: "jane.smith@company.com" },
      employeeCount: 2,
      createdAt: "2026-01-12T09:00:00Z",
      updatedAt: "2026-01-12T09:00:00Z",
    },
    {
      id: "dept-3",
      name: "Sales & Marketing",
      description: "Corporate accounts acquisitions, marketing funnels, and brand campaigns.",
      headId: "emp-4",
      head: { id: "emp-4", firstName: "Emily", lastName: "Watson", email: "emily.watson@company.com" },
      employeeCount: 1,
      createdAt: "2026-01-15T09:00:00Z",
      updatedAt: "2026-01-15T09:00:00Z",
    },
    {
      id: "dept-4",
      name: "Human Resources",
      description: "Talent acquisition pipeline, benefits auditing, onboarding, and operations.",
      headId: "emp-3",
      head: { id: "emp-3", firstName: "Robert", lastName: "Chen", email: "robert.chen@company.com" },
      employeeCount: 2,
      createdAt: "2026-01-20T09:00:00Z",
      updatedAt: "2026-01-20T09:00:00Z",
    },
  ], []);

  const [localDepts, setLocalDepts] = React.useState<Department[]>([]);
  React.useEffect(() => {
    setLocalDepts(fallbackDepts);
  }, [fallbackDepts]);

  // Combined Active Catalog Data List
  const departmentsList = React.useMemo(() => {
    const list = serverDepts && serverDepts.length > 0 ? serverDepts : localDepts;

    return list.map((dept) => {
      // Map parent and children references dynamically
      const parent = list.find((p) => p.id === dept.parentId);
      const head = dept.head || employees.find((emp) => emp.id === dept.headId);
      
      // Calculate dynamic count from employees list
      const count = employees.filter((emp) => emp.departmentId === dept.id).length;

      return {
        ...dept,
        parent: parent ? { id: parent.id, name: parent.name } : undefined,
        head: head ? {
          id: head.id,
          firstName: head.firstName,
          lastName: head.lastName,
          email: head.email,
        } : undefined,
        employeeCount: count,
      };
    });
  }, [serverDepts, localDepts, employees]);

  // Filter list by search query
  const filteredList = React.useMemo(() => {
    return departmentsList.filter((dept) =>
      dept.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (dept.description && dept.description.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  }, [departmentsList, searchQuery]);

  // Overview metrics
  const stats = React.useMemo(() => {
    const totalDepts = departmentsList.length;
    const totalStaff = employees.length;
    const unassigned = employees.filter((emp) => emp.departmentId === null).length;
    const heads = departmentsList.filter((dept) => dept.headId).length;

    return {
      totalDepts,
      totalStaff,
      unassigned,
      heads,
    };
  }, [departmentsList, employees]);

  // Collapsed items in tree structure
  const [collapsedTreeNodes, setCollapsedTreeNodes] = React.useState<Record<string, boolean>>({});

  const toggleTreeNode = (id: string) => {
    setCollapsedTreeNodes((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  // Open Create Dialog
  const handleOpenCreate = () => {
    setFormMode("create");
    setFormValues({
      name: "",
      description: "",
      parentId: "",
      headId: "",
    });
    setIsFormOpen(true);
  };

  // Open Edit Dialog
  const handleOpenEdit = (dept: Department) => {
    setFormMode("edit");
    setSelectedDept(dept);
    setFormValues({
      name: dept.name,
      description: dept.description || "",
      parentId: dept.parentId || "",
      headId: dept.headId || "",
    });
    setIsFormOpen(true);
  };

  // Form Submit Handler
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formValues.name) {
      toast.error("Please specify a department name");
      return;
    }

    try {
      if (formMode === "create") {
        await createDeptMutation.mutateAsync({
          name: formValues.name,
          description: formValues.description,
          parentId: formValues.parentId || undefined,
          headId: formValues.headId || undefined,
        });
        toast.success("Department created successfully");
      } else if (formMode === "edit" && selectedDept) {
        await updateDeptMutation.mutateAsync({
          id: selectedDept.id,
          data: {
            name: formValues.name,
            description: formValues.description,
            parentId: formValues.parentId || undefined,
            headId: formValues.headId || undefined,
          },
        });
        toast.success("Department updated successfully");
      }
      setIsFormOpen(false);
      refetch();
    } catch (err) {
      // Mock local update
      if (formMode === "create") {
        const newId = `dept-${Date.now()}`;
        const head = employees.find((e) => e.id === formValues.headId);

        const newDept: Department = {
          id: newId,
          name: formValues.name,
          description: formValues.description,
          parentId: formValues.parentId || undefined,
          headId: formValues.headId || undefined,
          head: head ? {
            id: head.id,
            firstName: head.firstName,
            lastName: head.lastName,
            email: head.email,
          } : undefined,
          employeeCount: 0,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        // If a head is selected, auto associate them to this department
        if (formValues.headId) {
          const updatedEmps = employees.map((emp) => {
            if (emp.id === formValues.headId) {
              return { ...emp, departmentId: newId };
            }
            return emp;
          });
          setEmployees(updatedEmps);
        }

        setLocalDepts([...localDepts, newDept]);
        toast.info("Created department node locally.");
      } else if (formMode === "edit" && selectedDept) {
        const head = employees.find((e) => e.id === formValues.headId);

        const updated = localDepts.map((d) => {
          if (d.id === selectedDept.id) {
            return {
              ...d,
              name: formValues.name,
              description: formValues.description,
              parentId: formValues.parentId || undefined,
              headId: formValues.headId || undefined,
              head: head ? {
                id: head.id,
                firstName: head.firstName,
                lastName: head.lastName,
                email: head.email,
              } : undefined,
              updatedAt: new Date().toISOString(),
            };
          }
          return d;
        });

        // Reassign selected head to this department
        if (formValues.headId) {
          const updatedEmps = employees.map((emp) => {
            if (emp.id === formValues.headId) {
              return { ...emp, departmentId: selectedDept.id };
            }
            return emp;
          });
          setEmployees(updatedEmps);
        }

        setLocalDepts(updated);
        toast.info("Updated department details locally.");
      }
      setIsFormOpen(false);
    }
  };

  // Delete Department Handler
  const handleDeleteDept = async (id: string) => {
    const count = employees.filter((emp) => emp.departmentId === id).length;
    if (count > 0) {
      toast.error(`Cannot delete department. There are ${count} employees currently assigned to it.`);
      return;
    }

    try {
      await deleteDeptMutation.mutateAsync(id);
      toast.success("Department removed successfully");
      refetch();
    } catch (err) {
      const updated = localDepts.filter((d) => d.id !== id);
      setLocalDepts(updated);
      toast.info("Deleted department node locally.");
    }
  };

  // Open Members Slide-over
  const handleOpenMembers = (dept: Department) => {
    setSelectedDept(dept);
    setIsMembersOpen(true);
  };

  // Handle reassigning employees
  const handleReassignEmployee = (employeeId: string, departmentId: string | null) => {
    const updated = employees.map((emp) => {
      if (emp.id === employeeId) {
        return {
          ...emp,
          departmentId: departmentId === "unassigned" ? null : departmentId,
        };
      }
      return emp;
    });

    setEmployees(updated);
    toast.success("Employee department allocation updated");
  };

  // Build recursive tree logic helper
  const renderTreeNodes = (nodes: Department[], parentId?: string, depth = 0) => {
    const children = nodes.filter((n) => n.parentId === parentId);
    if (children.length === 0) return null;

    return (
      <div className={cn("space-y-1.5", depth > 0 && "pl-6 border-l border-slate-100 ml-4.5 mt-1.5")}>
        {children.map((node) => {
          const isCollapsed = !!collapsedTreeNodes[node.id];
          const hasChildren = nodes.some((n) => n.parentId === node.id);

          return (
            <div key={node.id} className="space-y-1">
              <div className="flex items-center gap-3 p-2.5 hover:bg-slate-50 rounded-lg group transition-colors border border-transparent hover:border-slate-100 bg-white">
                
                {/* Expand toggle */}
                <button
                  onClick={() => toggleTreeNode(node.id)}
                  disabled={!hasChildren}
                  className={cn(
                    "p-1 rounded hover:bg-slate-100 text-slate-400 shrink-0",
                    !hasChildren && "opacity-0 cursor-default"
                  )}
                >
                  {isCollapsed ? <ChevronRight className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                </button>

                {/* Directory Icon */}
                <Folder className="h-4.5 w-4.5 text-indigo-500 shrink-0" />

                {/* Node info */}
                <div className="min-w-0 flex-1">
                  <span className="font-semibold text-sm text-slate-800">{node.name}</span>
                  {node.head && (
                    <span className="text-[10px] text-slate-400 ml-2 font-medium bg-slate-50 px-1.5 py-0.5 rounded">
                      Head: {node.head.firstName} {node.head.lastName}
                    </span>
                  )}
                </div>

                {/* Headcount badge */}
                <Badge className="bg-indigo-50 text-indigo-700 border-indigo-100 text-[10px] py-0 px-2 shrink-0">
                  {node.employeeCount} {node.employeeCount === 1 ? "Member" : "Members"}
                </Badge>

                {/* Actions group */}
                <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1 transition-opacity shrink-0">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleOpenMembers(node)}
                    className="h-7 px-2 text-xs font-bold text-indigo-600 hover:bg-indigo-50"
                  >
                    View Members
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleOpenEdit(node)}
                    className="h-7 w-7 p-0 text-slate-400 hover:text-indigo-600"
                  >
                    <Edit2 className="h-3.5 w-3.5" />
                  </Button>
                </div>

              </div>

              {/* Render Nested Children recursive */}
              {!isCollapsed && renderTreeNodes(nodes, node.id, depth + 1)}
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="p-6 space-y-6 w-full">
      
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-slate-900 via-indigo-950 to-indigo-900 bg-clip-text text-transparent dark:from-white dark:to-slate-300">
            Departments Directory
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Organize parent-child hierarchies, designate heads, and reassign workforce members.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            onClick={handleOpenCreate}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm"
          >
            <Plus className="h-4 w-4" />
            Add Department
          </Button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-slate-100 bg-white">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="p-3 rounded-lg bg-indigo-50 text-indigo-600">
              <Building className="h-5 w-5" />
            </div>
            <div>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block font-semibold">Departments</span>
              <h3 className="text-xl font-black text-slate-900 mt-0.5">{stats.totalDepts} Nodes</h3>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-100 bg-white">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="p-3 rounded-lg bg-indigo-50 text-indigo-600">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block font-semibold">Total Workforce</span>
              <h3 className="text-xl font-black text-slate-900 mt-0.5">{stats.totalStaff} staff</h3>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-100 bg-white">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="p-3 rounded-lg bg-amber-50 text-amber-600">
              <UserMinus className="h-5 w-5" />
            </div>
            <div>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block font-semibold">Unassigned</span>
              <h3 className="text-xl font-black text-slate-900 mt-0.5">{stats.unassigned} Employees</h3>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-100 bg-white">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="p-3 rounded-lg bg-emerald-50 text-emerald-600">
              <UserCheck className="h-5 w-5" />
            </div>
            <div>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block font-semibold">Active Heads</span>
              <h3 className="text-xl font-black text-slate-900 mt-0.5">{stats.heads} Managers</h3>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main View Grid Container */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        
        {/* Left Side Tab Buttons */}
        <div className="space-y-2">
          <Button
            variant={activeTab === "grid" ? "secondary" : "ghost"}
            onClick={() => setActiveTab("grid")}
            className={cn(
              "w-full justify-start font-semibold text-slate-700",
              activeTab === "grid" && "bg-indigo-50 text-indigo-700 hover:bg-indigo-50 hover:text-indigo-700"
            )}
          >
            <Grid className="mr-2 h-4 w-4 shrink-0" />
            Grid Overview
          </Button>
          <Button
            variant={activeTab === "tree" ? "secondary" : "ghost"}
            onClick={() => setActiveTab("tree")}
            className={cn(
              "w-full justify-start font-semibold text-slate-700",
              activeTab === "tree" && "bg-indigo-50 text-indigo-700 hover:bg-indigo-50 hover:text-indigo-700"
            )}
          >
            <GitPullRequest className="mr-2 h-4 w-4 shrink-0" />
            Hierarchy Tree View
          </Button>
          <Button
            variant={activeTab === "assignment" ? "secondary" : "ghost"}
            onClick={() => setActiveTab("assignment")}
            className={cn(
              "w-full justify-start font-semibold text-slate-700",
              activeTab === "assignment" && "bg-indigo-50 text-indigo-700 hover:bg-indigo-50 hover:text-indigo-700"
            )}
          >
            <UserCheck className="mr-2 h-4 w-4 shrink-0" />
            Staff Allocations
            {stats.unassigned > 0 && (
              <Badge className="ml-auto bg-amber-500 text-white border-0 hover:bg-amber-650 font-bold text-[10px]">
                {stats.unassigned}
              </Badge>
            )}
          </Button>
        </div>

        {/* Right Content Sheet Panels */}
        <div className="lg:col-span-3">
          
          {/* Tab 1: Grid Cards */}
          {activeTab === "grid" && (
            <div className="space-y-4">
              
              {/* Search row */}
              <div className="flex items-center gap-2 max-w-xs bg-white rounded-lg border border-slate-200 px-3 py-1.5 shadow-xs">
                <Search className="h-4 w-4 text-slate-400" />
                <input
                  placeholder="Filter departments..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-transparent border-0 text-xs focus:outline-hidden w-full text-slate-700"
                />
              </div>

              {filteredList.length === 0 ? (
                <div className="text-center py-16 bg-white border border-slate-100 rounded-xl text-slate-400">
                  <FolderOpen className="h-8 w-8 mx-auto text-slate-300 mb-2" />
                  <p className="text-xs font-semibold">No departments matching your query</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredList.map((dept) => (
                    <Card key={dept.id} className="border-slate-100 hover:border-indigo-150 transition-colors bg-white shadow-xs">
                      <CardHeader className="pb-2">
                        <div className="flex items-start justify-between">
                          <div>
                            <CardTitle className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                              {dept.name}
                            </CardTitle>
                            {dept.parent && (
                              <Badge variant="outline" className="mt-1 text-[9px] font-bold text-indigo-600 bg-indigo-50/20 border-indigo-100">
                                Parent: {dept.parent.name}
                              </Badge>
                            )}
                          </div>
                          
                          <div className="flex items-center gap-1">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleOpenEdit(dept)}
                              className="h-7 w-7 p-0 text-slate-450 hover:text-indigo-600 rounded-md"
                            >
                              <Edit2 className="h-3.5 w-3.5" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleDeleteDept(dept.id)}
                              className="h-7 w-7 p-0 text-slate-450 hover:text-rose-600 rounded-md"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </div>
                        {dept.description && (
                          <CardDescription className="text-xs text-slate-450 line-clamp-2 mt-1 leading-relaxed">
                            {dept.description}
                          </CardDescription>
                        )}
                      </CardHeader>
                      
                      <CardContent className="pt-2 pb-4 space-y-4">
                        {/* Member avatar rows and manager */}
                        <div className="flex justify-between items-center text-xs font-semibold text-slate-600 border-t border-slate-50 pt-3">
                          <div>
                            <span className="text-[10px] text-slate-400 block font-bold uppercase tracking-wider">Manager / Head</span>
                            {dept.head ? (
                              <span className="text-slate-800 text-xs mt-0.5 block font-bold">
                                {dept.head.firstName} {dept.head.lastName}
                              </span>
                            ) : (
                              <span className="text-slate-400 text-xs mt-0.5 block font-medium">Unassigned</span>
                            )}
                          </div>
                          <div className="text-right">
                            <span className="text-[10px] text-slate-400 block font-bold uppercase tracking-wider">Headcount</span>
                            <Button
                              variant="link"
                              onClick={() => handleOpenMembers(dept)}
                              className="p-0 h-auto text-indigo-600 hover:text-indigo-700 text-xs font-bold block mt-0.5"
                            >
                              {dept.employeeCount} Members <ExternalLink className="h-3 w-3 inline ml-0.5" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}

            </div>
          )}

          {/* Tab 2: Tree Hierarchy */}
          {activeTab === "tree" && (
            <Card className="border-slate-200 bg-white">
              <CardHeader>
                <CardTitle className="text-sm font-bold text-slate-800">Organogram Nesting Tree</CardTitle>
                <CardDescription className="text-xs">
                  Review sub-department reporting linkages and structural alignment.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6 bg-slate-50/50">
                {departmentsList.length === 0 ? (
                  <p className="text-xs text-slate-400 text-center">No nodes configured</p>
                ) : (
                  // Render parent nodes first (those with no parentId)
                  <div className="space-y-3">
                    {renderTreeNodes(departmentsList, undefined)}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Tab 3: Staff Assignment */}
          {activeTab === "assignment" && (
            <Card className="border-slate-200 bg-white">
              <CardHeader className="pb-3 border-b border-slate-100">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-sm font-bold text-slate-800">Workforce Assignment Portal</CardTitle>
                    <CardDescription className="text-xs">
                      Reallocate employees directly to department clusters.
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-slate-100 bg-slate-50/55 text-slate-450 text-[11px] font-bold uppercase tracking-wider">
                        <th className="py-3 px-6">Staff Member</th>
                        <th className="py-3 px-6">Current Designation</th>
                        <th className="py-3 px-6">Current Department</th>
                        <th className="py-3 px-6">Reallocate Department</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-sm text-slate-600">
                      {employees.map((emp) => {
                        const currentDept = departmentsList.find((d) => d.id === emp.departmentId);

                        return (
                          <tr key={emp.id} className="hover:bg-slate-50/30 transition-colors">
                            <td className="py-3.5 px-6">
                              <div className="flex items-center gap-3">
                                <div className="h-8 w-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-slate-700 text-xs shrink-0">
                                  {emp.firstName[0]}{emp.lastName[0]}
                                </div>
                                <div>
                                  <p className="font-semibold text-slate-900 leading-tight">
                                    {emp.firstName} {emp.lastName}
                                  </p>
                                  <p className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                                    <Mail className="h-3 w-3" />
                                    {emp.email}
                                  </p>
                                </div>
                              </div>
                            </td>
                            <td className="py-3.5 px-6 text-slate-700 text-xs font-semibold">
                              {emp.designation}
                            </td>
                            <td className="py-3.5 px-6">
                              {currentDept ? (
                                <Badge className="bg-indigo-50 text-indigo-700 border-indigo-100">
                                  {currentDept.name}
                                </Badge>
                              ) : (
                                <Badge className="bg-amber-50 text-amber-700 border-amber-100">
                                  Unassigned
                                </Badge>
                              )}
                            </td>
                            <td className="py-3.5 px-6">
                              <select
                                value={emp.departmentId || "unassigned"}
                                onChange={(e) => handleReassignEmployee(emp.id, e.target.value)}
                                className="h-8 px-2 text-xs bg-white rounded-lg border border-slate-200 focus:outline-hidden"
                              >
                                <option value="unassigned">Unassign Staff</option>
                                {departmentsList.map((d) => (
                                  <option key={d.id} value={d.id}>
                                    {d.name}
                                  </option>
                                ))}
                              </select>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}

        </div>
      </div>

      {/* Dialog 1: Create / Edit Department Form */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-md bg-white border border-slate-200 rounded-xl p-6">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-slate-900">
              {formMode === "create" ? "Add Department Node" : "Edit Department Node"}
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-400">
              Set details, parent report hierarchies, and select department heads.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleFormSubmit} className="space-y-4 py-2">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-600">Department Name</label>
              <Input
                type="text"
                placeholder="E.g., Engineering, Marketing..."
                value={formValues.name}
                onChange={(e) => setFormValues({ ...formValues, name: e.target.value })}
                required
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-600">Nesting Parent Node</label>
              <select
                value={formValues.parentId}
                onChange={(e) => setFormValues({ ...formValues, parentId: e.target.value })}
                className="w-full h-9 px-2 text-sm bg-white rounded-lg border border-slate-200 focus:outline-hidden"
              >
                <option value="">No Parent (Top-level Node)</option>
                {departmentsList
                  .filter((d) => d.id !== selectedDept?.id) // Prevent self-nesting loop
                  .map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name}
                    </option>
                  ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-600">Department Head / Manager</label>
              <select
                value={formValues.headId}
                onChange={(e) => setFormValues({ ...formValues, headId: e.target.value })}
                className="w-full h-9 px-2 text-sm bg-white rounded-lg border border-slate-200 focus:outline-hidden"
              >
                <option value="">Select Department Head</option>
                {employees.map((emp) => (
                  <option key={emp.id} value={emp.id}>
                    {emp.firstName} {emp.lastName} ({emp.designation})
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-600">Description</label>
              <Textarea
                placeholder="Core responsibilities or context of this department..."
                value={formValues.description}
                onChange={(e) => setFormValues({ ...formValues, description: e.target.value })}
                className="h-20"
              />
            </div>

            <DialogFooter className="pt-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsFormOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
                className="bg-indigo-600 text-white hover:bg-indigo-700 font-semibold"
              >
                Save Department
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Dialog 2: Department Members Audit Pop-up Sheet */}
      <Dialog open={isMembersOpen} onOpenChange={setIsMembersOpen}>
        <DialogContent className="max-w-md bg-white border border-slate-200 rounded-xl p-6">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-slate-900">
              {selectedDept?.name} Members List
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-400">
              Audit staff allocated to this node.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2 max-h-[50vh] overflow-y-auto">
            {selectedDept && employees.filter((emp) => emp.departmentId === selectedDept.id).length === 0 ? (
              <div className="text-center py-6 text-slate-400">
                <Users className="h-6 w-6 mx-auto text-slate-350 mb-2" />
                <span className="text-xs font-semibold">No staff assigned to this department node yet.</span>
              </div>
            ) : (
              selectedDept &&
              employees
                .filter((emp) => emp.departmentId === selectedDept.id)
                .map((emp) => {
                  const isManager = selectedDept.headId === emp.id;

                  return (
                    <div
                      key={emp.id}
                      className="flex items-center justify-between p-2.5 bg-slate-50 border border-slate-100 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-700 text-xs shrink-0">
                          {emp.firstName[0]}{emp.lastName[0]}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900 leading-none">
                            {emp.firstName} {emp.lastName}
                          </p>
                          <p className="text-[10px] text-slate-400 mt-1 leading-none">
                            {emp.designation}
                          </p>
                        </div>
                      </div>
                      {isManager && (
                        <Badge className="bg-emerald-50 text-emerald-700 border-emerald-100 text-[9px] font-bold">
                          Head / Lead
                        </Badge>
                      )}
                    </div>
                  );
                })
            )}
          </div>

          <DialogFooter className="pt-2">
            <Button
              type="button"
              size="sm"
              onClick={() => setIsMembersOpen(false)}
              className="bg-indigo-600 text-white hover:bg-indigo-700 font-semibold"
            >
              Done Auditing
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  );
}
