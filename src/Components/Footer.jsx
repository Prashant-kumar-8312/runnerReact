import { Link } from "react-router-dom";

export default function Footer() {
	return (
		<footer className="border-t border-[#d9e0e5] bg-[#17212b] text-[#b9c5cc]">
			<div className="mx-auto flex max-w-7xl flex-col gap-6 px-6 py-8 sm:px-8 md:flex-row md:items-center md:justify-between lg:px-10">
				<div>
					<Link to="/" className="text-lg font-semibold tracking-tight text-white">
						Codo<span className="text-[#ec8a72]">File</span>
					</Link>
					<p className="mt-2 text-sm">A calm place to build, test, and ship.</p>
				</div>

				<nav className="flex flex-wrap items-center gap-x-6 gap-y-3 text-sm" aria-label="Footer navigation">
					<Link to="/" className="transition hover:text-white">Home</Link>
					<Link to="/dashboard" className="transition hover:text-white">Dashboard</Link>
					<Link to="/login" className="transition hover:text-white">Sign in</Link>
					<span className="inline-flex items-center gap-2 text-[#a5d9bf]">
						<span className="h-2 w-2 rounded-full bg-[#62c795]" aria-hidden="true" />
						All systems operational
					</span>
				</nav>
			</div>
			<div className="border-t border-white/10">
				<div className="mx-auto max-w-7xl px-6 py-4 text-xs text-[#8797a1] sm:px-8 lg:px-10">
					&copy; {new Date().getFullYear()} CodoFile. Built for focused work.
				</div>
			</div>
		</footer>
	);
}
