import React, { useState, useMemo } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "./popover";
import { CATEGORY_ICONS } from "@/lib/constants/icons";
import { IconRenderer } from "./icon-renderer";
import { Button } from "./button";
import { ScrollArea } from "./scroll-area";
import { MagnifyingGlass } from "@phosphor-icons/react";
import { Input } from "./input";

interface IconPickerProps {
  value: string;
  onChange: (iconName: string) => void;
}

export function IconPicker({ value, onChange }: IconPickerProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const filteredGroups = useMemo(() => {
    if (!search.trim()) return CATEGORY_ICONS;
    const lowerSearch = search.toLowerCase();
    
    return CATEGORY_ICONS.map(group => ({
      ...group,
      icons: group.icons.filter(
        icon => 
          icon.name.toLowerCase().includes(lowerSearch) || 
          icon.label.toLowerCase().includes(lowerSearch)
      )
    })).filter(group => group.icons.length > 0);
  }, [search]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-[80px] h-12 flex items-center justify-center bg-slate-50 hover:bg-slate-100 dark:bg-slate-900/50 dark:hover:bg-slate-800"
        >
          {value ? (
            <IconRenderer icon={value} size={28} className="text-slate-700 dark:text-slate-300" />
          ) : (
            <IconRenderer icon="Star" size={28} className="text-slate-400" />
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[320px] p-0" align="start">
        <div className="p-3 border-b border-slate-100 dark:border-slate-800">
          <div className="relative">
            <MagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <Input
              placeholder="Tìm kiếm icon..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 h-9"
            />
          </div>
        </div>
        
        <ScrollArea className="h-[300px]">
          <div className="p-3 space-y-4">
            {filteredGroups.length === 0 ? (
              <p className="text-sm text-center text-slate-500 py-4">Không tìm thấy icon nào.</p>
            ) : (
              filteredGroups.map((group, idx) => (
                <div key={idx} className="space-y-2">
                  <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    {group.group}
                  </h4>
                  <div className="grid grid-cols-5 gap-2">
                    {group.icons.map((icon) => (
                      <button
                        key={icon.name}
                        onClick={() => {
                          if (typeof onChange === 'function') {
                            onChange(icon.name);
                          }
                          setOpen(false);
                          setSearch("");
                        }}
                        className={`p-2 flex flex-col items-center justify-center rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors ${
                          value === icon.name ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400 ring-1 ring-emerald-500/50" : "text-slate-600 dark:text-slate-400"
                        }`}
                        title={icon.label}
                      >
                        <IconRenderer icon={icon.name} size={24} />
                      </button>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}
