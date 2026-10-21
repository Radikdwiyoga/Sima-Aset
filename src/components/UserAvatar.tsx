'use client';

import React from 'react';

interface UserAvatarProps {
  name?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export function getInitials(name?: string): string {
  if (!name || !name.trim()) return 'U';
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return parts[0][0].toUpperCase();
}

export function getAvatarColor(name?: string): string {
  if (!name || !name.trim()) return 'bg-blue-600 text-white';
  const colors = [
    'bg-blue-600 text-white',
    'bg-indigo-600 text-white',
    'bg-emerald-600 text-white',
    'bg-violet-600 text-white',
    'bg-amber-600 text-white',
    'bg-rose-600 text-white',
    'bg-teal-600 text-white',
    'bg-cyan-600 text-white',
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
}

export function UserAvatar({ name = 'User', size = 'md', className = '' }: UserAvatarProps) {
  const initials = getInitials(name);
  const colorClass = getAvatarColor(name);

  const sizeClasses = {
    xs: 'w-6 h-6 text-[10px]',
    sm: 'w-7 h-7 text-[11px]',
    md: 'w-8 h-8 text-xs',
    lg: 'w-10 h-10 text-sm',
    xl: 'w-16 h-16 text-2xl',
  };

  return (
    <div
      className={`rounded-full flex items-center justify-center font-bold tracking-tight select-none shrink-0 shadow-xs ${sizeClasses[size]} ${colorClass} ${className}`}
      title={name}
    >
      {initials}
    </div>
  );
}
