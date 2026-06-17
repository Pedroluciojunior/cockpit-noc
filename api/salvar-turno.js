import { Octokit } from "@octokit/core";

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Método não permitido.' });
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
    console.error("ERRO NO BACKEND:", error);
    return res.status(500).json({ success: false, error: error.message });
  }
}