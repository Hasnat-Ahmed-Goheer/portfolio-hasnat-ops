"use client";

/**
 * commands.ts — terminal command registry + execution (the command bus).
 * Commands receive a CmdCtx so they can drive real navigation, theme and
 * scene state. This is a simulated shell: input is matched against this
 * registry only — nothing is ever evaluated or executed.
 */
import { themes } from "@/config/theme";
import { lexicon } from "@/config/console";
import { profile } from "@/content/profile";
import { projects } from "@/content/projects";
import { useTerminalStore, type LineKind } from "@/stores/terminalStore";
import { useSceneStore } from "@/stores/sceneStore";
import { useUiStore } from "@/stores/uiStore";
import { useConsoleStore } from "@/stores/consoleStore";
import { startTour } from "@/lib/tour";
import { getFps, getWorstFps, resetWorst } from "@/lib/perfMeter";
import {
  resolvePath,
  getNode,
  isDir,
  formatPath,
  listDir,
  HOME,
} from "@/lib/fakeFs";

export interface CmdCtx {
  navigate: (path: string) => void;
  close: () => void;
}

type Push = (text: string, kind?: LineKind) => void;

interface Command {
  desc: string;
  usage?: string;
  hidden?: boolean;
  run: (args: string[], push: Push, ctx: CmdCtx) => void;
}

const PAGES: Record<string, string> = {
  home: "/",
  about: "/about",
  work: "/work",
  experience: "/experience",
  lab: "/lab",
  contact: "/contact",
};

const SL_TRAIN = String.raw`
      ====        ________
  _D _|  |_______/        \__I_I_____===__|_________
   |(_)---  |   H\________/ |   |        =|___ ___|
   /     |  |   H  |  |     |   |         ||_| |_||
  |      |  |   H  |__------------------- | [___] |
  | ________|___H__/__|_____/[][]~\_______|       |
  |/ |   |-----------I_____I [][] []  D   |=======|
__/ =| o |=-~~\  /~~\  /~~\  /~~\ ____Y___________|
 |/-=|___|=    ||    ||    ||    |_____/~\___/
  \_/      \__/  \__/  \__/  \__/      \_/`;

export const commands: Record<string, Command> = {
  help: {
    desc: "list available commands",
    run: (_a, push) => {
      Object.entries(commands)
        .filter(([, c]) => !c.hidden)
        .forEach(([name, c]) =>
          push(`  ${(c.usage ?? name).padEnd(18)} ${c.desc}`, "dim")
        );
      push("  (this shell has more commands than it admits to)", "dim");
    },
  },
  whoami: {
    desc: "operator identity",
    run: (_a, push) => {
      useTerminalStore.getState().unlock("whoami");
      push(`${profile.name} — ${profile.role}`, "ok");
      push(`loc: ${profile.location} · status: ${profile.availability}`);
      push(profile.shortBio, "dim");
    },
  },
  goto: {
    desc: "navigate to a page",
    usage: "goto <page>",
    run: (args, push, ctx) => {
      let page = (args[0] || "").toLowerCase();
      /* prefix matching: goto ab → about */
      if (!(page in PAGES) && page) {
        const matches = Object.keys(PAGES).filter((p) => p.startsWith(page));
        if (matches.length === 1) page = matches[0];
        else if (matches.length > 1) {
          push(`ambiguous: ${matches.join(", ")}`, "dim");
          return;
        }
      }
      if (page in PAGES) {
        push(`→ ${lexicon.sectionPrefix}${lexicon.sections[page as keyof typeof lexicon.sections] ?? page.toUpperCase()}`, "ok");
        ctx.navigate(PAGES[page]);
        ctx.close();
      } else {
        push(`unknown page: ${page || "(none)"}`, "err");
        push(`pages: ${Object.keys(PAGES).join(", ")}`, "dim");
      }
    },
  },
  open: {
    desc: "inspect a deployment",
    usage: "open <project>",
    run: (args, push, ctx) => {
      const slug = (args[0] || "").toLowerCase();
      /* exact, then unique-prefix match */
      let p = projects.find((x) => x.slug === slug);
      if (!p && slug) {
        const matches = projects.filter((x) => x.slug.startsWith(slug));
        if (matches.length === 1) p = matches[0];
        else if (matches.length > 1) {
          push(`ambiguous: ${matches.map((x) => x.slug).join(", ")}`, "dim");
          return;
        }
      }
      if (p) {
        push(`inspecting ${p.slug} … [${p.status}]`, "ok");
        ctx.navigate(`/work/${p.slug}`);
        ctx.close();
      } else {
        push(`no such deployment: ${slug || "(none)"}`, "err");
        push(`registry: ${projects.map((x) => x.slug).join(", ")}`, "dim");
      }
    },
  },
  ls: {
    desc: "list directory",
    usage: "ls [-a] [path]",
    run: (args, push) => {
      const all = args.includes("-a");
      const target = args.find((a) => !a.startsWith("-"));
      const cwd = useTerminalStore.getState().cwd;
      const path = target ? resolvePath(cwd, target) : cwd;
      const node = getNode(path);
      if (!isDir(node)) {
        push(`ls: not a directory: ${target ?? formatPath(path)}`, "err");
        return;
      }
      const entries = listDir(node, all);
      push(entries.length ? entries.join("   ") : "(empty)");
      if (all && entries.some((e) => e.startsWith("."))) {
        useTerminalStore.getState().unlock("dotfiles");
      }
    },
  },
  cd: {
    desc: "change directory",
    usage: "cd <dir>",
    run: (args, push) => {
      const store = useTerminalStore.getState();
      const target = args[0] ?? "~";
      const path = target === "~" ? [...HOME] : resolvePath(store.cwd, target);
      const node = getNode(path);
      if (!isDir(node)) {
        push(`cd: no such directory: ${target}`, "err");
        return;
      }
      store.setCwd(path);
    },
  },
  cat: {
    desc: "print a file",
    usage: "cat <file>",
    run: (args, push) => {
      if (!args[0]) return push("cat: missing operand", "err");
      const cwd = useTerminalStore.getState().cwd;
      const node = getNode(resolvePath(cwd, args[0]));
      if (node === undefined) return push(`cat: no such file: ${args[0]}`, "err");
      if (isDir(node)) return push(`cat: ${args[0]}: is a directory`, "err");
      node.split("\n").forEach((l) => push(l));
      if (args[0].includes(".secrets")) {
        useTerminalStore.getState().unlock("secrets");
      }
    },
  },
  pwd: {
    desc: "print working directory",
    run: (_a, push) =>
      push("/" + useTerminalStore.getState().cwd.join("/")),
  },
  contact: {
    desc: "open the uplink",
    run: (_a, push, ctx) => {
      push("opening uplink …", "ok");
      ctx.navigate("/contact");
      ctx.close();
    },
  },
  resume: {
    desc: "download resume (pdf)",
    run: (_a, push) => {
      push(`streaming ${profile.resumeUrl} …`, "ok");
      window.open(profile.resumeUrl, "_blank", "noopener");
    },
  },
  theme: {
    desc: "switch theme",
    usage: "theme <name>",
    run: (args, push) => {
      const ok = useUiStore.getState().setTheme(args[0] ?? "");
      if (ok) push(`theme → ${args[0]}`, "ok");
      else
        push(`themes: ${Object.keys(themes).join(", ")}`, "dim");
    },
  },
  sound: {
    desc: "toggle ambient console sound (on/off)",
    usage: "sound <on|off>",
    run: (args, push) => {
      const console$ = useConsoleStore.getState();
      const arg = (args[0] || "").toLowerCase();
      if (arg === "on" || arg === "off") {
        console$.setSoundEnabled(arg === "on");
      } else if (!arg || arg === "toggle") {
        console$.toggleSound();
      } else {
        push("usage: sound <on|off>", "dim");
        return;
      }
      const on = useConsoleStore.getState().soundEnabled;
      push(`uplink audio → ${on ? "on" : "off"}`, on ? "ok" : "dim");
      if (on) push("subtle UI tones engaged. run `sound off` to mute.", "dim");
    },
  },
  history: {
    desc: "command history",
    run: (_a, push) =>
      useTerminalStore
        .getState()
        .history.forEach((h, i) => push(`  ${i + 1}  ${h}`, "dim")),
  },
  clear: {
    desc: "clear the screen",
    run: () => useTerminalStore.getState().clear(),
  },
  kubectl: {
    desc: "operate the live cluster (get/scale/delete/drain)",
    usage: "kubectl <cmd>",
    run: (args, push, ctx) => {
      useTerminalStore.getState().unlock("kubectl");
      const scene = useSceneStore.getState();
      const sub = (args[0] || "").toLowerCase();
      const onHome =
        typeof window !== "undefined" && window.location.pathname === "/";
      const watch = () => {
        if (!onHome) push("(run `goto home` to watch the cluster react)", "dim");
      };

      if (sub === "get") {
        const what = (args[1] || "pods").toLowerCase();
        if (what.startsWith("node")) {
          push("NAME            STATUS   ROLES     AGE", "dim");
          push("ops-control-1   Ready    control   2y", "ok");
          push("ops-worker-1    Ready    worker    2y", "ok");
          push("ops-worker-2    Ready    worker    2y", "ok");
          return;
        }
        push("NAME                    READY   STATUS    RESTARTS", "dim");
        ["nextjs", "fastapi", "pinecone", "stripe", "postgres", "gateway"].forEach(
          (n, i) =>
            push(`${`${n}-${7 + i}`.padEnd(23)} 1/1     Running   0`, "ok")
        );
        push(`… ${scene.replicas} replicas scheduled`, "dim");
        return;
      }
      if (sub === "scale") {
        const m = args.join(" ").match(/--replicas[ =](\d+)/);
        if (!m) {
          push("usage: kubectl scale deployment cluster --replicas=<n>", "dim");
          return;
        }
        const n = Math.max(0, Math.min(400, parseInt(m[1], 10)));
        scene.scaleReplicas(n);
        scene.bumpDisturb();
        push(`deployment.apps/cluster scaled to ${n} replicas`, "ok");
        if (n === 0)
          push("the hive goes dark. (scale --replicas=100 to bring it back)", "dim");
        watch();
        return;
      }
      if (sub === "delete") {
        const raw = (args[2] || args[1] || "").replace(/^pod\//, "");
        const base = raw.replace(/-\d+$/, "").toLowerCase();
        scene.killPod(base);
        push(`pod "${raw || "<scheduler-choice>"}" deleted`, "ok");
        push("the scheduler will reconcile shortly.", "dim");
        watch();
        return;
      }
      if (sub === "drain") {
        scene.scaleReplicas(0);
        scene.bumpDisturb();
        push("node/ops-worker-1 drained — workloads evicted", "ok");
        watch();
        return;
      }
      if (sub === "apply" || sub === "rollout") {
        scene.scaleReplicas(100);
        scene.bumpDisturb();
        push("deployment.apps/cluster configured — desired state restored", "ok");
        watch();
        return;
      }
      push("usage: kubectl <get|scale|delete|drain|apply>", "dim");
      push("  kubectl scale deployment cluster --replicas=200", "dim");
      push("  kubectl delete pod nextjs-7", "dim");
      push("  kubectl drain", "dim");
      void ctx;
    },
  },

  demo: {
    desc: "run the guided tour of the console",
    usage: "demo",
    run: (_a, push, ctx) => {
      useTerminalStore.getState().unlock("demo");
      push("starting guided tour … (ESC to exit)", "ok");
      ctx.close();
      /* defer to the next tick so the terminal-close state commit lands FIRST,
         in its own render, before the tour's state update — starting the tour in
         the same synchronous batch as the close raced React's concurrent render
         and the overlay sometimes never mounted (only the ⌘K path, which has no
         terminal to close, was reliable). */
      setTimeout(() => startTour(ctx), 0);
    },
  },
  tour: {
    desc: "",
    hidden: true, // alias of `demo`
    run: (a, push, ctx) => commands.demo.run(a, push, ctx),
  },

  /* ---------------- easter eggs (hidden from help) ---------------- */
  sudo: {
    desc: "",
    hidden: true,
    run: (args, push, ctx) => {
      useTerminalStore.getState().unlock("sudo");
      if (args.join(" ").startsWith("hire hasnat")) {
        push("[sudo] privilege escalation … GRANTED", "ok");
        push("excellent judgment. routing you to the uplink.", "ok");
        ctx.navigate("/contact");
        ctx.close();
        return;
      }
      push(`${profile.handle} is not in the sudoers file.`, "err");
      push("this incident will be reported. (to no one. it's a portfolio.)", "dim");
    },
  },
  matrix: {
    desc: "",
    hidden: true,
    run: (_a, push) => {
      useTerminalStore.getState().unlock("matrix");
      useSceneStore.getState().bumpDisturb();
      const glyphs = "ﾊﾐﾋｰｳｼﾅﾓﾆｻﾜﾂｵﾘ01";
      for (let r = 0; r < 6; r++) {
        push(
          Array.from({ length: 36 }, () =>
            glyphs[Math.floor(Math.random() * glyphs.length)]
          ).join(""),
          "ok"
        );
      }
      push("wake up. the cluster has you.", "dim");
    },
  },
  hire: {
    desc: "",
    hidden: true,
    run: (_a, push) => {
      useTerminalStore.getState().unlock("hire");
      push(`status: ${profile.availability}`, "ok");
      push(`fastest path: ${profile.email}`, "out");
      push("or run: contact", "dim");
    },
  },
  sl: {
    desc: "",
    hidden: true,
    run: (_a, push) => {
      useTerminalStore.getState().unlock("sl");
      SL_TRAIN.split("\n").forEach((l) => push(l, "ok"));
      push("you typed it wrong on purpose, didn't you.", "dim");
      push("(this train tracked 500+ real routes once — open aris-rails)", "dim");
    },
  },
  top: {
    desc: "",
    hidden: true,
    run: (_a, push) => {
      useTerminalStore.getState().unlock("top");
      const fps = getFps();
      const worst = getWorstFps();
      resetWorst();
      push(
        `  render: ${fps} fps (worst ${worst}) · ${useSceneStore.getState().replicas} replicas live`,
        fps >= 50 ? "ok" : "err"
      );
      push("  PID   COMMAND                       CPU   STATE", "dim");
      push("  2026  stack8s/marketplace           93%   running", "ok");
      push("  2026  stack8s/workload-platform     91%   running", "ok");
      push("  2025  wanile/diy-gc-platform        88%   shipped");
      push("  2025  swapfans/ai-platform          71%   shipped");
      push("  2024  techvaganza/corporate         80%   shipped");
      push("  2024  aris-rails/tracking           76%   shipped");
      push("  2023  intellogeek/lms               68%   shipped");
    },
  },
  ping: {
    desc: "",
    hidden: true,
    run: (args, push) => {
      useTerminalStore.getState().unlock("ping");
      const host = args[0] || "localhost";
      push(`PING ${host} 56 bytes of data.`);
      push(`64 bytes from ${host}: icmp_seq=1 ttl=42 time=0.2 ms`, "ok");
      push("sub-200ms. as is tradition.", "dim");
    },
  },
  neofetch: {
    desc: "",
    hidden: true,
    run: (_a, push) => {
      useTerminalStore.getState().unlock("neofetch");
      push(`        ▄▄▄        ${profile.handle}@ops`, "ok");
      push("      ▄█████▄      ---------", "ok");
      push(`    ▄█████████▄    OS: ${lexicon.systemName} v1.0.0`, "ok");
      push(`      ▀█████▀      Shell: simulated (nice try)`, "ok");
      push(`        ▀▀▀        Uptime: 2+ years in prod`, "ok");
    },
  },
  uptime: {
    desc: "",
    hidden: true,
    run: (_a, push) => {
      useTerminalStore.getState().unlock("uptime");
      push(" up 2y+,  15+ environments,  load average: shipping, shipping, shipping", "ok");
      push(" SLA 99.9% · last unplanned outage: none on record", "dim");
    },
  },
  coffee: {
    desc: "",
    hidden: true,
    run: (_a, push) => {
      useTerminalStore.getState().unlock("coffee");
      push("HTTP 418 — I'm a teapot.", "err");
      push("this node refuses to brew coffee. it only ships software.", "dim");
    },
  },
  cowsay: {
    desc: "",
    hidden: true,
    run: (args, push) => {
      useTerminalStore.getState().unlock("cowsay");
      const msg = args.join(" ").slice(0, 40) || "ship it.";
      push(" " + "_".repeat(msg.length + 2));
      push(`< ${msg} >`);
      push(" " + "-".repeat(msg.length + 2));
      push("        \\   ^__^");
      push("         \\  (oo)\\_______");
      push("            (__)\\       )\\/\\");
      push("                ||----w |");
      push("                ||     ||");
    },
  },
  vim: {
    desc: "",
    hidden: true,
    run: (_a, push) => {
      useTerminalStore.getState().unlock("vim");
      push("entering vim …", "ok");
      push(":q!  —  or just close the tab. we both know how this ends.", "dim");
    },
  },
  exit: {
    desc: "",
    hidden: true,
    run: (_a, push) => {
      push("there is no exit. only ESC.", "dim");
    },
  },
};

/** Parse + execute a raw input line. */
export function execute(raw: string, ctx: CmdCtx) {
  const store = useTerminalStore.getState();
  const push: Push = (t, k) => store.push(t, k);
  store.push(`${lexicon.prompt} ${raw}`, "in");
  store.addHistory(raw);
  const [name, ...args] = raw.trim().split(/\s+/);
  if (!name) return;
  const cmd = commands[name.toLowerCase()];
  if (cmd) cmd.run(args, push, ctx);
  else {
    push(`command not found: ${name}`, "err");
    push("run `help` to see what this shell admits to.", "dim");
  }
}

/** Tab completion: commands, page names, slugs, fs paths. */
export function complete(input: string): string[] {
  const parts = input.split(/\s+/);
  const cwd = useTerminalStore.getState().cwd;
  if (parts.length <= 1) {
    return Object.keys(commands)
      .filter((c) => !commands[c].hidden && c.startsWith(parts[0] ?? ""))
      .sort();
  }
  const [name, ...rest] = parts;
  const last = rest[rest.length - 1] ?? "";
  switch (name.toLowerCase()) {
    case "goto":
      return Object.keys(PAGES).filter((p) => p.startsWith(last));
    case "open":
      return projects.map((p) => p.slug).filter((s) => s.startsWith(last));
    case "theme":
      return Object.keys(themes).filter((t) => t.startsWith(last));
    case "kubectl":
      return ["get", "scale", "delete", "drain", "apply"].filter((s) =>
        s.startsWith(last)
      );
    case "cd":
    case "cat":
    case "ls": {
      const slash = last.lastIndexOf("/");
      const dirPart = slash >= 0 ? last.slice(0, slash + 1) : "";
      const filePart = slash >= 0 ? last.slice(slash + 1) : last;
      const dirNode = getNode(
        dirPart ? resolvePath(cwd, dirPart) : cwd
      );
      if (!isDir(dirNode)) return [];
      return listDir(dirNode, filePart.startsWith("."))
        .filter((e) => e.startsWith(filePart))
        .map((e) => dirPart + e);
    }
    default:
      return [];
  }
}
