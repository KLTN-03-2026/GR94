import { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { createGoalAction, updateGoalAction } from '@/lib/action';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { Check, Target, PlusCircle, PencilSimple } from '@phosphor-icons/react';
import { IconPicker } from '@/components/ui/icon-picker';

const PREDEFINED_COLORS = [
  '#10b981', // emerald (Primary)
  '#3b82f6', // blue
  '#f59e0b', // amber
  '#ef4444', // red
  '#8b5cf6', // violet
  '#ec4899', // pink
  '#14b8a6', // teal
  '#f97316', // orange
];

export const CreateGoalModal = ({
  isOpen,
  onClose,
  onSuccess,
  initialData,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  initialData?: any;
}) => {
  const [name, setName] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [color, setColor] = useState(PREDEFINED_COLORS[0]);
  const [icon, setIcon] = useState('Target');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (initialData) {
      setName(initialData.name || '');
      setTargetAmount(initialData.targetAmount?.toString() || '');
      setColor(initialData.color || PREDEFINED_COLORS[0]);
      setIcon(initialData.icon || 'Target');
    } else {
      setName('');
      setTargetAmount('');
      setColor(PREDEFINED_COLORS[0]);
      setIcon('Target');
    }
  }, [initialData, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !targetAmount) return;

    setLoading(true);
    try {
      let res;
      if (initialData) {
        res = await updateGoalAction(initialData._id, {
          name,
          targetAmount: Number(targetAmount),
          color,
          icon,
        });
      } else {
        res = await createGoalAction({
          name,
          targetAmount: Number(targetAmount),
          color,
          icon,
        });
      }

      if (res.error || res.statusCode !== 200) {
        toast.error(res.message || 'Lỗi khi xử lý kế hoạch');
        return;
      }
      toast.success(initialData ? 'Đã cập nhật kế hoạch' : 'Đã thêm kế hoạch mới');
      onSuccess();
      onClose();
    } catch (error) {
      console.error(error);
      toast.error('Lỗi kết nối máy chủ');
    } finally {
      setLoading(false);
    }
  };

  const isEdit = !!initialData;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden border-none shadow-2xl rounded-3xl">
        <div className={cn(
          "p-6 pb-4",
          isEdit ? "bg-blue-600/5 dark:bg-blue-500/10" : "bg-emerald-600/5 dark:bg-emerald-500/10"
        )}>
          <DialogHeader>
            <div className="flex items-center gap-4 mb-1">
              <div className={cn(
                "p-3 rounded-2xl shadow-xl transition-all duration-500",
                isEdit ? "bg-blue-600 shadow-blue-200" : "bg-emerald-600 shadow-emerald-200",
                "dark:shadow-none"
              )}>
                {isEdit ? (
                  <PencilSimple size={28} color="white" weight="bold" />
                ) : (
                  <Target size={28} color="white" weight="bold" />
                )}
              </div>
              <div>
                <DialogTitle className="text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
                  {isEdit ? 'Chỉnh sửa kế hoạch' : 'Tạo kế hoạch mới'}
                </DialogTitle>
                <DialogDescription className="text-slate-500 dark:text-slate-400 font-medium">
                  {isEdit ? 'Cập nhật lại thông tin mục tiêu tích lũy' : 'Thiết lập mục tiêu tích lũy cho gia đình'}
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
        </div>

        <form onSubmit={handleSubmit} className="p-6 pt-2 space-y-6">
          <div className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Tên kế hoạch</Label>
              <Input
                id="name"
                placeholder="VD: Mua nhà, Mua xe, Tiết kiệm..."
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="h-14 bg-slate-50/80 dark:bg-slate-800/50 border-none rounded-2xl focus-visible:ring-emerald-500/20 text-lg font-bold text-slate-800 dark:text-white"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="targetAmount" className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Số tiền mục tiêu</Label>
              <div className="relative">
                <span className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 font-black text-xl">₫</span>
                <Input
                  id="targetAmount"
                  type="number"
                  min="0"
                  placeholder="0"
                  value={targetAmount}
                  onChange={(e) => setTargetAmount(e.target.value)}
                  required
                  className="pl-10 pr-4 h-16 text-3xl font-black text-slate-800 dark:text-white bg-slate-50/80 dark:bg-slate-800/50 border-none rounded-2xl focus-visible:ring-emerald-500/20 tracking-tighter"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Biểu tượng</Label>
                <div className="flex gap-2">
                  <IconPicker value={icon} onChange={setIcon} />
                  <div className="flex-1 flex items-center px-4 bg-slate-50/80 dark:bg-slate-800/50 rounded-2xl border-none text-[11px] text-slate-400 font-bold uppercase tracking-tight leading-tight">
                    Chọn icon nhận diện
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Màu sắc chủ đề</Label>
                <div className="flex flex-wrap gap-2.5">
                  {PREDEFINED_COLORS.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setColor(c)}
                      style={{ backgroundColor: c }}
                      className={cn(
                        "w-8 h-8 rounded-full flex items-center justify-center transition-all shadow-sm ring-2 ring-offset-2",
                        color === c ? "ring-slate-800 dark:ring-white scale-110 shadow-lg" : "ring-transparent hover:scale-110"
                      )}
                    >
                      {color === c && <Check weight="bold" className="w-4 h-4 text-white" />}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="pt-4 flex gap-4">
            <Button 
              type="button" 
              variant="ghost" 
              onClick={onClose}
              className="flex-1 h-14 rounded-2xl font-black text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800/50"
            >
              Hủy
            </Button>
            <Button 
              type="submit" 
              disabled={loading}
              className={cn(
                "flex-[2] h-14 text-white font-black rounded-2xl shadow-xl transition-all active:scale-95",
                isEdit ? "bg-blue-600 hover:bg-blue-700 shadow-blue-500/20" : "bg-emerald-600 hover:bg-emerald-700 shadow-emerald-500/20"
              )}
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Đang xử lý...
                </div>
              ) : (
                isEdit ? 'Cập nhật kế hoạch' : 'Xác nhận tạo kế hoạch'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

