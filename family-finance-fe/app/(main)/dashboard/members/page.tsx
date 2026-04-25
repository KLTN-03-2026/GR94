"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getMySpaceAction, changeMemberRoleAction, removeMemberAction } from "@/lib/action";
import { useAuthStore } from "@/store/auth.store";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Copy, Users, User, UserMinus, Shield, UsersThree, Star } from "@phosphor-icons/react";
import { RoleConfirmModal } from "./_components/role-confirm-modal";
import { DeleteMemberConfirmModal } from "./_components/delete-member-confirm-modal";

export default function MembersPage() {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();

  // Modals state
  const [roleModalData, setRoleModalData] = useState<{ member: any; targetRole: "parent" | "member" } | null>(null);
  const [deleteModalMember, setDeleteModalMember] = useState<any | null>(null);

  const { data: space, isLoading } = useQuery({
    queryKey: ["mySpace"],
    queryFn: async () => {
      const res = await getMySpaceAction();
      if (res?.error || (res?.statusCode && res.statusCode >= 400)) {
        throw new Error(
          Array.isArray(res?.message) ? res.message[0] : (res?.message || "Lỗi tải không gian")
        );
      }
      return res?.data || res || null; 
    },
  });

  const roleMutation = useMutation({
    mutationFn: (data: { id: string; role: "parent" | "member" }) => changeMemberRoleAction(data.id, data.role),
    onSuccess: (res) => {
      if (res.error) {
         toast.error(res.message);
         return;
      }
      toast.success("Cập nhật quyền thành công");
      setRoleModalData(null);
      queryClient.invalidateQueries({ queryKey: ["mySpace"] });
    },
    onError: () => toast.error("Có lỗi xảy ra, thử lại sau"),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => removeMemberAction(id),
    onSuccess: (res) => {
      if (res.error) {
         toast.error(res.message);
         return;
      }
      toast.success("Đã xoá thành viên khỏi không gian");
      setDeleteModalMember(null);
      queryClient.invalidateQueries({ queryKey: ["mySpace"] });
    },
    onError: () => toast.error("Có lỗi xảy ra, thử lại sau"),
  });

  const handleCopyCode = () => {
    if (space?.invitedCode) {
      navigator.clipboard.writeText(space.invitedCode);
      toast.success("Đã copy mã mời!");
    }
  };

  if (isLoading) {
    return (
      <div className="h-64 flex flex-col items-center justify-center animate-in fade-in duration-500 gap-4">
        <div className="w-10 h-10 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin" />
        <p className="text-slate-500 font-medium italic">Đang tải không gian...</p>
      </div>
    );
  }

  if (!space) {
    return (
      <div className="p-4 md:p-8 flex flex-col items-center justify-center h-64 text-slate-500">
        Bạn chưa tham gia không gian nào.
      </div>
    );
  }

  const currentSpaceMember = space.membersId?.find((m: any) => m._id === user?._id);
  const isParent = currentSpaceMember?.role === "parent" || currentSpaceMember?.role === "admin" || space.createdBy?._id === user?._id || user?.role === "parent";

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto w-full space-y-8 animate-in fade-in duration-500">
      
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-slate-800 dark:text-white tracking-tight flex items-center gap-3">
          <UsersThree size={32} className="text-emerald-500 hidden sm:block" weight="duotone" />
          <span>Quản lý gia đình</span>
        </h1>
        <p className="text-slate-500 mt-2 font-medium">
          Gắn kết tài chính, vun đắp yêu thương. Dưới đây là các thành viên trong không gian <strong className="text-emerald-600 dark:text-emerald-400">"{space.name}"</strong>
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content - Members List */}
        <div className="lg:col-span-2 space-y-6">
          <div>
            <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-4 flex items-center gap-2">
              <Users size={24} weight="duotone" className="text-blue-500" />
              Thành viên hiện tại ({space.membersId?.length || 0})
            </h2>
            
            <div className="space-y-4">
              {space.membersId?.map((member: any) => {
                const isMe = member._id === user?._id;
                 // Nhận diện Quản lý (Parent) thông qua Role hoặc là người tạo phòng
                const isMemberParent = member.role === "parent" || member.role === "admin" || member._id === space.createdBy?._id;
                return (
                  <Card key={member._id} className="p-4 md:p-5 flex flex-col sm:flex-row items-center justify-between border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-2xl md:rounded-3xl shadow-xs hover:shadow-md transition-shadow gap-4">
                    <div className="flex items-center gap-4 w-full sm:w-auto">
                      {/* Avatar Mock */}
                      <div className="h-14 w-14 rounded-full bg-linear-to-tr from-emerald-400 to-emerald-600 flex items-center justify-center text-white font-bold text-xl shrink-0">
                        {member.name.charAt(0).toUpperCase()}
                      </div>
                      
                      <div className="flex flex-col">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-800 dark:text-slate-100 text-[15px]">{member.name} {isMe ? "(Bạn)" : ""}</span>
                          {isMemberParent ? (
                            <Badge variant="outline" className="bg-amber-50 text-amber-600 border-amber-200 dark:bg-amber-500/10 dark:border-amber-500/20 text-[10px] px-1.5 h-5 uppercase tracking-wider">
                              Quản lý
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="bg-slate-50 text-slate-500 border-slate-200 dark:bg-slate-800 dark:border-slate-700 text-[10px] px-1.5 h-5 uppercase tracking-wider">
                              Thành viên
                            </Badge>
                          )}
                        </div>
                        <span className="text-sm text-slate-500 dark:text-slate-400 font-medium">#{member._id.substring(member._id.length - 6).toUpperCase()}</span>
                      </div>
                    </div>

                    {/* Actions (Only Parent can see, but cannot operate on themselves) */}
                    {isParent && !isMe && (
                      <div className="flex items-center gap-2 w-full sm:w-auto mt-2 sm:mt-0 pt-3 sm:pt-0 border-t sm:border-0 border-slate-100 dark:border-slate-800">
                        {isMemberParent ? (
                           <Button 
                             variant="outline" 
                             className="flex-1 sm:flex-none border-amber-200 text-amber-600 hover:bg-amber-50 dark:border-amber-500/30 dark:hover:bg-amber-500/10 rounded-xl h-10"
                             onClick={() => setRoleModalData({ member, targetRole: "member" })}
                           >
                            <Shield size={16} className="mr-2" />
                            Huỷ Quản lý
                           </Button>
                        ) : (
                           <Button 
                             variant="outline"
                             className="flex-1 sm:flex-none border-blue-200 text-blue-600 hover:bg-blue-50 dark:border-blue-500/30 dark:hover:bg-blue-500/10 rounded-xl h-10"
                             onClick={() => setRoleModalData({ member, targetRole: "parent" })}
                           >
                             <Star size={16} className="mr-2" />
                             Thăng Cấp
                           </Button>
                        )}
                        
                        <Button 
                          variant="ghost" 
                          className="bg-rose-50 text-rose-600 hover:bg-rose-100 hover:text-rose-700 dark:bg-rose-500/10 dark:hover:bg-rose-500/20 rounded-xl h-10 px-3 shrink-0"
                          onClick={() => setDeleteModalMember(member)}
                        >
                          <UserMinus size={18} weight="bold" />
                        </Button>
                      </div>
                    )}
                  </Card>
                );
              })}
            </div>
          </div>
        </div>

        {/* Sidebar - Invite Area */}
        <div className="space-y-6">
          <Card className="bg-linear-to-br from-emerald-600 to-emerald-800 text-white border-0 shadow-xl shadow-emerald-900/20 rounded-3xl p-6 relative overflow-hidden">
            {/* Decoration */}
            <div className="absolute top-0 right-0 p-8 opacity-10">
              <UsersThree size={120} weight="duotone" />
            </div>

            <div className="relative z-10">
              <h3 className="text-xl font-bold mb-2">Mời thành viên mới</h3>
              <p className="text-emerald-100/90 text-sm font-medium mb-6 leading-relaxed">
                Chia sẻ mã mời này với người thân (vợ/chồng hoặc con cái) để họ có thể tham gia vào không gian gia đình của bạn.
              </p>

              <div className="bg-emerald-950/40 p-4 rounded-2xl border border-emerald-500/30 backdrop-blur-md flex flex-col items-center justify-center text-center gap-3">
                <span className="text-xs text-emerald-300 font-bold uppercase tracking-widest">Mã chia sẻ</span>
                <span className="font-mono text-4xl font-bold tracking-widest text-emerald-50">{space.invitedCode}</span>
                <Button 
                   onClick={handleCopyCode}
                   className="mt-2 w-full bg-white text-emerald-800 hover:bg-emerald-50 active:scale-95 transition-all font-bold rounded-xl"
                >
                  <Copy size={18} className="mr-2" weight="bold" />
                  Sao chép mã
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </div>

      <RoleConfirmModal 
        member={roleModalData?.member}
        isOpen={!!roleModalData}
        targetRole={roleModalData?.targetRole || "member"}
        isLoading={roleMutation.isPending}
        onClose={() => setRoleModalData(null)}
        onConfirm={() => {
           if(roleModalData) roleMutation.mutate({ id: roleModalData.member._id, role: roleModalData.targetRole });
        }}
      />

      <DeleteMemberConfirmModal 
        member={deleteModalMember}
        isOpen={!!deleteModalMember}
        isLoading={deleteMutation.isPending}
        onClose={() => setDeleteModalMember(null)}
        onConfirm={() => {
           if(deleteModalMember) deleteMutation.mutate(deleteModalMember._id);
        }}
      />
    </div>
  );
}