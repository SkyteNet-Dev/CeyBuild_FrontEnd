"use client";

import { useEffect, useState, useMemo } from "react";
import api from "@/lib/axios";
import AdminRoute from "@/components/AdminRoute";
import toast from "react-hot-toast";
import { useI18n } from "@/i18n/I18nProvider";
import { HiOutlineSearch, HiOutlineUserGroup, HiOutlineCheckCircle, HiOutlineBan } from "react-icons/hi";
import { HiOutlineArrowPath } from "react-icons/hi2";

interface User {
  id: string;
  fullName: string;
  email: string;
  role: string;
  status: string;
  phoneNumber?: string;
  createdAt?: string;
}

export default function UsersManagementPage() {
  const { t } = useI18n();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const fetchUsers = async () => {
    setLoading(true);
    setError(false);
    try {
      const response = await api.get("/users/all");
      const data = response.data.data || response.data;
      setUsers(Array.isArray(data) ? data : []);
    } catch {
      setError(true);
      toast.error(t("admin.failedToFetchUsers"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const matchesSearch =
        user.fullName?.toLowerCase().includes(search.toLowerCase()) ||
        user.email?.toLowerCase().includes(search.toLowerCase());
      const matchesRole = roleFilter === "ALL" || user.role === roleFilter;
      const matchesStatus = statusFilter === "ALL" || user.status === statusFilter;
      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [users, search, roleFilter, statusFilter]);

  const stats = useMemo(() => ({
    total: users.length,
    active: users.filter((u) => u.status === "ACTIVE").length,
    blocked: users.filter((u) => u.status === "BLOCKED").length,
  }), [users]);

  const handleToggleBlock = async (userId: string, currentStatus: string) => {
    const action = currentStatus === "ACTIVE" ? "block" : "unblock";
    if (!confirm(t(action === "block" ? "admin.confirmBlock" : "admin.confirmUnblock"))) return;
    try {
      await api.put(`/admin/users/${userId}/${action}`);
      toast.success(t("admin.userActionSuccess", { action }));
      fetchUsers();
    } catch {
      toast.error(t("admin.failedToUpdateUser"));
    }
  };

  const formatDate = (date?: string) => {
    if (!date) return "-";
    return new Date(date).toLocaleDateString();
  };

  if (loading) {
    return (
      <AdminRoute>
        <div className="flex h-[60vh] items-center justify-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      </AdminRoute>
    );
  }

  if (error) {
    return (
      <AdminRoute>
        <div className="flex flex-col items-center justify-center h-[60vh] space-y-4">
          <p className="text-gray-500">{t("admin.errorLoading")}</p>
          <button onClick={fetchUsers} className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-xl hover:bg-primary-hover transition-colors text-sm font-medium">
            <HiOutlineArrowPath className="w-4 h-4" />
            {t("admin.retry")}
          </button>
        </div>
      </AdminRoute>
    );
  }

  return (
    <AdminRoute>
      <div className="space-y-6 sm:space-y-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">{t("admin.usersManagement")}</h1>
          <p className="text-gray-500 mt-1 sm:mt-2 text-sm sm:text-base">{t("admin.usersDesc")}</p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
          {[
            { label: t("admin.totalUsers"), value: stats.total, icon: <HiOutlineUserGroup className="w-5 h-5 sm:w-6 sm:h-6 text-blue-500" />, bg: "bg-blue-50" },
            { label: t("admin.activeUsers"), value: stats.active, icon: <HiOutlineCheckCircle className="w-5 h-5 sm:w-6 sm:h-6 text-green-500" />, bg: "bg-green-50" },
            { label: t("admin.blockedUsers"), value: stats.blocked, icon: <HiOutlineBan className="w-5 h-5 sm:w-6 sm:h-6 text-red-500" />, bg: "bg-red-50" },
          ].map((stat, idx) => (
            <div key={idx} className="bg-white p-4 sm:p-5 rounded-2xl border border-gray-100 card-shadow flex items-center gap-3">
              <div className={`p-2.5 sm:p-3 rounded-xl ${stat.bg}`}>{stat.icon}</div>
              <div>
                <p className="text-xs sm:text-sm font-medium text-gray-500">{stat.label}</p>
                <h3 className="text-xl sm:text-2xl font-bold text-gray-900">{stat.value}</h3>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 card-shadow">
          <div className="p-4 sm:p-5 border-b border-gray-100">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <HiOutlineSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder={t("admin.searchPlaceholder")}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                />
              </div>
              <div className="flex gap-2">
                <select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                  className="px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary/20"
                >
                  <option value="ALL">{t("admin.allRoles")}</option>
                  <option value="ADMIN">{t("admin.adminRole")}</option>
                  <option value="WORKER">{t("admin.workerRole")}</option>
                  <option value="CUSTOMER">{t("admin.customerRole")}</option>
                </select>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary/20"
                >
                  <option value="ALL">{t("admin.allStatuses")}</option>
                  <option value="ACTIVE">{t("admin.activeUsers")}</option>
                  <option value="BLOCKED">{t("admin.blockedUsers")}</option>
                </select>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/80 border-b border-gray-100 text-xs sm:text-sm font-medium text-gray-500 uppercase tracking-wider">
                  <th className="px-4 sm:px-6 py-3 sm:py-4">{t("admin.name")}</th>
                  <th className="px-4 sm:px-6 py-3 sm:py-4 hidden sm:table-cell">{t("admin.email")}</th>
                  <th className="px-4 sm:px-6 py-3 sm:py-4">{t("admin.role")}</th>
                  <th className="px-4 sm:px-6 py-3 sm:py-4">{t("admin.status")}</th>
                  <th className="px-4 sm:px-6 py-3 sm:py-4 text-right">{t("admin.actions")}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-4 sm:px-6 py-3 sm:py-4">
                      <div className="font-semibold text-gray-900 text-sm">{user.fullName}</div>
                      <div className="text-xs text-gray-500 sm:hidden">{user.email}</div>
                    </td>
                    <td className="px-4 sm:px-6 py-3 sm:py-4 text-gray-600 text-sm hidden sm:table-cell">{user.email}</td>
                    <td className="px-4 sm:px-6 py-3 sm:py-4">
                      <span className="inline-block px-2.5 py-1 bg-gray-100 text-gray-700 text-xs font-bold rounded-full">
                        {user.role}
                      </span>
                    </td>
                    <td className="px-4 sm:px-6 py-3 sm:py-4">
                      <span className={`inline-block px-2.5 py-1 text-xs font-bold rounded-full ${
                        user.status === "ACTIVE" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                      }`}>
                        {user.status}
                      </span>
                    </td>
                    <td className="px-4 sm:px-6 py-3 sm:py-4 text-right">
                      <button
                        onClick={() => handleToggleBlock(user.id, user.status)}
                        className={`px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium rounded-xl transition-colors ${
                          user.status === "ACTIVE"
                            ? "text-red-600 bg-red-50 hover:bg-red-100"
                            : "text-green-600 bg-green-50 hover:bg-green-100"
                        }`}
                      >
                        {user.status === "ACTIVE" ? t("admin.block") : t("admin.unblock")}
                      </button>
                    </td>
                  </tr>
                ))}
                {filteredUsers.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-gray-500 text-sm">
                      {t("admin.noResults")}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminRoute>
  );
}
