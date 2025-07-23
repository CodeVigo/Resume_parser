module.exports = {
  apps: [
    {
      name: "backend",
      script: "npm",
      args: "run start",
      cwd: "./backend",
      watch: false,
    },
    {
      name: "frontend",
      script: "npm",
      args: "run dev",
      cwd: "./frontend",
      watch: false,
    },
  ],
};
