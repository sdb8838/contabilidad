import { NextRequest, NextResponse } from "next/server";
import { adminQueries, usersQueries } from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json();

    // Check if user is admin
    const adminUser = adminQueries.getByUsername(username);
    if (adminUser && (adminUser as any).password === password) {
      const response = NextResponse.json({
        success: true,
        user: {
          username,
          displayName: (adminUser as any).display_name,
          role: "admin",
        },
      });
      
      response.cookies.set("auth", JSON.stringify({
        username,
        displayName: (adminUser as any).display_name,
        role: "admin",
      }), {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24,
      });
      
      return response;
    }

    // Check if user is in authorized users list (LDAP users)
    if (usersQueries.isAuthorized(username)) {
      const response = NextResponse.json({
        success: true,
        user: {
          username,
          displayName: username,
          role: "user",
        },
      });
      
      response.cookies.set("auth", JSON.stringify({
        username,
        displayName: username,
        role: "user",
      }), {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24,
      });
      
      return response;
    }

    return NextResponse.json({ success: false, error: "Usuario no autorizado" }, { status: 401 });
  } catch (error) {
    return NextResponse.json({ success: false, error: "Error de autenticación" }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  const authCookie = request.cookies.get("auth");
  
  if (authCookie) {
    try {
      const user = JSON.parse(authCookie.value);
      return NextResponse.json({ authenticated: true, user });
    } catch {
      return NextResponse.json({ authenticated: false }, { status: 401 });
    }
  }
  
  return NextResponse.json({ authenticated: false });
}
