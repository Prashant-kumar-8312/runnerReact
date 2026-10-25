import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.js";

export default function NavBar() {
	const { user, loading, logout } = useAuth();
	const navigate = useNavigate();
	const location = useLocation();
	const [menuOpen, setMenuOpen] = useState(false);

	const handleLogout = async () => {
		try {
			await logout();
			navigate("/");
			setMenuOpen(false);
		} catch {
			// Keep the current session visible when the server cannot complete logout.
		}
	};

	return (
		<header className="sticky top-0 z-20 border-b border-white/10 bg-[#0b0d14]/95 shadow-[0_4px_20px_rgba(0,0,0,0.24)] backdrop-blur">
			<nav className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-10" aria-label="Main navigation">
				<div className="flex h-18 items-center justify-between">
					<Link to="/" className="group flex items-center gap-3" onClick={() => setMenuOpen(false)}>
						<span className="grid size-10 place-items-center rounded-xl bg-violet-600 text-sm font-bold text-white shadow-[0_6px_14px_rgba(124,58,237,0.28)] transition group-hover:-rotate-3 group-hover:bg-violet-500" aria-hidden="true">CF</span>
						<span className="text-lg font-bold tracking-tight text-white">Codo<span className="text-[#ec8a72]">File</span></span>
					</Link>

					<button type="button" className="grid size-10 place-items-center rounded-lg border border-white/10 text-slate-200 transition hover:bg-white/5 md:hidden" aria-expanded={menuOpen} aria-controls="main-menu" aria-label={menuOpen ? "Close menu" : "Open menu"} onClick={() => setMenuOpen((open) => !open)}>
						<span className="flex w-4 flex-col gap-1" aria-hidden="true"><span className="h-0.5 w-full bg-current" /><span className="h-0.5 w-full bg-current" /><span className="h-0.5 w-full bg-current" /></span>
					</button>

					{!loading && (
						<div id="main-menu" className={`${menuOpen ? "flex" : "hidden"} absolute left-0 right-0 top-18 flex-col gap-3 border-b border-white/10 bg-[#10121b] px-5 py-4 shadow-lg md:static md:flex md:flex-row md:items-center md:gap-6 md:border-0 md:bg-transparent md:px-0 md:py-0 md:shadow-none`}>
							<Link to="/" onClick={() => setMenuOpen(false)} className={`text-sm font-semibold transition ${location.pathname === "/" ? "text-[#ec8a72]" : "text-slate-400 hover:text-white"}`}>Home</Link>
							{user ? (
								<>
									{/* <Link to="/dashboard" onClick={() => setMenuOpen(false)} className={`text-sm font-semibold transition ${location.pathname === "/dashboard" ? "text-[#ec8a72]" : "text-slate-400 hover:text-white"}`}>Dashboard</Link> */}
									<div className="my-1 h-px bg-white/10 md:my-0 md:h-7 md:w-px" />
									<div className="flex items-center justify-between gap-3">
										<span className="flex min-w-0 items-center gap-2 text-sm font-medium text-slate-200"><span className="grid size-8 shrink-0 place-items-center rounded-full bg-violet-500/20 text-xs font-bold text-violet-300">{(user.name || user.email || "U").charAt(0).toUpperCase()}</span><span className="max-w-40 truncate">{user.name || user.email}</span></span>
										<button type="button" onClick={handleLogout} className="rounded-lg border border-white/10 px-3 py-2 text-sm font-semibold text-slate-200 transition hover:border-[#ec8a72] hover:text-[#ec8a72]">Logout</button>
									</div>
								</>
							) : (
								<div className="flex items-center gap-4">
									<Link to="/login" onClick={() => setMenuOpen(false)} className="text-sm font-semibold text-slate-200 hover:text-[#ec8a72]">Login</Link>
									<Link to="/register" onClick={() => setMenuOpen(false)} className="rounded-lg bg-[#ec5b3f] px-4 py-2.5 text-sm font-semibold text-white shadow-[0_6px_14px_rgba(236,91,63,0.2)] transition hover:bg-[#d94c31]">Get started</Link>
								</div>
							)}
						</div>
					)}
				</div>
			</nav>
		</header>
	);
}
