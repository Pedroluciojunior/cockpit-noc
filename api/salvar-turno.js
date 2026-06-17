import { Octokit } from "@octokit/core";

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Método não permitido.' });
  }

  try {
    // Configura o Octokit com o token que está na Vercel
    const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });
    
    // Opcional: Adicione um console.log para ver se o token está chegando
    // console.log("Token carregado:", process.env.GITHUB_TOKEN ? "SIM" : "NÃO");

    const dadosTurno = req.body;
    const d = new Date().toLocaleDateString("pt-BR").replace(/\//g, "-");
    const h = new Date().toLocaleTimeString("pt-BR", { hour: '2-digit', minute: '2-digit' }).replace(/:/g, "-");
    
    await octokit.request('PUT /repos/{owner}/{repo}/contents/{path}', {
      owner: 'Pedroluciojunior',
      repo: 'cockpit-noc',
      path: `backups-turno/turno-${d}_${h}.json`,
      message: `Backup: ${d}`,
      content: Buffer.from(JSON.stringify(dadosTurno, null, 2)).toString("base64"),
      branch: 'main'
    });

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error("ERRO NO BACKEND:", error);
    return res.status(500).json({ success: false, error: error.message });
  }
}