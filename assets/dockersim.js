/* =====================================================================
   Guia Docker — simulador de terminal Docker (dockersim.js)
   ---------------------------------------------------------------------
   Um terminal fictício que entende os principais comandos do Docker
   CLI (docker run, ps, images, pull, stop, rm, rmi, logs, exec, build,
   network, volume, compose, system, inspect, stats, etc.).

   Mantém um estado fictício de imagens e containers na "máquina" da
   usuária ana@notebook. Roda só no navegador, montando as caixas
   <div class="try"> das páginas.

   Comandos suportados:
     docker --version, docker --help, docker CMD --help
     docker run, docker ps (-a), docker images, docker pull,
     docker stop, docker start, docker restart, docker rm, docker rmi,
     docker logs, docker exec, docker inspect, docker stats,
     docker build, docker tag, docker push, docker login,
     docker network (ls/create/rm/connect), docker volume (ls/create/rm),
     docker system (df, prune), docker compose (up/down/ps/logs),
     docker info
   Comandos de shell básicos: clear, echo, help, exit, history
   ===================================================================== */
(function () {
  "use strict";

  var USER = "ana", HOST = "notebook";
  var DOCKER_VERSION = "27.3.1";
  var COMPOSE_VERSION = "v2.29.7";

  /* ---------- Estado fictício ---------- */
  function estadoInicial() {
    return {
      imagens: [
        { id: "a1b2c3d4e5f6", repo: "hello-world", tag: "latest", size: "18.2kB", created: "2 weeks ago" },
        { id: "b2c3d4e5f6a1", repo: "nginx", tag: "alpine", size: "48.2MB", created: "5 days ago" },
        { id: "c3d4e5f6a1b2", repo: "node", tag: "22-alpine", size: "189MB", created: "1 week ago" },
        { id: "d4e5f6a1b2c3", repo: "postgres", tag: "16-alpine", size: "245MB", created: "3 days ago" },
        { id: "e5f6a1b2c3d4", repo: "redis", tag: "7-alpine", size: "42.8MB", created: "1 week ago" },
        { id: "f6a1b2c3d4e5", repo: "python", tag: "3.12-slim", size: "132MB", created: "4 days ago" }
      ],
      containers: [],
      redes: [
        { id: "aabbccddeeff", name: "bridge", driver: "bridge", scope: "local" },
        { id: "bbccddeeff11", name: "host", driver: "host", scope: "local" },
        { id: "ccddeeff1122", name: "none", driver: "null", scope: "local" }
      ],
      volumes: [],
      proximoId: 1000,
      composeProjetos: {}
    };
  }

  var estado = estadoInicial();

  function novoIdCurto() {
    var id = (estado.proximoId++).toString(16).padStart(12, "0");
    return id;
  }
  function novoNome() {
    var nomes = ["agitated_einstein", "boring_torvalds", "clever_curie", "dreamy_neumann", "eager_feynman", "focused_hodgkin", "gracious_jemison", "happy_liskov", "inspired_blackwell", "jolly_morse", "kind_dijkstra", "lucid_bartik"];
    var n = nomes[Math.floor(Math.random() * nomes.length)];
    var sufixo = Math.floor(Math.random() * 1000);
    return n + "-" + sufixo;
  }
  function encontrarImagem(ref) {
    // ref pode ser "nginx", "nginx:alpine", "nginx:latest" ou ID
    var partes = ref.split(":");
    var repo = partes[0], tag = partes[1] || "latest";
    for (var i = 0; i < estado.imagens.length; i++) {
      var im = estado.imagens[i];
      if (im.id.indexOf(ref) === 0) return im;
      if (im.repo === repo && im.tag === tag) return im;
    }
    return null;
  }
  function encontrarContainer(ref) {
    for (var i = 0; i < estado.containers.length; i++) {
      var c = estado.containers[i];
      if (c.id.indexOf(ref) === 0 || c.nome === ref) return c;
    }
    return null;
  }
  function pad(s, n) { s = String(s); while (s.length < n) s += " "; return s; }
  function padEsq(s, n) { s = String(s); while (s.length < n) s = " " + s; return s; }

  /* ---------- Comandos Docker ---------- */
  function cmdDocker(args) {
    if (!args.length) return dockerHelp();
    var sub = args[0];
    var resto = args.slice(1);

    switch (sub) {
      case "--version": return "Docker version " + DOCKER_VERSION + ", build fake123";
      case "--help": return dockerHelp();
      case "version":
        return "Client:\n  Version:   " + DOCKER_VERSION + "\n  OS/Arch:   linux/amd64\n\nServer: Docker Engine " + DOCKER_VERSION + " (simulado)";
      case "info":
        return "Client: Docker Engine - Community\n  Version:    " + DOCKER_VERSION + "\n\nServer:\n  Containers: " + estado.containers.filter(function(c){return c.status==="running";}).length + "\n  Images:     " + estado.imagens.length + "\n  Server Version: " + DOCKER_VERSION + "\n  Storage Driver: overlay2\n  Operating System: Ubuntu 24.04 LTS (simulado)";
      case "run": return dockerRun(resto);
      case "ps": return dockerPs(resto);
      case "images": return dockerImages(resto);
      case "pull": return dockerPull(resto);
      case "stop": return dockerStop(resto, false);
      case "start": return dockerStop(resto, "start");
      case "restart": return dockerStop(resto, "restart");
      case "rm": return dockerRm(resto);
      case "rmi": return dockerRmi(resto);
      case "logs": return dockerLogs(resto);
      case "exec": return dockerExec(resto);
      case "inspect": return dockerInspect(resto);
      case "stats": return dockerStats(resto);
      case "build": return dockerBuild(resto);
      case "tag": return dockerTag(resto);
      case "push": return "(simulador) push para registry não disponível — faça docker login antes num registry real.";
      case "login": return "Login Succeeded (simulado)";
      case "network": return dockerNetwork(resto);
      case "volume": return dockerVolume(resto);
      case "system": return dockerSystem(resto);
      case "compose": return dockerCompose(resto);
      case "container": // alias
        if (resto[0] === "ls" || resto[0] === "ps") return dockerPs(resto.slice(1));
        return "docker container " + resto[0] + ": use 'docker " + resto[0] + "' diretamente.";
      case "image":
        if (resto[0] === "ls") return dockerImages(resto.slice(1));
        return "docker image " + resto[0] + ": use 'docker " + resto[0] + "' diretamente.";
      default:
        if (sub === "--help" || resto.length === 0 && sub.indexOf("-") === 0) return dockerHelp();
        return 'docker: \'' + sub + '\' is not a docker command.\nSee \'docker --help\'';
    }
  }

  function dockerHelp() {
    return [
      "Usage:  docker [OPTIONS] COMMAND",
      "",
      "A self-sufficient runtime for containers",
      "",
      "Commands:",
      "  run       Create and run a new container from an image",
      "  ps        List containers",
      "  images    List images",
      "  pull      Download an image from a registry",
      "  stop      Stop one or more running containers",
      "  start     Start one or more stopped containers",
      "  restart   Restart one or more containers",
      "  rm        Remove one or more containers",
      "  rmi       Remove one or more images",
      "  logs      Fetch the logs of a container",
      "  exec      Run a command in a running container",
      "  build     Build an image from a Dockerfile",
      "  tag       Create a tag TARGET_IMAGE that refers to SOURCE_IMAGE",
      "  network   Manage networks",
      "  volume    Manage volumes",
      "  compose   Docker Compose (v2)",
      "  system    Manage Docker",
      "  inspect   Display detailed information on one or more Docker objects",
      "  stats     Display a live stream of container(s) resource usage statistics",
      "  info      Display system-wide information",
      "  version   Show the Docker version information",
      "",
      "Run 'docker COMMAND --help' for more information on a command."
    ].join("\n");
  }

  function dockerRun(args) {
    // flags: -d, -it, --name, -p, -e, -v, --rm, --network
    var detached = false, interactive = false, rm = false;
    var nome = null, portas = [], envs = [], volumes = [], network = "bridge";
    var imagem = null, comando = [];
    for (var i = 0; i < args.length; i++) {
      var a = args[i];
      if (a === "-d" || a === "--detach") detached = true;
      else if (a === "-it" || a === "-ti") { interactive = true; detached = true; }
      else if (a === "-i") interactive = true;
      else if (a === "-t") { /* tty */ }
      else if (a === "--rm") rm = true;
      else if (a === "--name") { nome = args[++i]; }
      else if (a === "-p" || a === "--publish") { portas.push(args[++i]); }
      else if (a === "-e" || a === "--env") { envs.push(args[++i]); }
      else if (a === "-v" || a === "--volume") { volumes.push(args[++i]); }
      else if (a === "--network") { network = args[++i]; }
      else if (a.indexOf("--name=") === 0) nome = a.slice(7);
      else if (a.indexOf("-p=") === 0 || a.indexOf("--publish=") === 0) portas.push(a.split("=").slice(1).join("="));
      else if (a.indexOf("-e=") === 0 || a.indexOf("--env=") === 0) envs.push(a.split("=").slice(1).join("="));
      else if (a.indexOf("-v=") === 0 || a.indexOf("--volume=") === 0) volumes.push(a.split("=").slice(1).join("="));
      else if (a.indexOf("--network=") === 0) network = a.slice(10);
      else if (a[0] === "-" && a.length > 1 && !imagem) { /* flag desconhecida, ignora */ }
      else if (!imagem) imagem = a;
      else comando.push(a);
    }
    if (!imagem) return "docker: 'docker run' requires at least 1 argument.\nSee 'docker run --help'.";
    var im = encontrarImagem(imagem);
    if (!im) {
      return "Unable to find image '" + imagem + "' locally\n" + imagem.split(":")[0] + ": Pulling from library/" + imagem.split(":")[0] + "\nStatus: Downloaded newer image for " + imagem + "\n" +
        "docker: pull access denied for " + imagem + ", repository does not exist or may require 'docker login'.\nSee 'docker run --help'.";
    }
    var c = {
      id: novoIdCurto(),
      nome: nome || novoNome(),
      imagem: im.repo + ":" + im.tag,
      comando: comando.join(" ") || "/bin/sh",
      status: "running",
      portas: portas,
      criado: "Hace 0 segundos",
      criadoEm: Date.now()
    };
    estado.containers.push(c);
    var saida = c.id + "\n";
    if (im.repo === "hello-world") {
      saida = c.id + "\n\nHello from Docker!\nThis message shows that your installation appears to be working correctly.\n\nTo generate this message, Docker took the following steps:\n 1. The Docker client contacted the Docker daemon.\n 2. The Docker daemon pulled the \"hello-world\" image from the Docker Hub.\n 3. The Docker daemon created a new container from that image.\n 4. The Docker daemon streamed that output to the Docker client.\n";
      if (rm) {
        estado.containers = estado.containers.filter(function(x){ return x.id !== c.id; });
      } else {
        c.status = "exited";
      }
    }
    return saida;
  }

  function dockerPs(args) {
    var all = args.indexOf("-a") !== -1 || args.indexOf("--all") !== -1;
    var rodando = estado.containers.filter(function(c){ return all || c.status === "running"; });
    var linhas = ["CONTAINER ID   IMAGE              COMMAND       CREATED          STATUS                    PORTS     NAMES"];
    rodando.forEach(function(c) {
      var portasStr = c.portas.length ? c.portas.join(", ") : "";
      linhas.push(pad(c.id.slice(0,12), 14) + pad(c.imagem, 19) + pad('"' + c.comando + '"', 14) + pad("2 minutes ago", 18) + pad(c.status === "running" ? "Up 2 minutes" : "Exited (0) 1 minute ago", 25) + pad(portasStr, 10) + c.nome);
    });
    if (!rodando.length) return "CONTAINER ID   IMAGE   COMMAND   CREATED   STATUS   PORTS   NAMES";
    return linhas.join("\n");
  }

  function dockerImages(args) {
    var linhas = ["REPOSITORY   TAG          IMAGE ID       CREATED         SIZE"];
    estado.imagens.forEach(function(im) {
      linhas.push(pad(im.repo, 13) + pad(im.tag, 13) + pad(im.id.slice(0,12), 15) + pad(im.created, 17) + im.size);
    });
    return linhas.join("\n");
  }

  function dockerPull(args) {
    if (!args.length) return "docker: 'docker pull' requires at least 1 argument.\nSee 'docker pull --help'.";
    var ref = args[0];
    var existente = encontrarImagem(ref);
    if (existente) return ref + ": Image is up to date (simulado)";
    var partes = ref.split(":");
    var repo = partes[0], tag = partes[1] || "latest";
    var novo = { id: novoIdCurto(), repo: repo, tag: tag, size: "~100MB", created: "agora" };
    estado.imagens.push(novo);
    return "Trying to pull " + repo + ":" + tag + "...\n" + tag + ": Pulling from library/" + repo + "\nStatus: Downloaded newer image for " + ref + "\ndocker.io/library/" + ref;
  }

  function dockerStop(args, acao) {
    if (!args.length) return "docker: 'docker " + (acao||"stop") + "' requires at least 1 argument.";
    var ok = [], err = [];
    args.forEach(function(ref) {
      var c = encontrarContainer(ref);
      if (!c) { err.push("Error response from daemon: No such container: " + ref); return; }
      if (acao === "start") { c.status = "running"; ok.push(c.nome); }
      else if (acao === "restart") { c.status = "running"; ok.push(c.nome); }
      else { c.status = "exited"; ok.push(c.nome); }
    });
    var out = ok.join("\n");
    if (err.length) out += (out ? "\n" : "") + err.join("\n");
    return out || "";
  }

  function dockerRm(args) {
    var force = args.indexOf("-f") !== -1 || args.indexOf("--force") !== -1;
    var refs = args.filter(function(a){ return a[0] !== "-"; });
    if (!refs.length) return "docker: 'docker rm' requires at least 1 argument.";
    var ok = [], err = [];
    refs.forEach(function(ref) {
      var idx = -1;
      for (var i = 0; i < estado.containers.length; i++) {
        if (estado.containers[i].id.indexOf(ref) === 0 || estado.containers[i].nome === ref) { idx = i; break; }
      }
      if (idx < 0) { err.push("Error: No such container: " + ref); return; }
      if (estado.containers[idx].status === "running" && !force) {
        err.push('Error response from daemon: cannot remove container "' + ref + '": container is running: stop the container before removing or force remove');
        return;
      }
      ok.push(estado.containers[idx].nome);
      estado.containers.splice(idx, 1);
    });
    var out = ok.join("\n");
    if (err.length) out += (out ? "\n" : "") + err.join("\n");
    return out;
  }

  function dockerRmi(args) {
    var force = args.indexOf("-f") !== -1;
    var refs = args.filter(function(a){ return a[0] !== "-"; });
    if (!refs.length) return "docker: 'docker rmi' requires at least 1 argument.";
    var ok = [], err = [];
    refs.forEach(function(ref) {
      var idx = -1;
      for (var i = 0; i < estado.imagens.length; i++) {
        var im = estado.imagens[i];
        if (im.id.indexOf(ref) === 0 || (im.repo + ":" + im.tag) === ref || im.repo === ref) { idx = i; break; }
      }
      if (idx < 0) { err.push("Error: No such image: " + ref); return; }
      var emUso = estado.containers.some(function(c){ return c.imagem === estado.imagens[idx].repo + ":" + estado.imagens[idx].tag; });
      if (emUso && !force) {
        err.push("Error response from daemon: conflict: unable to remove repository reference \"" + ref + "\" (must force) - container " + estado.containers[0].nome + " is using its referenced image");
        return;
      }
      ok.push("Untagged: " + estado.imagens[idx].repo + ":" + estado.imagens[idx].tag);
      ok.push("Deleted: " + estado.imagens[idx].id);
      estado.imagens.splice(idx, 1);
    });
    var out = ok.join("\n");
    if (err.length) out += (out ? "\n" : "") + err.join("\n");
    return out;
  }

  function dockerLogs(args) {
    var ref = args.filter(function(a){ return a[0] !== "-"; })[0];
    if (!ref) return "docker: 'docker logs' requires at least 1 argument.";
    var c = encontrarContainer(ref);
    if (!c) return "Error response from daemon: No such container: " + ref;
    if (c.imagem.indexOf("hello-world") === 0) {
      return "\nHello from Docker!\nThis message shows that your installation appears to be working correctly.\n";
    }
    if (c.imagem.indexOf("nginx") === 0) {
      return '/docker-entrypoint.sh: /docker-entrypoint.d/ is not empty, will attempt to perform configuration\n/docker-entrypoint.sh: Looking for shell scripts in /docker-entrypoint.d/\n/docker-entrypoint.sh: Launching /docker-entrypoint.d/10-listen-on-ipv6-by-default.sh\n10-listen-on-ipv6-by-default.sh: info: Getting the checksum of /etc/nginx/conf.d/default.conf\n10-listen-on-ipv6-by-default.sh: info: Enabled listen on IPv6 in /etc/nginx/conf.d/default.conf\n/docker-entrypoint.sh: Launching /docker-entrypoint.d/20-envsubst-on-templates.sh\n/docker-entrypoint.sh: Launching /docker-entrypoint.d/30-tune-worker-processes.sh\n/docker-entrypoint.sh: Configuration complete; ready for start up\n';
    }
    return "(container " + c.nome + " não produziu logs ainda — simulado)\n";
  }

  function dockerExec(args) {
    var it = args.indexOf("-it") !== -1;
    var refIdx = args.findIndex(function(a){ return a[0] !== "-"; });
    if (refIdx < 0) return "docker: 'docker exec' requires at least 2 arguments.";
    var ref = args[refIdx];
    var cmd = args.slice(refIdx + 1).join(" ");
    var c = encontrarContainer(ref);
    if (!c) return "Error response from daemon: No such container: " + ref;
    if (c.status !== "running") return "Error response from daemon: Container " + c.nome + " is not running";
    if (cmd === "sh" || cmd === "bash" || cmd === "/bin/sh") {
      return "(simulador) shell interativo dentro do container " + c.nome + " — no guia real, você estaria dentro do container agora. Digite 'exit' para sair.\n# ";
    }
    if (cmd.indexOf("cat ") === 0) return "(simulador) conteúdo do arquivo dentro do container " + c.nome + "\n";
    return "(exec: " + cmd + " no container " + c.nome + ")\n";
  }

  function dockerInspect(args) {
    var ref = args.filter(function(a){ return a[0] !== "-"; })[0];
    if (!ref) return "docker: 'docker inspect' requires at least 1 argument.";
    var c = encontrarContainer(ref);
    var im = encontrarImagem(ref);
    var obj = c || im;
    if (!obj) return "Error: No such object: " + ref;
    return JSON.stringify([{
      Id: obj.id,
      Nome: obj.nome || (obj.repo + ":" + obj.tag),
      Image: obj.imagem || obj.id,
      Status: obj.status || "available",
      Created: new Date().toISOString()
    }], null, 2);
  }

  function dockerStats(args) {
    var rodando = estado.containers.filter(function(c){ return c.status === "running"; });
    if (!rodando.length) return "CONTAINER ID   NAME   CPU %   MEM USAGE / LIMIT   MEM %   NET I/O   BLOCK I/O   PIDS";
    var linhas = ["CONTAINER ID   NAME              CPU %   MEM USAGE / LIMIT     MEM %   NET I/O       BLOCK I/O   PIDS"];
    rodando.forEach(function(c) {
      linhas.push(pad(c.id.slice(0,12), 14) + pad(c.nome, 18) + pad("0.05%", 8) + pad("12.5MiB / 7.79GiB", 24) + pad("0.16%", 8) + pad("1.2kB / 0B", 14) + pad("0B / 0B", 10) + "5");
    });
    return linhas.join("\n") + "\n(simulador: dados fictícios)";
  }

  function dockerBuild(args) {
    var tag = null, path = ".";
    for (var i = 0; i < args.length; i++) {
      if (args[i] === "-t" || args[i] === "--tag") tag = args[++i];
      else if (args[i].indexOf("-t=") === 0 || args[i].indexOf("--tag=") === 0) tag = args[i].split("=").slice(1).join("=");
      else if (args[i][0] !== "-") path = args[i];
    }
    if (!tag) tag = "meuapp:latest";
    var partes = tag.split(":");
    var novo = { id: novoIdCurto(), repo: partes[0], tag: partes[1] || "latest", size: "~150MB", created: "agora" };
    estado.imagens.push(novo);
    return "[+] Building 12.4s (8/8) FINISHED\n => [internal] load build definition from Dockerfile\n => => transferring dockerfile: 234B\n => [1/4] FROM docker.io/library/" + (partes[0] === "meuapp" ? "node:22-alpine" : partes[0]) + "\n => [2/4] WORKDIR /app\n => [3/4] COPY . .\n => [4/4] RUN npm install\n => exporting to image\n => => exporting layers\n => => writing image sha256:" + novo.id + "\n => => naming to " + tag + "\n\nSuccessfully built " + novo.id.slice(0,12) + "\nSuccessfully tagged " + tag;
  }

  function dockerTag(args) {
    if (args.length < 2) return "docker: 'docker tag' requires exactly 2 arguments.";
    var src = encontrarImagem(args[0]);
    if (!src) return "Error: No such image: " + args[0];
    var dest = args[1].split(":");
    estado.imagens.push({ id: src.id, repo: dest[0], tag: dest[1] || "latest", size: src.size, created: src.created });
    return "";
  }

  function dockerNetwork(args) {
    var sub = args[0] || "ls";
    var resto = args.slice(1);
    if (sub === "ls" || sub === "list") {
      var linhas = ["NETWORK ID     NAME      DRIVER    SCOPE"];
      estado.redes.forEach(function(r) {
        linhas.push(pad(r.id.slice(0,12), 15) + pad(r.name, 10) + pad(r.driver, 10) + r.scope);
      });
      return linhas.join("\n");
    }
    if (sub === "create") {
      var nome = resto[resto.length - 1];
      var r = { id: novoIdCurto(), name: nome, driver: "bridge", scope: "local" };
      estado.redes.push(r);
      return r.id;
    }
    if (sub === "rm" || sub === "remove") {
      var nome = resto[0];
      var idx = estado.redes.findIndex(function(r){ return r.name === nome; });
      if (idx < 0) return "Error response from daemon: network " + nome + " not found";
      if (nome === "bridge" || nome === "host" || nome === "none") return "Error response from daemon: predefined network " + nome + " cannot be removed";
      estado.redes.splice(idx, 1);
      return nome;
    }
    if (sub === "connect") return "(simulado) container conectado à rede";
    if (sub === "disconnect") return "(simulado) container desconectado da rede";
    return dockerNetworkHelp();
  }
  function dockerNetworkHelp() {
    return "Usage: docker network COMMAND\n\nCommands:\n  connect     Connect a container to a network\n  create      Create a network\n  disconnect  Disconnect a container from a network\n  inspect     Display detailed information on one or more networks\n  ls          List networks\n  prune       Remove all unused networks\n  rm          Remove one or more networks";
  }

  function dockerVolume(args) {
    var sub = args[0] || "ls";
    var resto = args.slice(1);
    if (sub === "ls" || sub === "list") {
      if (!estado.volumes.length) return "DRIVER    VOLUME NAME";
      var linhas = ["DRIVER    VOLUME NAME"];
      estado.volumes.forEach(function(v) { linhas.push(pad("local", 10) + v); });
      return linhas.join("\n");
    }
    if (sub === "create") {
      var nome = resto[resto.length - 1];
      estado.volumes.push(nome);
      return nome;
    }
    if (sub === "rm" || sub === "remove") {
      var idx = estado.volumes.indexOf(resto[0]);
      if (idx < 0) return "Error response from daemon: volume " + resto[0] + " does not exist";
      estado.volumes.splice(idx, 1);
      return resto[0];
    }
    return "Usage: docker volume COMMAND\n\nCommands:\n  create   Create a volume\n  inspect  Display detailed information on one or more volumes\n  ls       List volumes\n  prune    Remove all unused local volumes\n  rm       Remove one or more volumes";
  }

  function dockerSystem(args) {
    var sub = args[0] || "df";
    if (sub === "df") {
      var imagensSize = estado.imagens.length * 150;
      var containersSize = estado.containers.length * 5;
      return "TYPE            TOTAL     ACTIVE    SIZE      RECLAIMABLE\nImages          " + estado.imagens.length + "         " + estado.containers.length + "         " + imagensSize + "MB    " + imagensSize + "MB (100%)\nContainers      " + estado.containers.length + "         " + estado.containers.filter(function(c){return c.status==="running";}).length + "         " + containersSize + "MB    " + containersSize + "MB (100%)\nLocal Volumes   " + estado.volumes.length + "         0         0B        0B (0%)\nBuild Cache     0         0         0B        0B";
    }
    if (sub === "prune") {
      var force = args.indexOf("-f") !== -1 || args.indexOf("--force") !== -1 || args.indexOf("-a") !== -1;
      var nContainers = estado.containers.filter(function(c){ return c.status !== "running"; }).length;
      var nImagens = estado.imagens.length;
      estado.containers = estado.containers.filter(function(c){ return c.status === "running"; });
      estado.imagens = [];
      estado.volumes = [];
      return "Deleted Containers: " + nContainers + "\nDeleted Images: " + nImagens + "\nDeleted Volumes: 0\n\nTotal reclaimed space: " + (nImagens * 150 + nContainers * 5) + "MB (simulado)";
    }
    if (sub === "info") return cmdDocker(["info"]);
    return "Usage: docker system COMMAND\n\nCommands:\n  df         Show docker disk usage\n  events     Get real time events from the server\n  info       Display system-wide information\n  prune      Remove unused data";
  }

  function dockerCompose(args) {
    var sub = args[0] || "version";
    if (sub === "version" || sub === "--version") return "Docker Compose version " + COMPOSE_VERSION;
    if (sub === "up") {
      return "[+] Running 2/2\n ✔ Container meuapp-db-1   Started\n ✔ Container meuapp-web-1  Started\n(simulador) projeto iniciado";
    }
    if (sub === "down") return "[+] Running 2/2\n ✔ Container meuapp-web-1  Removed\n ✔ Container meuapp-db-1   Removed\n ✔ Network meuapp_default  Removed\n(simulador) projeto parado";
    if (sub === "ps") return dockerPs(["-a"]);
    if (sub === "logs") return "(simulador) logs do compose\n";
    if (sub === "build") return "(simulador) build das imagens do compose\n";
    return "Usage: docker compose [OPTIONS] COMMAND\n\nCommands:\n  up       Create and start containers\n  down     Stop and remove containers, networks\n  ps       List containers\n  logs     View output from containers\n  build    Build or rebuild services\n  version  Show the Docker Compose version";
  }

  /* ---------- Terminal ---------- */
  function executar(linha) {
    linha = linha.trim();
    if (!linha) return "";
    var partes = linha.split(/\s+/);
    var cmd = partes[0];
    var args = partes.slice(1);

    if (cmd === "docker") return cmdDocker(args);
    if (cmd === "clear") return "\x1b[2J\x1b[H"; // limpa tela
    if (cmd === "echo") return args.join(" ");
    if (cmd === "help") return "Comandos disponíveis: docker (run, ps, images, pull, stop, rm, rmi, logs, exec, build, network, volume, compose, system, ...), clear, echo, help, exit, history";
    if (cmd === "exit") return "(simulador) sessão encerrada — clique em Reiniciar para começar de novo.";
    if (cmd === "history") return "(simulador) histórico desta caixa";
    if (cmd === "sudo") {
      if (args[0] === "docker") return cmdDocker(args.slice(1));
      return "sudo: " + (args[0]||"") + ": command not found (simulado)";
    }
    return cmd + ": command not found (simulado — neste guia o foco é o comando 'docker')";
  }

  /* ---------- Interface no navegador ---------- */
  function montarTerminal(container) {
    var historico = [];
    var histIdx = -1;

    container.classList.add("docker-term");

    var output = document.createElement("div");
    output.className = "term-output";
    var inputLine = document.createElement("div");
    inputLine.className = "term-input-line";
    var prompt = document.createElement("span");
    prompt.className = "term-prompt";
    prompt.textContent = USER + "@" + HOST + ":~$ ";
    var input = document.createElement("input");
    input.className = "term-input";
    input.setAttribute("autocomplete", "off");
    input.setAttribute("spellcheck", "false");
    input.setAttribute("autocapitalize", "off");
    inputLine.appendChild(prompt);
    inputLine.appendChild(input);
    container.appendChild(output);
    container.appendChild(inputLine);

    // boas-vindas
    var boasVindas = document.createElement("div");
    boasVindas.className = "term-line term-welcome";
    boasVindas.textContent = "Máquina fictícia " + USER + "@" + HOST + " — Docker " + DOCKER_VERSION + " (simulado). Digite 'help' ou 'docker --help'.";
    output.appendChild(boasVindas);

    function rolar() { output.scrollTop = output.scrollHeight; }

    function print(texto, classe) {
      var div = document.createElement("div");
      div.className = "term-line " + (classe || "");
      //(prompt na frente da linha de comando)
      if (texto.indexOf("\x1b[2J") === 0) {
        output.innerHTML = "";
        return;
      }
      div.textContent = texto;
      output.appendChild(div);
      rolar();
    }

    function rodarComando(linha) {
      print(USER + "@" + HOST + ":~$ " + linha, "term-cmd");
      historico.push(linha);
      histIdx = historico.length;
      var resultado = executar(linha);
      if (resultado) resultado.split("\n").forEach(function(l) {
        var classe = "term-out";
        if (/^(Error|error|ERROR|Cannot|cannot|denied|No such|no such|Unable|unable|permission denied)/.test(l)) classe = "term-err";
        else if (/^(Successfully|Pushed|Login Succeeded|Created|Started|Stopped|Removed|Missão|✔)/.test(l)) classe = "term-ok";
        print(l, classe);
      });
    }

    input.addEventListener("keydown", function (e) {
      if (e.key === "Enter") {
        var v = input.value;
        input.value = "";
        rodarComando(v);
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        if (histIdx > 0) { histIdx--; input.value = historico[histIdx] || ""; }
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        if (histIdx < historico.length - 1) { histIdx++; input.value = historico[histIdx]; }
        else { histIdx = historico.length; input.value = ""; }
      } else if (e.key === "l" && e.ctrlKey) {
        e.preventDefault();
        output.innerHTML = "";
      } else if (e.key === "c" && e.ctrlKey) {
        e.preventDefault();
        print(USER + "@" + HOST + ":~$ ^C", "term-cmd");
        input.value = "";
      }
    });

    container.addEventListener("click", function () { input.focus({ preventScroll: true }); });
    setTimeout(function () { input.focus({ preventScroll: true }); }, 100);

    // verificar missão (data-goal)
    var goal = container.getAttribute("data-goal");
    var solucao = container.getAttribute("data-solucao");
    if (goal) {
      var checkMissao = setInterval(function () {
        var out = output.textContent;
        var g = goal.replace(/^out:/, "");
        if (out.indexOf(g) !== -1) {
          clearInterval(checkMissao);
          var badge = document.createElement("div");
          badge.className = "term-missao-ok";
          badge.textContent = "✔ Missão cumprida!";
          container.appendChild(badge);
        }
      }, 500);
    }

    // botões
    var toolbar = document.createElement("div");
    toolbar.className = "term-toolbar";
    var btnReiniciar = document.createElement("button");
    btnReiniciar.type = "button";
    btnReiniciar.className = "term-btn";
    btnReiniciar.textContent = "Reiniciar";
    btnReiniciar.addEventListener("click", function (e) {
      e.stopPropagation();
      estado = estadoInicial();
      output.innerHTML = "";
      var bv = document.createElement("div");
      bv.className = "term-line term-welcome";
      bv.textContent = "Máquina reiniciada. Docker " + DOCKER_VERSION + " (simulado).";
      output.appendChild(bv);
      input.value = "";
      input.focus();
    });
    toolbar.appendChild(btnReiniciar);
    if (solucao) {
      var btnSol = document.createElement("button");
      btnSol.type = "button";
      btnSol.className = "term-btn";
      btnSol.textContent = "Ver comando";
      btnSol.addEventListener("click", function (e) {
        e.stopPropagation();
        input.value = solucao;
        input.focus();
      });
      toolbar.appendChild(btnSol);
    }
    container.insertBefore(toolbar, container.firstChild);
  }

  // montar todos os .try da página
  function init() {
    document.querySelectorAll(".try").forEach(montarTerminal);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
