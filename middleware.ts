import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

/** Allowlist de admins (ver lib/admin/auth). Inline para no arrastrar deps de server al edge. */
function isAdminEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  const raw = process.env.ADMIN_EMAILS;
  const list = raw
    ? raw.split(",").map((e) => e.trim().toLowerCase()).filter(Boolean)
    : ["hola@run72.app"];
  return list.includes(email.toLowerCase());
}

/**
 * Refresca la sesión de Supabase y protege /admin.
 * Solo corre sobre /admin/* (ver matcher).
 */
export async function middleware(req: NextRequest) {
  let res = NextResponse.next({ request: req });

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anon) return res;

  const supabase = createServerClient(url, anon, {
    cookies: {
      getAll() {
        return req.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => req.cookies.set(name, value));
        res = NextResponse.next({ request: req });
        cookiesToSet.forEach(({ name, value, options }) =>
          res.cookies.set(name, value, options),
        );
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();
  const isAdmin = Boolean(user) && isAdminEmail(user?.email);

  const path = req.nextUrl.pathname;
  const isLogin = path.startsWith("/admin/login");

  if (!isAdmin && !isLogin) {
    const redirect = req.nextUrl.clone();
    redirect.pathname = "/admin/login";
    return NextResponse.redirect(redirect);
  }
  if (isAdmin && isLogin) {
    const redirect = req.nextUrl.clone();
    redirect.pathname = "/admin";
    return NextResponse.redirect(redirect);
  }

  return res;
}

export const config = {
  matcher: ["/admin", "/admin/:path*"],
};
