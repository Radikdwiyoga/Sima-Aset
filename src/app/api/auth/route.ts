import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { UserRole } from '@/types';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { identifier, password, roleOverride } = body;

    const users = db.getUsers();

    // If roleOverride is provided (for fast demo/role switching)
    if (roleOverride) {
      const match = users.find(u => u.role === roleOverride);
      if (match) {
        return NextResponse.json({ success: true, user: match });
      }
      // If not in db, create structured mock for this role
      const fallbackUser = {
        id: `usr-${roleOverride}`,
        name: roleOverride === 'super_admin' ? 'Super Admin SIMA' :
              roleOverride === 'admin_it' ? 'Andi (Admin Aset)' :
              roleOverride === 'admin_ga' ? 'Dewi (Admin GA)' :
              roleOverride === 'management' ? 'Rina (Manajer Keuangan)' :
              'Budi (Staff Karyawan)',
        username: roleOverride,
        email: `${roleOverride}@company.com`,
        role: roleOverride as UserRole,
        department: roleOverride === 'super_admin' ? 'Administrator' :
                    roleOverride === 'admin_it' ? 'Divisi IT' :
                    roleOverride === 'admin_ga' ? 'General Affairs' :
                    roleOverride === 'management' ? 'Finance & Management' :
                    'Staff Operasional',
        avatar: roleOverride === 'super_admin' 
          ? 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=120&auto=format&fit=crop&q=80'
          : roleOverride === 'staff'
          ? 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&auto=format&fit=crop&q=80'
          : 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=120&auto=format&fit=crop&q=80'
      };
      return NextResponse.json({ success: true, user: fallbackUser });
    }

    if (!identifier) {
      return NextResponse.json(
        { success: false, message: 'Masukkan email atau username Anda.' },
        { status: 400 }
      );
    }

    // Email or username check
    const user = users.find(
      u => u.email.toLowerCase() === identifier.toLowerCase() || 
           u.username.toLowerCase() === identifier.toLowerCase()
    );

    if (!user) {
      // For testing flexibility: if user types a known demo email/role
      if (identifier.toLowerCase().includes('admin')) {
        return NextResponse.json({
          success: true,
          user: users[0]
        });
      }
      if (identifier.toLowerCase().includes('staff') || identifier.toLowerCase().includes('budi')) {
        return NextResponse.json({
          success: true,
          user: users.find(u => u.role === 'staff') || users[1]
        });
      }

      return NextResponse.json(
        { success: false, message: 'Akun dengan email/username tersebut tidak ditemukan.' },
        { status: 401 }
      );
    }

    return NextResponse.json({ success: true, user });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: 'Terjadi kesalahan sistem saat proses autentikasi.' },
      { status: 500 }
    );
  }
}
