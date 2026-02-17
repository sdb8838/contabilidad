import { NextRequest, NextResponse } from "next/server";
import { adminQueries } from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    const { username, currentPassword, newPassword } = await request.json();

    // Verify user exists and is admin
    const adminUser = adminQueries.getByUsername(username);
    if (!adminUser) {
      return NextResponse.json({ success: false, error: "Usuario no encontrado" }, { status: 404 });
    }

    // Verify current password
    if ((adminUser as any).password !== currentPassword) {
      return NextResponse.json({ success: false, error: "Contraseña actual incorrecta" }, { status: 401 });
    }

    // Update password
    adminQueries.updatePassword(username, newPassword);

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false, error: "Error al cambiar contraseña" }, { status: 500 });
  }
}
