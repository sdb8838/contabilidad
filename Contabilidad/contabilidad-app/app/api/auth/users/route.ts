import { NextRequest, NextResponse } from "next/server";
import { usersQueries } from "@/lib/db";

export async function GET() {
  const users = usersQueries.getAuthorized();
  return NextResponse.json({ users });
}

export async function POST(request: NextRequest) {
  try {
    const { username, displayName } = await request.json();

    if (!username || !displayName) {
      return NextResponse.json({ success: false, error: "Usuario y nombre son requeridos" }, { status: 400 });
    }

    usersQueries.addAuthorized(username, displayName);

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false, error: "Error al añadir usuario" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const username = searchParams.get("username");

    if (!username) {
      return NextResponse.json({ success: false, error: "Usuario requerido" }, { status: 400 });
    }

    usersQueries.removeAuthorized(username);

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false, error: "Error al eliminar usuario" }, { status: 500 });
  }
}
