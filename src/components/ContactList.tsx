// ==========================================
// ContactList — รายชื่อผู้ติดต่อ
// ==========================================
import React from 'react';
import type { Contact } from '../types/report';

interface ContactListProps {
  contacts: Contact[];
  onChange: (contacts: Contact[]) => void;
}

export default function ContactList({ contacts, onChange }: ContactListProps) {
  const updateContact = (index: number, field: keyof Contact, value: string) => {
    const updated = contacts.map((c, i) =>
      i === index ? { ...c, [field]: value } : c
    );
    onChange(updated);
  };

  const addContact = () => {
    onChange([...contacts, { name: '', phone: '', position: '' }]);
  };

  const removeContact = (index: number) => {
    if (contacts.length <= 1) return;
    onChange(contacts.filter((_, i) => i !== index));
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <label className="block text-sm font-bold text-gray-700">ผู้ที่ได้เข้าพบ (ลูกค้า/Yard)</label>
        <button
          type="button"
          onClick={addContact}
          className="min-h-touch px-4 py-2 bg-primary text-white rounded-xl text-sm font-medium
            flex items-center gap-1 active:scale-95 transition-transform"
        >
          <span className="text-lg">+</span> เพิ่มผู้ติดต่อ
        </button>
      </div>

      <div className="space-y-3">
        {contacts.map((contact, index) => (
          <div key={index} className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-bold text-primary">ผู้ติดต่อ #{index + 1}</span>
              {contacts.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeContact(index)}
                  className="min-w-touch min-h-[36px] px-3 bg-red-50 text-red-500 rounded-lg text-sm font-medium"
                >
                  ลบ
                </button>
              )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label className="text-xs text-gray-500 mb-1 block">ชื่อ-สกุล</label>
                <input
                  type="text"
                  value={contact.name}
                  onChange={(e) => updateContact(index, 'name', e.target.value)}
                  placeholder="ชื่อผู้ติดต่อ"
                  className="w-full min-h-touch px-3 py-2 text-base border border-gray-300 rounded-lg bg-white
                    focus:ring-2 focus:ring-primary/30 focus:border-primary"
                />
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">ตำแหน่ง</label>
                <input
                  type="text"
                  value={contact.position}
                  onChange={(e) => updateContact(index, 'position', e.target.value)}
                  placeholder="ตำแหน่ง"
                  className="w-full min-h-touch px-3 py-2 text-base border border-gray-300 rounded-lg bg-white
                    focus:ring-2 focus:ring-primary/30 focus:border-primary"
                />
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">เบอร์โทร</label>
                <div className="relative flex items-center">
                  <input
                    type="tel"
                    value={contact.phone}
                    onChange={(e) => updateContact(index, 'phone', e.target.value)}
                    placeholder="0XX-XXX-XXXX"
                    className={`w-full min-h-touch py-2 text-base border border-gray-300 rounded-lg bg-white
                      focus:ring-2 focus:ring-primary/30 focus:border-primary ${contact.phone ? 'pl-3 pr-12' : 'px-3'}`}
                  />
                  {contact.phone && (
                    <a
                      href={`tel:${contact.phone}`}
                      className="absolute right-1.5 w-9 h-9 bg-emerald-500 hover:bg-emerald-600 active:scale-95 text-white rounded-lg flex items-center justify-center transition-all shadow-sm"
                      title="โทรออก"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                      </svg>
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
