import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header';

export default function AppShell() {
  return (
    <div className="min-h-[calc(100vh-64px)] bg-slate-50 flex flex-col font-sans">
      <Header />
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 py-6 animate-fade-in">
        <Outlet />
      </main>
    </div>
  );
}
