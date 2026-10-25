// import { useEffect, useState } from "react";
// import { useNavigate } from "react-router-dom";

// import api from "../Services/api.js";
// import { useAuth } from "../context/AuthContext.js";

// const languageColors = {
//     JavaScript: "bg-amber-300",
//     TypeScript: "bg-sky-400",
//     HTML: "bg-orange-400",
//     CSS: "bg-blue-400",
// };

// function formatDate(date) {
//     if (!date) return "Recently";

//     return new Intl.DateTimeFormat("en", {
//         month: "short",
//         day: "numeric",
//     }).format(new Date(date));
// }

// export default function Dashboard() {
//     const navigate = useNavigate();
//     const { user } = useAuth();
//     const [projects, setProjects] = useState([]);
//     const [loading, setLoading] = useState(true);
//     const [error, setError] = useState("");
//     const [showCreate, setShowCreate] = useState(false);
//     const [projectName, setProjectName] = useState("");
//     const [projectDescription, setProjectDescription] = useState("");
//     const [creating, setCreating] = useState(false);

//     useEffect(() => {
//         const loadProjects = async () => {
//             try {
//                 const response = await api.get("/projects");
//                 setProjects(response.data.projects || []);
//             } catch {
//                 setError("Could not load your projects. Is the API running?");
//             } finally {
//                 setLoading(false);
//             }
//         };

//         loadProjects();
//     }, []);

//     const createProject = async (event) => {
//         event.preventDefault();
//         if (!projectName.trim()) return;

//         try {
//             setCreating(true);
//             const response = await api.post("/projects", {
//                 name: projectName.trim(),
//                 description: projectDescription.trim(),
//             });
//             const project = response.data.project;
//             setProjects((current) => [project, ...current]);
//             setProjectName("");
//             setProjectDescription("");
//             setShowCreate(false);
//             navigate(`/workspace/${project._id}`);
//         } catch {
//             setError("Project could not be created. Please try again.");
//         } finally {
//             setCreating(false);
//         }
//     };

//     return (
//         <main className="min-h-screen bg-[#f4f6f8] text-[#17212b]">
//             <div className="mx-auto max-w-7xl px-5 py-8 sm:px-8 lg:px-10 lg:py-12">
//                 <section className="relative mb-10 overflow-hidden rounded-2xl bg-[#17212b] px-6 py-8 text-white shadow-[0_18px_45px_rgba(23,33,43,0.12)] sm:px-10 sm:py-10">
//                     <div className="relative z-[1] max-w-2xl">
//                         <p className="mb-3 text-xs font-bold uppercase tracking-[0.22em] text-[#ec8a72]">Your workspace</p>
//                         <h1 className="text-3xl font-semibold tracking-[-0.04em] sm:text-5xl">Good to see you, {user?.name?.split(" ")[0] || "builder"}.</h1>
//                         <p className="mt-4 max-w-lg text-base leading-7 text-[#b9c5cc]">Pick up where you left off, or start a fresh project and turn the next idea into something real.</p>
//                         <button onClick={() => setShowCreate(true)} className="mt-7 inline-flex items-center justify-center gap-2 rounded-lg bg-[#ec5b3f] px-5 py-3 text-sm font-semibold text-white shadow-[0_8px_20px_rgba(236,91,63,0.25)] transition hover:bg-[#d94c31] focus:outline-none focus:ring-2 focus:ring-[#ec8a72] focus:ring-offset-2 focus:ring-offset-[#17212b]"><span className="text-lg leading-none">+</span> New project</button>
//                     </div>
//                     <div className="absolute -right-10 -top-16 h-64 w-64 rounded-full border-[28px] border-[#28644f]/40" aria-hidden="true" />
//                     <div className="absolute -bottom-24 right-24 h-48 w-48 rounded-full border-[18px] border-[#ec5b3f]/25" aria-hidden="true" />
//                 </section>

//                 {error && <p className="mb-6 rounded-lg border border-[#f2b6aa] bg-[#fff1ee] px-4 py-3 text-sm text-[#a53d2b]">{error}</p>}

//                 <section className="grid gap-4 sm:grid-cols-3">
//                     <div className="rounded-xl border border-[#d9e0e5] bg-white p-5 shadow-[0_4px_16px_rgba(23,33,43,0.03)]"><div className="flex items-center justify-between"><p className="text-xs font-semibold uppercase tracking-wider text-[#8a98a3]">Projects</p><span className="text-lg text-[#ec5b3f]">#</span></div><p className="mt-3 text-3xl font-semibold">{projects.length}</p><p className="mt-1 text-sm text-[#8a98a3]">in your workspace</p></div>
//                     <div className="rounded-xl border border-[#d9e0e5] bg-white p-5 shadow-[0_4px_16px_rgba(23,33,43,0.03)]"><div className="flex items-center justify-between"><p className="text-xs font-semibold uppercase tracking-wider text-[#8a98a3]">Editor</p><span className="h-2.5 w-2.5 rounded-full bg-[#3aa477]" /></div><p className="mt-3 text-3xl font-semibold text-[#28644f]">Ready</p><p className="mt-1 text-sm text-[#8a98a3]">Your tools are online</p></div>
//                     <div className="rounded-xl border border-[#d9e0e5] bg-white p-5 shadow-[0_4px_16px_rgba(23,33,43,0.03)]"><div className="flex items-center justify-between"><p className="text-xs font-semibold uppercase tracking-wider text-[#8a98a3]">Last activity</p><span className="text-lg text-[#71808c]">~</span></div><p className="mt-3 text-3xl font-semibold">{projects[0] ? formatDate(projects[0].updatedAt) : "Today"}</p><p className="mt-1 text-sm text-[#8a98a3]">Keep the momentum going</p></div>
//                 </section>

//                 <section className="mt-12"><div className="mb-5 flex items-end justify-between"><div><p className="text-xs font-bold uppercase tracking-[0.18em] text-[#ec5b3f]">Your work</p><h2 className="mt-1 text-2xl font-semibold tracking-tight">Recent projects</h2></div><span className="text-sm text-[#8a98a3]">{projects.length} total</span></div>
//                     {loading ? <div className="rounded-xl border border-[#d9e0e5] bg-white p-10 text-center text-sm text-[#71808c]">Loading your projects...</div> : projects.length === 0 ? <div className="overflow-hidden rounded-xl border border-[#d9e0e5] bg-white px-6 py-12 shadow-[0_4px_16px_rgba(23,33,43,0.03)] sm:px-12"><div className="max-w-xl"><div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-[#fff0eb] font-mono text-lg text-[#ec5b3f]">&lt;/&gt;</div><h3 className="text-2xl font-semibold tracking-tight">Your editor is waiting.</h3><p className="mt-3 leading-7 text-[#71808c]">Create a project to get a ready-to-edit workspace with your files, explorer, and code editor in one place.</p><button onClick={() => setShowCreate(true)} className="mt-7 rounded-lg bg-[#17212b] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#28644f]">Create your first project</button></div></div> : <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">{projects.map((project) => <button key={project._id} onClick={() => navigate(`/workspace/${project._id}`)} className="group rounded-xl border border-[#d9e0e5] bg-white p-5 text-left shadow-[0_4px_16px_rgba(23,33,43,0.03)] transition hover:-translate-y-1 hover:border-[#ec5b3f] hover:shadow-[0_12px_28px_rgba(23,33,43,0.1)] focus:outline-none focus:ring-2 focus:ring-[#ec5b3f] focus:ring-offset-2"><div className="flex items-start justify-between"><div className="flex h-11 w-11 items-center justify-center rounded-lg bg-[#fff0eb] font-mono text-[#ec5b3f]">&lt;/&gt;</div><span className="text-xl text-[#a2afb7] transition group-hover:translate-x-1 group-hover:text-[#ec5b3f]">-&gt;</span></div><h3 className="mt-6 truncate font-semibold">{project.name}</h3><p className="mt-2 min-h-10 text-sm leading-5 text-[#71808c]">{project.description || "No description yet."}</p><div className="mt-5 flex items-center gap-2 border-t border-[#edf0f2] pt-4 text-xs text-[#8a98a3]"><span className={`h-2 w-2 rounded-full ${languageColors[project.language] || "bg-[#ec5b3f]"}`} />Updated {formatDate(project.updatedAt)}</div></button>)}</div>}
//                 </section>
//             </div>

//             {showCreate && <div className="fixed inset-0 z-10 flex items-center justify-center bg-[#17212b]/40 px-6" onMouseDown={(event) => event.target === event.currentTarget && setShowCreate(false)}><form onSubmit={createProject} className="w-full max-w-md rounded-xl bg-white p-7 shadow-2xl"><div className="flex items-start justify-between"><div><p className="text-xs font-bold uppercase tracking-[0.18em] text-[#ec5b3f]">New workspace</p><h2 className="mt-2 text-2xl font-semibold">Start a project</h2></div><button type="button" onClick={() => setShowCreate(false)} className="text-2xl leading-none text-[#8a98a3]">&times;</button></div><label className="mt-7 block text-sm font-semibold">Project name<input autoFocus value={projectName} onChange={(event) => setProjectName(event.target.value)} placeholder="My next idea" className="mt-2 w-full rounded-lg border border-[#d9e0e5] px-3 py-2.5 outline-none transition focus:border-[#ec5b3f]" /></label><label className="mt-5 block text-sm font-semibold">Description<span className="ml-1 font-normal text-[#8a98a3]">(optional)</span><textarea value={projectDescription} onChange={(event) => setProjectDescription(event.target.value)} placeholder="What are you building?" rows="3" className="mt-2 w-full resize-none rounded-lg border border-[#d9e0e5] px-3 py-2.5 outline-none transition focus:border-[#ec5b3f]" /></label><button disabled={creating || !projectName.trim()} className="mt-6 w-full rounded-lg bg-[#ec5b3f] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#d94c31] disabled:cursor-not-allowed disabled:opacity-50">{creating ? "Creating..." : "Create project"}</button></form></div>}
//         </main>
//     );
// }


import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Code2,
  FolderCode,
  LayoutDashboard,
  Settings,
  Search,
  Plus,
  Clock3,
  Trash2,
  LogOut,
  LoaderCircle,
  X,
  ArrowUpRight,
  FileCode2,
} from "lucide-react";

import api from "../Services/api";

const projectLanguages = [
  { value: "python", label: "Run Python" },
  { value: "c", label: "Run C" },
  { value: "website", label: "Create Website" },
];

const projectLanguageLabels = Object.fromEntries(
  projectLanguages.map((option) => [option.value, option.label])
);

export default function Dashboard() {
  const navigate = useNavigate();

  const [projects, setProjects] = useState([]);
  const [search, setSearch] = useState("");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [language, setLanguage] = useState("python");
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    const loadProjects = async () => {
      try {
        const { data } = await api.get("/projects");
        if (!cancelled) {
          setProjects(data.projects || []);
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err.response?.data?.message ||
              "Could not load projects. Please sign in again."
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadProjects();

    return () => {
      cancelled = true;
    };
  }, []);

  async function createProject(event) {
    event.preventDefault();

    if (!name.trim()) return;

    try {
      setCreating(true);
      setError("");

      const { data } = await api.post("/projects", {
        name: name.trim(),
        description: description.trim(),
        language,
      });

      setProjects((previous) => [
        data.project,
        ...previous,
      ]);

      setShowModal(false);
      setName("");
      setDescription("");
      setLanguage("python");

      navigate(`/workspace/${data.project._id}`);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Could not create project."
      );
    } finally {
      setCreating(false);
    }
  }

  async function deleteProject(project) {
    if (!window.confirm(`Delete "${project.name}"?`)) {
      return;
    }

    try {
      await api.delete(`/projects/${project._id}`);

      setProjects((previous) =>
        previous.filter((item) => item._id !== project._id)
      );

    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Could not delete project."
      );
    }
  }

  async function logout() {
    try {
      await api.post("/auth/logout");
    } finally {
      navigate("/login", { replace: true });
    }
  }

  const filteredProjects = projects.filter((project) =>
    project.name.toLowerCase().includes(search.toLowerCase())
  );

  const colors = [
    "bg-violet-500/15 text-violet-300",
    "bg-blue-500/15 text-blue-300",
    "bg-emerald-500/15 text-emerald-300",
    "bg-pink-500/15 text-pink-300",
  ];

  return (
    <div className="flex min-h-screen bg-[#0b0d14] text-slate-100">

      {/* Sidebar */}
      <aside className="flex w-[245px] shrink-0 flex-col border-r border-white/10 bg-[#10121b] p-5 max-md:w-[68px] max-md:px-2">

        <div className="mb-12 flex items-center gap-3 font-heading text-xl font-bold">
          <div className="grid size-10 shrink-0 place-items-center rounded-xl bg-violet-600">
            <Code2 size={23} />
          </div>

          <span className="max-md:hidden">
            Codo<span className="text-violet-400">-File</span>
          </span>
        </div>

        <p className="mb-3 px-2 text-[10px] font-bold tracking-[2px] text-slate-500 max-md:hidden">
          WORKSPACE
        </p>

        <nav className="space-y-2">
          <button className="flex w-full items-center gap-3 rounded-lg border border-violet-400/10 bg-violet-500/15 px-3 py-3 text-left text-violet-300">
            <LayoutDashboard size={19} />
            <span className="text-sm max-md:hidden">Dashboard</span>
          </button>

          <button
            onClick={() =>
              document.getElementById("projects")?.scrollIntoView({
                behavior: "smooth",
              })
            }
            className="flex w-full items-center gap-3 rounded-lg px-3 py-3 text-left text-slate-400 transition hover:bg-white/5 hover:text-white"
          >
            <FolderCode size={19} />
            <span className="text-sm max-md:hidden">My Projects</span>
            <span className="ml-auto text-xs max-md:hidden">
              {projects.length}
            </span>
          </button>
        </nav>

        <div className="mt-auto">
          <button
            onClick={() => setError("Settings are coming soon.")}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-3 text-slate-400 hover:bg-white/5 hover:text-white"
          >
            <Settings size={19} />
            <span className="text-sm max-md:hidden">Settings</span>
          </button>

          <div className="mt-4 flex items-center gap-3 border-t border-white/10 pt-4">
            <div className="grid size-9 shrink-0 place-items-center rounded-xl bg-violet-500/20 text-xs font-bold text-violet-300">
              CF
            </div>

            <div className="min-w-0 flex-1 max-md:hidden">
              <p className="text-xs font-semibold">Developer</p>
              <p className="mt-1 text-[10px] text-slate-500">
                Personal workspace
              </p>
            </div>

            <button
              title="Log out"
              onClick={logout}
              className="rounded-lg p-2 text-slate-400 hover:bg-white/5 hover:text-white max-md:hidden"
            >
              <LogOut size={17} />
            </button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="min-w-0 flex-1">

        <header className="flex h-[67px] items-center justify-between border-b border-white/10 bg-[#0e1018] px-8 max-sm:px-4">
          <p className="text-sm">
            Workspace <span className="mx-2 text-slate-600">/</span>
            <span className="text-slate-400">Dashboard</span>
          </p>

          <div className="flex items-center gap-2 text-xs text-slate-400 max-sm:hidden">
            <span className="size-2 rounded-full bg-emerald-400" />
            Cloud workspace
          </div>
        </header>

        <div className="mx-auto max-w-[1440px] px-8 py-10 max-sm:px-4 max-sm:py-6">

          {/* Welcome */}
          <section className="mb-9 flex items-center justify-between gap-5 max-sm:items-start max-sm:flex-col">
            <div>
              <p className="mb-3 text-[10px] font-bold tracking-[2px] text-violet-400">
                YOUR DEVELOPMENT SPACE
              </p>

              <h1 className="font-heading text-4xl font-bold tracking-tight max-sm:text-3xl">
                Build something{" "}
                <span className="text-violet-400">great.</span>
              </h1>

              <p className="mt-3 text-sm text-slate-400">
                Your ideas, your code, all in one place.
              </p>
            </div>

            <button
              onClick={() => {
                setError("");
                setShowModal(true);
              }}
              className="flex items-center gap-2 rounded-lg bg-violet-600 px-4 py-3 text-sm font-semibold transition hover:bg-violet-500"
            >
              <Plus size={18} />
              New Project
            </button>
          </section>

          {error && (
            <div role="alert" className="mb-6 flex items-center justify-between gap-3 rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-300">
              <span>{error}</span>
              <button onClick={() => setError("")} aria-label="Dismiss error">
                <X size={17} />
              </button>
            </div>
          )}

          {/* Statistics */}
          <section className="mb-11 grid grid-cols-3 gap-4 max-lg:grid-cols-1">
            {[
              {
                label: "Total projects",
                value: loading ? "—" : projects.length,
                icon: FolderCode,
                color: "bg-violet-500/15 text-violet-300",
              },
              {
                label: "Code workspace",
                value: "Ready",
                icon: FileCode2,
                color: "bg-blue-500/15 text-blue-300",
              },
              {
                label: "Recent projects",
                value: loading ? "—" : Math.min(projects.length, 5),
                icon: Clock3,
                color: "bg-emerald-500/15 text-emerald-300",
              },
            ].map((stat) => {
              const Icon = stat.icon;

              return (
                <div
                  key={stat.label}
                  className="flex items-center gap-4 rounded-xl border border-white/10 bg-[#121520] p-5"
                >
                  <div className={`grid size-11 place-items-center rounded-xl ${stat.color}`}>
                    <Icon size={21} />
                  </div>

                  <div>
                    <p className="text-xs text-slate-400">{stat.label}</p>
                    <p className="mt-1 font-heading text-2xl font-bold">
                      {stat.value}
                    </p>
                  </div>
                </div>
              );
            })}
          </section>

          {/* Projects */}
          <section id="projects">
            <div className="mb-6 flex items-center justify-between gap-5 max-sm:items-start max-sm:flex-col">
              <div>
                <h2 className="font-heading text-xl font-bold">
                  My Projects
                </h2>
                <p className="mt-2 text-xs text-slate-400">
                  Your saved coding projects
                </p>
              </div>

              <label className="flex h-10 w-full max-w-[280px] items-center gap-2 rounded-lg border border-white/10 bg-[#121520] px-3 text-slate-400 focus-within:border-violet-500">
                <Search size={17} />
                <input
                  type="search"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search projects..."
                  className="min-w-0 flex-1 bg-transparent text-xs text-white outline-none placeholder:text-slate-500"
                />
              </label>
            </div>

            {loading ? (
              <div className="flex min-h-60 flex-col items-center justify-center gap-3 text-slate-400">
                <LoaderCircle className="animate-spin" size={28} />
                <p className="text-sm">Loading projects...</p>
              </div>
            ) : filteredProjects.length === 0 ? (
              <div className="flex min-h-64 flex-col items-center justify-center rounded-xl border border-dashed border-white/15 bg-[#10121b] p-8 text-center">
                <FolderCode size={34} className="mb-4 text-violet-300" />

                <h3 className="font-heading text-lg font-semibold">
                  {search ? "No matching projects" : "Your workspace starts here"}
                </h3>

                <p className="mt-2 text-sm text-slate-400">
                  {search
                    ? "Try another search term."
                    : "Create your first project and start coding."}
                </p>

                {!search && (
                  <button
                    onClick={() => setShowModal(true)}
                    className="mt-5 flex items-center gap-2 rounded-lg bg-violet-600 px-4 py-3 text-sm font-semibold hover:bg-violet-500"
                  >
                    <Plus size={18} />
                    Create project
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-4 max-xl:grid-cols-2 max-md:grid-cols-1">
                {filteredProjects.map((project, index) => (
                  <article
                    key={project._id}
                    className="group relative min-w-0 rounded-xl border border-white/10 bg-[#121520] p-5 transition hover:-translate-y-0.5 hover:border-violet-400/40"
                  >
                    <div className="mb-5 flex items-center justify-between">
                      <div className={`grid size-11 place-items-center rounded-xl ${colors[index % colors.length]}`}>
                        <Code2 size={23} />
                      </div>

                      <button
                        title="Delete project"
                        onClick={() => deleteProject(project)}
                        className="rounded-lg p-2 text-slate-500 hover:bg-red-500/10 hover:text-red-300"
                      >
                        <Trash2 size={17} />
                      </button>
                    </div>

                    <button
                      onClick={() => navigate(`/workspace/${project._id}`)}
                      className="max-w-full break-words text-left font-semibold hover:text-violet-300"
                    >
                      {project.name}
                    </button>

                    <p className="mt-2 min-h-10 break-words text-xs leading-5 text-slate-400">
                      {project.description || "No description added yet."}
                    </p>

                    <div className="mt-5 flex items-center justify-between gap-3 border-t border-white/10 pt-4">
                      <span className="flex items-center gap-1.5 text-[11px] text-slate-500">
                        <Clock3 size={13} />
                        {new Date(
                          project.updatedAt || project.createdAt
                        ).toLocaleDateString()}
                      </span>

                      <span className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                        {projectLanguageLabels[project.language] || project.language || "Project"}
                      </span>

                      <button
                        onClick={() => navigate(`/workspace/${project._id}`)}
                        className="flex items-center gap-1 text-xs font-medium text-violet-300 hover:text-white"
                      >
                        Open <ArrowUpRight size={15} />
                      </button>
                    </div>
                  </article>
                ))}

                <button
                  onClick={() => setShowModal(true)}
                  className="flex min-h-[215px] flex-col items-center justify-center rounded-xl border border-dashed border-violet-400/30 bg-[#10121b] p-6 transition hover:border-violet-400/70 hover:bg-violet-500/5"
                >
                  <span className="mb-4 grid size-11 place-items-center rounded-xl bg-violet-500/15 text-violet-300">
                    <Plus size={23} />
                  </span>
                  <strong className="text-sm">Create a project</strong>
                  <span className="mt-2 text-xs text-slate-400">
                    Start a new coding workspace
                  </span>
                </button>
              </div>
            )}
          </section>

          <footer className="mt-12 flex justify-between gap-3 border-t border-white/10 pt-5 text-[11px] text-slate-500 max-sm:flex-col">
            <span>Codo-File · Your code, your space.</span>
            <span>Built for developers</span>
          </footer>
        </div>
      </main>

      {/* Create project modal */}
      {showModal && (
        <div
          className="fixed inset-0 z-50 grid place-items-center bg-black/80 p-4 backdrop-blur-sm"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setShowModal(false);
            }
          }}
        >
          <form
            onSubmit={createProject}
            className="w-full max-w-md rounded-2xl border border-white/15 bg-[#151722] p-6 shadow-2xl"
          >
            <div className="mb-7 flex items-start justify-between gap-3">
              <div>
                <h2 className="font-heading text-xl font-bold">
                  Create a project
                </h2>
                <p className="mt-2 text-xs text-slate-400">
                  Give your next idea a home.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="rounded-lg p-2 text-slate-400 hover:bg-white/10"
                aria-label="Close modal"
              >
                <X size={19} />
              </button>
            </div>

            <label className="mb-5 block text-xs font-semibold">
              Project name
              <input
                required
                autoFocus
                maxLength={80}
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="e.g. My Portfolio"
                className="mt-2 w-full rounded-lg border border-white/15 bg-[#0d0f17] px-3 py-3 text-sm outline-none focus:border-violet-500"
              />
            </label>

            <label className="mt-5 block text-xs font-semibold">
              Start with language
              <select
                value={language}
                onChange={(event) => setLanguage(event.target.value)}
                className="mt-2 w-full rounded-lg border border-white/15 bg-[#0d0f17] px-3 py-3 text-sm text-white outline-none focus:border-violet-500"
              >
              {projectLanguages.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>

            <label className="block text-xs font-semibold">
              Description <span className="text-slate-500">(optional)</span>
              <textarea
                rows={3}
                maxLength={300}
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                placeholder="What are you building?"
                className="mt-2 w-full resize-y rounded-lg border border-white/15 bg-[#0d0f17] px-3 py-3 text-sm outline-none focus:border-violet-500"
              />
            </label>

            <div className="mt-7 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="rounded-lg border border-white/15 px-4 py-3 text-xs font-semibold hover:bg-white/5"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={creating}
                className="flex items-center gap-2 rounded-lg bg-violet-600 px-4 py-3 text-xs font-semibold hover:bg-violet-500 disabled:opacity-60"
              >
                {creating ? (
                  <LoaderCircle size={16} className="animate-spin" />
                ) : (
                  <Plus size={17} />
                )}
                {creating ? "Creating..." : "Create project"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
