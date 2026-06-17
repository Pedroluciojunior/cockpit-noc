import { Octokit } from "@octokit/core";

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Método não permitido.' });
  }

  // Verifica se o token existe antes de tentar usar
  if (!process.env.GITHUB_TOKEN) {
    return res.status(500).json({ success: false, error: 'GITHUB_TOKEN não configurado no servidor!' });
  }

  try {
    const dadosTurno = req.body;
    const dataFormatada = new Date().toLocaleDateString("pt-BR").replace(/\//g, "-");
    const horaFormatada = new Date().toLocaleTimeString("pt-BR", { hour: '2-digit', minute: '2-digit' }).replace(/:/g, "-");
    
    const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });
    const content = Buffer.from(JSON.stringify(dadosTurno, null, 2)).toString("base64");

    await octokit.request('PUT /repos/{owner}/{repo}/contents/{path}', {
      owner: 'Pedroluciojunior',
      repo: 'cockpit-noc',
      path: `backups-turno/turno-${dataFormatada}_${horaFormatada}.json`,
      message: `Backup: ${dataFormatada}`,
      content: content,
      branch: 'main'
    });

    return res.status(200).json({ success: true });
  } catch (error) {
    // Agora o erro detalhado vai aparecer no log da Vercel
    console.error("ERRO DETALHADO:", error);
    return res.status(500).json({ success: false, error: error.message });
  }
}