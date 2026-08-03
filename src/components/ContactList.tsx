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
                <div className="flex gap-2">
                  <input
                    type="tel"
                    value={contact.phone}
                    onChange={(e) => updateContact(index, 'phone', e.target.value)}
                    placeholder="0XX-XXX-XXXX"
                    className="flex-1 min-h-touch px-3 py-2 text-base border border-gray-300 rounded-lg bg-white
                      focus:ring-2 focus:ring-primary/30 focus:border-primary"
                  />
                  {contact.phone && (
                    <a
                      href={`tel:${contact.phone}`}
                      className="min-w-touch min-h-touch bg-green-500 text-white rounded-lg flex items-center justify-center"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
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
