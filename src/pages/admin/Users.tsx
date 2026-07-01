import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import AdminLayout from "@/layouts/AdminLayout";
import { useAdmin } from "@/hooks/useAdmin";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, Shield, User, Loader2, Calendar, Mail } from "lucide-react";

interface UserProfile {
    id: string;
    email: string;
    full_name: string | null;
    avatar_url: string | null;
    bio: string | null;
    created_at: string | null;
    role: "admin" | "user";
}

const Users = () => {
    const { isAdmin, loading: adminLoading } = useAdmin();
    const navigate = useNavigate();
    const { toast } = useToast();

    const [users, setUsers] = useState<UserProfile[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [roleFilter, setRoleFilter] = useState<"all" | "admin" | "user">("all");
    const [togglingId, setTogglingId] = useState<string | null>(null);
    const [currentUserId, setCurrentUserId] = useState<string | null>(null);

    const fetchUsers = useCallback(async () => {
        try {
            setLoading(true);
            const [profilesRes, rolesRes] = await Promise.all([
                supabase
                    .from("profiles")
                    .select("*")
                    .order("created_at", { ascending: false }),
                supabase
                    .from("user_roles")
                    .select("*")
            ]);

            if (profilesRes.error) throw profilesRes.error;
            if (rolesRes.error) throw rolesRes.error;

            const rolesMap = new Map(rolesRes.data?.map((r) => [r.user_id, r.role]) || []);
            
            const formattedUsers: UserProfile[] = (profilesRes.data || []).map((profile) => ({
                id: profile.id,
                email: profile.email,
                full_name: profile.full_name,
                avatar_url: profile.avatar_url,
                bio: profile.bio,
                created_at: profile.created_at,
                role: (rolesMap.get(profile.id) as "admin" | "user") || "user"
            }));

            setUsers(formattedUsers);
        } catch (error) {
            console.error("Error fetching users:", error);
            toast({
                variant: "destructive",
                title: "Error",
                description: "Failed to load user accounts.",
            });
        } finally {
            setLoading(false);
        }
    }, [toast]);

    useEffect(() => {
        if (!adminLoading && !isAdmin) {
            navigate("/");
            toast({
                variant: "destructive",
                title: "Access Denied",
                description: "You don't have permission to access this page.",
            });
        }
    }, [isAdmin, adminLoading, navigate, toast]);

    useEffect(() => {
        if (isAdmin) {
            const init = async () => {
                const { data: { user } } = await supabase.auth.getUser();
                if (user) {
                    setCurrentUserId(user.id);
                }
                await fetchUsers();
            };
            init();
        }
    }, [isAdmin, fetchUsers]);

    const toggleRole = async (userId: string, currentRole: "admin" | "user") => {
        if (userId === currentUserId) {
            toast({
                variant: "destructive",
                title: "Action Prevented",
                description: "You cannot change your own admin role status.",
            });
            return;
        }

        setTogglingId(userId);
        try {
            if (currentRole === "admin") {
                // Revoke admin role using RPC
                // @ts-expect-error - RPC function is defined in database schema but not client types
                const { error } = await supabase.rpc("revoke_admin_role", { _user_id: userId });
                if (error) throw error;

                toast({
                    title: "Role Revoked",
                    description: "Admin role has been successfully revoked.",
                });
            } else {
                // Grant admin role using RPC
                // @ts-expect-error - RPC function is defined in database schema but not client types
                const { error } = await supabase.rpc("grant_admin_role", { _user_id: userId });
                if (error) throw error;

                toast({
                    title: "Role Granted",
                    description: "Admin role has been successfully granted.",
                });
            }
            await fetchUsers();
        } catch (error) {
            console.error("Error toggling admin role:", error);
            toast({
                variant: "destructive",
                title: "Error",
                description: "Failed to modify user role. Please try again.",
            });
        } finally {
            setTogglingId(null);
        }
    };

    // Filter and search users
    const filteredUsers = users.filter((user) => {
        const nameMatch = (user.full_name || "").toLowerCase().includes(searchQuery.toLowerCase());
        const emailMatch = (user.email || "").toLowerCase().includes(searchQuery.toLowerCase());
        const searchMatch = nameMatch || emailMatch;

        if (roleFilter === "all") return searchMatch;
        return searchMatch && user.role === roleFilter;
    });

    // Show loading state when checking admin status
    if (adminLoading) {
        return null;
    }

    // Show nothing if not admin
    if (!isAdmin) {
        return null;
    }

    return (
        <AdminLayout>
            <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Users</h1>
                        <p className="text-muted-foreground">Manage user roles and permissions</p>
                    </div>
                </div>

                <Card className="border-border">
                    <CardHeader className="pb-3">
                        <CardTitle>User Accounts</CardTitle>
                        <CardDescription>
                            Total users registered on the platform
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {/* Filters and Search */}
                        <div className="flex flex-col md:flex-row gap-4 mb-6">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Search by name or email..."
                                    className="pl-9 bg-background border-input"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                            <div className="flex gap-2">
                                <Button
                                    variant={roleFilter === "all" ? "default" : "outline"}
                                    onClick={() => setRoleFilter("all")}
                                    size="sm"
                                >
                                    All
                                </Button>
                                <Button
                                    variant={roleFilter === "admin" ? "default" : "outline"}
                                    onClick={() => setRoleFilter("admin")}
                                    size="sm"
                                    className="flex items-center gap-1.5"
                                >
                                    <Shield className="h-3.5 w-3.5" />
                                    Admins
                                </Button>
                                <Button
                                    variant={roleFilter === "user" ? "default" : "outline"}
                                    onClick={() => setRoleFilter("user")}
                                    size="sm"
                                    className="flex items-center gap-1.5"
                                >
                                    <User className="h-3.5 w-3.5" />
                                    Regular Users
                                </Button>
                            </div>
                        </div>

                        {/* Users Table */}
                        {loading ? (
                            <div className="flex items-center justify-center py-12">
                                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                            </div>
                        ) : filteredUsers.length === 0 ? (
                            <div className="text-center py-12 border rounded-lg border-dashed bg-muted/20">
                                <User className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
                                <p className="text-base font-semibold">No users found</p>
                                <p className="text-sm text-muted-foreground">
                                    Try adjusting your search filters.
                                </p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto border rounded-lg">
                                <Table>
                                    <TableHeader>
                                        <TableRow className="bg-muted/40 hover:bg-muted/40">
                                            <TableHead className="w-[80px]">Avatar</TableHead>
                                            <TableHead>User Details</TableHead>
                                            <TableHead>Joined</TableHead>
                                            <TableHead>Role</TableHead>
                                            <TableHead className="text-right">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {filteredUsers.map((u) => (
                                            <TableRow key={u.id} className="hover:bg-muted/10 transition-colors">
                                                <TableCell>
                                                    {u.avatar_url ? (
                                                        <img
                                                            src={u.avatar_url}
                                                            alt={u.full_name || u.email}
                                                            className="h-10 w-10 rounded-full object-cover border"
                                                        />
                                                    ) : (
                                                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                                                            {(u.full_name || u.email)[0].toUpperCase()}
                                                        </div>
                                                    )}
                                                </TableCell>
                                                <TableCell className="max-w-[200px]">
                                                    <div className="font-semibold truncate">
                                                        {u.full_name || "No name set"}
                                                    </div>
                                                    <div className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5 truncate">
                                                        <Mail className="h-3 w-3" />
                                                        {u.email}
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="text-sm text-muted-foreground flex items-center gap-1.5">
                                                        <Calendar className="h-3.5 w-3.5" />
                                                        {u.created_at
                                                            ? new Date(u.created_at).toLocaleDateString("en-US", {
                                                                  year: "numeric",
                                                                  month: "short",
                                                                  day: "numeric",
                                                              })
                                                            : "Unknown"}
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    {u.role === "admin" ? (
                                                        <Badge variant="default" className="bg-primary hover:bg-primary flex items-center gap-1 w-fit">
                                                            <Shield className="h-3 w-3" />
                                                            Admin
                                                        </Badge>
                                                    ) : (
                                                        <Badge variant="secondary" className="flex items-center gap-1 w-fit">
                                                            <User className="h-3 w-3" />
                                                            User
                                                        </Badge>
                                                    )}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    {u.id === currentUserId ? (
                                                        <span className="text-xs text-muted-foreground italic mr-2">You (Current Admin)</span>
                                                    ) : (
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            disabled={togglingId === u.id}
                                                            onClick={() => toggleRole(u.id, u.role)}
                                                        >
                                                            {togglingId === u.id ? (
                                                                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                                            ) : u.role === "admin" ? (
                                                                "Demote to User"
                                                            ) : (
                                                                "Promote to Admin"
                                                            )}
                                                        </Button>
                                                    )}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AdminLayout>
    );
};

export default Users;