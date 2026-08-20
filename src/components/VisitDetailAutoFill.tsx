// ==========================================
// VisitDetailAutoFill — ตัวช่วยสร้างข้อความรายละเอียดการเข้าเยี่ยมอัตโนมัติ
// ==========================================
import React, { useState, useEffect } from 'react';

interface Props {
  companyName?: string;
  currentValue: string;
  onChange: (value: string) => void;
}

interface CustomOptions {
  roles: string[];
  brands: string[];
  machines: string[];
}

const DEFAULT_ROLES = [
  'ตัวแทนจำหน่าย',
  'ผู้ผลิต',
  'ผู้นำเข้า',
  'ผู้ให้บริการ/ศูนย์ซ่อมบำรุง',
  'ผู้เช่า/ผู้ใช้งานเครื่องจักร',
];

const DEFAULT_BRANDS = [
  'Shangair',
  'LEPO',
  'Komatsu',
  'Caterpillar',
  'Hitachi',
  'Volvo',
  'Kobelco',
];

const DEFAULT_MACHINES = [
  'ปั๊มลม',
  'เครื่องเป่าขวด',
  'เครื่องบรรจุ',
  'เครื่องแพ็คซีล',
  'รถขุด',
  'รถฟอร์คลิฟท์',
  'รถเครน',
  'รถตัก',
];

const STORAGE_KEY = 'visit_yard_custom_options_v1';

export default function VisitDetailAutoFill({ companyName = '', currentValue, onChange }: Props) {
  // Option Lists (Default + User Custom)
  const [roles, setRoles] = useState<string[]>(DEFAULT_ROLES);
  const [brands, setBrands] = useState<string[]>(DEFAULT_BRANDS);
  const [machines, setMachines] = useState<string[]>(DEFAULT_MACHINES);

  // Selected State
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [selectedMachines, setSelectedMachines] = useState<string[]>([]);

  // Input State for adding new options
  const [newRoleInput, setNewRoleInput] = useState('');
  const [newBrandInput, setNewBrandInput] = useState('');
  const [newMachineInput, setNewMachineInput] = useState('');

  // Control UI accordion expand
  const [isExpanded, setIsExpanded] = useState(true);

  // Load custom options from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed: CustomOptions = JSON.parse(saved);
        if (parsed.roles) setRoles(Array.from(new Set([...DEFAULT_ROLES, ...parsed.roles])));
        if (parsed.brands) setBrands(Array.from(new Set([...DEFAULT_BRANDS, ...parsed.brands])));
        if (parsed.machines) setMachines(Array.from(new Set([...DEFAULT_MACHINES, ...parsed.machines])));
      }
    } catch (e) {
      console.warn('Failed to load custom options from localStorage', e);
    }
  }, []);

  // Save options to localStorage when lists update
  const saveOptionsToStorage = (updatedRoles: string[], updatedBrands: string[], updatedMachines: string[]) => {
    try {
      const customRoles = updatedRoles.filter((r) => !DEFAULT_ROLES.includes(r));
      const customBrands = updatedBrands.filter((b) => !DEFAULT_BRANDS.includes(b));
      const customMachines = updatedMachines.filter((m) => !DEFAULT_MACHINES.includes(m));

      const payload: CustomOptions = {
        roles: customRoles,
        brands: customBrands,
        machines: customMachines,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    } catch (e) {
      console.warn('Failed to save custom options to localStorage', e);
    }
  };

  // Toggle Selection Handlers
  const toggleRole = (item: string) => {
    setSelectedRoles((prev) =>
      prev.includes(item) ? prev.filter((i) => i !== item) : [...prev, item]
    );
  };

  const toggleBrand = (item: string) => {
    setSelectedBrands((prev) =>
      prev.includes(item) ? prev.filter((i) => i !== item) : [...prev, item]
    );
  };

  const toggleMachine = (item: string) => {
    setSelectedMachines((prev) =>
      prev.includes(item) ? prev.filter((i) => i !== item) : [...prev, item]
    );
  };

  // Add Custom Options
  const handleAddRole = (e: React.FormEvent) => {
    e.preventDefault();
    const val = newRoleInput.trim();
    if (!val || roles.includes(val)) return;
    const next = [...roles, val];
    setRoles(next);
    setSelectedRoles((prev) => [...prev, val]);
    setNewRoleInput('');
    saveOptionsToStorage(next, brands, machines);
  };

  const handleAddBrand = (e: React.FormEvent) => {
    e.preventDefault();
    const val = newBrandInput.trim();
    if (!val || brands.includes(val)) return;
    const next = [...brands, val];
    setBrands(next);
    setSelectedBrands((prev) => [...prev, val]);
    setNewBrandInput('');
    saveOptionsToStorage(roles, next, machines);
  };

  const handleAddMachine = (e: React.FormEvent) => {
    e.preventDefault();
    const val = newMachineInput.trim();
    if (!val || machines.includes(val)) return;
    const next = [...machines, val];
    setMachines(next);
    setSelectedMachines((prev) => [...prev, val]);
    setNewMachineInput('');
    saveOptionsToStorage(roles, brands, next);
  };

  // Generate Automated Summary Sentence
  const generateText = () => {
    const parts: string[] = [];

    if (companyName) {
      parts.push(`${companyName}`);
    }

    if (selectedRoles.length > 0) {
      parts.push(`เป็น${selectedRoles.join(' และ ')}`);
    }

    if (selectedBrands.length > 0) {
      parts.push(`สินค้าและอุปกรณ์แบรนด์ ${selectedBrands.join(' / ')}`);
    }

    if (selectedMachines.length > 0) {
      parts.push(`โดยมีเครื่องจักรหลัก ได้แก่ ${selectedMachines.join(', ')}`);
    }

    if (parts.length === 0) return '';

    return parts.join(' ');
  };

  const generatedText = generateText();

  // Apply Handlers
  const handleReplaceText = () => {
    if (!generatedText) return;
    onChange(generatedText);
  };

  const handleAppendText = () => {
    if (!generatedText) return;
    if (!currentValue.trim()) {
      onChange(generatedText);
    } else {
      onChange(`${currentValue.trim()}\n\n${generatedText}`);
    }
  };

  const handleClearSelections = () => {
    setSelectedRoles([]);
    setSelectedBrands([]);
    setSelectedMachines([]);
  };

  return (
    <div className="border border-blue-200 bg-blue-50/40 rounded-2xl p-4 transition-all">
      {/* Header Bar */}
      <div className="flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-2 text-left font-bold text-blue-900 hover:text-blue-700 transition-colors"
        >
          <span className="text-xl">✨</span>
          <div>
            <div className="text-sm sm:text-base font-extrabold flex items-center gap-2">
              <span>ตัวช่วยระบุรายละเอียดการเข้าเยี่ยม (ติ๊กสร้างข้อความอัตโนมัติ)</span>
            </div>
            <p className="text-xs font-normal text-slate-500">
              เลือกบทบาท, Brand และเครื่องจักร เพื่อสร้างข้อความสรุปใส่ในรายละเอียด
            </p>
          </div>
        </button>

        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className="px-3 py-1.5 rounded-xl bg-white border border-blue-200 text-blue-700 text-xs font-bold hover:bg-blue-50 shadow-2xs"
        >
          {isExpanded ? 'ย่อซ่อน 🔼' : 'แสดงตัวเลือก 🔽'}
        </button>
      </div>

      {/* Expanded Options Content */}
      {isExpanded && (
        <div className="mt-4 pt-4 border-t border-blue-200/80 space-y-4 animate-in fade-in duration-150">
          {/* 1. ตัวแทน / ผู้ผลิต */}
          <div className="bg-white rounded-xl p-3.5 border border-slate-200 shadow-2xs">
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded-md font-extrabold">1</span>
                <span>บทบาท / ประเภทธุรกิจ (ตัวแทน, ผู้ผลิต ฯลฯ)</span>
              </label>
              <span className="text-[10px] text-slate-400">เลือกได้หลายข้อ</span>
            </div>

            <div className="flex flex-wrap gap-2 mb-3">
              {roles.map((r) => {
                const isSelected = selectedRoles.includes(r);
                return (
                  <button
                    key={r}
                    type="button"
                    onClick={() => toggleRole(r)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all flex items-center gap-1.5 ${
                      isSelected
                        ? 'bg-blue-600 text-white border-blue-600 font-bold shadow-xs'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100 hover:border-blue-300'
                    }`}
                  >
                    <span>{isSelected ? '✓' : '+'}</span>
                    <span>{r}</span>
                  </button>
                );
              })}
            </div>

            {/* Add Custom Role */}
            <form onSubmit={handleAddRole} className="flex gap-2">
              <input
                type="text"
                value={newRoleInput}
                onChange={(e) => setNewRoleInput(e.target.value)}
                placeholder="+ เพิ่มบทบาท/ประเภทใหม่..."
                className="flex-1 px-3 py-1.5 text-xs border border-slate-200 rounded-lg bg-slate-50 focus:bg-white focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              />
              <button
                type="submit"
                className="px-3 py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 rounded-lg text-xs font-bold transition-all"
              >
                + เพิ่ม
              </button>
            </form>
          </div>

          {/* 2. Brand */}
          <div className="bg-white rounded-xl p-3.5 border border-slate-200 shadow-2xs">
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <span className="bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded-md font-extrabold">2</span>
                <span>แบรนด์ / ยี่ห้อ (Brand)</span>
              </label>
              <span className="text-[10px] text-slate-400">เลือกได้หลายข้อ</span>
            </div>

            <div className="flex flex-wrap gap-2 mb-3">
              {brands.map((b) => {
                const isSelected = selectedBrands.includes(b);
                return (
                  <button
                    key={b}
                    type="button"
                    onClick={() => toggleBrand(b)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all flex items-center gap-1.5 ${
                      isSelected
                        ? 'bg-indigo-600 text-white border-indigo-600 font-bold shadow-xs'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100 hover:border-indigo-300'
                    }`}
                  >
                    <span>{isSelected ? '✓' : '+'}</span>
                    <span>{b}</span>
                  </button>
                );
              })}
            </div>

            {/* Add Custom Brand */}
            <form onSubmit={handleAddBrand} className="flex gap-2">
              <input
                type="text"
                value={newBrandInput}
                onChange={(e) => setNewBrandInput(e.target.value)}
                placeholder="+ เพิ่ม Brand ใหม่ (เช่น LEPO, Volvo)..."
                className="flex-1 px-3 py-1.5 text-xs border border-slate-200 rounded-lg bg-slate-50 focus:bg-white focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
              />
              <button
                type="submit"
                className="px-3 py-1.5 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200 rounded-lg text-xs font-bold transition-all"
              >
                + เพิ่ม
              </button>
            </form>
          </div>

          {/* 3. เครื่องจักร */}
          <div className="bg-white rounded-xl p-3.5 border border-slate-200 shadow-2xs">
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-md font-extrabold">3</span>
                <span>ประเภทเครื่องจักร (ปั๊มลม, เครื่องเป่าขวด, เครื่องบรรจุ ฯลฯ)</span>
              </label>
              <span className="text-[10px] text-slate-400">เลือกได้หลายข้อ</span>
            </div>

            <div className="flex flex-wrap gap-2 mb-3">
              {machines.map((m) => {
                const isSelected = selectedMachines.includes(m);
                return (
                  <button
                    key={m}
                    type="button"
                    onClick={() => toggleMachine(m)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all flex items-center gap-1.5 ${
                      isSelected
                        ? 'bg-emerald-600 text-white border-emerald-600 font-bold shadow-xs'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100 hover:border-emerald-300'
                    }`}
                  >
                    <span>{isSelected ? '✓' : '+'}</span>
                    <span>{m}</span>
                  </button>
                );
              })}
            </div>

            {/* Add Custom Machine */}
            <form onSubmit={handleAddMachine} className="flex gap-2">
              <input
                type="text"
                value={newMachineInput}
                onChange={(e) => setNewMachineInput(e.target.value)}
                placeholder="+ เพิ่มประเภทเครื่องจักรใหม่..."
                className="flex-1 px-3 py-1.5 text-xs border border-slate-200 rounded-lg bg-slate-50 focus:bg-white focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500"
              />
              <button
                type="submit"
                className="px-3 py-1.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 rounded-lg text-xs font-bold transition-all"
              >
                + เพิ่ม
              </button>
            </form>
          </div>

          {/* Real-time Generated Text Preview & Action Buttons */}
          {generatedText ? (
            <div className="bg-slate-900 text-white rounded-xl p-4 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span className="font-bold text-blue-400 flex items-center gap-1">
                  ⚡ ข้อความอัตโนมัติที่สร้างจากตัวเลือก:
                </span>
                <button
                  type="button"
                  onClick={handleClearSelections}
                  className="text-slate-400 hover:text-white underline text-[11px]"
                >
                  ล้างตัวเลือกทั้งหมด
                </button>
              </div>

              <div className="bg-slate-800/90 text-slate-100 p-3 rounded-lg text-xs sm:text-sm leading-relaxed border border-slate-700/80 font-mono">
                {generatedText}
              </div>

              <div className="flex flex-wrap gap-2 pt-1">
                <button
                  type="button"
                  onClick={handleReplaceText}
                  className="flex-1 min-h-[38px] px-3 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1.5"
                >
                  <span>✨</span>
                  <span>วางแทนที่ข้อความทั้งหมด</span>
                </button>
                <button
                  type="button"
                  onClick={handleAppendText}
                  className="flex-1 min-h-[38px] px-3 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1.5"
                >
                  <span>➕</span>
                  <span>เพิ่มต่อท้ายข้อความเดิม</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-white/80 border border-slate-200/80 rounded-xl p-3 text-center text-xs text-slate-500">
              💡 คลิกเลือกบทบาท, Brand หรือเครื่องจักร ด้านบนเพื่อสร้างข้อความอัตโนมัติลงในรายละเอียด
            </div>
          )}
        </div>
      )}
    </div>
  );
}
