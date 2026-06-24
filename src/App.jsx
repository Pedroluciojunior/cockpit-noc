/**
 * @project      Sistema Web de Gestão de Atendimentos (Cockpit Enterprise Edition)
 * @author       Pedro Lúcio Cardoso Matos Júnior
 * @role         IT Support Analyst / Solution Architect
 * @version      9.9.5 (NOC Enterprise Automation Master Edition)
 * @date         Junho de 2026
 *
 * "Toda vez que choveu, parou."
 */

import React, { useState, useEffect, useMemo, useRef } from "react";
import { get, set } from "idb-keyval"; 

export default function SistemaAtendimentos() {
  const [viewAtiva, setViewAtiva] = useState("operacional"); 
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem("sistema_darkmode") === "true");

  const [form, setForm] = useState({ designacao: "", gtNome: "", posicionamento: "", status: "Aberto" });
  const [filtro, setFiltro] = useState("");
  const [statusFiltro, setStatusFiltro] = useState("Todos");
  const [dataFiltro, setDataFiltro] = useState(new Date().toLocaleDateString("pt-BR"));

  const [blocoNotasTemporario, setBlocoNotasTemporario] = useState("");
  
  const [diretorioBackup, setDiretorioBackup] = useState(null);
  const [nomeDiretorio, setNomeDiretorio] = useState("Não configurado");

  const [rascunho, setRascunho] = useState(() => localStorage.getItem("sistema_rascunho") || "");
  const [toasts, setToasts] = useState([]);
  
  const [atendimentos, setAtendimentos] = useState(() => {
    try { const dados = localStorage.getItem("atendimentos"); return dados ? JSON.parse(dados) : []; } 
    catch (e) { return []; }
  });

  const [dadosFix, setDadosFix] = useState(() => {
    try { const salvo = localStorage.getItem("sistema_wiki_fix"); return salvo ? JSON.parse(salvo) : []; } catch(e) { return []; }
  });

const [dadosStcArsMaster, setDadosStcArsMaster] = useState(() => {
    const dadosLocais = [
      ["015", "ENCONTRADO OK", "SEM REALIZAÇÃO DE TESTE FÍSICO", "-", ".", "[Link Encontrado OK] Falha restabelecida após efetuar testes no link", "Este fechamento só deve ser utilizado para os casos em que o técnico de campo foi despachado e encontre o circuito normalizado e o cliente PERMITIU parar o circuito para realização de testes, PORÉM NÃO FOI POSSÍVEL IDENTIFICAR A CAUSA DA FALHA"],
      ["00105", "ENCONTRADO OK", "COM REALIZAÇÃO DE TESTE FÍSICO", "-", ".", "[Link Encontrado OK] Falha restabelecida sem intervenção técnica no link", "Este fechamento só deve ser utilizado para os casos em que o técnico de campo foi despachado e encontre o circuito normalizado e o cliente NÃO permitiu parar o circuito para realização de testes."],
      ["00514", "CLIENTE", "FALTA DE ENERGIA", "-", "Pública", "[Cliente - Falha Elétrica Energia] Falha elétrica no cliente por parte da concessionária de energia", "Falha causada por falta de energia da concessionária no ambiente do cliente"],
      ["00534", "CLIENTE", "REDE INTERNA", "-", ".", "[Cliente - Rede Interna] Falha restabelecida após correção da rede interna do cliente", "Falha causada por defeito na rede interna (quadros, blocos de interligação, cabos, rack) ou infra-estrutura (infiltrações, incêndio, etc) no ambiente do cliente"],
      ["00554", "CLIENTE", "REDE ELÉTRICA", "-", "Aterramento", "[Cliente - Falha Eletrica Energia] Falha elétrica ou fora dos padrões na rede do cliente", "Falha causada por defeito na rede elétrica (tomada, aterramento, no-break, retificador, disjuntor) ou climatização no ambiente do cliente"],
      ["00584", "CLIENTE", "EQUIPAMENTO DESLIGADO", "-", ".", "[Cliente - Eqpto desligado] Falha restabelecida após religar equipamento do cliente", "Falha causada por desligamento de equipamentos de responsabilidade da Oi (modem, roteador, PABX, conversor, etc) no ambiente do cliente. Teclas de modem pressionadas no cliente."],
      ["00506", "CLIENTE", "FALHA EQUIPAMENTO CLIENTE", "-", ".", "[Cliente - Eqpto Defeito] Falha restabelecida após trocar equipamento do cliente", "Falha causada por defeito em equipamentos de responsabilidade do cliente (switch, roteador, LAN, ataque de hacker, alta utilização, desconfiguração)"],
      ["00594", "CLIENTE", "FALHA EQUIPAMENTO CLIENTE", "-", ".", "[Cliente - Eqpto Defeito] Falha restabelecida após trocar equipamento do cliente", "Falha causada por defeito em equipamentos de responsabilidade do cliente (switch, roteador, LAN, ataque de hacker, alta utilização, desconfiguração)"],
      ["3001", "REDE METÁLICA", "DG", "ROUBO/ VANDALISMO", ".", "[VOZ Vandalismo] Falha restabelecida após equipamentos substituídos devido vandalismo por roubo/furto", "Falha causada por defeito nos blocos, estrutura metálica, aterramento, módulos/fusíveis no DG (predial ou URA) devido a roubo ou vandalismo, tendo sido solucionado através de recuperação, substituição ou reconexão do elemento danificado"],
      ["3002", "REDE METÁLICA", "DG", "JUMPER/CONEXÃO", ".", "[VOZ Jumper] Falha restabelecida após troca de jumper no acesso cliente", "Falha causada por defeito, desconexão ou falta de jumper e/ou fusível/módulo no DG (predial ou URA), tendo sido solucionado através da substituição, recuperação, reposição ou reconexão de jumper e/ou fusível/módulo"],
      ["3005", "REDE METÁLICA", "DG", "ACIDENTE", ".", "[VOZ Acidente] Falha restabelecida após fusão de cabo metalico no DG ocasionado por acidente ou obras", "Falha causada por defeito nos blocos, estrutura metálica, aterramento, módulos/fusíveis no DG (predial ou URA) devido a acidente por obras de terceiros, colisão de veículos, obras da contratada, fenômenos naturais, incêndio ou ataque de animais, tendo sido solucionado através de recuperação, substituição ou reconexão do elemento danificado"],
      ["3006", "REDE METÁLICA", "DG", "DEGRADAÇÃO", ".", "[VOZ Degradação] Falha restabelecida após troca/manobra de par metalico desgastado no DG", "Falha causada por degradação, desgaste, oxidação ou atenuação nos blocos, estrutura metálica, aterramento, módulos/fusíveis no DG (predial ou URA), tendo sido solucionado através da substituição ou recuperação do elemento danificado"],
      ["4385", "COMUTAÇÃO", "RESET", "-", "Reinicialização", "[Comutação] Falha restabelecida após reset no equipamento na Estação", "Falha normalizada após reset físico ou lógico de qualquer elemento da rede comutada"],
      ["4696", "COMUTAÇÃO", "RECONFIGURAÇÃO (REDE)", "-", "Configuração", "[Comutação] Falha restabelecida após configuração no DDR na Estação", "Falha causada por erro ou perda de configuração, bloqueio indevido, falhas de encaminhamento, tendo sido solucionado após reconfiguração da REDE nas centrais de comutação de responsabilidade da Oi"],
      ["4697", "COMUTAÇÃO", "RECONFIGURAÇÃO (DDR)", "-", "Configuração", "[Comutação] Falha restabelecida após configuração no DDR na Estação", "Falha causada por erro de configuração, bloqueio indevido, tendo sido solucionado após reconfiguração do DDR nas centrais de comutação de responsabilidade da Oi"],
      ["43173", "COMUTAÇÃO", "PLACA OU PORTA/PORTA", "-", "Placa", "[Comutação Placa] Falha restabelecida após troca de placa/porta na estação", "Falha causada por defeito, desgaste ou queima/curto de PLACA OU PORTA da rede comutada, tendo sido solucionada através de substituição de PLACA OU PORTA ou troca de facilidade (troca de porta)"],
      ["43373", "COMUTAÇÃO", "CHASSI/FONTE", "-", "Fonte", "[Comutação Fonte] Falha restabelecida após troca de fonte na estação", "Falha causada por defeito, desgaste ou queima/curto de fonte, rack, bastidor ou sub da rede comutada, tendo sido solucionada através de substituição ou recuperação do elemento"],
      ["43473", "COMUTAÇÃO", "CABO/CONECTOR", "-", "Cabo/Conector", "[Comutação Cabo] Falha restabelecida após troca de cabo/conector na estação", "Falha causada por defeito, desgaste, desconexão, solda fria, nos cabos/conectores e terminações de DID de facilidades da rede comutada, tendo sido solucionada através de substituição, recuperação, reposição ou reconexão do cabo/conector"],
      ["80055", "ACESSO DADOS", "OUTROS EQUIPAMENTOS", "RESET", "Reinicialização", "[Modem Reset] Falha restabelecida após modem reiniciado", "Falha normalizada após reset físico ou lógico de modem (analógico, banda-base, HDSL, SHDSL, DTU/NTU ou VSAT). Teclas pressionadas na estação"],
      ["80058", "ACESSO DADOS", "OUTROS EQUIPAMENTOS", "RECONFIGURAÇÃO", "Configuração", "[Modem Config] Falha restabelecida após configuração do modem", "Falha causada por erro ou perda de configuração de modem óptico, tendo sido solucionado após reconfiguração."],
      ["81005", "ACESSO DADOS", "MODEM ÓPTICO", "RESET", "Reinicialização", "[Modem Reset] Falha restabelecida após modem reiniciado", "Falha normalizada após reset físico ou lógico de modem (analógico, banda-base, HDSL, SHDSL, DTU/NTU ou VSAT). Teclas pressionadas na estação"],
      ["81008", "ACESSO DADOS", "MODEM ÓPTICO", "RECONFIGURAÇÃO", "Configuração", "[Modem Config] Falha restabelecida após configuração do modem", "Falha causada por erro ou perda de configuração de modem óptico, tendo sido solucionado após reconfiguração."],
      ["81102", "ACESSO DADOS", "MODEM ÓPTICO", "PLACA OU PORTA", "Porta", "[Modem Troca] Falha restabelecida após troca de placa/porta na Estação ou Cliente", "Falha causada por defeito, desgaste ou queima/curto de PLACA OU PORTA de modem óptico, tendo sido solucionada através de substituição do elemento em falha ou troca de porta/tributário"],
      ["81106", "ACESSO DADOS", "MODEM ÓPTICO", "RECONFIGURAÇÃO", "Configuração", "[Modem Config] Falha restabelecida após configuração do modem", "Falha causada por erro ou perda de configuração de modem óptico, tendo sido solucionado após reconfiguração."],
      ["81302", "ACESSO DADOS", "MODEM ÓPTICO", "CHASSI/FONTE", "Equipamento com defeito", "[Modem Ótico Cabo] Falha restabelecida após troca de cabo/conector no modem", "Falha causada por defeito, desgaste ou queima/curto de fonte, fusível, rack ou sub rack de modem óptico, tendo sido solucionada através de substituição do elemento em falha"],
      ["81402", "ACESSO DADOS", "MODEM ÓPTICO", "CABO/CONECTOR", "Cabo", "[Modem Cabo] Falha restabelecida após troca de cabo/conector no modem", "Falha causada por defeito, manuseio indevido, má qualidade da instalação/confecção/material utilizado, desgaste, desconexão, mau contato ou solda fria nos cabos, cordões ópticos, conectores ou terminações de DID de modens ópticos, tendo sido solucionada através de substituição, recuperação, reposição ou reconexão do elemento em falha"],
      ["81712", "ACESSO DADOS", "MODEM ÓPTICO", "-", "Cabo", "[Modem Cabo] Falha restabelecida após troca de cabo/conector no modem", "Falha causada por defeito, manuseio indevido, má qualidade da instalação/confecção/material utilizado, desgaste, desconexão, mau contato ou solda fria nos cabos, cordões ópticos, conectores ou terminações de DID de modens ópticos, tendo sido solucionada através de substituição, recuperação, reposição ou reconexão do elemento em falha"],
      ["82005", "ACESSO DADOS", "MODEM", "RESET", "Reinicialização", "[Modem Reset] Falha restabelecida após modem reiniciado", "Falha normalizada após reset físico ou lógico de modem (analógico, banda-base, HDSL, SHDSL, DTU/NTU ou VSAT). Teclas pressionadas na estação"],
      ["82006", "ACESSO DADOS", "MODEM", "RECONFIGURAÇÃO", "Configuração", "[Modem Config] Falha restabelecida após configuração do modem", "Falha causada por erro ou perda de configuração de modem (analógico, banda-base, HDSL, SHDSL, DTU/NTU ou VSAT), tendo sido solucionado após reconfiguração."],
      ["82008", "ACESSO DADOS", "MODEM", "RECONFIGURAÇÃO", "Configuração", "[Modem Config] Falha restabelecida após configuração do modem", "Falha causada por erro ou perda de configuração de modem (analógico, banda-base, HDSL, SHDSL, DTU/NTU ou VSAT), tendo sido solucionado após reconfiguração."],
      ["82045", "ACESSO DADOS", "CONVERSOR DE INTERFACE (MÍDIA)", "RESET", "Reinicialização", "[Modem Reset] Falha restabelecida após reinicialização do conversor", "Falha normalizada após reset físico do conversor de interface/mídia (G703<=>V35, G703<=>Ethernet, óptico<=>G703, óptico<=>Ethernet). Este encerramento aplica-se quando o conversor é utilizado como solução de Acesso."],
      ["82048", "ACESSO DADOS", "CONVERSOR DE INTERFACE (MÍDIA)", "RECONFIGURAÇÃO", "Configuração", "[Modem Config] Falha restabelecida após configuração do modem", "Falha causada por erro de configuração tendo sido solucionado após reconfiguração, (estrapes) do conversor de interface/mídia (G703<=>V35, G703<=>Ethernet, óptico<=>G703, óptico<=>Ethernet). Este encerramento aplica-se quando o conversor é utilizado como solução de Acesso."],
      ["82102", "ACESSO DADOS", "MODEM", "PLACA OU PORTA", "Porta", "[Modem Troca] Falha restabelecida após troca de placa/porta na Estação ou Cliente", "Falha causada por defeito, desgaste ou queima/curto de PLACA OU PORTA de modem (analógico, banda-base, HDSL, SHDSL, DTU/NTU ou VSAT), tendo sido solucionada através de substituição do elemento em falha"],
      ["82142", "ACESSO DADOS", "CONVERSOR DE INTERFACE (MÍDIA)", "PLACA OU PORTA", "Porta", "[Conversor Troca] Falha restabelecida após troca de conversor na Estação ou Cliente", "Falha causada por defeito, desgaste ou queima/curto do conversor de interface/mídia (G703<=>V35, G703<=>Ethernet, óptico<=>G703, óptico<=>Ethernet), tendo sido solucionada através de substituição do conversor. Este encerramento aplica-se quando o conversor é utilizado como solução de Acesso."],
      ["82302", "ACESSO DADOS", "MODEM", "CHASSI/FONTE", "Equipamento com defeito", "[Modem Cabo] Falha restabelecida após troca de cabo/conector no modem", "Falha causada por defeito, desgaste ou queima/curto de fonte, fusível, gabinete, rack ou sub rack de modem, tendo sido solucionada através de substituição do elemento em falha"],
      ["82342", "ACESSO DADOS", "CONVERSOR DE INTERFACE (MÍDIA)", "CHASSI/FONTE", "Equipamento com defeito", "[Conversor Fonte] Falha restabelecida após troca de fonte na Estação ou Cliente", "Falha causada por defeito, desgaste ou queima/curto de fonte, fusível, rack, chassi, bastidor/sub/terminação DID de conversores de interface/mídia (G703<=>V35, G703<=>Ethernet, óptico<=>G703, óptico<=>Ethernet), tendo sido solucionada através de substituição ou recuperação do elemento em falha. Este encerramento aplica-se quando o conversor é utilizado como solução de Acesso."],
      ["82402", "ACESSO DADOS", "MODEM", "CABO/CONECTOR", "Cabo", "[Modem Cabo] Falha restabelecida após troca de cabo/conector no modem", "Falha causada por defeito, manuseio indevido, má qualidade da instalação/confecção/material utilizado, desgaste, desconexão, mau contato ou solda fria nos cabos, conectores, terminações de DID, régua/cabo/adaptador de interface de modens (analógico, banda-base, HDSL, SHDSL, DTU/NTU ou VSAT), tendo sido solucionada através de substituição, recuperação, reposição ou reconexão do elemento em falha"],
      ["82442", "ACESSO DADOS", "CONVERSOR DE INTERFACE (MÍDIA)", "CABO/CONECTOR", "Cabo", "[Modem Cabo] Falha restabelecida após troca de cabo/conector no modem", "Falha causada por defeito, manuseio indevido, má qualidade da instalação/confecção/material utilizado, desgaste, desconexão, mau contato ou solda fria nos cabos, cordões ópticos ou conectores de conversores de interface/mídia (G703<=>V35, G703<=>Ethernet, óptico<=>G703, óptico<=>Ethernet), tendo sido solucionada através de substituição, recuperação, reposição ou reconexão do elemento em falha. Este encerramento aplica-se quando o conversor é utilizado como solução de Acesso."],
      ["84282", "REDE DE DADOS", "REDE MULTISERVIÇOS", "PLACA OU PORTA", "Placa", "[Backbone Placa] Falha restabelecida após troca de placa/porta na estação", "Falha causada por defeito, desgaste ou queima/curto de PLACA OU PORTA de qualquer elemento da RMS (roteadores, switches, servidor de autenticação de senha, RAS, BRAS, etc), tendo sido solucionada através de substituição de PLACA OU PORTA ou troca de facilidade (troca de porta)"],
      ["84285", "REDE DE DADOS", "REDE MULTISERVIÇOS", "RESET", "Reinicialização", "[Backbone Reset] Falha restabelecida após reset no equipamento na Estação", "Falha normalizada após reset físico ou lógico de qualquer elemento da RMS (roteadores, switches, servidor de autenticação de senha, RAS, BRAS, etc)"],
      ["84286", "REDE DE DADOS", "REDE MULTISERVIÇOS", "RECONFIGURAÇÃO", "Configuração", "[Backbone Config] Falha restabelecida após configuração na Estação", "Falha causada por erro ou perda de configuração, bloqueio indevido (blacklist) ou falhas de roteamento, tendo sido solucionado após reconfiguração/roteamento de qualquer elemento da RMS (roteadores, switches, servidor de autenticação de senha, RAS, BRAS, etc)"],
      ["84288", "REDE DE DADOS", "REDE MULTISERVIÇOS", "RECONFIGURAÇÃO", "Configuração", "[Backbone Config] Falha restabelecida após configuração na Estação", "Falha causada por erro ou perda de configuração, bloqueio indevido (blacklist) ou falhas de roteamento, tendo sido solucionado após reconfiguração/roteamento de qualquer elemento da RMS (roteadores, switches, servidor de autenticação de senha, RAS, BRAS, etc)"],
      ["84782", "REDE DE DADOS", "REDE MULTISERVIÇOS", "CABO/CONECTOR", "Cabo/Conector", "[Backbone Cabo] Falha restabelecida após troca de cabo/conector na estação", "Falha causada por defeito, manuseio indevido, má qualidade da instalação/confecção/material utilizado, desgaste, desconexão, mau contato ou solda fria nos cabos, cordões ópticos, conectores, terminações de DID, régua/cabo/adaptador de interface nos elementos da RMS (roteadores, switches, servidor de autenticação de senha, RAS, BRAS, etc), tendo sido solucionada através de substituição, recuperação, reposição ou reconexão do elemento em falha"],
      ["84982", "REDE DE DADOS", "REDE MULTISERVIÇOS", "CHASSI/FONTE", "Fonte", "[Backbone Fonte] Falha restabelecida após troca de fonte na Estação", "Falha causada por defeito, desgaste ou queima/curto de fonte, fusível, sistema de ventilação forçada, rack, chassi, bastidor ou sub de qualquer elemento da RMS (roteadores, switches, servidor de autenticação de senha, RAS, BRAS, etc), tendo sido solucionada através de substituição ou recuperação do elemento em falha"],
      ["85282", "REDE DE DADOS", "REDE METRO", "PLACA OU PORTA", "Placa", "[Backbone Placa] Falha restabelecida após troca de placa/porta na estação", "Falha causada por defeito, desgaste ou queima/curto de PLACA OU PORTA ou módulo (GBIC, SFP) de switches da Rede Metro Ethernet, tendo sido solucionada através de substituição de PLACA OU PORTA/módulo ou troca de facilidade (troca de porta)"],
      ["85285", "REDE DE DADOS", "REDE METRO", "RESET", "Reinicialização", "[Backbone Reset] Falha restabelecida após reset no equipamento na Estação", "Falha normalizada após reset físico ou lógico de switches da Rede Metro Ethernet."],
      ["85288", "REDE DE DADOS", "REDE METRO", "RECONFIGURAÇÃO", "Configuração", "[Backbone Config] Falha restabelecida após configuração na Estação", "Falha causada por erro ou perda de configuração, tendo sido solucionado após reconfiguração de switches da Rede Metro Ethernet"],
      ["85782", "REDE DE DADOS", "REDE METRO", "CABO/CONECTOR", "Cabo/Conector", "[Backbone Cabo] Falha restabelecida após troca de cabo/conector na estação", "Falha causada por defeito, manuseio indevido, má qualidade da instalação/confecção/material utilizado, desgaste, desconexão ou mau contato nos cabos UTP, conectores RJ45, cordões monofibra nos switches da Rede Metro Ethernet, tendo sido solucionada através de substituição, recuperação, reposição ou reconexão do elemento em falha"],
      ["85982", "REDE DE DADOS", "REDE METRO", "CHASSI/FONTE", "Fonte", "[Backbone Fonte] Falha restabelecida após troca de fonte na Estação", "Falha causada por defeito, desgaste ou queima/curto de fonte, fusível, sistema de ventilação forçada, rack, chassi ou bastidor de switches da Rede Metro Ethernet, tendo sido solucionada através de substituição ou recuperação do elemento em falha"],
      ["86282", "REDE DE DADOS", "REDES ESPECIALIZADAS", "PLACA OU PORTA", "Placa", "[Backbone Placa] Falha restabelecida após troca de placa/porta na estação", "Falha causada por defeito, desgaste ou queima/curto de PLACA OU PORTA de qualquer elemento das Redes Especializadas (determinística, estatística, ATM, frame-relay, x25, etc) de qualquer fabricante (Newbridge, Alcatel, Datacom, Huawei, DXX, Nortel, etc), tendo sido solucionada através de substituição de PLACA OU PORTA ou troca de facilidade (troca de porta)"],
      ["86285", "REDE DE DADOS", "REDES ESPECIALIZADAS", "RESET", "Reinicialização", "[Backbone Reset] Falha restabelecida após reset no equipamento na Estação", "Falha normalizada após reset físico ou lógico de qualquer elemento das Redes Especializadas (determinística, estatística, ATM, frame-relay, x25, etc) de qualquer fabricante (Newbridge, Alcatel, Datacom, Huawei, DXX, Nortel, etc)"],
      ["86288", "REDE DE DADOS", "REDES ESPECIALIZADAS", "RECONFIGURAÇÃO", "Configuração", "[Backbone Config] Falha restabelecida após configuração na Estação", "Falha causada por erro ou perda de configuração, bloqueio indevido, loop, tendo sido solucionado após reconfiguração/roteamento de qualquer elemento das Redes Especializadas (determinística, estatística, ATM, frame-relay, x25, etc) de qualquer fabricante (Newbridge, Alcatel, Datacom, Huawei, DXX, Nortel, etc)"],
      ["86782", "REDE DE DADOS", "REDES ESPECIALIZADAS", "CABO/CONECTOR", "Cabo/Conector", "[Backbone Cabo] Falha restabelecida após troca de cabo/conector na estação", "Falha causada por defeito, manuseio indevido, má qualidade da instalação/confecção/material utilizado, desgaste, desconexão, mau contato ou solda fria nos cabos, cordões ópticos, conectores, terminações de DID, régua/cabo/adaptador de interface nos elementos das Redes Especializadas (determinística, estatística, ATM, frame-relay, x25, etc) de qualquer fabricante (Newbridge, Alcatel, Datacom, Huawei, DXX, Nortel, etc), tendo sido solucionada através de substituição, recuperação, reposição ou reconexão do elemento em falha"],
      ["86982", "REDE DE DADOS", "REDES ESPECIALIZADAS", "CHASSI/FONTE", "Fonte", "[Backbone Fonte] Falha restabelecida após troca de fonte na Estação", "Falha causada por defeito, desgaste ou queima/curto de fonte, fusível, sistema de ventilação forçada, rack, chassi, bastidor ou sub de qualquer elemento das Redes Especializadas (determinística, estatística, ATM, frame-relay, x25, etc) de qualquer fabricante (Newbridge, Alcatel, Datacom, Huawei, DXX, Nortel, etc), tendo sido solucionada através de substituição ou recuperação do elemento em falha"],
      ["88105", "ACESSO DADOS", "CPE", "RESET", "Reinicialização", "[Roteador Reset] Falha restabelecida após reinicialização do CPE - Roteador no cliente", "Falha normalizada após reset físico ou lógico de CPE (Roteador, PABX, Encoder/Decoder, Camera, etc)"],
      ["88108", "ACESSO DADOS", "CPE", "RECONFIGURAÇÃO", "Configuração", "[Roteador Config] Falha restabelecida após configuração do roteador", "Falha causada por erro ou perda de configuração de CPE (Roteador, PABX, Encoder/Decoder, Camera, etc), tendo sido solucionado após reconfiguração."],
      ["88112", "ACESSO DADOS", "CPE", "PLACA OU PORTA", "Placa", "[Roteador Placa] Falha restabelecida após troca de placa/porta no acesso", "Falha causada por defeito, desgaste ou queima/curto de PLACA OU PORTA de CPE (Roteador, PABX, Encoder/Decoder, Camera, etc), tendo sido solucionada através de substituição do elemento em falha"],
      ["88122", "ACESSO DADOS", "CPE", "CHASSI/FONTE", "Equipamento com defeito", "[Roteador Troca] Falha restabelecida após troca do CPE - Roteador no cliente", "Falha causada por defeito, desgaste ou queima/curto de fonte, fusível, gabinete, rack ou sub rack de CPE (Roteador, PABX, Encoder/Decoder, Camera, etc), tendo sido solucionada através de substituição do elemento em falha"],
      ["88142", "ACESSO DADOS", "CPE", "CABO/CONECTOR", "Cabo", "[Roteador Cabo] Normalizado após troca/reconfiguração de switch.", "Falha causada por defeito, manuseio indevido, má qualidade da instalação/confecção/material utilizado, desgaste, desconexão, mau contato ou solda fria nos cabos, conectores de CPE (Roteador, PABX, Encoder/Decoder, Camera, etc), tendo sido solucionada através de substituição, recuperação, reposição ou reconexão do elemento em falha"],
      ["2N0091", "REDE METÁLICA", "REDE PRIMÁRIA/SECUNDÁRIA", "RECUPERAÇÃO DE PAR", "Par Metálico", "[Par Metalico] Falha restabelecida após recuperação de par metalico no acesso cliente", "Falha causada por degradação, desgaste, oxidação ou atenuação em qualquer elemento da rede primária, secundária ou rígida (cabos, caixas de emenda, conectores, subida lateral, etc), tendo sido solucionado através da substituição, RECUPERAÇÃO do elemento degradado"],
      ["2N3012", "REDE METÁLICA", "REDE PRIMÁRIA/SECUNDÁRIA", "ROUBO/ VANDALISMO", "Par Metálico", "[Par Metálico] Falha restabelecida após refazer o cabo metalico ocasionado por vandalismo", "Falha causada por rompimento de cabo primário, cabo secundário ou rede rígida/dedicada devido a roubo ou vandalismo, tendo sido solucionado através de recuperação, lançamento e/ou emenda de cabo."],
      ["2N3022", "REDE METÁLICA", "REDE PRIMÁRIA/SECUNDÁRIA", "JUMPER/CONEXÃO", "Par Metálico", "[Par Metálico] Falha restabelecidade após refazer jumper", "Falha causada por defeito, desconexão ou falta de CABO/CONECTOR em caixas de emenda pertencentes a rede primária, secundária ou rede rígida/dedicada, tendo sido solucionado através da substituição, recuperação, reposição ou reconexão de jumper"],
      ["2N3052", "REDE METÁLICA", "REDE PRIMÁRIA/SECUNDÁRIA", "ACIDENTE", "Par Metálico", "[Par Metálico] Falha restabelecida após fusão de cabo metalico ocasionado por acidente", "Falha causada por rompimento de cabo primário, cabo secundário ou rede rígida/dedicada devido a acidente por obras de terceiros, colisão de veículos, obras da contratada, fenômenos naturais, incêndio ou ataque de animais, tendo sido solucionado através de recuperação, lançamento e/ou emenda de cabo."],
      ["2N7012", "REDE METÁLICA", "ARMÁRIO", "ROUBO/ VANDALISMO", "Par Metálico", "[Par Metálico] Falha restabelecida após refazer o cabo metalico ocasionado por vandalismo", "Falha causada por defeito nos blocos, jumpers, estrutura metálica, aterramento nos armários de distribuição devido a roubo ou vandalismo, tendo sido solucionado através de recuperação, substituição ou reconexão do elemento danificado"],
      ["2N7022", "REDE METÁLICA", "ARMÁRIO", "JUMPER/CONEXÃO", "Par Metálico", "[Par Metálico] Falha restabelecidade após refazer jumper", "Falha causada por defeito, desconexão ou falta de jumper nos armários de distribuição, tendo sido solucionado através da substituição, recuperação, reposição ou reconexão de jumper"],
      ["2N7052", "REDE METÁLICA", "ARMÁRIO", "ACIDENTE", "Par Metálico", "[Par Metálico] Falha restabelecida após fusão de cabo metalico ocasionado por acidente", "Falha causada por defeito nos blocos, estrutura metálica, aterramento nos armários de distribuição devido a acidente por obras de terceiros, colisão de veículos, obras da contratada, fenômenos naturais, incêndio ou ataque de animais, tendo sido solucionado através de recuperação, substituição ou reconexão do elemento danificado"],
      ["2N7062", "REDE METÁLICA", "ARMÁRIO", "DEGRADAÇÃO", "Par Metálico", "[Par Metálico] Falha restabelecida após corrigir degradação do par metálico", "Falha causada por degradação, desgaste, oxidação ou atenuação nos blocos, estrutura metálica, aterramento nos armários de distribuição, tendo sido solucionado através da substituição ou recuperação do elemento danificado"],
      ["2S", "REDE METÁLICA", "REDE PRIMÁRIA/SECUNDÁRIA", "MANOBRA DE PAR", "Par Metálico", "[Par Metalico] Falha restabelecida após troca/manobra de par metalico no acesso cliente", "Falha causada por degradação, desgaste, oxidação ou atenuação em qualquer elemento da rede primária, secundária ou rígida (cabos, caixas de emenda, conectores, subida lateral, etc), tendo sido solucionado através de MANOBRA DE PAR (remanejamento) do elemento degradado."],
      ["5009A", "INFRA-ESTRUTURA", "ENERGIA", "-", ".", "[Backbone Falha Elétrica] Falha restabelecida após estabilizar a rede elétrica na estação", "Falha na rede elétrica da estação Oi (USCA, USCC, retificador, bateria, no break, fusível) podendo ter sido causado por vandalismo, descarga elétrica/atmosférica, sobrecarga, falta de energia, etc"],
      ["5089A", "INFRA-ESTRUTURA", "CLIMATIZAÇÃO", "-", ".", "[Backbone Climatização] Falha restabelecida após estabilizar climatização na Estação", "Falha na climatização da estação Oi, podendo ter sido causado por vandalismo, descarga elétrica/atmosférica, sobrecarga, etc"],
      ["5099A", "INFRA-ESTRUTURA", "CIVIL/PREDIAL", "-", ".", "[Backbone Predial] Falha restabelecida após correção de infraestrutura na Estação", "Falha de infra-estrutura civil/predial da estação Oi, podendo ter sido causado por infiltrações, vandalismo, incêndio, ataque de insetos, etc"],
      ["5116D", "REDE DE TRANSPORTE", "WDM / DWDM", "RECONFIGURAÇÃO", "Configuração", "[Backbone Config] Falha restabelecida após reconfiguração de receptor/transmissor na estação", "Falha causada por erro de configuração tendo sido solucionado após reconfiguração, ajustes de nível de canal de qualquer elemento da Rede de Transporte WDM/DWDM"],
      ["5148A", "REDE DE TRANSPORTE", "SDH / PDH (MUX)", "CHASSI/FONTE", "Equipamento com defeito", "[Backbone Fonte] Falha restabelecida após troca de fonte de alimentação na Rede de Transporte SDH/PDH (Mux)", "Falha causada por defeito, desgaste ou queima/curto de fonte, fusível, sistema de ventilação forçada, rack, chassi, bastidor ou sub de qualquer elemento da Rede de Transporte SDH/PDH (Mux), tendo sido solucionada através de substituição ou recuperação do elemento em falha."],
      ["5152A", "REDE DE TRANSPORTE", "WDM / DWDM", "CABO/CONECTOR", "Cabo/Conector", "[Backbone Cabo] Falha restabelecida após refeito cabo/conector na estação", "Falha causada por defeito, manuseio indevido, má qualidade da instalação/confecção/material utilizado, desgaste, desconexão, mau contato ou solda fria nos cabos, cordões ópticos, conectores, terminações de DID de qualquer elemento da Rede de Transporte WDM/DWDM, tendo sido solucionada através de substituição, recuperação, reposição ou reconexão do elemento em falha"],
      ["5155A", "REDE DE TRANSPORTE", "WDM / DWDM", "CHASSI/FONTE", "Fonte", "[Backbone Fonte] Falha restabelecida após troca de fonte na estação", "Falha causada por defeito, desgaste ou queima/curto de fonte, fusível, sistema de ventilação forçada, rack, chassi, bastidor ou sub de qualquer elemento da Rede de Transporte WDM/DWDM, tendo sido solucionada através de substituição ou recuperação do elemento em falha"],
      ["5158A", "REDE DE TRANSPORTE", "WDM / DWDM", "PLACA OU PORTA", "Placa", "[Backbone Placa] Falha restabelecida após troca de placa/porta na estação", "Falha causada por defeito, desgaste ou queima/curto de PLACA OU PORTA OU PORTA óptica, PLACA OU PORTA OU PORTA de tributário, PLACA OU PORTA OU PORTA de dados 64k, modulador, demodulador, transmissor, receptor, guia de onda ou antena de qualquer elemento da Rede de Transporte WDM/DWDM, tendo sido solucionada através de substituição de PLACA OU PORTA OU PORTA ou troca de facilidade (troca de porta)"],
      ["5158D", "REDE DE TRANSPORTE", "WDM / DWDM", "RECONFIGURAÇÃO", "Configuração", "[Backbone Config] Falha restabelecida após reconfiguração de receptor/transmissor na estação", "Falha causada por erro de configuração tendo sido solucionado após reconfiguração, ajustes de nível de canal de qualquer elemento da Rede de Transporte WDM/DWDM"],
      ["5158G", "REDE DE TRANSPORTE", "WDM / DWDM", "RESET", "Reinicialização", "[Backbone Reset] Falha restabelecida após reset de receptor/transmissor na estação", "Falha normalizada após reset físico ou lógico de qualquer elemento da Rede de Transporte WDM/DWDM"],
      ["5188A", "REDE DE TRANSPORTE", "SDH / PDH (MUX)", "CABO/CONECTOR", "Cabo/Conector", "[Backbone Cabo] Falha restabelecida após refeito cabo/conector na estação", "Falha causada por defeito, manuseio indevido, má qualidade da instalação/confecção/material utilizado, desgaste, desconexão, mau contato ou solda fria nos cabos, cordões ópticos, conectores, terminações de DID de qualquer elemento da Rede de Transporte SDH/PDH (Mux), tendo sido solucionada através de substituição, recuperação, reposição ou reconexão do elemento em falha"],
      ["5198A", "REDE DE TRANSPORTE", "SDH / PDH (MUX)", "PLACA OU PORTA", "Placa", "[Backbone Placa] Falha restabelecida após troca de placa/porta na estação", "Falha causada por defeito, desgaste ou queima/curto de PLACA OU PORTA OU PORTA óptica, PLACA OU PORTA OU PORTA de tributário, modulador, demodulador, PLACA OU PORTA OU PORTA de relógio, controladora, transmissor, receptor, transponder, guia de onda ou antena de qualquer elemento da Rede de Transporte SDH/PDH (Mux), tendo sido solucionada através de substituição de PLACA OU PORTA OU PORTA ou troca de facilidade (troca de porta)."],
      ["5198D", "REDE DE TRANSPORTE", "SDH / PDH (MUX)", "RECONFIGURAÇÃO", "Configuração", "[Backbone Roteado] Falha restabelecida após roteado na transmissão", "Falha causada por erro ou perda de configuração, bloqueio indevido (loop), tendo sido solucionado após reconfiguração de qualquer elemento da Rede de Transporte SDH/PDH (Mux) ou comutação de rota/anel."],
      ["5198G", "REDE DE TRANSPORTE", "SDH / PDH (MUX)", "RESET", "Reinicialização", "[Backbone Reset] Falha restabelecida após reset no equipamento na Estação", "Falha normalizada após reset físico ou lógico de qualquer elemento da Rede de Transporte SDH/PDH (Mux)."],
      ["5248A", "REDE DE TRANSPORTE", "SDH / PDH (RÁDIO)", "CHASSI/FONTE", "Fonte", "[Backbone Fonte] Falha restabelecida após troca de fonte na estação", "Falha causada por defeito, desgaste ou queima/curto de fonte, fusível, sistema de ventilação forçada, rack, chassi, bastidor ou sub de qualquer elemento da Rede de Transporte SDH/PDH (Radio), tendo sido solucionada através de substituição ou recuperação do elemento em falha."],
      ["5288A", "REDE DE TRANSPORTE", "SDH / PDH (RÁDIO)", "CABO/CONECTOR", "Cabo/Conector", "[Backbone Cabo] Falha restabelecida após refeito cabo/conector na estação", "Falha causada por defeito, manuseio indevido, má qualidade da instalação/confecção/material utilizado, desgaste, desconexão, mau contato ou solda fria nos cabos, cordões ópticos, conectores, terminações de DID de qualquer elemento da Rede de Transporte SDH/PDH (Radio), tendo sido solucionada através de substituição, recuperação, reposição ou reconexão do elemento em falha."],
      ["5298A", "REDE DE TRANSPORTE", "SDH / PDH (RÁDIO)", "PLACA OU PORTA", "Placa", "[Backbone Placa] Falha restabelecida após troca de placa/porta na estação", "Falha causada por defeito, desgaste ou queima/curto de PLACA OU PORTA OU PORTA óptica, PLACA OU PORTA OU PORTA de tributário, PLACA OU PORTA OU PORTA de dados 64k, modulador, demodulador, transmissor, receptor, guia de onda ou antena de qualquer elemento da Rede de Transporte PDH (Mux, Rádio, Modem Óptico), tendo sido solucionada através de substituição de PLACA OU PORTA OU PORTA ou troca de facilidade (troca de porta)."],
      ["5298D", "REDE DE TRANSPORTE", "SDH / PDH (RÁDIO)", "RECONFIGURAÇÃO", "Configuração", "[Backbone Config] Falha restabelecida após configuração de modem óptico na Estação", "Falha causada por erro de configuração tendo sido solucionado após reconfiguração, ajustes de nível de canal de qualquer elemento da Rede de Transporte SDH/PDH (Radio)."],
      ["5298G", "REDE DE TRANSPORTE", "SDH / PDH (RÁDIO)", "RESET", "Reinicialização", "[Backbone Reset] Falha restabelecida após reset no equipamento na Estação", "Falha normalizada após reset físico ou lógico de qualquer elemento da Rede de Transporte SDH/PDH (Radio)."],
      ["5301F", "REDE ÓPTICA", "ACESSO", "ROUBO/ VANDALISMO", "Fibra", "[Fibra Acidente] Falha restabelecida após fusão de fibra ocasionado por roubo/furto", "Falha causada por rompimento de cabo óptico devido a roubo ou vandalismo, tendo sido solucionado através de recuperação, lançamento e/ou emenda de cabo óptico."],
      ["5302F", "REDE ÓPTICA", "ACESSO", "ACIDENTE", "Fibra", "[Fibra Acidente] Falha restabelecida após fusão de fibra ocasionado por acidente", "Falha causada por rompimento de cabo óptico devido a acidente por obras de terceiros, colisão de veículos, obras da contratada, fenômenos naturais, incêndio ou ataque de animais, tendo sido solucionado através de recuperação, lançamento e/ou emenda de cabo óptico."],
      ["5305F", "REDE ÓPTICA", "ACESSO", "DEGRADAÇÃO", "Fibra", "[Fibra Desgaste] Falha restabelecida após troca/fusão de fibra ocasionada por atenuação.", "Falha causada por degradação, desgaste ou atenuação em qualquer elemento da rede óptica (cabos, caixas de emenda, conectores, DGO, cordões monofibra, etc), tendo sido solucionado através da substituição, recuperação ou limpeza do elemento degradado"],
      ["5307F", "REDE ÓPTICA", "ACESSO", "JUMPER/CONEXÃO", "Fibra", "[Fibra Jumper] Falha restabelecida após troca de jumper no acesso cliente", "Falha causada por defeito, desconexão ou falta de cordão monofibra/conector, tendo sido solucionado através da substituição, recuperação, reposição ou reconexão"],
      ["5311F", "REDE ÓPTICA", "BACKBONE NACIONAL", "ROUBO/ VANDALISMO", "Fibra", "[Backbone Fibra Acidente] Falha restabelecida após fusão de fibra ocasionado por roubo/furto", "Falha causada por rompimento de cabo óptico devido a roubo ou vandalismo, tendo sido solucionado através de recuperação, lançamento e/ou emenda de cabo óptico."],
      ["5312F", "REDE ÓPTICA", "BACKBONE NACIONAL", "ACIDENTE", "Fibra", "[Backbone Fibra Acidente] Rompimento de fibra ocasionado por acidente", "Falha causada por rompimento de cabo óptico devido a acidente por obras de terceiros, colisão de veículos, obras da contratada, fenômenos naturais, incêndio ou ataque de animais, tendo sido solucionado através de recuperação, lançamento e/ou emenda de cabo óptico."],
      ["5315F", "REDE ÓPTICA", "BACKBONE NACIONAL", "DEGRADAÇÃO", "Fibra", "[Backbone Fibra Desgaste] Falha restabelecida após troca/fusão de fibra ocasionada por atenuação.", "Falha causada por degradação, desgaste ou atenuação em qualquer elemento da rede óptica (cabos, caixas de emenda, conectores, DGO, cordões monofibra, etc), tendo sido solucionado através da substituição, recuperação ou limpeza do elemento degradado"],
      ["5317F", "REDE ÓPTICA", "BACKBONE NACIONAL", "JUMPER/CONEXÃO", "Fibra", "[Backbone Fibra Jumper] Falha restabelecida após troca de jumper/conector na Estação", "Falha causada por defeito, desconexão ou falta de cordão monofibra/conector, tendo sido solucionado através da substituição, recuperação, reposição ou reconexão"],
      ["5321F", "REDE ÓPTICA", "BACKBONE REGIONAL", "ROUBO/ VANDALISMO", "Fibra", "[Backbone Fibra Acidente] Falha restabelecida após fusão de fibra ocasionado por roubo/furto", "Falha causada por rompimento de cabo óptico devido a roubo ou vandalismo, tendo sido solucionado através de recuperação, lançamento e/ou emenda de cabo óptico."],
      ["5322F", "REDE ÓPTICA", "BACKBONE REGIONAL", "ACIDENTE", "Fibra", "[Backbone Fibra Acidente] Rompimento de fibra ocasionado por acidente", "Falha causada por rompimento de cabo óptico devido a acidente por obras de terceiros, colisão de veículos, obras da contratada, fenômenos naturais, incêndio ou ataque de animais, tendo sido solucionado através de recuperação, lançamento e/ou emenda de cabo óptico."],
      ["5325F", "REDE ÓPTICA", "BACKBONE REGIONAL", "DEGRADAÇÃO", "Fibra", "[Backbone Fibra Desgaste] Falha restabelecida após troca/fusão de fibra ocasionada por atenuação.", "Falha causada por degradação, desgaste ou atenuação em qualquer elemento da rede óptica (cabos, caixas de emenda, conectores, DGO, cordões monofibra, etc), tendo sido solucionado através da substituição, recuperação ou limpeza do elemento degradado"],
      ["5327F", "REDE ÓPTICA", "BACKBONE REGIONAL", "JUMPER/CONEXÃO", "Fibra", "[Backbone Fibra Jumper] Falha restabelecida após troca de jumper/conector na Estação", "Falha causada por defeito, desconexão ou falta de cordão monofibra/conector, tendo sido solucionado através da substituição, recuperação, reposição ou reconexão"],
      ["5407A", "REDE DE TRANSPORTE", "SDH / PDH (MODEM ÓPTICO)", "CHASSI/FONTE", "Fonte", "[Backbone Fonte] Falha restabelecida após troca de fonte na estação", "Falha causada por defeito, desgaste ou queima/curto de fonte, fusível, sistema de ventilação forçada, rack, chassi, bastidor ou sub de qualquer elemento da Rede de Transporte SDH/PDH (Modem Óptico), tendo sido solucionada através de substituição ou recuperação do elemento em falha"],
      ["5407D", "REDE DE TRANSPORTE", "SDH / PDH (MODEM ÓPTICO)", "RECONFIGURAÇÃO", "Configuração", "[Backbone Config] Falha restabelecida após configuração de modem óptico na Estação", "Falha causada por erro de configuração tendo sido solucionado após reconfiguração, ajustes de nível de canal de qualquer elemento da Rede de Transporte SDH/PDH (Modem Óptico)"],
      ["5407G", "REDE DE TRANSPORTE", "SDH / PDH (MODEM ÓPTICO)", "RESET", "Reinicialização", "[Backbone Reset] Falha restabelecida após reset no equipamento na Estação", "Falha normalizada após reset físico ou lógico de qualquer elemento da Rede de Transporte SDH/PDH (Modem Óptico)"],
      ["5417A", "REDE DE TRANSPORTE", "SDH / PDH (MODEM ÓPTICO)", "PLACA OU PORTA", "Placa", "[Backbone Placa] Falha restabelecida após troca de placa/porta na estação", "Falha causada por defeito, desgaste ou queima/curto de PLACA OU PORTA OU PORTA óptica, PLACA OU PORTA OU PORTA de tributário, PLACA OU PORTA OU PORTA de dados 64k, modulador, demodulador, transmissor, receptor, guia de onda ou antena de qualquer elemento da Rede de Transporte SDH/PDH (Modem Óptico), tendo sido solucionada através de substituição de PLACA OU PORTA OU PORTA ou troca de facilidade (troca de porta)"],
      ["5437A", "REDE DE TRANSPORTE", "SDH / PDH (MODEM ÓPTICO)", "CABO/CONECTOR", "Cabo/Conector", "[Backbone Cabo] Falha restabelecida após refeito cabo/conector na estação", "Falha causada por defeito, manuseio indevido, má qualidade da instalação/confecção/material utilizado, desgaste, desconexão, mau contato ou solda fria nos cabos, cordões ópticos, conectores, terminações de DID de qualquer elemento da Rede de Transporte SDH/PDH (Modem Óptico), tendo sido solucionada através de substituição, recuperação, reposição ou reconexão do elemento em falha"],
      ["5500A", "REDE DE TRANSPORTE", "SATÉLITE", "PLACA OU PORTA", "Equipamento Satélite", "[Satélite Configuração] Falha restabelecida após troca da placa/porta do equipamento satélite", "Falha causada por defeito, desgaste ou queima/curto de PLACA OU PORTA OU PORTA de qualquer elemento da Rede de Transporte Satélite (modem, amplificador de RF, guia de onda, antena), tendo sido solucionada através de substituição de PLACA OU PORTA OU PORTA ou troca de facilidade (troca de porta)"],
      ["5509A", "REDE DE TRANSPORTE", "SATÉLITE", "CHASSI/FONTE", "Equipamento Satélite", "[Satélite Configuração] Falha restabelecida após troca da fonte do equipamento satélite", "Falha causada por defeito, desgaste ou queima/curto de fonte, fusível, sistema de ventilação forçada, rack, chassi, bastidor ou sub de qualquer elemento da Rede de Transporte Satélite (passport, modem satélite, controladora, amplificador de RF, guia de onda/alimentador, antena), tendo sido solucionada através de substituição ou recuperação do elemento em falha"],
      ["5509D", "REDE DE TRANSPORTE", "SATÉLITE", "RECONFIGURAÇÃO", "Equipamento Satélite", "[Satélite Configuração] Falha restabelecida após configuração de equipamento satélite", "Falha causada por erro de configuração tendo sido solucionado após reconfiguração, ajustes de nível de canal de qualquer elemento da Rede de Transporte Satélite (passport, modem satélite, controladora, amplificador de RF, guia de onda/alimentador, antena)"],
      ["5509G", "REDE DE TRANSPORTE", "SATÉLITE", "RESET", "Equipamento Satélite", "[Satélite Reset] Falha restabelecida após reset no equipamento satélite na Estação", "Falha normalizada após reset físico ou lógico de qualquer elemento da Rede de Transporte Satélite (passport, modem satélite, controladora, amplificador de RF, guia de onda/alimentador, antena)"],
      ["5539A", "REDE DE TRANSPORTE", "SATÉLITE", "CABO/CONECTOR", "Equipamento Satélite", "[Satélite Cabo] Falha restabelecida após troca de cabo/conector satélite na Estação", "Falha causada por defeito, manuseio indevido, má qualidade da instalação/confecção/material utilizado, desgaste, desconexão, mau contato ou solda fria nos cabos, conectores, terminações de DID de qualquer elemento da Rede de Transporte Satélite (passport, modem satélite, controladora, amplificador de RF, guia de onda/alimentador, antena), tendo sido solucionada através de substituição, recuperação, reposição ou reconexão do elemento em falha"],
      ["5670D", "REDE DE TRANSPORTE", "CONVERSOR INTERFACE", "RECONFIGURAÇÃO", "Configuração", "[Backbone Rádio] Falha restabelecida após configuração/troca do conversor", "Falha causada por erro de configuração tendo sido solucionado após reconfiguração, (estrapes) do conversor de interface/mídia (G703<=>V35, G703<=>Ethernet, óptico<=>G703, óptico<=>Ethernet). Este encerramento aplica-se quando o conversor é utilizado como solução de Rede de Transporte."],
      ["5670G", "REDE DE TRANSPORTE", "CONVERSOR INTERFACE", "RESET", "Reinicialização", "[Backbone Rádio] Falha restabelecida reinciar equipamentos na estação", "Falha normalizada após reset físico do conversor de interface/mídia (G703<=>V35, G703<=>Ethernet, óptico<=>G703, óptico<=>Ethernet). Este encerramento aplica-se quando o conversor é utilizado como solução de Rede de Transporte."],
      ["5672A", "REDE DE TRANSPORTE", "CONVERSOR INTERFACE", "CABO/CONECTOR", "Cabo/Conector", "[Backbone Cabo] Falha restabelecida após refeito cabo/conector na estação", "Falha causada por defeito, manuseio indevido, má qualidade da instalação/confecção/material utilizado, desgaste, desconexão, mau contato ou solda fria nos cabos, cordões ópticos ou conectores de conversores de interface/mídia (G703<=>V35, G703<=>Ethernet, óptico<=>G703, óptico<=>Ethernet), tendo sido solucionada através de substituição, recuperação, reposição ou reconexão do elemento em falha. Este encerramento aplica-se quando o conversor é utilizado como solução de Rede de Transporte."],
      ["5674A", "REDE DE TRANSPORTE", "CONVERSOR INTERFACE", "CHASSI/FONTE", "Fonte", "[Backbone Fonte] Falha restabelecida após troca de fonte na estação", "Falha causada por defeito, desgaste ou queima/curto de fonte, fusível, rack, chassi, bastidor/sub/terminação DID de cconversores de interface/mídia (G703<=>V35, G703<=>Ethernet, óptico<=>G703, óptico<=>Ethernet), tendo sido solucionada através de substituição ou recuperação do elemento em falha. Este encerramento aplica-se quando o conversor é utilizado como solução de Rede de Transporte."],
      ["5679A", "REDE DE TRANSPORTE", "CONVERSOR INTERFACE", "PLACA OU PORTA", "Placa", "[Backbone Placa] Falha restabelecida após troca de placa/porta na estação", "Falha causada por defeito, desgaste ou queima/curto do conversor de interface/mídia (G703<=>V35, G703<=>Ethernet, óptico<=>G703, óptico<=>Ethernet), tendo sido solucionada através de substituição do conversor. Este encerramento aplica-se quando o conversor é utilizado como solução de Rede de Transporte."],
      ["S1420", "REDE DE TRANSPORTE", "SDH / PDH (MUX)", "RECONFIGURAÇÃO", "Configuração", "[OEMP Backbone Config] Falha restabelecida após configuração de modem óptico na Estação (Rede basica)", "Falha causada por erro de configuração tendo sido solucionado após reconfiguração, ajustes de nível de canal de qualquer elemento da Rede de Transporte Basica SDH/PDH"],
      ["S1440", "REDE DE TRANSPORTE", "SDH / PDH (MUX)", "RECONFIGURAÇÃO", "Configuração", "[OEMP Backbone Config] Falha restabelecida após configuração de modem óptico na Estação (Rede movel)", "Falha causada por erro de configuração tendo sido solucionado após reconfiguração, ajustes de nível de canal de qualquer elemento da Rede de Transporte Movel SDH/PDH"],
      ["S3520", "BACKBONE IP", "CONFIGURAÇÃO", "OUTROS", "Configuração", "[OEMP Backbone Config] Falha restabelecida após configuração de modem óptico na Estação (Rede movel)", "Falha causada por erro de configuração tendo sido solucionado após reconfiguração, ajustes de nível de canal de qualquer elemento da Rede de Transporte Movel SDH/PDH"],
      ["S4520", "COMUTAÇÃO (OEMP)", "CONFIGURAÇÃO", "OUTROS", "Configuração", "[OEMP - Comutação] Falha restabelecida após configuração na Rede na Estação", "Falha de configuração após testes da operadora"],
      ["S4528", "COMUTAÇÃO (OEMP)", "CONFIGURAÇÃO", "SEM AÇÃO", "Configuração", "[OEMP - Comutação] Falha restabelecida após configuração na Rede na Estação", "Falha de configuração onde não houve atuação da operadora."],
      ["S4540", "COMUTAÇÃO (OEMP)", "CONFIGURAÇÃO", "OUTROS", "Configuração", "[OEMP - Comutação] Falha restabelecida após configuração na Estação", "Falha de configuração após testes da operadora"],
      ["S4620", "COMUTAÇÃO (OEMP)", "ENCAMINHAMENTO", "OUTROS", "Configuração", "[OEMP - Comutação] Falha restabelecida após ajuste de encaminhamento na Rede", "Falha de encaminhamento após testes da operadora"],
      ["S4628", "COMUTAÇÃO (OEMP)", "ENCAMINHAMENTO", "SEM AÇÃO", "Configuração", "[OEMP - Comutação] Falha restabelecida após ajuste de encaminhamento na Rede", "Falha de encaminhamento onde não houve atuação da operadora."],
      ["S5120", "EQUIPAMENTO", "MODEM", "OUTROS", "Reinicialização", "[OEMP Reset] Falha restabelecida após reset nos equipamentos", "Falha de dados para outra operadora onde foi efetuado reset em algum equipamento."],
      ["S5420", "EQUIPAMENTO", "EQUIPAMENTO DESLIGADO", "OUTROS", "Equipamento com defeito", "[OEMP Equipamento] Falha restabelecida após troca equipamento", "Falha de dados para outra operadora onde foi substituído algum equipamento."],
      ["S6124", "REDE EXTERNA", "FIBRA ÓTICA", "OUTROS", "Fibra", "[OEMP Fibra Desgaste] Falha restabelecida após troca/fusão de fibra ocasionada por atenuação.", "Falha causada por degradação, desgaste ou atenuação em qualquer elemento da rede óptica (cabos, caixas de emenda, conectores, DGO, cordões monofibra, etc), tendo sido solucionado através da substituição, recuperação ou limpeza do elemento degradado"],
      ["S8120", "REDE DE DADOS (OEMP)", "OUTROS", "-", ".", "[OEMP Link Encontrado OK] Falha restabelecida após efetuar testes no link", "Falha de dados para outra operadora onde não há expecificação na última coluna (utilizamos o campo de descrição livre para detalhar)."],
      ["S8121", "REDE DE DADOS (OEMP)", "RECONFIGURADO O EQUIPAMENTO", "-", "Configuração", "[OEMP Config] Falha restabelecida após reconfiguração na estação", "Falha de dados para outra operadora onde foi reconfigurado algum equipamento."],
      ["S8122", "REDE DE DADOS (OEMP)", "RESET NO EQUIPAMENTO", "-", "Reinicialização", "[OEMP Reset] Falha restabelecida após reset nos equipamentos", "Falha de dados para outra operadora onde foi efetuado reset em algum equipamento."],
      ["S8123", "REDE DE DADOS (OEMP)", "SUBSTITUÍDO O EQUIPAMENTO", "-", "Equipamento com defeito", "[OEMP Equipamento] Falha restabelecida após troca equipamento", "Falha de dados para outra operadora onde foi substituído algum equipamento."],
      ["S8124", "REDE DE DADOS (OEMP)", "RECUPERADO O CABO", "-", "Cabo/Conector", "[OEMP Cabo] Falha restabelecida após troca de cabo/conector na estação", "Falha de dados para outra operadora onde foi recuperado algum cabo."],
      ["S8125", "REDE DE DADOS (OEMP)", "MANOBRADOS OS PARES", "-", "Par Metálico", "[OEMP Par Metálico] Falha restabelecida após refeito cabo/conector na estação", "Falha de dados para outra operadora onde foi manobrado algum par."],
      ["S8126", "REDE DE DADOS (OEMP)", "CONEXÕES REFEITAS", "-", "Cabo/Conector", "[OEMP Cabo] Falha restabelecida após troca de cabo/conector na estação", "Falha de dados para outra operadora onde foi refeita alguma conexão."],
      ["S8127", "REDE DE DADOS (OEMP)", "TESTES DE TRANSMISSÃO", "-", "Reinicialização", "[OEMP Reset] Falha restabelecida após reset nos equipamentos", "Falha de dados para outra operadora onde foi feito algum teste de transmissão."],
      ["S8128", "REDE DE DADOS (OEMP)", "SEM AÇÃO", "-", ".", "[OEMP Link Encontrado OK] Falha restabelecida sem intervenção técnica no link", "Falha de dados para outra operadora onde não houve intervenção da mesma para normalizar o link."],
      ["S820", "REDE DE DADOS (OEMP)", "OUTROS", "-", ".", "[OEMP Link Encontrado OK] Falha restabelecida após efetuar testes no link", "Falha de dados para outra operadora onde não há expecificação na última coluna (utilizamos o campo de descrição livre para detalhar)."],
      ["S821", "REDE DE DADOS (OEMP)", "RECONFIGURADO O EQUIPAMENTO", "-", "Configuração", "[OEMP Config] Falha restabelecida após reconfiguração na estação", "Falha de dados para outra operadora onde foi reconfigurado algum equipamento."],
      ["S822", "REDE DE DADOS (OEMP)", "RESET NO EQUIPAMENTO", "-", "Reinicialização", "[OEMP Reset] Falha restabelecida após reset nos equipamentos", "Falha de dados para outra operadora onde foi efetuado reset em algum equipamento."],
      ["S8220", "REDE DE DADOS (OEMP)", "OUTROS", "-", ".", "[OEMP Link Encontrado OK] Falha restabelecida após efetuar testes no link", "Falha de dados para outra operadora onde não há expecificação na última coluna (utilizamos o campo de descrição livre para detalhar)."],
      ["S8221", "REDE DE DADOS (OEMP)", "RECONFIGURADO O EQUIPAMENTO", "-", "Configuração", "[OEMP Config] Falha restabelecida após reconfiguração na estação", "Falha de dados para outra operadora onde foi reconfigurado algum equipamento."],
      ["S8222", "REDE DE DADOS (OEMP)", "RESET NO EQUIPAMENTO", "-", "Reinicialização", "[OEMP Reset] Falha restabelecida após reset nos equipamentos", "Falha de dados para outra operadora onde foi efetuado reset em algum equipamento."],
      ["S8223", "REDE DE DADOS (OEMP)", "SUBSTITUÍDO O EQUIPAMENTO", "-", "Equipamento com defeito", "[OEMP Equipamento] Falha restabelecida após troca equipamento", "Falha de dados para outra operadora onde foi substituído algum equipamento."],
      ["S8224", "REDE DE DADOS (OEMP)", "RECUPERADO O CABO", "-", "Cabo/Conector", "[OEMP Cabo] Falha restabelecida após troca de cabo/conector na estação", "Falha de dados para outra operadora onde foi recuperado algum cabo."],
      ["S8225", "REDE DE DADOS (OEMP)", "MANOBRADOS OS PARES", "-", "Par Metálico", "[OEMP Par Metálico] Falha restabelecida após refeito cabo/conector na estação", "Falha de dados para outra operadora onde foi manobrado algum par."],
      ["S8226", "REDE DE DADOS (OEMP)", "CONEXÕES REFEITAS", "-", "Cabo/Conector", "[OEMP Cabo] Falha restabelecida após troca de cabo/conector na estação", "Falha de dados para outra operadora onde foi refeita alguma conexão."],
      ["S8227", "REDE DE DADOS (OEMP)", "TESTES DE TRANSMISSÃO", "-", "Reinicialização", "[OEMP Reset] Falha restabelecida após reset nos equipamentos", "Falha de dados para outra operadora onde foi feito algum teste de transmissão."],
      ["S8228", "REDE DE DADOS (OEMP)", "SEM AÇÃO", "-", ".", "[OEMP Link Encontrado OK] Falha restabelecida sem intervenção técnica no link", "Falha de dados para outra operadora onde não houve intervenção da mesma para normalizar o link."],
      ["S823", "REDE DE DADOS (OEMP)", "SUBSTITUÍDO O EQUIPAMENTO", "-", "Equipamento com defeito", "[OEMP Equipamento] Falha restabelecida após troca equipamento", "Falha de dados para outra operadora onde foi substituído algum equipamento."],
      ["S824", "REDE DE DADOS (OEMP)", "RECUPERADO O CABO", "-", "Cabo/Conector", "[OEMP Cabo] Falha restabelecida após troca de cabo/conector na estação", "Falha de dados para outra operadora onde foi recuperado algum cabo."],
      ["S825", "REDE DE DADOS (OEMP)", "MANOBRADOS OS PARES", "-", "Par Metálico", "[OEMP Par Metálico] Falha restabelecida após refeito cabo/conector na estação", "Falha de dados para outra operadora onde foi manobrado algum par."],
      ["S826", "REDE DE DADOS (OEMP)", "CONEXÕES REFEITAS", "-", "Cabo/Conector", "[OEMP Cabo] Falha restabelecida após troca de cabo/conector na estação", "Falha de dados para outra operadora onde foi refeita alguma conexão."],
      ["S827", "REDE DE DADOS (OEMP)", "TESTES DE TRANSMISSÃO", "-", "Reinicialização", "[OEMP Reset] Falha restabelecida após reset nos equipamentos", "Falha de dados para outra operadora onde foi feito algum teste de transmissão."],
      ["S828", "REDE DE DADOS (OEMP)", "SEM AÇÃO", "-", ".", "[OEMP Link Encontrado OK] Falha restabelecida sem intervenção técnica no link", "Falha de dados para outra operadora onde não houve intervenção da mesma para normalizar o link."],
      ["S8320", "REDE DE DADOS (OEMP)", "OUTROS", "-", ".", "[OEMP Link Encontrado OK] Falha restabelecida após efetuar testes no link", "Falha de dados para outra operadora onde não há expecificação na última coluna (utilizamos o campo de descrição livre para detalhar)."],
      ["S8321", "REDE DE DADOS (OEMP)", "RECONFIGURADO O EQUIPAMENTO", "-", "Configuração", "[OEMP Config] Falha restabelecida após reconfiguração na estação", "Falha de dados para outra operadora onde foi reconfigurado algum equipamento."],
      ["S8322", "REDE DE DADOS (OEMP)", "RESET NO EQUIPAMENTO", "-", "Reinicialização", "[OEMP Reset] Falha restabelecida após reset nos equipamentos", "Falha de dados para outra operadora onde foi efetuado reset em algum equipamento."],
      ["S8323", "REDE DE DADOS (OEMP)", "SUBSTITUÍDO O EQUIPAMENTO", "-", "Equipamento com defeito", "[OEMP Equipamento] Falha restabelecida após troca equipamento", "Falha de dados para outra operadora onde foi substituído algum equipamento."],
      ["S8324", "REDE DE DADOS (OEMP)", "RECUPERADO O CABO", "-", "Cabo/Conector", "[OEMP Cabo] Falha restabelecida após troca de cabo/conector na estação", "Falha de dados para outra operadora onde foi recuperado algum cabo."],
      ["S8325", "REDE DE DADOS (OEMP)", "MANOBRADOS OS PARES", "-", "Par Metálico", "[OEMP Par Metálico] Falha restabelecida após refeito cabo/conector na estação", "Falha de dados para outra operadora onde foi manobrado algum par."],
      ["S8326", "REDE DE DADOS (OEMP)", "CONEXÕES REFEITAS", "-", "Cabo/Conector", "[OEMP Cabo] Falha restabelecida após troca de cabo/conector na estação", "Falha de dados para outra operadora onde foi refeita alguma conexão."],
      ["S8327", "REDE DE DADOS (OEMP)", "TESTES DE TRANSMISSÃO", "-", "Reinicialização", "[OEMP Reset] Falha restabelecida após reset nos equipamentos", "Falha de dados para outra operadora onde foi feito algum teste de transmissão."],
      ["S8328", "REDE DE DADOS (OEMP)", "SEM AÇÃO", "-", ".", "[OEMP Link Encontrado OK] Falha restabelecida sem intervenção técnica no link", "Falha de dados para outra operadora onde não houve intervenção da mesma para normalizar o link."],
      ["S8420", "REDE DE DADOS (OEMP)", "OUTROS", "-", ".", "[OEMP Link Encontrado OK] Falha restabelecida após efetuar testes no link", "Falha de dados para outra operadora onde não há expecificação na última coluna (utilizamos o campo de descrição livre para detalhar)."],
      ["S8421", "REDE DE DADOS (OEMP)", "RECONFIGURADO O EQUIPAMENTO", "-", "Configuração", "[OEMP Config] Falha restabelecida após reconfiguração na estação", "Falha de dados para outra operadora onde foi reconfigurado algum equipamento."],
      ["S8422", "REDE DE DADOS (OEMP)", "RESET NO EQUIPAMENTO", "-", "Reinicialização", "[OEMP Reset] Falha restabelecida após reset nos equipamentos", "Falha de dados para outra operadora onde foi efetuado reset em algum equipamento."],
      ["S8423", "REDE DE DADOS (OEMP)", "SUBSTITUÍDO O EQUIPAMENTO", "-", "Equipamento com defeito", "[OEMP Equipamento] Falha restabelecida após troca equipamento", "Falha de dados para outra operadora onde foi substituído algum equipamento."],
      ["S8424", "REDE DE DADOS (OEMP)", "RECUPERADO O CABO", "-", "Cabo/Conector", "[OEMP Cabo] Falha restabelecida após troca de cabo/conector na estação", "Falha de dados para outra operadora onde foi recuperado algum cabo."],
      ["S8425", "REDE DE DADOS (OEMP)", "MANOBRADOS OS PARES", "-", "Par Metálico", "[OEMP Par Metálico] Falha restabelecida após refeito cabo/conector na estação", "Falha de dados para outra operadora onde foi manobrado algum par."],
      ["S8426", "REDE DE DADOS (OEMP)", "CONEXÕES REFEITAS", "-", "Cabo/Conector", "[OEMP Cabo] Falha restabelecida após troca de cabo/conector na estação", "Falha de dados para outra operadora onde foi refeita alguma conexão."],
      ["S8427", "REDE DE DADOS (OEMP)", "TESTES DE TRANSMISSÃO", "-", "Reinicialização", "[OEMP Reset] Falha restabelecida após reset nos equipamentos", "Falha de dados para outra operadora onde foi feito algum teste de transmissão."],
      ["S8428", "REDE DE DADOS (OEMP)", "SEM AÇÃO", "-", ".", "[OEMP Link Encontrado OK] Falha restabelecida sem intervenção técnica no link", "Falha de dados para outra operadora onde não houve intervenção da mesma para normalizar o link."],
      ["S8520", "REDE DE DADOS (OEMP)", "OUTROS", "-", ".", "[OEMP Link Encontrado OK] Falha restabelecida após efetuar testes no link", "Falha de dados para outra operadora onde não há expecificação na última coluna (utilizamos o campo de descrição livre para detalhar)."],
      ["S8521", "REDE DE DADOS (OEMP)", "RECONFIGURADO O EQUIPAMENTO", "-", "Configuração", "[OEMP Config] Falha restabelecida após reconfiguração na estação", "Falha de dados para outra operadora onde foi reconfigurado algum equipamento."],
      ["S8522", "REDE DE DADOS (OEMP)", "RESET NO EQUIPAMENTO", "-", "Reinicialização", "[OEMP Reset] Falha restabelecida após reset nos equipamentos", "Falha de dados para outra operadora onde foi efetuado reset em algum equipamento."],
      ["S8523", "REDE DE DADOS (OEMP)", "SUBSTITUÍDO O EQUIPAMENTO", "-", "Equipamento com defeito", "[OEMP Equipamento] Falha restabelecida após troca equipamento", "Falha de dados para outra operadora onde foi substituído algum equipamento."],
      ["S8524", "REDE DE DADOS (OEMP)", "RECUPERADO O CABO", "-", "Cabo/Conector", "[OEMP Cabo] Falha restabelecida após troca de cabo/conector na estação", "Falha de dados para outra operadora onde foi recuperado algum cabo."],
      ["S8525", "REDE DE DADOS (OEMP)", "MANOBRADOS OS PARES", "-", "Par Metálico", "[OEMP Par Metálico] Falha restabelecida após refeito cabo/conector na estação", "Falha de dados para outra operadora onde foi manobrado algum par."],
      ["S8526", "REDE DE DADOS (OEMP)", "CONEXÕES REFEITAS", "-", "Cabo/Conector", "[OEMP Cabo] Falha restabelecida após troca de cabo/conector na estação", "Falha de dados para outra operadora onde foi refeita alguma conexão."],
      ["S8527", "REDE DE DADOS (OEMP)", "TESTES DE TRANSMISSÃO", "-", "Reinicialização", "[OEMP Reset] Falha restabelecida após reset nos equipamentos", "Falha de dados para outra operadora onde foi feito algum teste de transmissão."],
      ["S8528", "REDE DE DADOS (OEMP)", "SEM AÇÃO", "-", ".", "[OEMP Link Encontrado OK] Falha restabelecida sem intervenção técnica no link", "Falha de dados para outra operadora onde não houve intervenção da mesma para normalizar o link."],
      ["S8620", "REDE DE DADOS (OEMP)", "OUTROS", "-", ".", "[OEMP Link Encontrado OK] Falha restabelecida após efetuar testes no link", "Falha de dados para outra operadora onde não há expecificação na última coluna (utilizamos o campo de descrição livre para detalhar)."],
      ["S8621", "REDE DE DADOS (OEMP)", "RECONFIGURADO O EQUIPAMENTO", "-", "Configuração", "[OEMP Config] Falha restabelecida após reconfiguração na estação", "Falha de dados para outra operadora onde foi reconfigurado algum equipamento."],
      ["S8622", "REDE DE DADOS (OEMP)", "RESET NO EQUIPAMENTO", "-", "Reinicialização", "[OEMP Reset] Falha restabelecida após reset nos equipamentos", "Falha de dados para outra operadora onde foi efetuado reset em algum equipamento."],
      ["S8623", "REDE DE DADOS (OEMP)", "SUBSTITUÍDO O EQUIPAMENTO", "-", "Equipamento com defeito", "[OEMP Equipamento] Falha restabelecida após troca equipamento", "Falha de dados para outra operadora onde foi substituído algum equipamento."],
      ["S8624", "REDE DE DADOS (OEMP)", "RECUPERADO O CABO", "-", "Cabo/Conector", "[OEMP Cabo] Falha restabelecida após troca de cabo/conector na estação", "Falha de dados para outra operadora onde foi recuperado algum cabo."],
      ["S8625", "REDE DE DADOS (OEMP)", "MANOBRADOS OS PARES", "-", "Par Metálico", "[OEMP Par Metálico] Falha restabelecida após refeito cabo/conector na estação", "Falha de dados para outra operadora onde foi manobrado algum par."],
      ["S8626", "REDE DE DADOS (OEMP)", "CONEXÕES REFEITAS", "-", "Cabo/Conector", "[OEMP Cabo] Falha restabelecida após troca de cabo/conector na estação", "Falha de dados para outra operadora onde foi refeita alguma conexão."],
      ["S8627", "REDE DE DADOS (OEMP)", "TESTES DE TRANSMISSÃO", "-", "Reinicialização", "[OEMP Reset] Falha restabelecida após reset nos equipamentos", "Falha de dados para outra operadora onde foi feito algum teste de transmissão."],
      ["S8628", "REDE DE DADOS (OEMP)", "SEM AÇÃO", "-", ".", "[OEMP Link Encontrado OK] Falha restabelecida sem intervenção técnica no link", "Falha de dados para outra operadora onde não houve intervenção da mesma para normalizar o link."],
      ["S8720", "REDE DE DADOS (OEMP)", "OUTROS", "-", ".", "[OEMP Link Encontrado OK] Falha restabelecida após efetuar testes no link", "Falha de dados para outra operadora onde não há expecificação na última coluna (utilizamos o campo de descrição livre para detalhar)."],
      ["S8721", "REDE DE DADOS (OEMP)", "RECONFIGURADO O EQUIPAMENTO", "-", "Configuração", "[OEMP Config] Falha restabelecida após reconfiguração na estação", "Falha de dados para outra operadora onde foi reconfigurado algum equipamento."],
      ["S8722", "REDE DE DADOS (OEMP)", "RESET NO EQUIPAMENTO", "-", "Reinicialização", "[OEMP Reset] Falha restabelecida após reset nos equipamentos", "Falha de dados para outra operadora onde foi efetuado reset em algum equipamento."],
      ["S8723", "REDE DE DADOS (OEMP)", "SUBSTITUÍDO O EQUIPAMENTO", "-", "Equipamento com defeito", "[OEMP Equipamento] Falha restabelecida após troca equipamento", "Falha de dados para outra operadora onde foi substituído algum equipamento."],
      ["S8724", "REDE DE DADOS (OEMP)", "RECUPERADO O CABO", "-", "Cabo/Conector", "[OEMP Cabo] Falha restabelecida após troca de cabo/conector na estação", "Falha de dados para outra operadora onde foi recuperado algum cabo."],
      ["S8725", "REDE DE DADOS (OEMP)", "MANOBRADOS OS PARES", "-", "Par Metálico", "[OEMP Par Metálico] Falha restabelecida após refeito cabo/conector na estação", "Falha de dados para outra operadora onde foi manobrado algum par."],
      ["S8726", "REDE DE DADOS (OEMP)", "CONEXÕES REFEITAS", "-", "Cabo/Conector", "[OEMP Cabo] Falha restabelecida após troca de cabo/conector na estação", "Falha de dados para outra operadora onde foi refeita alguma conexão."],
      ["S8727", "REDE DE DADOS (OEMP)", "TESTES DE TRANSMISSÃO", "-", "Reinicialização", "[OEMP Reset] Falha restabelecida após reset nos equipamentos", "Falha de dados para outra operadora onde foi feito algum teste de transmissão."],
      ["S8728", "REDE DE DADOS (OEMP)", "SEM AÇÃO", "-", ".", "[OEMP Link Encontrado OK] Falha restabelecida sem intervenção técnica no link", "Falha de dados para outra operadora onde não houve intervenção da mesma para normalizar o link."],
      ["S9120", "INFRA-ESTRUTURA", "FALTA ENERGIA", "EQUIPAMENTO DESLIGADO", ".", "[OEMP - Falha Elétrica Energia] Falha restabelecida após estabilizar a rede elétrica na estação", "Falha causada por falta de energia na operadora"],
      ["S9140", "INFRA-ESTRUTURA", "FALTA ENERGIA", "EQUIPAMENTO DESLIGADO", ".", "[OEMP - Falha Elétrica Energia] Falha restabelecida após estabilizar a rede elétrica na estação", "Falha causada por falta de energia na infraestrutura interna da rede"],
      ["S9440", "COMUTAÇÃO", "CLIMATIZAÇÃO", "-", ".", "[OEMP Backbone Climatização] Falha restabelecida após estabilizar climatização na Estação", "Falha na climatização da estação terceiros, podendo ter sido causado por vandalismo, descarga elétrica/atmosférica, sobrecarga, etc"]
    ];
    
    try {
      const salvo = localStorage.getItem("sistema_wiki_stcars_master");
      if (salvo && salvo.includes("N_A")) {
        localStorage.removeItem("sistema_wiki_stcars_master");
        return dadosLocais;
      }
      return salvo ? JSON.parse(salvo) : dadosLocais;
    } catch(e) {
      return dadosLocais;
    }
  });

  const rascunhoRef = useRef(null);

  const [horaGeral, setHoraGeral] = useState(new Date());

  useEffect(() => {
    const temporizador = setInterval(() => {
      setHoraGeral(new Date());
    }, 1000);
    return () => clearInterval(temporizador);
  }, []);

  const dataNocFormatada = horaGeral.toLocaleDateString("pt-BR", { day: '2-digit', month: '2-digit', year: '2-digit' });
  const horaNocFormatada = horaGeral.toLocaleTimeString("pt-BR", { hour: '2-digit', minute: '2-digit', second: '2-digit' });

  const [editandoId, setEditandoId] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [filtroWiki, setFiltroWiki] = useState("");
  const [textoImportacao, setTextoImportacao] = useState("");

  const [senhasVisiveis, setSenhasVisiveis] = useState({});
  const toggleSenha = (id) => setSenhasVisiveis(prev => ({ ...prev, [id]: !prev[id] }));

  const [dadosSTC, setDadosSTC] = useState(() => {
    try { const salvo = localStorage.getItem("sistema_wiki_stc"); return salvo ? JSON.parse(salvo) : []; } catch(e) { return []; }
  });
  const [dadosResidentes, setDadosResidentes] = useState(() => {
    try { const salvo = localStorage.getItem("sistema_wiki_res"); return salvo ? JSON.parse(salvo) : []; } catch(e) { return []; }
  });

  const [dadosOEMP, setDadosOEMP] = useState(() => {
    const baseNativaOEMP = [
      // ONDE INSERIR: Logo no início do array baseNativaOEMP, ou no final dele.
      { n: "MAMTECH", l: ["Suporte Técnico | (86) 3142-0494 | chamados@mamtech.com.br", "Supervisão - Hermínia Mateus | (86) 99970-0474 | gestaoisp@mamtech.com.br", "Diretoria - Daniel Gattai | (19) 99460-4503 | daniel.gattai@maminfo.com.br", ] },
      { n: "ASCENTY", l: ["NOC - (19) 3517 7777 | 19 3517-7600 opção #1 e #4  | ticket@ascenty.com  | Após 1h - Rogerio Sanchez  | Contato: (19) 35177600 Ramal 1143  |(19) 97117 6129  | rogerio.sanchez@ascenty.com", "Rodrigo Radaieski - Diretor de Serviços  | rodrigo.radaieski@ascenty.com  | (19)35177600 Ramal 2224  | (19) 998471550  | Sergio Abela -  Diretor de Operações Data Centers  | sergio.abela@ascenty.com  | Telefone +55 19 3517-7600 ramal 2236 | Celular +55 11 99330-8881", "Marcos Siqueira - Vice Presidente  | marcos.siqueira@ascenty.com  | (19)3517 7600 Ramal 1308 | (11) 95252 7950", "Gustavo Sousa  | gustavo.sousa@ascenty.com  | (11) 96564-8530", ] },
      { n: "ATIVA", l: ["Atendimento via telefone: 31 2342-1467  | Via Whatsapp: 31999773480  | e-mail: noc@ativatelecom.net.br  | Atendimento 24hrs - 7/7 - Apos as 18:00hrs Andre e Wender revesam o plantao. Disponiveis remotamente.", "Andre -  (31) 98108-5365 | andre.silva@ativatelecom.net.br  | Wender Silva -  (31) 99529-4022 |  wender.silva@ativatelecom.net.br  | Marco Tulio - (31) 99901-9178", "Thyeres (31) 99443-2572  | thyeres@ativatelecom.net.br  | Caroline Lima - 317146-3263  | caroline.lima@ativatelecom.net.br", "Wellington - Diretor  | (31) 99105-4491 - wellington@ativatelecom.net.br", "Robson - Diretor  | (31) 99230-1984  - robson@ativatelecom.net.br", ] },
      { n: "VOGEL (PARCEIRA DESCONTINUADA)", l: ["Parceira Vogel deixou de existir.  | Circuitos Vogel são Tratados pela Algar Telecom.", ] },
      { n: "UOLDIVEO", l: ["0800 160 066  | 11 40031100  | Servicedeskuoldiveo@uoldiveo.com", "Gestao Service Desk  | 1130975239  | 55 11 95708-0708  | l-sdesk-gestao@uoldiveo.com", "Vanessa Genaro  | 11 952618361  | vgenaro@uoldiveo.com", "Valeria Ferreira  | 21 994796228  | voferreira@uoldiveo.com", ] },
      { n: "VIVO", l: ["Abertura de chamado: 0800 015 1551 OP. 2 - codigo 05.423.963 ou 33.000.118  | Abertura de chamado: 0800 7715211 OP. 2  | Abertura de chamado: 10315 + codigo 6546  | Informar CNPJ 05.423.963/0001-11 para atendimento  | WhatsApp 11975710315 (abertura e acompanhamento)  | 0800 7710533 op 4 - SPEEDY  | relacionamentoempresas.br@vivo.com.br  | SPEEDY: atendimentopjfixa@vivo.com.br", "11 3292 5024 OP 2 - Atualizacao  | Solicitacao de evidencia - Apos o reparo na vivo ser fechado:  | Leonardo Bastos- 139811-25660  | leonardo.bastos@telefonica.com  | Mariana negov - 11967314603  | mariana.negov@telefonica.com  | Alinne Braga  - 19 99641-4474  | alinne.braga@telefonica.com", "11 3292 5515", "(11) 3188-5973  | Regina Pigozzi  (Diario – 09h as 20h)  | 11 971009589  | regina.pigozzi@telefonica.com", "Maria Cecilia Nogueira Flores  | 11 99616 7588  | cecilia.flores@telefonica.com", ] },
      { n: "NEOVIA", l: ["11 30174680  | 0800 702 7023  | suporte.corporativo@neovia.com.br", "Vagner  | 11 94145 5808  | escalation@neovia.com.br", "Cesar Ribeiro  | 11 30174486 / 11 941443931  | cesar.ribeiro@neovia.com.br", ] },
      { n: "ALGAR", l: ["0800 940 2999 - CANAL COM A OI(CNPJ 33.000.118/0001-79)  | 0800 340 2558  | (WHATSAPP) 34 99889 2822 -  // 34 99898-2999  | hdcorporativo@algartelecom.com.br", "Escalonamentos:  | 34 99694 5100  | 34 99694 5127  | escalonamento_operacoes@algartelecom.com.br", "Acionamento 1h apos o contato com o 2o nivel.  | Kassio Gabrhiell da Cunha  | 34 9895-3686  | kassiogc@algartelecom.com.br", "Francisco Borges Buzatto  | 34 9.9971-1983  | franciscob@algartelecom.com.br", ] },
      { n: "EMBRATEL", l: ["0800 721 1021  | E-mail: chamado@embratel.com.br  | Portal Embratel: https://webebt01.embratel.com.br/embratelonline/", "Felipe Borges -  (08h as 17h – seg. a sex.) | felipe.borgessantos@claro.com.br  | Tel.:(11) 2121-6809 / (11) 96636 5772 Felipe  | Posicionamento: Tel.:(11) 2121-2880 - Plantao (24h)  | caspo@embratel.com.br", "Adriano Nascimento (06h as 19h) | adriano.nascimento@claro.com.br  | Tel.:(11) 2121-7146 / (11) 99202-8125  | Luciano Johannsen (20h as 06h)  | luciano.johannsen@claro.com.br  | (11) 2121-3684 / (11) 99259-6225", "Jose Eduardo Neves Silva  | jose.nevessilva@claro.com.br  | Tel: (11) 2121-2134 / (11) 99259-6352", "Alex Fonseca Goncalves  | alex.goncalves@claro.com.br  | Tel: (11) 2121-2362 / (11) 99259-6239", ] },
      { n: "HUGHES", l: ["NOC  | Tel2: 55 11 3957.8367 /  | 0800 701 0111  | helpdesk@hughes.com.br", "Pedro Paulo Rodrigues Batista  | 11 950644280  | pbatista@hughes.com.br", "Aparecido Mendonca  | 11 981964158  | amendonca@hughes.com.br", "Daniel Tunisi  | 11 94113-2326  | dtunisi@hughes.com.br", ] },
      { n: "CIRIUN - (LUMEN E LEVEL3)", l: ["NOC  | 0800 887 3333  | 011 3957-2288 opcao 1", "Helio Correa (15h15 – 00h00)  | Celular de Operaoes 55 11 3957 2210 (55 11 99642 1615)  | Escritorio 55 11 3957 2323   (24x5)  | E-mail helio.correa@ciriontechnologies.com  | TSCBRLeaders@ciriontechnologies.com (24x5)  | Israel Silva (23h30 – 07h30)  | Celular de Operacoes 55 11 3957 2210 (55 11 99870 1052)  | Escritorio 55 11 3957 2323 (24x5)  | E-mail israel.silva@ciriontechnologies.com.com  | TSCBRLeaders@ciriontechnologies.com (24x5)  | Joao Santos (09h00 – 18h00)  | Celular de Operacoes 55 11 3957 2210 (55 41 99606 4861)  | Escritorio 55 11 3957 2323 (24x5)  | E-mail joao.santos@ciriontechnologies.com  | TSCBRLeaders@ciriontechnologies.com (24x5)", "Rubens Moraes (08h30 – 17:30)  | Celular de Operacoes 55 11 3957 2210 (55 11 99908 6440)  | Escritorio 55 11 3957 2333 (8x5)  | E-mail rubens.moraes@ciriontechnologies.com", "Voloi Borges  | Celular de Operacoes 55 11 93351-6699  | Escritorio 55 11 3957-2213  | E-mail voloi.borges@ciriontechnologies.com", "55 11 3957-2210", ] },
      { n: "TELESPAZIO", l: ["0800 888 8722  | TPZ.BR.TAC@telespazio.com  | Novo Portal Telespazio: https://insieme.telespazio.com.br/#/login  | Login: OI.CGS.SP.OP | Senha: La#21C$", "Tiago Silva  | (21) 2141-3154  | tiago.silva@noc-telespazio.com.br", "Bruno Laurentino  | (21) 2141-3168  | (21) 9 8103-1240  | bruno.laurentino@noc-telespazio.com.br", "Andre Amaral  | (21) 2141-3199  | (21) 980003940  | andre.amaral@telespazio.net.br", ] },
      { n: "BT TELECOM - CONSAT", l: ["1147001940  | srd-netco-gurugram@bt.com", "Especialistas  | 91 9811397461  | dutymanager.gur@bt.com", "Subbin Sharda; Kuldeep Rathore; Rishi Sharma; Varun Palia; Asheesh Raheja  | 91 9582411653  | netco.opsmanager@bt.com", "31 207006363  | global.escalation.management@bt.com", "44 2036845594  | global.escalation.management@bt.com", ] },
      { n: "TELMEX", l: ["NOC  | 0800-728-2991  | (16) 21018480  | 22246.telmex@embratel.com.br", "(11) 9323-8763  | (11) 9323-8763  | fabpin@embratel.com.br", "Flavio oliveira  | 11 91212177  | 11 45016253  | flucas@embratel.com.br", "Mario Miguel  | (11) 4501-6221  | (11) 9454-6162  | mariolm@embratel.com.br", ] },
      { n: "AMERICA NET", l: ["CNPJ para abertura: 76535764000143  | Abertura 10385 ou 0800-878-1000  | Portal https://meuamericanetempresas.com.br/ |  Usuario: 76535764000143  - Senha: OISA318AL  | Nivel 1 - Apos 1h  | 11 3500-1152 - Opcao 1", "Nivel 2 - Apos 2 horas  | Coordenacao NOC Lucas Renze - 11 95185 9620  | Nivel 3 - Apos 4 horas  | Gerente de Operacoes Flavio Wisnevski - 11 92085 5591", "Nivel 4 - Apos 6 horas  | Diretor de Operacoes Renato Buosi - 11 95185 7378  | Nivel 5 - Apos 8 horas  | CTO Eduardo Vale - 11 93500 6667", "Nivel 1  - Erica Novais - 1135001160 / 11 92085 5920  | enovaes@americanet.com.br  | Nivel 2 - Celula Carrier  | carrier@americanet.com.br", "Nivel 3 - Gerente Monike de Oliveira  | maraujo@americanet.com.br  | 11 35001080 // 1193500 8393", ] },
      { n: "NET", l: ["0800 721 0027", ] },
      { n: "AMERICAN TOWER", l: ["31 30033336 - Telefone e Whatsapp", "Acionamento apos 3 horas de registro de ticket  | 31 3079-6222  | noc.fibra@americantower.com", "Acionamento apos 6 horas de registro de ticket  | 31 99958-0414  | noc.fibra@americantower.com", "Acionamento apos 6 horas de registro de ticket  | 31 99981-3067  | noc.fibra.coord@americantower.com", "Acionamento apos 8 horas de registro de ticket  | 31 99724-1173  | noc.fibra.coord@americantower.com", ] },
      { n: "PORTUGAL TELECOM", l: ["351 21 500 2696  | 351 21 500 2428  | inoc@telecom.pt", "351 21 500 2654  | Fax:  351 21 500 2450  | m-augusto-almeida@telecom.pt", "351 21 500 1167  | joao-c-gueifao@telecom.pt", "351 21 500 1900  | manuela-f-coutinho@telecom.pt", ] },
      { n: "WKVE", l: ["NOC - Helpdesk  | 0800 717 1706  | SUPORTE WKVE WHATSAPP 33 3301 3300  | suporte@wkve.com.br", "Contato conforme Regional - Supervisao Tecnica  | Regional Belo Horizonte | Anderson Eustaquio | 31 9 97989109 | anderson.santos@wkve.com.br  | Regional Ipatinga | Marcio de Castro | 31 9 91685230 | marcio.castro@wkve.com.br  | Regional Gov. Valadares  | Michael Gomes | 33 9 91917313 | michael.oliveira@wkve.com.br  | Regional Para | Janderson Garcia | 94 9 99386961 | janderson.garcia@wkve.com.br  | Regional Porto Seguro | Romario Rodrigues | 73 9 99795566 | romario.barreto@wkve.com.br", "Coordenacao Tecnica e Coordenacao de Projetos  | Moises Lamarca - 31 99168 4455  | moises.bernardes@wkve.com.br  | Rafael Cunha -  33 9 84094994  | rafael.cunha@wkve.com.br", "Gerencia Tecnica  | Filipe Sales  | 94 991401122  | filipe.sales@wkve.com.br", "Superintendente Tecnico  | Thiago Bernardes  | 37 9 91270017", ] },
      { n: "PRONTONET", l: ["91 30754474  | corporativo@pronto.net.br", "Fabio Bittencourt  | (91) 3131-2313  | (91) 98288-0089  | fabio.guimaraes@pronto.net.br", "Adryenne oliveira  | (91) 3075-4465  | (91) 991245960  | 91- 99101-5501  | adryenne@pronto.net.br", "Tamires Virgilio  | 91)3075-4456/4479  | (91) 99207-0075  | tamires@pronto.net.br", ] },
      { n: "TIM/ ELETROPAULO", l: ["0800 8888020", "11 985236405", "Claudete Santana  | 55 (11) 98523-5127", "Danilo Sousa  | 55 (11) 98113-0132", "Fernando Prado  | 55 (11) 98113-0740", ] },
      { n: "SERCONTEL", l: ["10343 op- 4-2  | ana.assis@sercontel.net.br", ] },
      { n: "HISPAMAR", l: ["0800 282 9488", ] },
      { n: "TIWS", l: ["051 4111-0070", ] },
      { n: "LIGGA (COPEL)", l: ["Ligga  0800 414 1810  | (41) 3331-3001  | Horizons  0800 604 39 39  | Nova  (41) 3271-7030  | PRIORIZAÇÃO DE CHAMADO -  1h após a abertura  | Ligga, Horizons e Nova: (41) 99283 3849", "(41) 3318-7894 24hrs  | (41) 99515-0173 Seg a Sab 8h as 19h  | Nivel 2 - Operações  | (41) 3318-7995 24hrs  | (41)99751-0068 24hrs", "Analista de Operações  | Fernando / Israel / Allan  | (41) 99987-9844  | Nivel 4 - Coodenação  | Gustavo / Elen / Andrea  | (41) 99987-9844", "Jefferson Agapito  | (41) 99537-0664  | Nivel 6 - Diretoria  | Antonio Carlos  | (41) 99537-0664", "Coordenação de CS  | Ciro Lobo (43) 99178-1414  | Gerência de CX  | Crystyne Dawybida (41) 99537-0664  | Diretoria Comercial  | Ricardo Montanher (41) 99733-0088", ] },
      { n: "COMPULINE", l: ["0800 600 5353", ] },
      { n: "MOBWIRE (MOB TELECOM E WIRELINK)", l: ["Atendimento: +55 85 2181-6200 +55 85 2181-6299  | Whatsapp:  85 91850115  | e-mail: atendimentosuporte@mobwire.com.br  | Nivel 1 - Após 4 horas  | COORDENADOR DE SUPORTE  | BRENO TAVARES - 85 99261-3809  | BRENO.TAVARES@MOBWIRE.COM.BR | GESTAOSUPORTE@MOBWIRE.COM.BR", "GERENTE SUPORTE TÉCNICO  | ANDERSON MORAIS - 85 99122-1998  | ANDERSON.MORAIS@MOBWIRE.COM.BR | GESTAOSUPORTE@MOBWIRE.COM.BR  | Nivel 3 - Após 8 horas  | GERENTE DO CENTRO DE QUALIDADE E GERÊNCIA DE REDES  | RUBENS COSTA - 85 99137-8981  | RUBENS.COSTA@MOBWIRE.COM.BR", "DIRETOR DE ATENDIMENTO  | GEORGE RAMALHO - 85 9277-8501  | GEORGE.RAMALHO@MOBWIRE.COM.BR", "DIRETOR DE OPERAÇÕES  | CID KUAHARA - 85 99146-8979  | CID.KUAHARA@MOBWIRE.COM.BR", "CEO  | SÉRGIO RIBEIRO - 85 99141-5099  | SERGIO.RIBEIRO@MOBWIRE.COM.BR", ] },
      { n: "ITTNET", l: ["86 3131-8000 - 7h as 19h  | 0800 007 8020 - Corporativo 07h as 18h  | suporte@ittnet.com.br", "Kleber Paiva  | 86 920018664 - 24h  | kleberpaiva2015s@gmail.com", "Nome: Luciano Soares Pimentel Filho  | Celular: 86 92001 9629  | lucianofilho@ittnet.com.br", ] },
      { n: "INTERNEXA", l: ["Analistas de Suporte  | 0800 606 8280  | Whatsapp: 21 9 81220035  | suportebrasil@internexa.com", "Analistas de Servico - 2 horas  | RJ - 21 3723-8268  | Nacional - 21 3723-8299  | posvendas_brasil@internexa.com", "Coordenador de Operacoes - 4 horas  | Luca Silbernael  | 21 9 8169 5693  | sluca@internexa.com", "Diretor de Operacoes - 6 horas  | Diego Nagy  | 21 9 6783 1379  | dnagy@internexa.com", "Diretora Comercial - 8 horas  | Roseli Tegani  | 11 9 7493 0638  | rtegani@internexa.com", ] },
      { n: "MTEL (YSSY)", l: ["Service Desk – 0800 709 2083 | Abertura: Opção 1 | Posicionamento Opção 2  | WhatsApp – 0800 709 2083  | suporte@yssy.com.br", "Gerente de Suporte - Milva Souza  | milva.souza@yssy.com.br  | (11) 9 7963-0311 | (11) 4134-8405", "Gerente de Operações - Rafael Batista  | rafael.batista@yssy.com.br  | (11) 9 8875-6030 | (11) 41348048", "Superintendente de Operações - Diego Nobre  | diego.nobre@yssy.com.br  | (61) 9 9676 4455", ] },
      { n: "SPEEDCAST", l: ["(22) 2106-4840  | macae.csc@speedcast.com", "(22) 2106-4812  | (22) 99221-3338  | bruno.ferreira@speedcast.com", "Roberto Souza  | (21) 97441-0472  | roberto.souza@speedcast.com", "(21) 96703-1838  | paulo.bigal@speedcast.com", ] },
      { n: "RIX", l: ["(83) 3341-5770 (07:00 as 19:00)  | Ligação e WhatsAPP -  83 99155-3500 (24h)  | suporte24h@rix.com.br", "Henrique  | 83 98219-2221  | gerencia_suporte@rix.com.br", "Carlos Junior  | 83 996570187  | cltc.jr@gmail.com", "Valdemir Cesar da Silva  | 83 991550635  | valdemir.rix@gmail.com", ] },
      { n: "OPIX", l: ["Whatsapp: 79 3025-8114 | CNPJ para abertura de reparo: 76535764000143  | Central OPIX: (79) 30258114 | (83) 3022.9941  | noc@opix.com.br", "Kleyton - 83 99962-0078 | kleyton.costa@opix.com.br", "Valter - 83 8186-2050 | infra2@opix.com.br", "Gilberto 83 98115-9214  | gilberto@opix.com.br", "Viviane Ferreira  - 83 99913 0085  | comercial@opix.com.br", ] },
      { n: "UMTELECOM", l: ["(CNPJ 33.000.118/0001-79)  | Central: 3003-8411  | Whatsapp: +55 30038411  | n1.suporte@1telecom.com.br", "(81) 97601-0008  | (81) 99965-8571  | supervisao.noc@1telecom.com.br", "Nenetha Souza - Gestora  | nenetha.souza@1telecom.com.br  | (81) 98752-6954", "Gillianne Quirino  | gillianne.quirino@1telecom.com.br  | (21) 98801-0071", "Marciolli Barbosa  | marciolli.barbosa@1telecom.com.br  | (81) 99206-1765  | (81) 98807-2460", "Saulo Porto  | saulo.porto@1telecom.com.br  | (81) 99760-7700", "Daniel Albuquerque  | daniel.albuquerque@1telecom.com.br  | (81) 981061906", "João Ribeiro  | joao.albuquerque@1telecom.com.br  | (81)98679-5457", ] },
      { n: "TUDDO", l: ["0800-039-2009 | (47)3047-8400 | (32)99113-0303  | noc@metronetwork.com.br  | WhatsApp (47) 92844387", "(21)96766-6233  | cgr@tuddointernet.com.br", "Sanchez (47)99641-2466  | sanchez.leal@metronetwork.com.br  | Anilton (47)99263-3426  | anilton.junior@metronetwork.com.br", "Jadson Grillo  | (21) 99539-2146  | jadson@tuddointernet.com.br", "Jan Jhonsen | (21)97110-6300  | jan@tuddointernet.com.br  | 6o Nivel - Gerente  | Leandro Malek - (21)99829-8795  | leandro.madureira@tuddointernet.com.br", ] },
      { n: "NETFACIL/SEMPRE", l: ["0800 600 0800  - TSC 24 horas (Whatsapp) |  Informar CNPJ 76.535.764/0007-39  | (31) 3987-0800 // 031 3987-0501  | tsc@sempre.net.br", "Julio Mateus - Supervisor do NOC  | 31 99776-6665  | Alan dos Santos - Supervisor Core | 31 99517 - 6962", "Coordenador do NOC / CORE  | 31 99546 - 8818", "Coordenadores ROT  | Leandro Morais - 37 99106 - 0342  | Clayton Pereira - 31 99564 - 2585", "Gerente de Operações - Tiago Parreiras | 31 98848 - 0578  | COO DSO - Warley Cotta | 31 99551 - 0565", ] },
      { n: "MICROTELL", l: ["Service Desk - Abertura de Chamado - 08h as 22h  | 0800.038.9004 // (38) 3221-9004  | Whatsapp: 38 9169-0600 - informar cnpj para atendimento: 76.535.764/0007-39", "Hercules - 38 9951-1975 (Ligação e Whatsapp) - Plantonista aos finais de semana  | hercules.maciel@microtell.com.br  | Julio - 38 99733-2599  | juliopontocesardl@gmail.com", ] },
      { n: "STIW (BKPNET)", l: ["NOC / Plantao  | (33) 3516-1614 / (33) 99106-8368  | 33 9106-8368 Whatsapp", "Pedro | (33) 99938-2892  | pedrohsampaio@bkpnet.com.br  | Felipe |  (33) 99955-2372 (whatsapp) / (33) 999204310  | felipe@bkpnet.com.br", "Omar  | (33) 99193-5651  | omar@bkpnet.com.br", ] },
      { n: "CONECTA", l: ["CNPJ para atendimento: 76535764000739  | 0800 887 1617  | 38 991881708 - Whatsapp  | atendimento@conectafibra.com.br | noc@conectafibra.com.br", "Roberto  | (38) 99183-3660  | roberto@conectafibra.com.br", "Robson  | (38) 98402-0106  | rbsti@conectafibra.com.br", ] },
      { n: "ONNET", l: ["Suporte (Linha exclusiva)  | (34) 3099-0597", "Adriel  | (34) 98402-2411 / 99828-9216", "Willian  | (34) 99264-0370", ] },
      { n: "NAVA", l: ["11 40837491 Opcao 2  | reparo.oi@nava.com.br", "Alex Mendes - 11 94395-5400 | Seg-Sex / 09:00 - 18:00  | alex.mendes@nava.com.br", "Estevao Cezario Silva  | 11 93466-5212  | estevao.silva@nava.com.br", "Flávio Gomes - 11 91165-6122  | flavio.gomes@nava.com.br  | Thiago Ezsias - 11 99915-8737  | thiago.ezsias@nava.com.br", "Jairo Abrantes  | 11 96399-5158  | jairo.abrantes@nava.com.br", ] },
      { n: "WEBFOCO (WT TELECOM)", l: ["Abertura de chamado (24h) | 0800 000 2029 | 99975-6009  | Acompanhamento de chamado | 71 99975-6009  WHATSAPP  | ops@webfoco.net", "Quem atender  | 71 99975-6009", "Amilton araujo  | 71 99625-3664  | amilton@webfoco.net", "Odemar Junior  | (74) 9 9974-1460", "Carlos Alberto  | 71) 9 9966-3664", ] },
      { n: "NEW MASTER", l: ["WhatsApp: 64 92001-9352  | Atendimento: 0800 454 5141  | comercialpj@newmastertelecom.com.br", "Hugo Soares - (64) 99978-0014  | Felipe Martins -  (62) 98329-8349", "Rogério de Lima  | (62) 93300-4216", ] },
{ 
        n: "SITELBRA", 
        t: "SOLICITAÇÃO DE REPARO / ATUALIZAÇÃO\n\nDesignação do Circuito: \nFalha Identificada: \nContato Local: \n\n*IMPORTANTE:\n- Reparos/Atualizações devem ser feitas pelo (61) 3028-6010 Opção 2 ou WhatsApp (61) 99618-8285 (24h).\n- Ligações com ID suprimido não serão atendidas.",
        l: [
          "N1 – NOC Atendimento | (61) 3028-6010 | noc@sitelbra.com.br",
          "N2 – Ponto Focal NOC (Samile Chagas) | (11) 9539-2739 | Samile.novaes@sitelbra.com.br",
          "N3 – Ponto Focal Cliente (Mateus Francelli) | (61) 99319-4390 | Mateus.silva@sitelbra.com.br",
          "N4 – Gerência (Luana Siqueira) | (61) 99116-2725 | Luana.siqueira@sitelbra.com.br",
          "N5 – Gerente de Contas (Renan Thielke) | (64) 9280-8290 | renan.thielke@sitelbra.com.br",
          "N6 – Vice Presidente (Vanderlei Boschetto) | (41) 99997-4060 | vanderlei.b@sitelbra.com.br"
        ] 
      },      { n: "OTRS GRUPO ARION", l: ["0800 878 8230  | Whatsapp: 0800 878 8230  | atendimento@grupoarion.com.br", "Central de Atendimento - até 24h  | 0800 878 8230  | noc@grupoarion.com.br", "Supervisor NOC - Felipe Moretti - Após 24h  | (19) 9 8841-1041  | felipe.moretti@grupoarion.com.br", "Gestor de Operações - Herick Lara - após 36h  | (31) 9 7569-0039  | herick.lara@grupoarion.com.br", "Diretor de Operações - Marcos Cortez - após 42h  | (11) 9 6467-2526  | marcos.cortez@grupoarion.com.br", ] },
      { n: "NET TURBO", l: ["(19) 3515-7204 (whatsapp)  | suportecorporativo@netturbo.com.br", "Supervisor NOC - (apos 2 horas do SLA)  | Felipe Turcatti  - 19 3515-7204  | felipe.turcatti@netturbo.com.br", "Coordenador NOC - Apos 2 horas do SLA  | Alexandre Borges - 19 999534431  | alexandre.borges@netturbo.com.br", "Diretor NOC - Apos 4 horas do SLA  | Vinicius Garcia - 19 998761065  | vinicius.garcia@netturbo.com.br", ] },
      { n: "G8 (MEGA TELECOM)", l: ["N1 SUPORTE TECNICO - Abertura de Chamado  | 11 2110-1001  | noc@g8.net.br", "N2 Operation (Data/Voice) - de 2h a 5h:  | 11 2110-1001  | informar nº do chamado", "N3 DADOS - de 5h a 8h  | 11 97213-3698  | noc@megatelecom.com", "N4 DADOS - de 8h a 10h  | Guilherme  Labadessa - 14 99633 - 8761  | guilherme.labadessa@megatelecom.com", "N5 DADOS E VOZ - Acimda de 10h  | Flavio Barros - 17 98128 - 0400  | flavio.barros@megatelecom.com", ] },
      { n: "OSI", l: ["Sempre que necessario  | URA (11) 5070-7070 - Opcao 1 e Opcao 7  | noc@ositelecom.com.br", "30 minutos apos o registro do chamado  | Atendimento (11) 5070-7070 - Opcao 1 e Opcao 7  | (47) 3368-3512 | (47) 3263-8600  | atendimento@ositelecom.com.br", "1 hora apos o registro do chamado  | Gerencia de NOC - David  | (11) 5070-9476 - (47) 99287-8282  | noc@ositelecom.com.br", "2 horas apos o registro do chamado  | Projetos Especiais - Rogerio  | (11) 5070-9473 - (47) 99170 0067  | josue@ositelecom.com.br", "3 horas apos o registro do chamado  | Tecnologia - Josue  | (11) 5070-8002 - (11) 98693-8650  | josue@ositelecom.com.br", ] },
      { n: "TITANIA TELECOM (PARCEIRA DESCONTINUADA)", l: ["Parceira Titania deixou de existir.  | Circuitos Titania agora são Tratados pela parceira Avato.", "Alexsandra Fernanda Da Silva Teixeira  | alexsandrateixeira@avato.com.br  | 11 94902-1640", ] },
      { n: "UFINET", l: ["Atendimento via telefone:  | 0800 038 9000  | nocbr@ufinet.com  | whatsapp: 11 3080 8900", "(NOC Manager) Rafael Stein - 21 98818 3574  | rstein@ufinet.com  | Nivel 3 - Apos 4h  | (Head de O&M) Marcio Del Duque - 11 97079 8997  | msantos@ufinet.com", "Apos 6h  | (CTO Brasil e Paraguay) Juan Marin - 11 97079 8997  | jmarin@ufinet.com", "Apos 6h  | (Contry Manager Brasil) Alvaro Britto - 11 99244 4776  | abritto@ufinet.com", "(Commercial Director) Juan Pablo Garay  | jpgaray@ufinet.com  | (Contry Manager Brasil) Alvaro Britto - 11 99244 4776  | abritto@ufinet.com", ] },
      { n: "BR DIGITAL", l: ["0800 600 5353  | 51 3022 9350  | noc.tickets@br.digital  | noc@br.digital", "NOC Leadership  | (51) 3079-7958  | leaders.noc@br.digital", "NOC Supervisão  | Carolina Ribeiro (51) 3079-7933 | Laís Pires (51) 3079-7956  | Paola Camargo (51) 99281-9269  | supervisao.noc@br.digital", "NOC  Coordenação  | Marcio Moraes  | 51 3079 7947 | 51 99162 9842  | mlmoraes@br.digital", "Operations Manager  | Cassio Moreira  | 51 3079 7957 | 51 99826 0107  | croliveira@br.digital", ] },
      { n: "VERO INTERNET", l: ["31 40001020 - 24/7 | informar CNPJ 76.535.764/0007-39  | Analista Jefferson - jlsilva@verointernet.com.br  |  (seg a sex das 8h as 18h) Atendimento Nacional  | Supervisor Nathan - nbuhler@verointernet.com.br | Apos as 19h - Atendimento SUL  | Analista Luan - lnogueira@verointernet.com.br | Apos as 19h - Atendimento MG  | b2bn2@verointernet.com.br", "Coordenador Carlos Monteiro  – 08:00 as 18:00  | (32) 99176-5443  | cmonteiro@verointernet.com.br", "Gerente Renata  | (11) 95421-2310  | referreira@verointernet.com.br", "Joao Prates (coordenador de redes)  | jprates@verointernet.com.br", "Allison Breno  | Gerente  | abreno@giganet.psi.br", ] },
      { n: "GVR TELECOM", l: ["Gilvan Rodrigues (24 horas)  | 67 98183 4850  | gilvan-r@hotmail.com / gilvan.r@gvrtelecom.com.br  | TELIUM", "Inês (24 horas)  | (67) 98401 8855  | maria.ines@gvrtelecom.com.br", "Central  | (67) 3474 2102", "Vander (24 horas)  | (67) 98456 4135", "Renzo  | (16) 98818 9500  | renzo@gvrtelecom.com.br", ] },
      { n: "NIVEL 1", l: ["Centro de Operacoes de Redes  | (NOC) (11) 4003-5700 / 0800 600 0 600  | noc@telium.com.br", "Thiago Silva – Supervisor - 08h00 às 17h00  | (11) 9 4178-2195 | thiago.silva@telium.com.br  | Felipe Silva – Supervisor - 13h00 às 22h00  | (11) 9 6415-1743 | felipe.silva @telium.com.br  | Giovani Cunha – Supervisor - 22h00 às 07h00  | (11) 9 874-11633 | giovani.cunha@telium.com.br", "Gerente de Operacoes  | Lorena Silva -   24h  | (11) 9 5094-6338 | lorena.silva@telium.com.br  | Thiago Sampaio - 24h  | (11) 9 7144-7088 | sampaio@telium.com.br", "Diretor de Operacoes  | Cristian Nascimento  | (11) 4052-3669 / (11) 9 9991-1896  | cristian@telium.com.br", ] },
      { n: "HOSTIFIBER", l: ["11 3777-3480 - 24 X 7  | noc@hostfiber.com.br", "11 3777-3245  | Contato exclusivo via voz em horario comercial (Das 6:00 as 22:00 em dias uteis)  | redes@hostfiber.com.br  | noc@hostfiber.com.br", "11 95038-9329  | Contato exclusivo via voz fora de horario comercial (Das 22:00 as 06:00 em dias uteis e finais de semana)  | redes@hostfiber.com.br  | noc@hostfiber.com.br", "Coordenacao NOC  | 11 99663-3161  | qualidade@hostfiber.com.br", ] },
      { n: "ALLREDE", l: ["CNPJ para atendimento: 76.535.764/0328-51  | 0800 255 7333  - 24x7  | 62 9995-5075 - Somente Whatsapp - 24x7  | suporteb2b@allrede.com.br - Abertura de reparo", "Beatriz Matos - 61 992886359", "Leandro Veloso - 64 992165625", ] },
      { n: "ULTRANET", l: ["11 3544 4444  | suporte@ultra.net.br", "11 2106-9715 / 2106-9726  | noc@ultra.net.br", "11 2106-9745  | eriel@ultra.net.br", "11 2106-9718  | andre@ultra.net.br", ] },
      { n: "VOLUY", l: ["CGR (Centro de Gerenciamento de Rede)  | CNPJ para atendimento: 76535764/0001-43  | 0800 865 8900 Ligação 24h  | 35 3112 1370 Telefone e Whatsapp 07h as 22h  | suporte.tec@voluy.com.br", "Supervisão  | 35 99932 8162 - Quem atender", "Gerente Solucoes Telecom e TI  | Lucas Cesar Silva  | 35 98807-5308 (Ligacao + Whatsapp)  | 35 99927 5647 (Ligaçao)  | lucas.silva@voluy.com.br", ] },
      { n: "AVATO", l: ["0800 644 0692 - CNPJ 76535764/0001-43  | suporte@avato.com.br", "CAC Suporte Ativo  - Apos 2h  | 55 98439-8421 / 55 997348858  | suporte@avato.com.br/ cac@avato.com.br", "Coordenação 2º Nível - Apos 4h  | 55 99169 6582  | cac.coordenacao@avato.com.br", "Gerência Telecom - Apos 7hs  | Marcos Ravalha 55 99176 6628 (Também Whatsapp)  | marcosravalha@avato.com.br", "Head de Atendimento  | Carlos Fraga 51 99973 6537  | Comercial - Alexsandra Teixeira - 11 94902-1640  | <alexsandrateixeira@avato.com.br>", ] },
      { n: "UNIFIQUE", l: ["NOC  - (47) 3380-0800  | suporte@redeunifique.com.br", "(47) 3380-0810  | n2@redeunifique.com.br", "(47) 3380-0810  | monitoramento@redeunifique.com.br", ] },
      { n: "ELO SOLUCOES", l: ["Suporte ao cliente  | 0800 180 0091 - Horário Comercial - 08 - 18hs  | (62)99205-5933 - Whatsapp - 24 x 7  | suporte@elosolucoes.net.br / noc@elosolucoes.net.br", "Supervisor de Suporte ao  Cliente  | JHONATAN - 62-99205-5933  | DIOGO - 62 9535-9207", "Alta Administracao  - Resolucao Imediata  | Livio Vasconcelos Teles - (64) 9 9267 3876  | livio@elosolucoes.net.br", "Gerente de Contas  | (62) 99943 - 8100 - 0800 180 0091  | comercial@elosolucoes.net.br", "Diretoria Financeira  | (64) 99200 - 9098 - 0800 180 0091  | financeiro@elosolucoes.net.br", ] },
      { n: "WORLD NET TELECOM", l: ["Suporte Geral  | 81 3323-4401  | noc@worldnet.com.br | suporte@worldnet.com.br", "Coordenacao  | Amanda Menezes | 81 9 8169-991  | amanda.noc@worldnet.com.br", "Gerente Comercial  | Juan Raindo | 81 9 7307-175  | comercial@worldnet.com.br", "Diretor de Tenologia  | Thiago Santos | 81 99223-0976  | thiago@worldnet.com.br", ] },
      { n: "WCS TECNOLOGIA", l: ["CNPJ para atendimento 76535764/0001-43  | Abertura de chamado:  11 48004900 - 24h  | Portal WCS - https://wcs.my.site.com/clientewcs/s/login/ | Login: LD-NOCTERCEIRO@oi.net.br | Senha: Aguardando parceira informar  | (não solicitar abertura de chamado, somente para envio de envidencias). | noc@wcs.com.br", "Angélica Leão - Coordenadora de Operações - (11) 96397-1965  | Pedro Neto - Coordenador de Operações - (11) 94033-1213  | Humberto Oliveira - Coordenador de Operações - (11) 94028-8104  | Plantão Coordenação -  (11) 4934-5500", "Gerencia  | Tatiana Soares - Gerente do NOC - (11) 99649-9528", ] },
      { n: "DTEL TELECOM", l: ["Telefone: 0800 001 2008  | e-mail: callcenter@dtel.com.br", "Jorge - Telefone: 81 9 9290-7543  | e-mail: jorge@dtel.com.br", "Gabriel - Telefone: 81 9.9848-0231  | e-mail: gabriel@dtel.com.br", "Orlando Soares - Telefone:81 9.8873-1099  | e-mail:  orlando@dtel.com.br", "Contato: Gerência comercial -Telefone: 81 9 9248-8212  | e-mail:  adelmir@dtel.com.br  | Atendimento comercial  | Telefone: 81 9.9254-6117  | e-mail:  andrea@dtel.com.br", ] },
      { n: "BRISANET", l: ["Suporte avançado  | suportecorporativo@grupobrisanet.com.br  | Cel: (88) 9.8182-0137  | 0800 282 3017 (Ligações originadas do nordeste)  | (88) 2150-0923 (Ligações de outros Estados", "Lucas Bezerra  | lucas.bezerra@grupobrisanet.com.br  | Cel: (84) 9.8114-8330 || Ramal 4760  | 0800 282 3017 (Ligações originadas do nordeste)  | (88) 2150-0923 (Ligações de outros Estados", "Vinicius Lopes Fernandes Pinheiro  | viniciuslopes@grupobrisanet.com.br  | Cel: (084) 9.8109-5471 || Ramal 4720  | 0800 282 3017 (Ligações originadas do nordeste)  | (88) 2150-0923 (Ligações de outros Estados", ] },
      { n: "MEGALINK (GRUPO BILINK | QUICK TELECOM)", l: ["Abertura de Chamado - 24 x7  | Código para Abertura de chamado: OI S.A 114270  | CNPJ: 76535764.0001.43  | (65) 2123-3110 - Opção 1 / 0800 065 3110 - Opção 1  | 65 8140-2425 Whatsapp - informar código 114270 para atendimento  | Caso não tenha sucesso via telefone:  | aberturachamados@quick.inf.br / comercial@bilink.com.br", "Michelle Goulart  | Michelle Goulart  | whatsapp: +351934566635  | telefone fixo: 65-2123-3111", "Contato Técnico - Lincoln Junior:  | e-mail: lincolnjunior1@bilink.com.br  | whatsapp: 65981056932  | telefone fixo: 65-2123-3100", "Lincoln  | 65 99676-2559", "Glaucia  | e-mail: glaucia.bilink@hotmail.com  | whatsapp: 65-99944-9404  | telefone fixo: 65-2123-3100", ] },
      { n: "SUMICITY", l: ["Abertura do Chamado:  | 0800 053 0000  | (22) 2537 8038 – WhatsApp  | cgr@sumicity.net.br", "Coordenador de Operações de Rede  | Lúcio Gomes – (22) 99255-6015  | lucio.gomes@sumicity.net.br", "Gerente de Operações de Rede  | Sumicity: Maurício Araújo – (22) 99278-3949 |  mauricio.araujo@sumicity.net.br  | Univox Fibra: Eduardo Machado – (35) 9750-2535 |  eduardocoelho@univox.com.br  | Click Telecom: Waner Gabriel – (34) 9865-0166 |  waner.gabriel@naclick.com.br", "Gerente Executivo de Engenharia e Operações de Rede  | Diogo Maia – (22) 99241-2167  | diogo.maia@sumicity.net.br", "Financeiro:  | financeiro.empresarial@sumicity.net.br  | Comercial corporativo:  | samuel.diniz@sumicity.net.br", ] },
      { n: "SENCINET", l: ["NOC - 24/7  | 0800 707 3399", "Ivan Mello – 21 99003-7633  | ivan.mello@sencinet.com", ] },
      { n: "FREEWAY NET", l: ["Utilizar como usuário : CNPJ 05.532.085/0001-72  | PORTAL DO CLIENTE https://sistema.freewaynet.com.br/central_assinante_web/login  | Plataforma Digital -> CANAL OMNICHANNEL (67)3025-3131 (whattsapp ou telegrama)  | suporte@freewaynet.com.br  | Via Telefone -> (67)3025-3131", "Telefone do Plantão do Suporte  | 67 99821-6917", "Flávio Ortegua – Analista de Suporte & Redes  | +55 67 98476-6716 | projetos@freewaynet.com.br  | Leonardo Ribas – Operações de TELECOM  | +55 67 9 9862-1164 | leonardo.ribas@freewaynet.com.br", "Tatiane Newhaus  | 67 9 9215-4047 | financeiro@freewaynet.com.br", ] },
      { n: "MASTER INTERNET", l: ["NOC Master Internet  | +55 37 3512-4730", "Igor Raposo  | 37 99199-1846  | Igor.raposo@soumaster.com.br", ] },
      { n: "GTI TELECOM", l: ["Atendimento - Até 2h  | 0800 2233 123 / 27 2233-2233  | suporte@gtitelecom.net.br", "NOC - Acima de 2h  | 27 2233-2290 / 27 99891-2290  | suporte@gtitelecom.net.br", "Cristiano Botelho - Acima de 4H (Suporte)  | 27 99796 7166  | cristiano.botelho@gtitelecom.net.br", "Darlan Estevão - Acima de 6h - (Suporte)  | 27 99509 6312  | darlanestevao@gtitelecom.net.br", "Álvaro França (Coordenador Geral) - Acima de 12H  | 27 99776-8825  | alvaro@gtitelecom.net.br", ] },
      { n: "ALLFIBER", l: ["08:00 as 22:00 de Segunda a Sexta-Feira | 08:00 as 12:00 das 14:00 as 18:00 aos Sábados, Domingos e Feriados  | (95) 4009-8460 - Opção 4 (Suporte técnico Empresarial)  | WhatsApp: (95) 4009-8460  | CNPJ OI para a Abertura: 76.535.764/0328-51  | suporte@allfiber.com.br", "08:00 as 18:00 segunda a sexta-feira  | 08:00 as 11:30 sábado  | 95 8119-3939  | Ivan - ivanandrade@allfiber.com.br", "08:00 as 18:00 segunda a sexta-feira  | 08:00 as 11:30 sábado  | 95 9905-3204  | Matheus - matheus@allfiber.com.br", ] },
      { n: "V.TAL", l: ["Suporte e Testes  | 0800 031 6060 / 0800 031 8031/ 21 96958-2551 (via Whatsapp)  | EMAIL: LD-GESTAOTECNICAVTAL@VTAL.COM  | 0800-1255060", ] },
      { n: "CASSI-VALIDAÇÃO", l: ["61 32125023", ] },
    ];

    try {
      const salvo = localStorage.getItem("sistema_wiki_oemp");
      return salvo ? JSON.parse(salvo) : baseNativaOEMP;
    } catch(e) {
      return baseNativaOEMP;
    }
  });

const macrosAvancadas = [
    { label: "Acionamento de Operadora", texto: "Chamado de reparo aberto junto à operadora responsável. // Ocorrência em acompanhamento. // Aguardando análise e posicionamento técnico para continuidade das tratativas." },
    { label: "Solicitação de Apoio SOC (E-mail)", texto: "Acionado apoio da equipe SOC por meio de comunicação formal via e-mail (às XX:XXh). // Solicitação em acompanhamento. // Aguardando retorno para prosseguimento da análise." },
    { label: "Encaminhamento para Validação SOC", texto: "Caso direcionado à equipe SOC após validações iniciais sem indícios de falha no circuito. // Ocorrência sob análise especializada. // Aguardando parecer técnico." },
    { label: "Apoio Cliente – Firewall e Infraestrutura", texto: "Solicitado apoio do cliente para validação do firewall e da infraestrutura local. // Necessária confirmação dos testes realizados. // Aguardando retorno para continuidade da investigação." },
    { label: "Validação de Equipamentos em Campo", texto: "Necessária verificação dos equipamentos instalados na localidade. // Procedimento requerido para avanço da análise. // Aguardando retorno das validações." },
    { label: "Solicitação de Evidências Fotográficas", texto: "Solicitado envio de fotos dos equipamentos e conexões para apoio à análise técnica. // Evidências pendentes de recebimento. // Aguardando retorno da localidade." },
    { label: "Escalonamento à Gestão Técnica", texto: "Caso escalonado ao gestor responsável para apoio na obtenção de contatos e validações junto à localidade. // Tratativa em acompanhamento. // Aguardando retorno." },
    { label: "Apoio da Gestão", texto: "Solicitado apoio da gestão técnica por meio de e-mail (às XX:XXh). // Demanda em acompanhamento. // Aguardando posicionamento para avanço das tratativas." },
    { label: "Follow-up das Tratativas", texto: "Realizado follow-up junto às equipes responsáveis pela análise da ocorrência. // Caso permanece em monitoramento. // Aguardando atualização das ações em andamento." },
    { label: "Solicitação de Atualização", texto: "Solicitada atualização do incidente via e-mail (às XX:XXh). // Aguardando posicionamento da área responsável. // Pendente estimativa para normalização do serviço." },
    { label: "Análise da Equipe de Fibra", texto: "Ocorrência em análise pela equipe de fibra. // Causa da falha em apuração. // Aguardando retorno técnico com diagnóstico." },
    { label: "Triagem de Rede", texto: "Incidente em processo de triagem na rede. // Identificação da causa em andamento. // Próxima atualização prevista em 3 horas." },
    { label: "Atuação Técnica Local", texto: "Equipe técnica acionada para atendimento na localidade. // Verificações em andamento no ambiente do cliente. // Aguardando conclusão da atuação e retorno técnico." }
  ];
  
const [categoriaExpandida, setCategoriaExpandida] = useState("DIA A DIA"); 
  const [artigoAtivo, setArtigoAtivo] = useState("dia_ferramentas");
const [escalaExpandida, setEscalaExpandida] = useState(null);
  const [modoNoc, setModoNoc] = useState(false); // NOVO GATILHO
  const [circuitoExpandido, setCircuitoExpandido] = useState(null); // CONTROLE DA GAVETA

  const baseConhecimento = [
            {
      categoria: "CONTATOS",
      artigos: [
        { id: "contatos_oemp", titulo: "OEMP / Parceiras", tipo: "cards_oemp", dados: dadosOEMP },
        { 
          id: "contatos_uteis", 
          titulo: "Contatos Operacionais e Úteis", 
          tipo: "cards_uteis", 
          dados: [
            { nome: "CEC BB", telefone: "0800 282 1453", opcao: "2", funcao: "Suporte Banco do Brasil", cor: "bg-amber-500" },
            { nome: "Cintia OI", telefone: "(61) 98625-1142", funcao: "Operacional OI", cor: "bg-yellow-500" },
            { nome: "Mariana Conti", email: "mariana.conti@oi.net.br", obs: 'Acionar via Teams quando o circuito estiver "preto" no Itaú.', funcao: "Apoio OI / Itaú", cor: "bg-yellow-500" },
            { nome: "SOC OI", email: "oi-soc@oi.net.br", funcao: "Security Operations Center", cor: "bg-rose-600" },
            { nome: "Magno MTI", telefone: "(21) 96959-7018", funcao: "Coordenação GT", cor: "bg-cyan-600" },
            { nome: "NOC Megatelecom", telefone: "(11) 2110-1001", email: "noc@megatelecom.com.br", funcao: "NOC Corporativo", cor: "bg-blue-600" },
            { nome: "NOC G8", email: "noc@g8.net.br", funcao: "NOC Corporativo", cor: "bg-blue-600" },
            { nome: "Isaac Damasceno", telefone: "(11) 96119-7213", funcao: "Administrador do Grupo", cor: "bg-emerald-500" },
            { nome: "Miguel Alexsander", telefone: "(37) 9969-9845", funcao: "Administrador do Grupo", cor: "bg-emerald-500" },
            { nome: "Gleison Torres", telefone: "(11) 95196-6567", funcao: "Contato Operacional", cor: "bg-slate-500" },
            { nome: "Izaias Belmont", telefone: "(11) 96965-5412", funcao: "Contato Operacional", cor: "bg-slate-500" },
            { nome: "Fabio Souza", telefone: "(11) 96955-0430", funcao: "Coordenador NAVA", cor: "bg-fuchsia-600" },
            { nome: "Neto", telefone: "(61) 98139-1099", funcao: "NAVA - DF", cor: "bg-fuchsia-600" }
          ] 
        }
      ]
    },
    {
      categoria: "DIA A DIA",
      artigos: [
        { 
          id: "dia_ferramentas", 
          titulo: "Links e Ferramentas", 
          tipo: "tabela", 
          colunas: ["Ferramenta / Sistema", "Endereço / Link de Acesso"],
          dados: [
            ["Twilio Flex", "https://flex.twilio.com/ochre-bat-4536"],
            ["Portal Base Única - Farol 360", "cec.nava.com.br"],
            ["Portal GIS (Gestão Integrada)", "gestaointegrada.oi.net.br"],
            ["VeloCloud Orchestrator", "124-vsca1.velocloud.net"],
            ["RT Ping Telemar", "rtping.telemar.net.br"],
            ["Legado Brasil Telecom", "legado.brasiltelecom.com.br"],
            ["Portal Fornecedor BB", "fornecedor.piloto.bb.com.br"],
            ["Batida Online (Ahgora)", "app.ahgora.com.br"],
            ["Acessos IP Diretos (Roteadores/Equipamentos)", "10.121.240.208 / 10.61.81.95 / 10.121.185.113 / 10.111.4.118"]
          ]
        },
        { 
          id: "dia_senhas", 
          titulo: "Cofre de Senhas e Acessos", 
          tipo: "cards_senhas", 
          dados: [
            { id: "gis", sistema: "Portal OI GIS", usuario: "TR808175", senha: "++Roinuj00@@", obs: "Gestão Integrada", icone: "🌍", cor: "bg-fuchsia-500" },
            { id: "fix", sistema: "FIX / RMS / FTC", usuario: "TR808175", senha: "Plcmjrjfn123", obs: "Senha OI Unificada", icone: "🛡️", cor: "bg-indigo-500" },
            { id: "sac", sistema: "Sistema SAC", usuario: "TR808175", senha: "Não requer / Padrão", obs: "Acesso Operacional", icone: "📞", cor: "bg-cyan-500" },
            { id: "stc", sistema: "Sistema STC", usuario: "J48435", senha: "Não requer / Padrão", obs: "Controle de Chamados", icone: "📡", cor: "bg-emerald-500" }
          ] 
        },
{
          id: "dia_escala",
          titulo: "Escala Operacional (Junho 2026)",
          tipo: "escala_inteligente",
          manha: [
            { nome: "Fabio Roberto Ribeiro de Alvarenga", turno: "J2", horario: "07:00 as 16:00", escala: { 4:'F', 5:'BH', 6:'SAB', 7:'DOM', 13:'SAB', 14:'DOM', 20:'SAB', 21:'DOM', 27:'SAB', 28:'DOM' } },
            { nome: "Raymundo Serrate dos Santos Neto", turno: "J2", horario: "07:00 as 16:00", escala: { 4:'F', 5:'BH', 6:'SAB', 7:'DOM', 13:'SAB', 14:'DOM', 19:'SAB', 22:'DOM', 27:'SAB', 28:'DOM' } },
            { nome: "Girlene de Lima Silva", turno: "J2", horario: "07:00 as 16:00", escala: { 1:'BH', 4:'F', 5:'BH', 6:'SAB', 7:'DOM', 13:'SAB', 14:'DOM', 20:'SAB', 21:'DOM', 27:'SAB', 28:'DOM' } },
            { nome: "Lucas Ribeiro Araujo", turno: "J2", horario: "07:00 as 16:00", escala: { 4:'F', 5:'BH', 6:'SAB', 7:'DOM', 12:'SAB', 15:'DOM', 20:'SAB', 21:'DOM', 27:'SAB', 28:'DOM' } },
            { nome: "Samara de Lima", turno: "J2", horario: "07:00 as 16:00", escala: { 4:'F', 5:'BH', 6:'SAB', 7:'DOM', 13:'SAB', 14:'DOM', 20:'SAB', 21:'DOM', 27:'SAB', 28:'DOM' } },
            { nome: "Antonio Davi Silva de Araujo", turno: "J3", horario: "08:00 as 17:00", escala: { 4:'F', 5:'BH', 6:'SAB', 7:'DOM', 13:'SAB', 14:'DOM', 20:'SAB', 21:'DOM', 27:'SAB', 28:'DOM' } },
            { nome: "Winnie Lidsley Perales Villamonte", turno: "J3", horario: "08:00 as 17:00", escala: { 1:'FERIAS', 2:'FERIAS', 3:'FERIAS', 4:'FERIAS', 5:'FERIAS', 6:'FERIAS', 7:'FERIAS', 8:'FERIAS', 9:'FERIAS', 10:'FERIAS', 12:'SAB', 13:'DOM', 19:'SAB', 20:'DOM', 26:'SAB', 29:'DOM' } },
            { nome: "Julian Brendon Fortunato Alves", turno: "J3", horario: "08:00 as 17:00", escala: { 2:'SAB', 9:'DOM', 12:'SAB', 13:'DOM', 19:'SAB', 20:'DOM', 27:'SAB', 28:'DOM' } },
            { nome: "Charlie Magiver Perales Villamontes", turno: "J5", horario: "09:00 as 18:00", escala: { 1:'FERIAS', 2:'FERIAS', 3:'FERIAS', 4:'FERIAS', 5:'FERIAS', 6:'FERIAS', 7:'FERIAS', 8:'FERIAS', 9:'FERIAS', 10:'FERIAS', 11:'FERIAS', 12:'FERIAS', 13:'FERIAS', 14:'FERIAS', 15:'FERIAS', 16:'FERIAS', 17:'FERIAS', 18:'FERIAS', 19:'FERIAS', 20:'FERIAS', 21:'FERIAS', 22:'FERIAS', 27:'SAB', 28:'DOM' } }
          ],
          tarde: [
{ nome: "Gleison de Torres Loiola", turno: "J9", horario: "14:00 as 23:00", escala: { 4:'F', 5:'BH', 6:'SAB', 7:'DOM', 13:'SAB', 14:'DOM', 19:'SAB', 22:'DOM', 27:'SAB', 28:'DOM' } },
            { nome: "Miguel Alexsander do Nascimento", turno: "J9", horario: "14:00 as 23:00", escala: { 4:'F', 5:'BH', 6:'SAB', 7:'DOM', 13:'SAB', 14:'DOM', 20:'SAB', 21:'DOM', 26:'SAB', 29:'DOM' } },            { nome: "Isaac Nogueira Veras Damasceno", turno: "J9", horario: "14:00 as 23:00", escala: { 1:'FERIAS', 2:'FERIAS', 3:'SAB', 8:'DOM', 13:'SAB', 14:'DOM', 20:'SAB', 21:'DOM', 27:'SAB', 28:'DOM' } },
            { nome: "Pedro Lucio Cardoso Matos Junior", turno: "J9", horario: "14:00 as 23:00", escala: { 4:'F', 5:'BH', 6:'SAB', 7:'DOM', 12:'SAB', 15:'DOM', 20:'SAB', 21:'DOM', 27:'SAB', 28:'DOM' } }
          ]
        }
                        ]
    },
    {
      categoria: "MANUAIS / POSICIONAMENTOS",
      artigos: [
        { id: "manuais_encerramentos", titulo: "Códigos de Encerramento (STC_ARS)", tipo: "cards_stcars_master", dados: dadosStcArsMaster },
        { id: "twilio_fix", titulo: "Árvore de Códigos FIX", tipo: "tabela_fix", dados: dadosFix },
            { id: "guia_stc", titulo: "Guia Rápido STC Master", tipo: "guia_stc_premium", regiao1: [            { posto: "CLD", desc: "Nova Oi - envio de técnico" },
            { posto: "CLDV", desc: "Vital - envio de técnico" },
            { posto: "REDEA", desc: "Rede de cabos metálicos" },
            { posto: "TX", desc: "Transmissão Nova Oi" },
            { posto: "TXVT", desc: "Transmissão Vital" },
            { posto: "FIBRA", desc: "Vital" },
            { posto: "FIBO", desc: "Fibra Nova Oi" },
            { posto: "COMUT", desc: "Comutação" },
            { posto: "CONF", desc: "Configuração de voz" },
            { posto: "NATA", desc: "Triagem Nova Oi" },
            { posto: "NATAV", desc: "Triagem Vital" },
            { posto: "EIAD", desc: "Pendente migração tec/parceira" },
            { posto: "TRIAV", desc: "Triagem rede Vital (SDH)" },
            { posto: "TRIA", desc: "Massiva na rede Vital" },
            { posto: "OEMP", desc: "Circuitos parceira última milha" },
            { posto: "TADE", desc: "Posto de encerramento" },
            { posto: "CGS/FCR", desc: "Circuito criado pend. manual" },
            { posto: "PARC", desc: "Posto parceira" }
          ],
          regiao2: [
            { posto: "CECV", desc: "Massiva na rede Vital" },
            { posto: "CDE", desc: "CLD Nova Oi - envio técnico" },
            { posto: "CX", desc: "Comutação Região II" },
            { posto: "FO", desc: "Fibra (Vital)" },
            { posto: "TXIF", desc: "Transmissão Nova Oi (Infra)" },
            { posto: "CB", desc: "Rédea (cabos metálicos)" },
            { posto: "NATA", desc: "Triagem Nova Oi" },
            { posto: "NATAV", desc: "Triagem Vital" }
          ],
          comandos: [
            { cmd: "R", desc: "Redirecionar chamado" },
            { cmd: "M", desc: "Mostrar mensagens" },
            { cmd: "V", desc: "Visualizar mensagem" },
            { cmd: "N", desc: "Inserir nova mensagem" },
            { cmd: "W", desc: "Inserir/retirar pendência" },
            { cmd: "T", desc: "Histórico de tramitação" },
            { cmd: "E", desc: "Encerrar ou cancelar chamado" }
          ],
          pendencias: [
            { cod: "4051", desc: "Liberação de acesso ao cliente" },
            { cod: "4052", desc: "Cliente ausente" },
            { cod: "4053", desc: "Aguardando data agendada" },
            { cod: "4055", desc: "Monitoração" },
            { cod: "4056", desc: "Confirmação de solução" },
            { cod: "4058", desc: "Infra responsabilidade cliente" },
            { cod: "4059", desc: "Área de risco" },
            { cod: "4060", desc: "Falta energia concessionária" },
            { cod: "4065", desc: "Aguardando carro forte" },
            { cod: "4070", desc: "Manutenção aprovação cliente" },
            { cod: "7031", desc: "Agendamento MUA - EMP" },
            { cod: "7032", desc: "Agendamento MUA - ASS" },
            { cod: "7036", desc: "Agendamento MUA - Funcional" },
            { cod: "7037", desc: "Agendamento MUA - Técnico" },
            { cod: "7038", desc: "Aguardando agendamento MUA" }
          ]
        },
        { 
          id: "pop_operacao", 
          titulo: "POP: Operação e STC Master", 
          tipo: "pop_interativo", 
          secoes: [
            {
              titulo: "Comandos STC (Terminal)",
              icone: "⌨️",
              cor: "border-indigo-500",
              textoCor: "text-indigo-400",
              bgCor: "bg-indigo-500/10",
              itens: [
                { label: "CA", desc: "Consulta Instalação e Nota" },
                { label: "CBC", desc: "Tramitar, Pendência, Encerrar, Aprazar" },
                { label: "R", desc: "Redirecionar / Tramitar Estágios" },
                { label: "W", desc: "Retroagir / Retirar Pendência" },
                { label: "E", desc: "Encerrar Ticket" },
                { label: "M", desc: "Ler Mensagens Internas" },
                { label: "N", desc: "Incluir Nova Mensagem" },
                { label: "T", desc: "Verificar Vencimento (Tempo)" }
              ],
              destaque: "RETROAGIR / PENDÊNCIA: Utilizar Código 4053. Para pendências, jogar 15 dias pra frente. Ao retroagir (ex: Posto TADE), acrescentar sempre 3 minutos ao horário da entrada."
            },
            {
              titulo: "Fluxos de Tratativa",
              icone: "🔄",
              cor: "border-emerald-500",
              textoCor: "text-emerald-400",
              bgCor: "bg-emerald-500/10",
              texto: [
                "OEMP::Tratados pela Oi (A Vtal não atende). Encaminhar para o posto TADE com a devida marcação.",
                "PFN (Alarme Falso)::Se alarma mas o link continua funcionando, deve-se fechar o STC. (Na Região II usar cód. de encerramento indevido 03696 para FIX). Se o cliente reclamar, abra chamado, concilie após normalizar e atualize no RDE.",
                "CASSI::Abertura é normal, mas segue direto para o campo. Escalonar no painel e enviar e-mail ao cliente. REGRA: Ligar e validar se há energia no local.",
                "POSTOS CHAVE::TADE (Validação e Encerramento final) | CLD e CLDU (Fazem liberação no acesso)."
              ]
            },
            {
              titulo: "Classificação de Eventos",
              icone: "🚨",
              cor: "border-rose-500",
              textoCor: "text-rose-400",
              bgCor: "bg-rose-500/10",
              texto: [
                "EVENTO DE VULTO::Inicia a partir de 10 links inoperantes. Necessário acionar via E-mail e WhatsApp. Exige resumo do caso.",
                "EVENTO CRÍTICO::Evento de vulto que afeta o Concentrador. A validação deve ser feita imediatamente sem contato com o cliente.",
                "VULTO FIXO (Região II)::Identificado pelo Código de Defeito 9 (múltiplos circuitos interrompidos).",
                "SISTEMAS ESPECIAIS::PAE-P (Refere-se a Caixas Eletrônicos) | DRENAP (Links sendo reabilitados nas agências)."
              ]
            },
            {
              titulo: "Procedimentos BMC (ARQ / FIX)",
              icone: "🗺️",
              cor: "border-amber-500",
              textoCor: "text-amber-400",
              bgCor: "bg-amber-500/10",
              texto: [
                "REGIÃO I (ARQ)::Criação de BD (STC) com necessidade de transmissão. Tramita na Reg. I -> após BD (RS), ocorre o FCR.",
                "PERÍMETRO DE ACESSO (ARQ)::Se Vtal: 1ª Estação -> TRIAV. Se Oi: Estação Telemar Matriz -> COS.",
                "REGIÃO II (FIX)::Circuitos c/ zero inicial (cria BA). Estados abrangidos: AC, RO, MT, MS, PR, RS, SC, TO, GO.",
                "REGRA DE OURO::Sempre copiar os dados do BD/BO para o histórico."
              ]
            },
            {
              titulo: "Ferramentas e Ecossistema",
              icone: "🛠️",
              cor: "border-cyan-500",
              textoCor: "text-cyan-400",
              bgCor: "bg-cyan-500/10",
              texto: [
                "TWILIO FLEX::Plataforma de Contact Center para recebimento de ligações.",
                "FLEX / AFN::Gerenciamento de dados de circuitos.",
                "RMS / SECUNY::Acesso direto via interface do equipamento (TAKACK).",
                "ROBÔ DE AUTOMAÇÃO::Atuação programada de Segunda a Sexta-feira, das 08h às 18h.",
                "ESTRUTURA DO CIRCUITO::Composta por IDBB -> Prefixo -> Localidade -> Contato.",
                "ENTIDADES BBTS::CASSI, BB Turismo, BB Previdência, DITEC, CEMAM, Mesa Fin. (Nota: BBTS não possui links gerenciáveis). Parceiros: DEMP."
              ]
            }
          ]
        },
        { 
          id: "biblioteca_central", 
          titulo: "Biblioteca de Arquivos", 
          tipo: "biblioteca_arquivos", 
          documentos: [
            { id: 2, nome: "Roteiro de Validação de Firewall", formato: "word", descricao: "Passo a passo para validação de bloqueios em CPE.", atualizado: "Abril/2026", link: "#" }
          ]
        }
      ]
    }
  ];

  const artigosWikiFiltrados = useMemo(() => {
    if (!filtroWiki) return baseConhecimento;
    const busca = filtroWiki.toLowerCase();
    
    return baseConhecimento.map(categoria => {
      const artigosFiltrados = categoria.artigos.map(artigo => {
        const matchTitulo = (artigo.titulo || "").toLowerCase().includes(busca);
        if (artigo.tipo === "texto") return (matchTitulo || (artigo.conteudo || "").toLowerCase().includes(busca)) ? artigo : null;
        
        if (artigo.tipo === "cards_stcars_master") {
          if (!artigo.dados) return matchTitulo ? artigo : null;
          const dadosFiltrados = artigo.dados.filter(row => row.some(celula => String(celula || "").toLowerCase().includes(busca)));
          return dadosFiltrados.length > 0 ? { ...artigo, dados: dadosFiltrados } : null;
        }

        if (artigo.tipo === "cards_oemp") {
          if (!artigo.dados) return matchTitulo ? artigo : null;
          const dadosFiltrados = artigo.dados.filter(parc => {
            const matchNome = (parc.n || "").toLowerCase().includes(busca);
            const matchLinhas = parc.l.some(linha => String(linha || "").toLowerCase().includes(busca));
            return matchNome || matchLinhas;
          });
          return dadosFiltrados.length > 0 ? { ...artigo, dados: dadosFiltrados } : null;
        }

        if (artigo.tipo === "cards_uteis") {
          if (!artigo.dados) return matchTitulo ? artigo : null;
          const dadosFiltrados = artigo.dados.filter(cont => {
            const stringUnificada = `${cont.nome} ${cont.telefone || ""} ${cont.email || ""} ${cont.funcao || ""} ${cont.obs || ""}`.toLowerCase();
            return stringUnificada.includes(busca);
          });
          return dadosFiltrados.length > 0 ? { ...artigo, dados: dadosFiltrados } : null;
        }

        if (artigo.tipo === "cards_senhas") {
          if (!artigo.dados) return matchTitulo ? artigo : null;
          const dadosFiltrados = artigo.dados.filter(s => `${s.sistema} ${s.usuario} ${s.obs || ""}`.toLowerCase().includes(busca));
          return dadosFiltrados.length > 0 ? { ...artigo, dados: dadosFiltrados } : null;
        }

        if (artigo.tipo === "recorrencia_master") {
          if (!artigo.dados) return matchTitulo ? artigo : null;
          const dadosFiltrados = artigo.dados.filter(r => JSON.stringify(r).toLowerCase().includes(busca));
          return dadosFiltrados.length > 0 ? { ...artigo, dados: dadosFiltrados } : null;
        }

        if (artigo.tipo === "guia_stc_premium") {
          const matchDados = JSON.stringify(artigo).toLowerCase().includes(busca);
          return (matchTitulo || matchDados) ? artigo : null;
        }

        if (artigo.tipo === "pop_interativo") {
          const matchConteudo = JSON.stringify(artigo.secoes || "").toLowerCase().includes(busca);
          return (matchTitulo || matchConteudo) ? artigo : null;
        }

        if (artigo.tipo === "biblioteca_arquivos") {
          if (!artigo.documentos) return matchTitulo ? artigo : null;
          const docsFiltrados = artigo.documentos.filter(doc => (doc.nome || "").toLowerCase().includes(busca) || (doc.descricao || "").toLowerCase().includes(busca));
          return docsFiltrados.length > 0 ? { ...artigo, documentos: docsFiltrados } : (matchTitulo ? artigo : null);
        }

        return matchTitulo ? artigo : null;
      }).filter(Boolean);

      return { ...categoria, artigos: artigosFiltrados };
    }).filter(categoria => categoria.artigos.length > 0); 
  }, [filtroWiki, dadosSTC, dadosResidentes, dadosOEMP]);

  let artigoRenderizado = baseConhecimento.flatMap(cat => cat.artigos).find(art => art.id === artigoAtivo);
  if (filtroWiki && artigoRenderizado) {
     const filtrado = artigosWikiFiltrados.flatMap(cat => cat.artigos).find(art => art.id === artigoAtivo);
     artigoRenderizado = filtrado ? filtrado : { ...artigoRenderizado, dados: [], documentos: [] }; 
  }

  useEffect(() => localStorage.setItem("atendimentos", JSON.stringify(atendimentos)), [atendimentos]);
  useEffect(() => localStorage.setItem("sistema_rascunho", rascunho), [rascunho]);
  
  useEffect(() => {
    localStorage.setItem("sistema_darkmode", darkMode);
    if (darkMode) document.documentElement.classList.add("dark");
    else document.documentElement.classList.remove("dark");
  }, [darkMode]);

  useEffect(() => {
    async function loadDirectoryHandle() {
      try {
        const handle = await get('backupDirectoryHandle');
        if (handle) {
          setDiretorioBackup(handle);
          setNomeDiretorio(handle.name);
        }
      } catch (err) {
        console.warn("Nenhum diretório salvo no IndexedDB.");
      }
    }
    loadDirectoryHandle();
  }, []);

  const mostrarToast = (mensagem, tipo = "sucesso") => {
    const id = Date.now(); setToasts((t) => [...t, { id, message: mensagem, tipo }]);
    setTimeout(() => setToasts((t) => t.filter((item) => item.id !== id)), 3500);
  };

  const processarColagemSTC = () => {
    if (!textoImportacao.trim()) { mostrarToast("Caixa vazia.", "erro"); return; }
    try {
      const matriz = textoImportacao.trim().split('\n').map(linha => linha.split('\t').map(c => c.trim()));
      setDadosSTC(matriz); localStorage.setItem("sistema_wiki_stc", JSON.stringify(matriz));
      setTextoImportacao(""); mostrarToast("✅ Matriz STC processada!");
    } catch (e) { mostrarToast("Erro ao processar STC.", "erro"); }
  };

  const processarColagemResidentes = () => {
    if (!textoImportacao.trim()) { mostrarToast("Caixa vazia.", "erro"); return; }
    try {
      const linhas = textoImportacao.trim().split('\n');
      let clienteAtual = "";
      const matrizFormatada = [];
      
      linhas.forEach(linha => {
        const celulas = linha.split('\t').map(c => c.trim());
        if(celulas.length === 0 || celulas.every(c => c === "")) return;
        
        if(celulas[0] && celulas[0] !== "") clienteAtual = celulas[0];
        else celulas[0] = clienteAtual;
        
        if (celulas[0].toLowerCase() !== "cliente" && celulas[0].toLowerCase() !== "unnamed: 0") {
            matrizFormatada.push([celulas[0], celulas[1]||"", celulas[2]||"", celulas[3]||""]);
        }
      });
      setDadosResidentes(matrizFormatada); localStorage.setItem("sistema_wiki_res", JSON.stringify(matrizFormatada));
      setTextoImportacao(""); mostrarToast("✅ Residentes processados!");
    } catch (e) { mostrarToast("Erro ao processar Residentes.", "erro"); }
  };

  const processarColagemOEMP = () => {
    if (!textoImportacao.trim()) { mostrarToast("Caixa vazia.", "erro"); return; }
    try {
      const linhas = textoImportacao.split('\n');
      const parceirasEncontradas = [];
      let parceiraAtual = null;

      linhas.forEach(linha => {
        const linhaLimpa = static_linhaLimpa(linha);
        if (!linhaLimpa) return;

        if (linhaLimpa.startsWith('*')) {
          if (parceiraAtual) parceirasEncontradas.push(parceiraAtual);
          parceiraAtual = {
            n: linhaLimpa.replace('*', '').trim(),
            l: [] 
          };
        } else if (parceiraAtual) {
          if (!linhaLimpa.toLowerCase().includes("atualizado em")) {
            parceiraAtual.l.push(linhaLimpa);
          }
        }
      });
      if (parceiraAtual) parceirasEncontradas.push(parceiraAtual);

      setDadosOEMP(parceirasEncontradas);
      localStorage.setItem("sistema_wiki_oemp", JSON.stringify(parceirasEncontradas));
      setTextoImportacao("");
      mostrarToast(`✅ ${parceirasEncontradas.length} Parceiras estruturadas com sucesso!`);
    } catch (e) {
      mostrarToast("Erro ao processar mapeasmento didático.", "erro");
    }
  };

  function static_linhaLimpa(str) {
    return str.trim();
  }

  const apagarDados = (tipo) => {
    if(confirm("Deseja apagar os dados atuais?")) {
      if(tipo === 'stc') { setDadosSTC([]); localStorage.removeItem("sistema_wiki_stc"); }
      if(tipo === 'res') { setDadosResidentes([]); localStorage.removeItem("sistema_wiki_res"); }
      if(tipo === 'oemp') { setDadosOEMP([]); localStorage.removeItem("sistema_wiki_oemp"); }
      if(tipo === 'stcars') { setDadosStcArsMaster([]); localStorage.removeItem("sistema_wiki_stcars_master"); }
      mostrarToast("Dados apagados.");
    }
  };

  const processarColagemFix = () => {
    if (!textoImportacao.trim()) { mostrarToast("Caixa vazia.", "erro"); return; }
    try {
      const matriz = textoImportacao.trim().split('\n').map(linha => linha.split('\t').map(c => c.trim()));
      setDadosFix(matriz); localStorage.setItem("sistema_wiki_fix", JSON.stringify(matriz));
      setTextoImportacao(""); mostrarToast("✅ Base FIX processada com sucesso!");
    } catch (e) { mostrarToast("Erro ao processar Base FIX.", "erro"); }
  };

  const processarColagemStcArsMaster = () => {
    if (!textoImportacao.trim()) { mostrarToast("Caixa vazia.", "erro"); return; }
    try {
      const matriz = textoImportacao.trim().split('\n').map(linha => {
        const separador = linha.includes('\t') ? '\t' : (linha.includes(';') ? ';' : ',');
        return linha.split(separador).map(c => c.trim().replace(/^"|"$/g, ''));
      });

      if (matriz[0][0].toUpperCase().includes("COD") || matriz[0][0].toUpperCase().includes("ENC")) {
        matriz.shift();
      }

      setDadosStcArsMaster(matriz); 
      localStorage.setItem("sistema_wiki_stcars_master", JSON.stringify(matriz));
      setTextoImportacao(""); 
      mostrarToast(`✅ Base STC_ARS carregada! ${matriz.length} registros ativos.`);
    } catch (e) { 
      mostrarToast("Erro ao processar dados da planilha.", "erro"); 
    }
  };

const aplicarMascara = (novoStatus) => {
    let novaMascara = "";
    
    if (novoStatus === "Em andamento") {
      novaMascara = `DESIGNAÇÃO: \nGT NOME: \nPOSICIONAMENTO: FALHA/ //AÇÃO -- //`;
      
    } else if (novoStatus === "Encerrado") {
      const d = new Date().toLocaleDateString("pt-BR", { day: '2-digit', month: '2-digit', year: '2-digit' });
      const h = new Date().toLocaleTimeString("pt-BR", { hour: '2-digit', minute: '2-digit' });
      // Mantido com # como você solicitou
      novaMascara = `#CÓDIGO#\nDESIGNAÇÃO: \nGT NOME: \nFALHA: \nINÍCIO: \nNORMALIZAÇÃO: ${d} ${h}\nCAUSA: \nSOLUÇÃO: \n`;
    }
    
    setRascunho(novaMascara);
  };

const handleStatusChange = (e) => {
    let novoStatus = e.target.value;

    if (novoStatus === "Aberto") {
      const ePorEmail = window.confirm("Este chamado foi aberto via e-mail?");
      setForm(prev => ({ ...prev, status: "Aberto" }));
      if (ePorEmail) {
        setRascunho(`DESIGNAÇÃO: \nHR VIA EMAIL: \nGT NOME: \nDESCRIÇÃO: FALHA - //AÇÃO - //`);
      } else {
        setRascunho(`DESIGNAÇÃO: \nNºTT: \nGT NOME: \nDESCRIÇÃO: FALHA - //AÇÃO - //`);
      }
    } else {
            setForm(prev => ({ ...prev, status: novoStatus }));
      aplicarMascara(novoStatus);
    }
    
    setTimeout(() => rascunhoRef.current?.focus(), 50);
  };

  const handleRascunhoChange = (texto) => {
    setRascunho(texto);
    if (texto.includes("#[CÓDIGO]#") || texto.includes("SOLUÇÃO:")) {
      if (form.status !== "Encerrado") setForm(prev => ({ ...prev, status: "Encerrado" }));
} else if (texto.includes("HR VIA EMAIL:")) {
      if (form.status !== "Aberto") setForm(prev => ({ ...prev, status: "Aberto" }));
    } else if (texto.includes("POSICIONAMENTO:")) {
            if (form.status !== "Em andamento") setForm(prev => ({ ...prev, status: "Em andamento" }));
    } else if (texto.includes("DESCRIÇÃO:")) {
      if (form.status !== "Aberto" && form.status !== "Aberto por E-mail") setForm(prev => ({ ...prev, status: "Aberto" }));
    }
  };

  const adicionarMacro = (texto) => {
    const novoTexto = rascunho ? `${rascunho}\n${texto}` : text;
    handleRascunhoChange(novoTexto);
  };

const copiarMascaraSTC = (codigo) => {
    const dataAtual = new Date().toLocaleDateString("pt-BR", { day: '2-digit', month: '2-digit', year: '2-digit' });
    const horaAtual = new Date().toLocaleTimeString("pt-BR", { hour: '2-digit', minute: '2-digit' });
    // Sem colchetes para facilitar a seleção e preenchimento
    const textoCopiado = `${codigo}\nDESIGNAÇÃO: \nGT NOME: \nFALHA: \nINÍCIO: \nNORMALIZAÇÃO: ${dataAtual} ${horaAtual}\nCAUSA: \nSOLUÇÃO: `;
    navigator.clipboard.writeText(textoCopiado);
    mostrarToast(`Máscara do STC ${codigo} copiada!`);
  };

  const copiarContato = (texto) => {
    navigator.clipboard.writeText(texto);
    mostrarToast(`Contato Copiado!`);
  };

const devePiscar = (ultimaAtualizacao, status) => {
  if (!ultimaAtualizacao || status === "Encerrado") return false;

  // Formato esperado: "17/06/2026, 21:50:33"
  // Remove a vírgula caso exista para facilitar o split
  const dataLimpa = ultimaAtualizacao.replace(",", ""); 
  const [data, hora] = dataLimpa.split(" ");
  const [dia, mes, ano] = data.split("/");
  const [h, m, s] = hora.split(":");

  const dataObj = new Date(ano, mes - 1, dia, h, m, s);
  const agora = new Date();
  
  // Diferença em minutos
  const diferencaMinutos = (agora - dataObj) / 1000 / 60;
  
  return diferencaMinutos >= 180; // 3 horas
};

  const adicionarAtendimento = () => {
    if (!rascunho || rascunho.trim() === "") {
      mostrarToast("O Rascunho está vazio. Preencha a máscara.", "erro"); 
      return; 
    }

    const rascunhoEmCaixaAlta = rascunho.toUpperCase();

    const extrairDado = (texto, regex) => {
      const match = texto.match(regex);
      return match && match[1].trim() !== "" ? match[1].trim() : "NÃO INFORMADO";
    };

    const designacaoRaw = extrairDado(rascunhoEmCaixaAlta, /DESIGNA[ÇC][AÃ]O:\s*(.*)/i);
    let gtNome = extrairDado(rascunhoEmCaixaAlta, /GT NOME:\s*(.*)/i);
    
    if (gtNome.includes("FALHA:") || gtNome.includes("DESCRIÇÃO:") || gtNome.includes("POSICIONAMENTO:") || gtNome.includes("HR VIA EMAIL:")) {
      gtNome = "NÃO INFORMADO";
    }
    
    const status = form.status;
    const dataHora = new Date().toLocaleString("pt-BR");
    
let conteudoUtil = "";
    if (status === "Aberto") {
      if (rascunhoEmCaixaAlta.includes("HR VIA EMAIL:")) {
        const horaEmail = extrairDado(rascunhoEmCaixaAlta, /HR VIA EMAIL:\s*(.*)/i);
        const descricaoChamado = extrairDado(rascunhoEmCaixaAlta, /DESCRI[ÇC][AÃ]O:\s*([\s\S]*)/i);
        conteudoUtil = `HR VIA EMAIL: ${horaEmail} // DESCRIÇÃO: ${descricaoChamado}`;
      } else {
        const numeroTT = extrairDado(rascunhoEmCaixaAlta, /N[º°]TT:\s*(.*)/i);
        const descricaoChamado = extrairDado(rascunhoEmCaixaAlta, /DESCRI[ÇC][AÃ]O:\s*([\s\S]*)/i);
        conteudoUtil = `NºTT: ${numeroTT} // DESCRIÇÃO: ${descricaoChamado}`;
      }
    } else if (status === "Em andamento") {
            conteudoUtil = extrairDado(rascunhoEmCaixaAlta, /POSICIONAMENTO:\s*([\s\S]*)/i);
} else if (status === "Encerrado") {
      const codigoMatch = rascunhoEmCaixaAlta.match(/#([a-zA-Z0-9]+)#/i);
      const codigo = codigoMatch ? `#${codigoMatch[1]}#` : "#0000#";
            const falha = extrairDado(rascunhoEmCaixaAlta, /FALHA:\s*(.*)/i);
      const inicio = extrairDado(rascunhoEmCaixaAlta, /INÍCIO:\s*(.*)/i);
      const normalizacao = extrairDado(rascunhoEmCaixaAlta, /NORMALIZAÇÃO:\s*(.*)/i);
      const causa = extrairDado(rascunhoEmCaixaAlta, /CAUSA:\s*(.*)/i);
      const solucao = extrairDado(rascunhoEmCaixaAlta, /SOLUÇÃO:\s*([\s\S]*)/i);
      conteudoUtil = `${codigo}\n\nFALHA: ${falha}\n\nINÍCIO: ${inicio}\n\nNORMALIZAÇÃO: ${normalizacao}\n\nCAUSA: ${causa}\n\nSOLUÇÃO: ${solucao}`;
    }

    if (conteudoUtil === "NÃO INFORMADO" || conteudoUtil.trim() === "") {
      conteudoUtil = rascunhoEmCaixaAlta
        .replace(/DESIGNA[ÇC][AÃ]O:.*\n?/i, "")
        .replace(/GT NOME:.*\n?/i, "")
        .replace(/N[º°]TT:.*\n?/i, "")
        .replace(/HR VIA EMAIL:.*\n?/i, "")
        .trim();
    }

    const horaMinuto = new Date().toLocaleTimeString("pt-BR", { hour: '2-digit', minute: '2-digit' });
    const bloco = `[${horaMinuto}] - ${conteudoUtil}`;

    const designacoesArray = designacaoRaw.split(';').map(d => d.trim()).filter(d => d !== "");
    if (designacoesArray.length === 0) designacoesArray.push("NÃO INFORMADO");

    let chamadosAtualizados = [...atendimentos];
    let qtdNovos = 0;
    let qtdAtualizados = 0;

    designacoesArray.forEach((desig, indexLoop) => {
      const indexExistente = chamadosAtualizados.findIndex(a => a.designacao.toUpperCase() === desig && desig !== "NÃO INFORMADO");

      if (indexExistente !== -1) {
        const chamadoAntigo = chamadosAtualizados[indexExistente];
        const historicoAcumulado = chamadoAntigo.resumo 
          ? `${bloco}\n\n${chamadoAntigo.resumo}` 
          : bloco;

        const chamadoModificado = {
          ...chamadoAntigo,
          resumo: historicoAcumulado,
          gtNome: gtNome !== "NÃO INFORMADO" ? gtNome : chamadoAntigo.gtNome,
          status: status,
          ultimaAtualizacao: dataHora,
          qtdAtualizacoes: (chamadoAntigo.qtdAtualizacoes || 0) + 1,
          historico: [{ data: dataHora, acao: `Atualizado para [${status}]` }, ...(chamadoAntigo.historico || [])]
        };

        chamadosAtualizados.splice(indexExistente, 1);
        chamadosAtualizados.unshift(chamadoModificado);
        qtdAtualizados++;
      } else {
        const novoChamado = {
          id: Date.now() + indexLoop + Math.random(), 
          protocolo: `ATD-${Date.now()}-${Math.floor(Math.random() * 1000)}`, 
          designacao: desig,
          gtNome: gtNome,
          resumo: bloco, 
          status: status,
          qtdAtualizacoes: 0,
          dataHora: dataHora, 
          ultimaAtualizacao: dataHora,
          historico: [{ data: dataHora, acao: `Criado [${status}]` }],
        };
        chamadosAtualizados.unshift(novoChamado); 
        qtdNovos++;
      }
    });

    setAtendimentos(chamadosAtualizados); 
    
    if (designacoesArray.length > 1) {
      mostrarToast(`Lote processado! ${qtdNovos} criados, ${qtdAtualizados} updated.`);
    } else {
      mostrarToast(qtdNovos > 0 ? "Novo atendimento registrado!" : `Atendimento atualizado!`);
    }
    
    aplicarMascara(status);
    setTimeout(() => rascunhoRef.current?.focus(), 50);
  };

  const removerAtendimento = (id) => {
    if (window.confirm("ATENÇÃO: Deseja realmente excluir este atendimento do turno?")) { 
      setAtendimentos(prev => prev.filter((item) => String(item.id) !== String(id))); 
      mostrarToast("Atendimento excluído com sucesso.", "erro"); 
    }
  };

  const iniciarEdicao = (item) => { 
    setEditandoId(String(item.id)); 
    setEditForm(item); 
  };

  const cancelarEdicao = () => { 
    setEditandoId(null); 
    setEditForm({}); 
  };

  const salvarEdicao = () => {
    setAtendimentos(prev => prev.map(item => {
      if (String(item.id) === String(editandoId)) {
        return { 
          ...editForm, 
          ultimaAtualizacao: new Date().toLocaleString("pt-BR"), 
          historico: [{ data: new Date().toLocaleString("pt-BR"), acao: "Edição Manual" }, ...(item.historico || [])] 
        };
      }
      return item;
    }));
    setEditandoId(null); 
    mostrarToast("Atendimento updated com sucesso!");
  };

  const alterarStatus = (id, novoStatus) => {
    setAtendimentos(prev => prev.map((item) => {
        if (String(item.id) === String(id)) {
          return { 
            ...item, 
            status: novoStatus, 
            ultimaAtualizacao: new Date().toLocaleString("pt-BR"), 
            historico: [{ data: new Date().toLocaleString("pt-BR"), acao: `Status modificado para: ${novoStatus}` }, ...(item.historico || [])] 
          };
        }
        return item;
    }));
    mostrarToast(`Status modificado para: ${novoStatus}`);
  };

  const verificarPermissao = async (fileHandle) => {
    const options = { mode: 'readwrite' };
    if ((await fileHandle.queryPermission(options)) === 'granted') {
      return true;
    }
    if ((await fileHandle.requestPermission(options)) === 'granted') {
      return true;
    }
    return false;
  };

  const escolherPastaBackup = async () => {
    try {
      const handle = await window.showDirectoryPicker({ mode: 'readwrite' });
      await set('backupDirectoryHandle', handle); 
      setDiretorioBackup(handle);
      setNomeDiretorio(handle.name);
      mostrarToast(`Pasta [${handle.name}] configurada com sucesso!`);
    } catch (erro) {
      if(erro.name !== 'AbortError') {
        mostrarToast("Erro ao configurar pasta.", "erro");
        console.error(erro);
      }
    }
  };

  const baixarArquivoNaPasta = async (nomeArquivo, conteudo, tipo) => {
    try {
      if (!diretorioBackup) {
         mostrarToast("Atenção: Configure a pasta de backup primeiro!", "erro");
         return false; 
      }

      const temPermissao = await verificarPermissao(diretorioBackup);
      if (!temPermissao) {
        mostrarToast("Permissão negada para salvar na pasta.", "erro");
        return false;
      }

      const arquivoHandle = await diretorioBackup.getFileHandle(nomeArquivo, { create: true });
      const writable = await arquivoHandle.createWritable();
      const blob = new Blob([conteudo], { type: tipo });
      await writable.write(blob);
      await writable.close();
      
      mostrarToast(`Salvo com sucesso em: ${nomeDiretorio}/${nomeArquivo}`);
      return true;

    } catch (erro) { 
      console.error("Falha fatal ao salvar no diretório", erro); 
      mostrarToast(`Erro ao salvar. Verifique permissões da pasta ${nomeDiretorio}.`, "erro");
      return false;
    }
  };

const encerrarExpediente = async () => {
    if (atendimentos.length === 0) { 
      mostrarToast("Sem dados.", "erro"); 
      return; 
    }

    if (window.confirm("Confirmar fechamento no GitHub?")) {
      try {
        const resposta = await fetch('/api/salvar-turno', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(atendimentos)
        });

        const data = await resposta.json();

        if (resposta.ok && data.success) {
          mostrarToast("✅ Salvo com sucesso!");
          setAtendimentos([]); 
          localStorage.removeItem("atendimentos");
        } else {
          throw new Error(data.error || "Erro no servidor");
        }
      } catch (err) {
        console.error(err);
        mostrarToast("Erro: " + err.message, "erro");
      }
    }
  };
  
  const gerarRelatorioTurno = async () => {
    if (atendimentos.length === 0) return;
    if (!diretorioBackup) { mostrarToast("Configure o Diretório de Backup primeiro!", "erro"); return; }

    let textoRelatorio = `==================================================\n  RELATÓRIO DE ATENDIMENTOS\n==================================================\n\n`;
    atendimentos.forEach((item, index) => {
      textoRelatorio += `${index + 1}. PROTOCOLO: ${item.protocolo} [${item.status}]\n   Designação: ${item.designacao}\n   RESUMO:\n   ${(item.resumo || "").replace(/\n/g, "\n   ")}\n==================================================\n\n`;
    });
    
    const d = new Date().toLocaleDateString("pt-BR", { day: '2-digit', month: '2-digit', year: '2-digit' }).replace(/\//g, "-");
    const h = new Date().toLocaleTimeString("pt-BR", { hour: '2-digit', minute: '2-digit' }).replace(/:/g, "-");
    const nomeArquivo = `Relatorio-Turno-${d}_${h}.txt`;

    await baixarArquivoNaPasta(nomeArquivo, textoRelatorio, "text/plain;charset=utf-8");
  };
  
  const exportarJSON = async () => {
    if (atendimentos.length === 0) { mostrarToast("Nenhum dado.", "erro"); return; }
    if (!diretorioBackup) { mostrarToast("Configure o Diretório de Backup primeiro!", "erro"); return; }

    const d = new Date().toLocaleDateString("pt-BR", { day: '2-digit', month: '2-digit', year: '2-digit' }).replace(/\//g, "-");
    const h = new Date().toLocaleTimeString("pt-BR", { hour: '2-digit', minute: '2-digit' }).replace(/:/g, "-");
    const nomeArquivo = `backup-${d}_${h}.json`;

    await baixarArquivoNaPasta(nomeArquivo, JSON.stringify(atendimentos, null, 2), "application/json");
  };

  const importarBackup = (event) => {
    const arquivo = event.target.files[0];
    if (!arquivo) return;
    const leitor = new FileReader();
    leitor.onload = (e) => {
      try {
        const dadosImportados = JSON.parse(e.target.result);
        if (!Array.isArray(dadosImportados)) return;
        setAtendimentos((atuais) => {
          const mapa = new Map(atuais.map(item => [item.id, item]));
          dadosImportados.forEach((item) => { mapa.set(item.id, { ...mapa.get(item.id), ...item }); });
          return Array.from(mapa.values()).sort((a, b) => b.id - a.id);
        });
        mostrarToast("Dados restaurados com sucesso.");
      } catch (erro) { mostrarToast("Falha na importação do arquivo.", "erro"); }
    };
    leitor.readAsText(arquivo);
  };

  const atendimentosFiltrados = atendimentos.filter((item) => {
    const busca = (filtro || "").toLowerCase();
    const des = (item.designacao || "").toLowerCase();
    const gt = (item.gtNome || "").toLowerCase();
    const res = (item.resumo || "").toLowerCase();
    
    const correspondeBusca = des.includes(busca) || gt.includes(busca) || res.includes(busca);
    const correspondeStatus = statusFiltro === "Todos" || item.status === statusFiltro;
    const dataAtendimento = item.dataHora ? String(item.dataHora).split(",")[0].trim() : "";
    const correspondeData = dataFiltro === "Todas" || dataAtendimento === dataFiltro;
    return correspondeBusca && correspondeStatus && correspondeData;
  });

  const abertos = atendimentosFiltrados.filter((a) => a.status === "Aberto").length;

  const getIconeFormato = (formato) => {
    switch (formato) {
      case 'excel':
        return (
          <div className="w-12 h-12 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 mb-3 shadow-inner">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
          </div>
        );
      case 'pdf':
        return (
          <div className="w-12 h-12 rounded-xl bg-rose-100 dark:bg-rose-900/30 flex items-center justify-center text-rose-600 dark:text-rose-400 mb-3 shadow-inner">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
          </div>
        );
      case 'word':
        return (
          <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 mb-3 shadow-inner">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
          </div>
        );
      default:
        return (
          <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 mb-3 shadow-inner">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" /></svg>
          </div>
        );
    }
  };

return (
    <div className={`${darkMode ? "dark" : ""}`}>
      {/* Fundo alterado de slate-50/80 para slate-100 fixo, tirando o reflexo agressivo da tela */}
      <div className="min-h-screen bg-slate-100 dark:bg-slate-900 text-slate-800 dark:text-slate-100 font-sans antialiased selection:bg-cyan-200 dark:selection:bg-cyan-800 flex flex-col transition-colors duration-300">        
        {/* Notificações */}
        <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 pointer-events-none">
          {toasts.map((toast) => (
            <div key={toast.id} className={`shadow-xl backdrop-blur-md rounded-xl p-3.5 text-white text-xs font-semibold flex items-center gap-2.5 transition-all duration-300 pointer-events-auto border ${toast.tipo === "erro" ? "bg-rose-600/95 border-rose-700" : "bg-cyan-950/95 dark:bg-cyan-900/95 border-cyan-800 shadow-cyan-950/20"}`}>
              <span className="text-sm">{toast.tipo === "erro" ? "✕" : "✓"}</span>{toast.message}
            </div>
          ))}
        </div>

        {/* MODAL DE EDIÇÃO DE ATENDIMENTO */}
        {editandoId && (
          <div className="fixed inset-0 z-[99] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
            <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 w-full max-w-2xl shadow-2xl border border-slate-200 dark:border-slate-700 flex flex-col gap-5 animate-fade-in">
              <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-700 pb-3">
                <h3 className="text-sm font-black text-cyan-800 dark:text-cyan-400 uppercase tracking-widest flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                  Editar Ticket
                </h3>
                <button onClick={cancelarEdicao} className="text-slate-400 hover:text-rose-500 transition-colors">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Designação</label>
                  <input type="text" value={editForm.designacao || ""} onChange={(e) => setEditForm({...editForm, designacao: e.target.value.toUpperCase()})} className="border border-slate-200 dark:border-slate-600 rounded-xl p-2.5 text-xs font-mono font-bold bg-slate-50 dark:bg-slate-900 dark:text-white outline-none focus:border-cyan-50 transition-colors shadow-inner" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">GT Nome</label>
                  <input type="text" value={editForm.gtNome || ""} onChange={(e) => setEditForm({...editForm, gtNome: e.target.value.toUpperCase()})} className="border border-slate-200 dark:border-slate-600 rounded-xl p-2.5 text-xs font-bold bg-slate-50 dark:bg-slate-900 dark:text-white outline-none focus:border-cyan-500 transition-colors shadow-inner" />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Resumo do Chamado (Linha do Tempo)</label>
                <textarea value={editForm.resumo || ""} onChange={(e) => setEditForm({...editForm, resumo: e.target.value})} className="border border-slate-200 dark:border-slate-600 rounded-xl p-3 text-xs bg-slate-50 dark:bg-slate-900 dark:text-slate-200 outline-none focus:border-cyan-500 min-h-[200px] font-mono resize-y shadow-inner leading-relaxed" />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button onClick={cancelarEdicao} className="px-5 py-2.5 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors uppercase tracking-wider">Cancelar</button>
                <button onClick={salvarEdicao} className="px-6 py-2.5 rounded-xl text-xs font-black text-white bg-cyan-600 hover:bg-cyan-500 shadow-md hover:shadow-lg active:scale-95 transition-all uppercase tracking-wider flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg> Salvar Alterações
                </button>
              </div>
            </div>
          </div>
        )}

{/* =========================================================================
            HEADER GLOBAL INTEGRADO TÁTICO (Otimização de Margem e Botões Premium)
            ========================================================================= */}
        <header className="bg-slate-900 border-b border-slate-700 shadow-md px-4 py-1.5 flex flex-col md:flex-row items-center justify-between gap-2 transition-colors z-40 sticky top-0 select-none h-auto md:h-12">
          
          {/* Lado Esquerdo: Identidade e Seletor de Módulos */}
          <div className="flex items-center gap-4 flex-shrink-0">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 bg-cyan-600 rounded-md flex items-center justify-center shadow-inner">
                <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
              </div>
              <div>
                <h1 className="text-[11px] font-black text-white tracking-tighter leading-none">COCKPIT <span className="text-cyan-400">NOC</span></h1>
                <p className="text-[7px] font-bold text-slate-500 uppercase tracking-widest leading-none mt-0.5">Automations</p>
              </div>
            </div>

            <div className="flex bg-slate-800 p-0.5 rounded-md border border-slate-700 shadow-inner">
              <button onClick={() => setViewAtiva("operacional")} className={`py-1 px-2.5 rounded text-[9px] font-black tracking-wide transition-all ${viewAtiva === "operacional" ? "bg-slate-700 text-cyan-400 shadow-sm" : "text-slate-400 hover:text-slate-200"}`}>OPERACIONAL</button>
              <button onClick={() => setViewAtiva("wiki")} className={`py-1 px-2.5 rounded text-[9px] font-black tracking-wide transition-all ${viewAtiva === "wiki" ? "bg-slate-700 text-cyan-400 shadow-sm" : "text-slate-400 hover:text-slate-200"}`}>WIKI</button>
            </div>
          </div>

          {/* Centro: Métricas Rápidas e Botões Otimizados (Mais compactos e atraentes) */}
          {viewAtiva === "operacional" && (
            <div className="flex items-center gap-4 flex-wrap md:flex-nowrap justify-center animate-fade-in flex-1 max-w-2xl px-2">
              <div className="flex gap-3 border-r border-slate-700 pr-4 flex-shrink-0">
                <span className="text-[9px] text-slate-400 font-black uppercase tracking-wider flex items-center gap-1">Listados: <strong className="text-white text-xs font-mono bg-slate-800 px-1.5 py-0.5 rounded border border-slate-700 shadow-inner">{atendimentosFiltrados.length}</strong></span>
                <span className="text-[9px] text-slate-400 font-black uppercase tracking-wider flex items-center gap-1">Abertos: <strong className="text-amber-400 text-xs font-mono bg-amber-950/30 px-1.5 py-0.5 rounded border border-amber-900/30 shadow-inner">{abertos}</strong></span>
              </div>
              
              <div className="flex items-center gap-1.5 flex-wrap md:flex-nowrap">
                <button onClick={gerarRelatorioTurno} title="Baixar relatório do turno em .txt" className="text-[9px] font-black text-slate-300 hover:text-white uppercase tracking-wider bg-slate-800 hover:bg-slate-700 border border-slate-700 px-2 py-1 rounded-md transition-colors active:scale-95 flex items-center gap-1">
                  📄 Relatório
                </button>
                <button onClick={exportarJSON} title="Exportar Backup do Banco de Dados" className="text-[9px] font-black text-slate-300 hover:text-white uppercase tracking-wider bg-slate-800 hover:bg-slate-700 border border-slate-700 px-2 py-1 rounded-md transition-colors active:scale-95 flex items-center gap-1">
                  📦 Backup
                </button>
                <label title="Importar Backup anterior" className="text-[9px] font-black text-slate-300 hover:text-white uppercase tracking-wider bg-slate-800 hover:bg-slate-700 border border-slate-700 px-2 py-1 rounded-md transition-colors active:scale-95 cursor-pointer flex items-center gap-1">
                  📥 Importar <input type="file" accept=".json" onChange={importarBackup} className="hidden" />
                </label>
                <button onClick={encerrarExpediente} className="text-[9px] font-black text-white uppercase tracking-wider bg-rose-600 hover:bg-rose-500 px-2.5 py-1 rounded-md transition-all active:scale-95 shadow-md flex items-center gap-1">
                  🛑 Fechar Turno
                </button>
              </div>
            </div>
          )}

          {/* Lado Direito: Relógio, Filtro Compacto e Controles de Modo */}
          <div className="flex items-center gap-2 flex-shrink-0 w-full md:w-auto justify-center md:justify-end">
            
            {/* Relógio Reduzido */}
            <div className="flex items-center gap-1.5 px-2 py-0.5 bg-slate-800 border border-slate-700 rounded-md shadow-inner font-mono text-[9px] h-6">
              <span className="text-slate-400 font-bold">{dataNocFormatada}</span>
              <span className="text-slate-600">|</span>
              <span className="text-white font-black">{horaNocFormatada}</span>
            </div>

            {/* Barra de Pesquisa Slim */}
            {viewAtiva === "operacional" && (
              <div className="flex items-center bg-slate-800 border border-slate-700 rounded-md px-2 shadow-inner focus-within:border-cyan-500/50 transition-all h-6">
                <svg className="w-3 h-3 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                <input type="text" placeholder="Filtrar..." value={filtro} onChange={(e) => setFiltro(e.target.value)} className="py-0.5 px-1 text-[10px] w-20 focus:w-28 outline-none bg-transparent text-white placeholder-slate-500 transition-all duration-300" />
              </div>
            )}

            <button onClick={() => setDarkMode(!darkMode)} title={darkMode ? "Modo Claro" : "Modo Escuro"} className="p-1 rounded-md bg-slate-800 border border-slate-700 text-amber-400 hover:scale-105 transition-all shadow-inner text-[10px] w-6 h-6 flex items-center justify-center">
              {darkMode ? "☀️" : "🌙"}
            </button>
            <button onClick={() => setModoNoc(!modoNoc)} title={modoNoc ? "Sair da Tela Cheia" : "Modo NOC Monitor Gigante"} className={`p-1 rounded-md border transition-all hover:scale-105 shadow-inner text-[10px] w-6 h-6 flex items-center justify-center ${modoNoc ? "bg-cyan-600 border-cyan-500 text-white animate-pulse" : "bg-slate-800 border-slate-700 text-cyan-400"}`}>
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" /></svg>
            </button>
          </div>
        </header>

        {/* LETREIRO DINÂMICO NOC */}
        <div className="w-full bg-slate-900 border-b border-cyan-950 text-slate-300 text-[11px] font-mono py-2 overflow-hidden shadow-inner relative flex items-center select-none z-30 h-8">
          <div className="absolute left-0 top-0 bottom-0 bg-cyan-950 px-3 flex items-center text-cyan-400 font-black tracking-widest z-20 border-r border-cyan-800 uppercase text-[9px] shadow-md h-full">
            📡 Live Feed
          </div>
          <div className="marquee-container flex items-center whitespace-nowrap">
            <div className="marquee-content flex items-center gap-12 pl-[110px]">
              <span className="inline-flex items-center gap-1.5">💵 USD: <strong className="text-emerald-400">R$ 5,82</strong></span>
              <span className="inline-flex items-center gap-1.5">💶 EUR: <strong className="text-cyan-400">R$ 6,12</strong></span>
              <span className="text-slate-600 font-bold">|</span>
              <span className="inline-flex items-center gap-1.5">📞 VTAL: <strong className="text-white">0800 125 5060</strong></span>
              <span className="inline-flex items-center gap-1.5">🩺 CASSI VALIDAÇÃO: <strong className="text-amber-400">(61) 3212-5023</strong></span>
              <span className="inline-flex items-center gap-1.5">📡 MTI: <strong className="text-white">0800 031 0133</strong></span>
              <span className="inline-flex items-center gap-1.5">🧑‍💻 MAGNO MTI: <strong className="text-cyan-400">(21) 96959-7018</strong></span>
              <span className="inline-flex items-center gap-1.5">👔 IZAIAS BELMONT: <strong className="text-white">(11) 96965-5412</strong></span>
              <span className="inline-flex items-center gap-1.5">📞 CÍNTIA OI: <strong className="text-amber-400">(61) 98625-1142</strong></span>
              <span className="inline-flex items-center gap-1.5">✉️ MARIANA CONTI: <strong className="text-cyan-400">mariana.conti@oi.net.br</strong></span>
              <span className="inline-flex items-center gap-1.5">🛡️ OI SOC: <strong className="text-rose-400">oi-soc@oi.net.br</strong></span>
              <span className="inline-flex items-center gap-1.5">🌐 NOC MEGATELECOM: <strong className="text-white">noc@megatelecom.com.br | (11) 2110-1001</strong></span>
              <span className="inline-flex items-center gap-1.5">🚀 NOC G8: <strong className="text-emerald-400">noc@g8.net.br</strong></span>
            </div>
          </div>
        </div>

        {/* Correção estrutural do CSS de animação */}
        <style>{`
          .marquee-container { width: 100%; overflow: hidden; }
          .marquee-content { display: inline-flex; animation: marqueeTimeline 35s linear infinite; }
          .marquee-content:hover { animation-play-state: paused; }
          @keyframes marqueeTimeline { 0% { transform: translate3d(0, 0, 0); } 100% { transform: translate3d(-50%, 0, 0); } }
          @keyframes blink-animation { 0% { opacity: 1; } 50% { opacity: 0.4; } 100% { opacity: 1; } }
          .animate-piscar { animation: blink-animation 1.5s infinite; border: 3px solid #f43f5e !important; }
        `}</style>

        <div className="max-w-[1600px] mx-auto w-full flex-1 flex flex-col p-4 space-y-4">
          {/* =========================================================================
              MÓDULO 1: COCKPIT OPERACIONAL
              ========================================================================= */}
          {viewAtView_operacional()}

          {/* =========================================================================
              MÓDULO 2: BASE DE CONHECIMENTO (WIKI)
              ========================================================================= */}
          {viewAtView_wiki()}
        </div>
      </div>
    </div>
  );

  function viewAtView_operacional() {
    if (viewAtiva !== "operacional") return null;
    return (
      <>
        {/* FILTROS DE STATUS INTEGRADOS EM BARRA ÚNICA */}
        {!modoNoc && (
          <div className="bg-white dark:bg-slate-800 rounded-xl p-2 border border-slate-200 dark:border-slate-700 shadow-sm flex items-center justify-between gap-4 animate-fade-in select-none">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Filtros Táticos:</span>
              <div className="flex bg-slate-100 dark:bg-slate-900 p-0.5 rounded-lg border border-slate-200/60 dark:border-slate-700/80 gap-1">
                {["Todos", "Aberto", "Em andamento", "Encerrado"].map(st => (
                  <button key={st} onClick={() => setStatusFiltro(st)} className={`px-4 py-1 rounded-md text-[10px] font-black uppercase tracking-wider transition-all ${statusFiltro === st ? (st === "Aberto" ? "bg-emerald-500 text-white shadow-sm" : st === "Em andamento" ? "bg-amber-500 text-white shadow-sm" : st === "Encerrado" ? "bg-blue-500 text-white shadow-sm" : "bg-white dark:bg-slate-700 text-cyan-800 dark:text-cyan-300 shadow-sm") : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-300"}`}>
                    {st}
                  </button>
                ))}
              </div>
            </div>
            
            <div className="flex items-center bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-2 py-0.5 shadow-inner mr-2">
              <label className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase mr-2 ml-1">Filtro Data:</label>
              <select value={dataFiltro} onChange={(e) => setDataFiltro(e.target.value)} className="bg-transparent text-slate-800 dark:text-slate-200 font-bold text-[11px] outline-none cursor-pointer pr-2 focus:ring-0 border-none py-1">
                <option value={new Date().toLocaleDateString("pt-BR")}>HOJE</option>
                <option value="Todas">TODAS AS DATAS</option>
              </select>
            </div>
          </div>
        )}

        {/* EVENT INTAKE - 100% LARGURA TOTAL COM TEXTAREAS COMPACTOS FOCUS-EXPANSÍVEIS */}
        {!modoNoc && (
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-4 shadow-sm transition-colors animate-fade-in">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700 pb-3 mb-3">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-cyan-500 rounded-full animate-pulse"></div>
                <h2 className="text-xs font-black text-slate-800 dark:text-white uppercase tracking-widest">Event Intake</h2>
                <div className="ml-3 flex items-center bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-2.5 py-0.5 shadow-inner">
                  <label className="text-[9px] font-black text-slate-400 uppercase mr-2">Estágio:</label>
                  <select name="status" value={form.status} onChange={handleStatusChange} className="bg-transparent text-cyan-600 dark:text-cyan-400 font-black text-[11px] outline-none cursor-pointer border-none py-1 focus:ring-0 pr-4">
                      <option value="Aberto">ABERTO</option>
                      <option value="Em andamento">EM ANDAMENTO</option>
                      <option value="Encerrado">ENCERRADO</option>
                  </select>
                </div>
              </div>

              <button onClick={adicionarAtendimento} className="px-6 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-xl text-[11px] uppercase tracking-widest transition-all shadow-md active:scale-95 whitespace-nowrap">
                Injetar Registro (New Ticket)
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
              {/* Auto-Extrator: Altura inteligente para liberar o monitor */}
              <div className="lg:col-span-8 flex flex-col">
                <div className="flex items-center justify-between mb-1.5 ml-1">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Auto-Extrator de Dados (Ctrl + Enter)</label>
                  <select onChange={(e) => { if(e.target.value){ adicionarMacro(e.target.value); e.target.value = ""; } }} className="text-[9px] font-bold bg-slate-50 text-cyan-800 dark:bg-slate-700 dark:text-cyan-400 border border-slate-200 dark:border-slate-600 rounded-lg px-2 py-0.5 outline-none cursor-pointer">
                    <option value="">⚡ INSERIR MACRO RÁPIDA...</option>
                    {macrosAvancadas.map((m, idx) => <option key={idx} value={m.texto}>{m.label}</option>)}
                  </select>
                </div>
                <textarea 
                  ref={rascunhoRef}
                  value={rascunho} 
                  onChange={(e) => handleRascunhoChange(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.ctrlKey && e.key === 'Enter') { e.preventDefault(); adicionarAtendimento(); }
                  }}
                  placeholder="Preencha a máscara aqui..." 
                  className="w-full h-[90px] focus:h-[200px] bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 font-mono text-xs rounded-xl p-3 outline-none focus:border-cyan-500 resize-y leading-relaxed transition-all duration-300 shadow-inner" 
                />
              </div>

              {/* Rascunho Temporário: Altura inteligente expansível */}
              <div className="lg:col-span-4 flex flex-col">
                <div className="flex items-center justify-between mb-1.5 ml-1">
                  <label className="text-[9px] font-black text-amber-500 uppercase tracking-widest font-mono">📝 Bloco de Apoio Rápido</label>
                  <button onClick={() => { if(window.confirm("Limpar anotações?")) setBlocoNotasTemporario(""); }} className="text-[8px] font-black text-rose-500 hover:text-rose-600 uppercase tracking-wider">Limpar</button>
                </div>
                <textarea 
                  value={blocoNotasTemporario}
                  onChange={(e) => setBlocoNotasTemporario(e.target.value)}
                  placeholder="Cole listas de circuitos ou dados avulsos aqui..." 
                  className="w-full h-[90px] focus:h-[200px] bg-amber-50/10 dark:bg-amber-950/10 border border-amber-200/40 dark:border-amber-900/30 text-slate-700 dark:text-amber-200/90 font-mono rounded-xl p-3 text-[11px] outline-none focus:border-amber-400 resize-y leading-relaxed transition-all duration-300 shadow-inner" 
                />
              </div>
            </div>
          </div>
        )}

{/* TABELA DE ALTA DENSIDADE CORPORATIVA (Ocupa o espaço máximo em 100% de zoom) */}
        <div className="w-full bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden transition-colors">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse whitespace-nowrap table-fixed">
              <thead>
                <tr className="bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-b border-slate-200 dark:border-slate-700 select-none">
                  {/* Redistribuição precisa de larguras totalizando 100% */}
                  <th className="px-4 py-2.5 text-[10px] font-black uppercase tracking-wider w-[12%]">Designação</th>
                  <th className="px-4 py-2.5 text-[10px] font-black uppercase tracking-wider w-[14%]">Identificador / Protocolo</th>
                  <th className="px-4 py-2.5 text-[10px] font-black uppercase tracking-wider w-[13%]">Grupo Técnico</th>
                  <th className="px-4 py-2.5 text-[10px] font-black uppercase tracking-wider w-[11%]">Data / Hora</th>
                  <th className="px-4 py-2.5 text-[10px] font-black uppercase tracking-wider w-[30%]">Último Posicionamento Técnico</th>
                  <th className="px-4 py-2.5 text-[10px] font-black uppercase tracking-wider text-center w-[20%]">Ações táticas</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60 text-xs font-bold">
                {atendimentosFiltrados.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-4 py-8 text-center text-slate-400 font-medium font-mono select-none">Nenhum circuito em tratamento listado para os filtros aplicados.</td>
                  </tr>
                ) : (
                  atendimentosFiltrados.map((item) => {
                    let corStatusBg = "bg-slate-100 text-slate-600 dark:bg-slate-900 dark:text-slate-400";
                    if (item.status === "Aberto") corStatusBg = "bg-emerald-500 text-white font-black";
                    else if (item.status === "Em andamento") corStatusBg = "bg-amber-500 text-white font-black";
                    else if (item.status === "Encerrado") corStatusBg = "bg-blue-500 text-white font-black";

                    const scaleOpen = circuitoExpandido === item.id;
                    const notasArray = item.resumo.split('\n\n');
                    const ultimaNotaBruta = jackpot_obterTextoUtil(notasArray[0]);

                    return (
                      <React.Fragment key={item.id}>
                        <tr 
                          onClick={() => setCircuitoExpandido(scaleOpen ? null : item.id)}
                          className={`border-b border-slate-200 dark:border-slate-700/60 transition-colors group cursor-pointer ${scaleOpen ? "bg-slate-200/60 dark:bg-slate-700/40" : "bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700/30"}`}
                        >
                          <td className="px-4 py-2.5 font-mono font-black text-cyan-600 dark:text-cyan-400 select-all truncate">
                            <div className="flex items-center gap-1.5 truncate">
                              <span className={`text-slate-400 transition-transform duration-200 text-[8px] flex-shrink-0 ${scaleOpen ? "rotate-90 text-cyan-500" : ""}`}>▶</span>
                              <span className="truncate">📡 {item.designacao}</span>
                            </div>
                          </td>
                          <td className="px-4 py-2.5 font-mono text-slate-500 dark:text-slate-400 text-[11px] font-normal truncate">{item.protocolo}</td>
                          <td className="px-4 py-2.5 text-slate-700 dark:text-slate-300 truncate">{item.gtNome}</td>
                          <td className="px-4 py-2.5 font-mono text-slate-500 dark:text-slate-400 text-[11px] font-normal truncate">{item.dataHora ? item.dataHora.replace(', ', ' | ') : ''}</td>
                          
                          <td className="px-4 py-2.5 text-slate-700 dark:text-slate-300 font-normal truncate" title={ultimaNotaBruta}>
                            <div className="flex items-center gap-1.5 overflow-hidden">
                              <span className="bg-slate-200 dark:bg-slate-900 text-slate-800 dark:text-cyan-400 text-[9px] font-black px-1.5 py-0.5 rounded border border-slate-300 dark:border-cyan-100/10 font-mono flex-shrink-0">LATEST</span>
                              <span className="truncate font-medium cursor-help">{ultimaNotaBruta}</span>
                            </div>
                          </td>
                          
                          {/* COLUNA DE AÇÕES ULTRA COMPACTADA EM LINHA ÚNICA */}
                          <td className="px-2 py-2 text-center" onClick={(e) => e.stopPropagation()}>
                            <div className="flex items-center justify-center gap-1.5 flex-nowrap">
                              <select value={item.status} onChange={(e) => alterarStatus(item.id, e.target.value)} className={`border rounded px-1 py-0.5 text-[9px] uppercase tracking-wide focus:outline-none cursor-pointer border-slate-200 dark:border-slate-600 dark:bg-slate-900 shadow-sm max-w-[90px] truncate ${corStatusBg}`}>
                                <option value="Aberto">Aberto</option>
                                <option value="Em andamento">Andamento</option>
                                <option value="Encerrado">Encerrado</option>
                              </select>

                              {/* Botão + Nota reduzido e otimizado */}
                              <button onClick={() => {
                                const hora = new Date().toLocaleTimeString("pt-BR", { hour: '2-digit', minute: '2-digit' });
                                setRascunho(`DESIGNAÇÃO: ${item.designacao}\nGT NOME: ${item.gtNome}\nPOSICIONAMENTO: \n\n[${hora}] - `);
                                setForm(prev => ({...prev, status: "Em andamento"}));
                                if (modoNoc) setModoNoc(false);
                                window.scrollTo({ top: 0, behavior: 'smooth' });
                                setTimeout(() => rascunhoRef.current?.focus(), 100);
                              }} className="text-cyan-600 bg-cyan-50 hover:bg-cyan-100 dark:bg-cyan-900/20 dark:text-cyan-400 p-1 px-1.5 rounded border border-cyan-200 dark:border-cyan-800 active:scale-95 text-[9px] font-black uppercase flex items-center gap-0.5" title="Adicionar nota rápida de posicionamento">
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" /></svg> Nota
                              </button>

                              {/* Botões de ícones com tamanhos fixados para evitar quebra */}
                              <button onClick={() => {
                                let conteudoLimpo = item.resumo.replace(/\[\d{2}:\d{2}\]\s*-\s*/g, "").trim();
                                let textoFinal = "";
                                if (conteudoLimpo.startsWith("#") || conteudoLimpo.includes("FALHA:")) {
                                  const linhas = conteudoLimpo.split("\n\n");
                                  textoFinal = `${linhas[0]}\nGT NOME: ${item.gtNome}\n${linhas.slice(1).join("\n")}`;
                                } else {
                                  let posUtil = conteudoLimpo.replace(/DESIGNA[ÇC][AÃ]O:.*\n?/gi, "").replace(/GT NOME:.*\n?/gi, "").trim().replace(/^POSICIONAMENTO:\s*/i, "");
                                  textoFinal = `GT NOME: ${item.gtNome}\nPOSICIONAMENTO: ${posUtil}`;
                                }
                                navigator.clipboard.writeText(textoFinal.replace(/\n\n/g, "\n"));
                                mostrarToast("Encerramento estruturado copiado!");
                              }} className="text-slate-400 hover:text-cyan-600 p-1 bg-slate-50 dark:bg-slate-900 rounded border border-slate-200 dark:border-slate-700 active:scale-95 flex-shrink-0" title="Copiar Histórico Estruturado">
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                              </button>

                              <button onClick={() => iniciarEdicao(item)} className="text-slate-400 hover:text-cyan-600 p-1 bg-slate-50 dark:bg-slate-900 rounded border border-slate-200 dark:border-slate-700 active:scale-95 flex-shrink-0" title="Editar Registro">
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                              </button>

                              <button onClick={() => removerAtendimento(item.id)} className="text-slate-400 hover:text-rose-600 p-1 bg-slate-50 dark:bg-slate-900 rounded border border-slate-200 dark:border-slate-700 active:scale-95 flex-shrink-0" title="Excluir Registro">
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                              </button>
                            </div>
                          </td>
                        </tr>

                        {/* GAVETA DE NOTAS HISTÓRICAS */}
                        {scaleOpen && (
                          <tr className="bg-slate-100/50 dark:bg-slate-900/60 border-l-4 border-l-cyan-500 animate-fade-in">
                            <td colSpan="6" className="p-4">
                              <div className="flex flex-col gap-2.5 max-w-7xl">
                                <div className="text-[10px] font-black text-cyan-600 dark:text-cyan-400 uppercase tracking-widest font-sans flex items-center gap-1.5 select-none">
                                   Adilson Roteiro de Notas (Histórico Completo do Circuito)
                                </div>
                                <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-4 font-semibold text-slate-800 dark:text-slate-200 whitespace-pre-wrap leading-relaxed shadow-inner max-h-[300px] overflow-y-auto pr-6 font-mono select-all">
                                  {item.resumo.split('\n\n').map((notaBloco, nIdx) => {
                                    const matchHoraNota = notaBloco.match(/^\[([0-9]{2}:[0-9]{2})\]\s*-\s*/);
                                    if (matchHoraNota) {
                                      const textoInterno = notaBloco.substring(matchHoraNota[0].length);
                                      return (
                                        <div key={nIdx} className="mb-3 last:mb-0 border-l border-cyan-500/40 pl-3 relative py-0.5">
                                          <span className="inline-block bg-slate-100 dark:bg-slate-800 text-cyan-800 dark:text-cyan-400 text-[9px] font-black px-1.5 py-0.5 rounded border border-slate-200/50 dark:border-slate-700 font-mono mb-1">
                                            🕒 {matchHoraNota[1]}
                                          </span>
                                          <p className="text-slate-900 dark:text-slate-200 text-[11px] leading-relaxed">{textoInterno}</p>
                                        </div>
                                      );
                                    }
                                    return <p key={nIdx} className="text-slate-500 dark:text-slate-400 text-[11px] my-1">{notaBloco}</p>;
                                  })}
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
                  </>
    );
  }

  function jackpot_obterTextoUtil(blocoTexto) {
    if (!blocoTexto) return "";
    return blocoTexto.replace(/^\[[0-9]{2}:[0-9]{2}\]\s*-\s*/, "").trim();
  }  
  function viewAtView_wiki() {
    if (viewAtiva !== "wiki") return null;
    return (
      <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm flex flex-1 min-h-[75vh] overflow-hidden transition-colors">
        <div className="w-72 bg-slate-50 dark:bg-slate-900/50 border-r border-slate-200 dark:border-slate-700 flex flex-col">
          <div className="p-5 border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
            <h2 className="text-sm font-black text-cyan-950 dark:text-white uppercase tracking-wider flex items-center gap-2">
              <svg className="w-4 h-4 text-cyan-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg> Diretórios WIKI
            </h2>
          </div>
          
          <div className="px-4 pt-4 pb-2">
            <div className="flex items-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-600 rounded-lg px-3 py-2 shadow-inner focus-within:border-cyan-500 transition-colors">
              <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
              <input type="text" placeholder="Buscar na Wiki..." value={filtroWiki} onChange={(e) => setFiltroWiki(e.target.value)} className="w-full ml-2 bg-transparent text-xs outline-none text-slate-800 dark:text-white placeholder-slate-400" />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {artigosWikiFiltrados.map((categoria) => (
              <div key={categoria.categoria} className="border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 overflow-hidden shadow-sm">
                <button onClick={() => setCategoriaExpandida(categoriaExpandida === categoria.categoria ? null : categoria.categoria)} className="w-full text-left px-4 py-3 bg-slate-50 dark:bg-slate-800 hover:bg-cyan-50 dark:hover:bg-slate-700 font-black text-xs text-slate-800 dark:text-slate-200 flex justify-between items-center transition-colors">
                  {categoria.categoria}
                  <svg className={`w-4 h-4 text-slate-400 transition-transform ${categoriaExpandida === categoria.categoria ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                </button>
                {categoriaExpandida === categoria.categoria && (
                  <div className="flex flex-col py-2 bg-white dark:bg-slate-800">
                    {categoria.artigos.map((art) => (
                      <button key={art.id} onClick={() => setArtigoAtivo(art.id)} className={`text-left px-6 py-2.5 text-[11px] font-bold transition-colors border-l-4 ${artigoAtivo === art.id ? "bg-cyan-50/50 dark:bg-slate-700 border-cyan-600 text-cyan-800 dark:text-cyan-400" : "border-transparent text-slate-500 hover:text-cyan-700 dark:hover:text-cyan-300 hover:bg-slate-50 dark:hover:bg-slate-700/50"}`}>
                        {art.titulo}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="flex-1 p-8 overflow-y-auto bg-slate-50/50 dark:bg-slate-800/50 max-w-full relative">
          {artigoRenderizado ? (
            <div className="w-full max-w-7xl mx-auto">
              
              <div className="mb-6 flex flex-col xl:flex-row xl:items-end justify-between gap-4">
                <div>
                  <span className="text-[10px] font-black text-cyan-600 dark:text-cyan-400 uppercase tracking-widest bg-cyan-50 dark:bg-slate-700 px-3 py-1.5 rounded-lg border border-cyan-100/30 dark:border-slate-600">
                    {baseConhecimento.find(cat => cat.artigos.some(a => a.id === artigoRenderizado.id))?.categoria || "WIKI"}
                  </span>
                  <h1 className="text-3xl font-black text-slate-900 dark:text-white mt-4 tracking-tight">{artigoRenderizado.titulo}</h1>
                </div>
              </div>

              {/* RENDERIZADOR PREMIUM DE RECORRÊNCIAS E ACIONAMENTOS */}
              {artigoRenderizado.tipo === "recorrencia_master" && (
                <div className="flex flex-col gap-6 w-full">
                  {artigoRenderizado.dados.map((rec, idx) => (
                    <div key={idx} className="bg-slate-900 border border-slate-700/80 rounded-3xl p-6 shadow-xl relative overflow-hidden flex flex-col xl:flex-row gap-8 transition-all hover:border-violet-500/30 group">
                      
                      {/* Fundo decorativo neon */}
                      <div className="absolute top-0 right-0 w-64 h-64 bg-violet-500/10 blur-3xl rounded-full pointer-events-none"></div>

                      {/* Bloco da Esquerda: Template de Email */}
                      <div className="flex-1 flex flex-col gap-4 relative z-10">
                        <div className="flex items-center gap-3 mb-1">
                          <span className="text-3xl drop-shadow-md">📧</span>
                          <div>
                            <h3 className="text-[16px] font-black text-white uppercase tracking-wider leading-tight">{rec.nome}</h3>
                            <p className="text-[10px] font-bold text-violet-400 font-mono tracking-widest mt-0.5 bg-violet-950/50 px-2 py-0.5 rounded border border-violet-800/50 inline-block">
                              TO: {rec.emailAbertura}
                            </p>
                          </div>
                        </div>

                        <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 flex-1 shadow-inner relative group/caixa">
                          <span className="absolute top-2 right-3 text-[9px] font-black text-slate-600 uppercase tracking-widest">Template de Disparo</span>
                          <pre className="text-[11px] font-mono font-medium text-slate-300 whitespace-pre-wrap leading-loose mt-2">
                            {rec.template}
                          </pre>
                        </div>
                        
                        <button 
                          onClick={() => {
                            navigator.clipboard.writeText(`Para: ${rec.emailAbertura}\n\n${rec.template}`);
                            mostrarToast(`Template da ${rec.nome} copiado!`);
                          }}
                          className="w-full py-3.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-black text-[11px] uppercase tracking-widest transition-all active:scale-95 shadow-[0_0_15px_rgba(139,92,246,0.2)] flex items-center justify-center gap-2"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                          Copiar Template Completo
                        </button>
                      </div>

                      {/* Divisor Vertical nas telas grandes */}
                      <div className="hidden xl:block w-px bg-slate-700/50"></div>

                      {/* Bloco da Direita: Escalonamento */}
                      <div className="flex-1 flex flex-col gap-4 relative z-10">
                        <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1 border-b border-slate-700/50 pb-2 flex items-center gap-2">
                          <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                          Linha de Escalonamento Ativo
                        </h4>
                        
                        <div className="flex flex-col gap-3.5 h-full justify-center">
                          {rec.escalonamentos.map((esc, eIdx) => (
                            <div key={eIdx} className="bg-slate-800/80 rounded-xl p-4 border-l-4 border-violet-500 border border-slate-700/50 hover:border-violet-400 transition-all hover:translate-x-1 hover:bg-slate-800 shadow-sm flex items-center justify-between">
                              <div className="flex flex-col gap-1.5 w-full">
                                <div className="flex items-center gap-2">
                                  <span className="bg-violet-500/20 text-violet-300 text-[10px] font-black px-1.5 py-0.5 rounded uppercase border border-violet-500/30">Nível {esc.nivel}</span>
                                  <span className="text-[13px] font-bold text-slate-200 tracking-tight">{esc.equipe}</span>
                                </div>
                                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mt-1 text-[10.5px] font-mono font-medium text-slate-400">
                                  <span className="flex items-center gap-1.5 hover:text-cyan-400 transition-colors cursor-pointer w-max active:scale-95" onClick={() => copiarContato(esc.telefone)} title="Copiar Telefone">
                                    <span className="bg-slate-900 p-1 rounded border border-slate-700">📞</span> {esc.telefone}
                                  </span>
                                  <span className="hidden sm:block text-slate-600">|</span>
                                  <span className="flex items-center gap-1.5 hover:text-amber-400 transition-colors cursor-pointer w-max active:scale-95" onClick={() => copiarContato(esc.email)} title="Copiar E-mail">
                                    <span className="bg-slate-900 p-1 rounded border border-slate-700">✉️</span> {esc.email}
                                  </span>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                    </div>
                  ))}
                </div>
              )}

              {/* RENDERIZADOR MASTER STC_ARS (CARDS COMPLETOS COM BASE EM 7 COLUNAS) */}
              {artigoRenderizado.tipo === "cards_stcars_master" && (
                <div className="flex flex-col gap-5">
                  <div className="flex justify-end gap-3 select-none">
                    <button onClick={() => apagarDados('stcars')} className="text-[10px] font-bold text-rose-500 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 dark:bg-rose-900/20 dark:hover:bg-rose-900/40 px-3.5 py-2 rounded-xl border border-rose-200 dark:border-rose-800/50 shadow-sm transition-colors flex items-center gap-1.5 active:scale-95">
                      🗑️ Limpar Banco Master
                    </button>
                  </div>

                  {artigoRenderizado.dados.length === 0 ? (
                    <div className="bg-white dark:bg-slate-800 border-2 border-dashed border-cyan-300 rounded-2xl p-8 text-center shadow-sm">
                      <h3 className="text-lg font-black mb-2 text-slate-800 dark:text-white">Importar Planilha Master de Encerramentos</h3>
                      <p className="text-xs text-slate-500 mb-4">Abra seu arquivo CSV/Excel, dê Ctrl+A, Ctrl+C e cole na caixa abaixo:</p>
                      <textarea value={textoImportacao} onChange={(e) => setTextoImportacao(e.target.value)} placeholder="Cole aqui os dados copiados da sua planilha de 7 colunas..." className="w-full max-w-3xl min-h-[140px] bg-slate-50 border rounded-xl p-4 text-xs outline-none dark:bg-slate-900 dark:text-white mb-6 font-mono border-slate-300 dark:border-slate-700" />
                      <button onClick={processarColagemStcArsMaster} className="bg-cyan-600 hover:bg-cyan-500 text-white font-black py-3 px-8 rounded-xl text-xs uppercase tracking-widest transition-all shadow-md active:scale-95">Processar Dados</button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 xl:grid-cols-2 2xl:grid-cols-3 gap-5">
                      {artigoRenderizado.dados.map((row, idx) => (
                        <div key={idx} className="bg-white dark:bg-slate-800 border-t-4 border-t-cyan-600 border-x border-b border-slate-200 dark:border-slate-700/60 rounded-2xl p-5 shadow-sm hover:shadow-md hover:border-cyan-500/50 transition-all flex flex-col justify-between group relative">
                          <div>
                            <div className="flex justify-between items-center mb-3">
                              <div className="flex items-center gap-2">
                                <span className="font-mono font-black text-sm text-cyan-700 dark:text-cyan-400 bg-cyan-50 dark:bg-slate-900 px-2.5 py-1 rounded-lg border border-cyan-100 dark:border-slate-800">
                                  NOC COD: #{row[0]}
                                </span>
</div>
                              <button 
                                onClick={() => { 
                                  const d = new Date().toLocaleDateString("pt-BR", { day: '2-digit', month: '2-digit', year: '2-digit' });                                  const h = new Date().toLocaleTimeString("pt-BR", { hour: '2-digit', minute: '2-digit' });
                                  const textoFinal = `#${row[0]}#\nDESIGNAÇÃO: \nGT NOME: \nFALHA: ${row[1]} - ${row[2]}\nINÍCIO: \nNORMALIZAÇÃO: ${d} ${h}\nCAUSA: ${row[4] !== "-" ? row[4] : "REDE EXTERNA"}\nSOLUÇÃO: ${row[5]}`;
                                  
                                  // 1. Copia para a área de transferência
                                  navigator.clipboard.writeText(textoFinal); 
                                  
                                  // 2. Cola automaticamente no extrator de rascunhos
                                  setRascunho(textoFinal);
                                  
                                  // 3. Altera o status do seletor para Encerrado
                                  setForm(prev => ({ ...prev, status: "Encerrado" }));
                                  
                                  // 4. Redireciona a tela de volta para o Operacional
                                  setViewAtiva("operacional");
                                  
                                  mostrarToast(`Máscara #${row[0]} enviada direto para o Extrator!`); 
                                }} 
                                className="text-[9px] font-black uppercase tracking-wider bg-slate-100 hover:bg-emerald-50 text-slate-600 hover:text-emerald-700 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-emerald-950/40 p-2 rounded-xl border border-slate-200 dark:border-slate-600 transition-all active:scale-95"
                              >
                                📋 Copiar Máscara
                              </button>
                                                          </div>

                            <div className="flex flex-wrap items-center gap-1 mb-4 bg-slate-50 dark:bg-slate-900/40 p-2 rounded-xl border border-slate-100 dark:border-slate-700/50 select-none">
                              <span className="text-[9px] font-black text-slate-500 uppercase tracking-tight">{row[1]}</span>
                              <span className="text-[8px] font-black text-slate-300">&gt;</span>
                              <span className="text-[9px] font-black text-cyan-700 dark:text-cyan-400 uppercase tracking-tight" title={row[2]}>{row[2]}</span>
                              {row[3] !== "-" && (
                                <>
                                  <span className="text-[8px] font-black text-slate-300">&gt;</span>
                                  <span className="text-[9px] font-bold text-slate-600 dark:text-slate-300 uppercase tracking-tight">{row[3]}</span>
                                </>
                              )}
                              {row[4] !== "-" && (
                                <>
                                  <span className="text-[8px] font-black text-slate-300">&gt;</span>
                                  <span className="text-[9px] font-black text-amber-600 dark:text-amber-400 uppercase tracking-tight">{row[4]}</span>
                                </>
                              )}
                            </div>

                            <div className="space-y-3">
                              <div>
                                <span className="text-[8px] font-black text-slate-400 uppercase block tracking-wider">Descrição do Encerramento</span>
                                <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 leading-relaxed bg-slate-50/50 dark:bg-slate-900/20 p-3 rounded-xl border border-slate-100 dark:border-slate-700/30 font-mono">
                                  {row[5]}
                                </p>
                              </div>
                              <div>
                                <span className="text-[8px] font-black text-cyan-600 dark:text-cyan-400 uppercase block tracking-wider">Diretriz de Uso NOC</span>
                                <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 leading-relaxed pl-1">
                                  {row[6]}
                                </p>
                              </div>
                            </div>
                          </div>

                          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-700/50 flex justify-between items-center text-[8px] font-bold text-slate-400 uppercase tracking-widest select-none">
                            <span>Hierarquia: {row[1]}</span>
                            <span>Item: {row[4] !== "-" ? row[4] : "Geral"}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* RENDERIZADOR DA TABELA DE LINKS E FERRAMENTAS EXTRAÍDAS */}
              {artigoRenderizado.tipo === "tabela" && (
                <div className="rounded-2xl border border-slate-200 dark:border-slate-700 overflow-x-auto shadow-sm bg-white dark:bg-slate-900">
                  <table className="w-full text-left border-collapse whitespace-nowrap">
                    <thead className="bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                      <tr>
                        {artigoRenderizado.colunas.map((col, idx) => (
                          <th key={idx} className="px-5 py-4 text-[10px] font-black uppercase tracking-widest border-b border-slate-200 dark:border-slate-700 sticky top-0 bg-slate-50 dark:bg-slate-800 z-10">{col}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="text-sm">
                      {artigoRenderizado.dados.map((linha, index) => (
                        <tr key={index} className="even:bg-slate-50/50 dark:even:bg-slate-800/50 hover:bg-cyan-50/40 dark:hover:bg-slate-700/50 transition-colors">
                          {linha.map((celula, celIdx) => (
                             <td key={celIdx} className="px-5 py-3 border-b border-slate-100 dark:border-slate-700/50 text-xs font-bold text-slate-700 dark:text-slate-200">
                               {celula.includes(".com") || celula.includes(".net") || celula.includes(".br") || celula.includes("10.") ? (
                                  <a href={celula.startsWith("http") ? celula : `http://${celula}`} target="_blank" rel="noopener noreferrer" className="text-cyan-600 dark:text-cyan-400 hover:underline">{celula}</a>
                               ) : (
                                  celula
                                )}
                             </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

{/* RENDERIZADOR PREMIUM DE ESCALA INTELIGENTE (TEMPO REAL + HEATMAP) */}
              {artigoRenderizado.tipo === "escala_inteligente" && (
                <div className="flex flex-col gap-6 w-full animate-fade-in">
                  <div className="flex items-center gap-3 bg-cyan-900/30 border border-cyan-800/50 p-4 rounded-2xl shadow-inner">
                    <span className="text-2xl animate-pulse">📡</span>
                    <div>
                      <h3 className="text-cyan-400 font-black text-sm uppercase tracking-widest">Painel de Escala e Mapa de Calor</h3>
                      <p className="text-slate-400 text-[10px] font-bold mt-0.5">Clique em um analista para visualizar a jornada mensal. O status cruza o relógio com as regras de folga e férias.</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 w-full">
                    
                    {/* Renderizador Genérico de Colunas */}
                    {[
                      { id: 'm', label: "🌅 TURNO MANHÃ", dados: artigoRenderizado.manha, cor: "amber" },
                      { id: 't', label: "🌙 TURNO TARDE", dados: artigoRenderizado.tarde, cor: "indigo" }
                    ].map((coluna) => (
                      <div key={coluna.id} className="bg-slate-900 border border-slate-700/80 rounded-3xl p-6 shadow-xl relative overflow-hidden flex flex-col">
                        <div className={`absolute top-0 right-0 w-48 h-48 bg-${coluna.cor}-500/10 blur-3xl rounded-full pointer-events-none`}></div>
                        <h4 className={`text-[12px] font-black text-${coluna.cor}-400 uppercase tracking-widest mb-4 border-b border-slate-700/50 pb-3`}>
                          {coluna.label}
                        </h4>
                        
                        <div className="flex flex-col gap-3 relative z-10">
                          {coluna.dados.map((colab, idx) => {
                            const diaHoje = horaGeral.getDate();
                            const statusHoje = colab.escala[diaHoje];
                            
                            let isOnline = false;
                            let textoStatus = "💤 OFFLINE";
                            let corStatus = "bg-slate-900 text-slate-500 border-slate-700";

                            if (statusHoje === "FERIAS") {
                                textoStatus = "🏖️ FÉRIAS";
                                corStatus = "bg-rose-500/10 text-rose-400 border-rose-500/30";
                            } else if (["SAB", "DOM", "F", "BH"].includes(statusHoje)) {
                                textoStatus = "☕ FOLGA";
                                corStatus = "bg-blue-500/10 text-blue-400 border-blue-500/30";
                            } else {
                                const [hI, mI] = colab.horario.split("as")[0].trim().split(":").map(Number);
                                const [hF, mF] = colab.horario.split("as")[1].trim().split(":").map(Number);
                                const minAgora = horaGeral.getHours() * 60 + horaGeral.getMinutes();
                                isOnline = minAgora >= (hI * 60 + mI) && minAgora <= (hF * 60 + mF);
                                if (isOnline) {
                                    textoStatus = "🟢 ONLINE";
                                    corStatus = "bg-emerald-500/10 text-emerald-400 border-emerald-500/30 animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.2)]";
                                }
                            }

                            return (
                              <div key={idx} onClick={() => setEscalaExpandida(escalaExpandida === colab.nome ? null : colab.nome)} className={`bg-slate-800/60 border ${escalaExpandida === colab.nome ? `border-${coluna.cor}-500/50 bg-slate-800` : "border-slate-700"} rounded-xl p-3 flex flex-col hover:border-${coluna.cor}-500/40 cursor-pointer transition-all shadow-sm group`}>
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-3">
                                    <div className={`w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-xs font-black text-slate-300 uppercase shadow-inner group-hover:bg-${coluna.cor}-500/20 group-hover:text-${coluna.cor}-400 transition-colors`}>
                                      {colab.nome.charAt(0)}
                                    </div>
                                    <div className="flex flex-col">
                                      <span className="text-[11px] font-bold text-slate-200 uppercase tracking-tight">{colab.nome}</span>
                                      <span className="text-[9px] font-mono text-slate-400">{colab.turno} | {colab.horario}</span>
                                    </div>
                                  </div>
                                  <div className={`px-2 py-1 rounded border text-[8px] font-black tracking-widest uppercase ${corStatus}`}>
                                    {textoStatus}
                                  </div>
                                </div>

                                {/* SANFONA DO CALENDÁRIO */}
                                {escalaExpandida === colab.nome && (
                                  <div className="mt-4 pt-3 border-t border-slate-700/50 animate-fade-in cursor-default" onClick={(e) => e.stopPropagation()}>
                                    
                                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 mb-3">
                                      <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">MAPA DE CALOR: JUNHO 2026</span>
                                      <div className="flex flex-wrap gap-2 text-[8px] font-bold uppercase">
                                        <span className="flex items-center gap-1 text-slate-400"><div className="w-1.5 h-1.5 rounded-full bg-slate-600"></div> Trab</span>
                                        <span className="flex items-center gap-1 text-blue-400"><div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div> S/D</span>
                                        <span className="flex items-center gap-1 text-emerald-400"><div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div> Feriado</span>
                                        <span className="flex items-center gap-1 text-amber-400"><div className="w-1.5 h-1.5 rounded-full bg-amber-500"></div> Banco</span>
                                        <span className="flex items-center gap-1 text-rose-400"><div className="w-1.5 h-1.5 rounded-full bg-rose-500"></div> Férias</span>
                                      </div>
                                    </div>
                                    
                                    <div className="grid grid-cols-7 gap-1.5">
                                      {['SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SAB', 'DOM'].map((diaSemana, i) => (
                                        <div key={i} className="text-[8px] text-center font-black text-slate-500 pb-1">{diaSemana}</div>
                                      ))}
                                      
                                      {Array.from({ length: 30 }, (_, i) => i + 1).map(dia => {
                                        const tipo = colab.escala[dia];
                                        let corBg = "bg-slate-800 border-slate-700 text-slate-400"; // Padrão
                                        let label = dia;

                                        if (tipo === 'FERIAS') {
                                          corBg = "bg-rose-500/10 text-rose-400 border-rose-500/30";
                                        } else if (tipo === 'F') {
                                          corBg = "bg-emerald-500/10 text-emerald-400 border-emerald-500/30";
                                          label = "F";
                                        } else if (tipo === 'BH') {
                                          corBg = "bg-amber-500/10 text-amber-400 border-amber-500/30";
                                          label = "BH";
                                        } else if (tipo === 'SAB' || tipo === 'DOM') {
                                          corBg = "bg-blue-500/10 text-blue-400 border-blue-500/30";
                                        }

                                        // Glow no dia de hoje
                                        if (dia === diaHoje) corBg += " ring-2 ring-cyan-400 ring-offset-1 ring-offset-slate-900 scale-110 z-10";

                                        return (
                                          <div key={dia} className={`flex items-center justify-center py-2 rounded border text-[10px] font-mono font-bold transition-all ${corBg}`} title={`Dia ${dia} - ${tipo || 'Trabalho'}`}>
                                            {label}
                                          </div>
                                        );
                                      })}
                                    </div>
                                  </div>
                                )}

                              </div>
                            )
                          })}
                        </div>
                      </div>
                    ))}

                  </div>
                </div>
              )}
              
              {/* RENDERIZADOR PREMIUM DE PARCEIRAS (4 A 5 CARDS POR COLUNA) */}
              {artigoRenderizado.tipo === "cards_oemp" && (
                <div className="flex flex-col gap-5 w-full">
                  <div className="flex justify-between items-center select-none">
                    <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest font-mono">
                      🗂️ {artigoRenderizado.dados.length} Operadoras Homologadas no Banco
                    </span>
                    <button onClick={() => apagarDados('oemp')} className="text-[10px] font-bold text-rose-500 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 dark:bg-rose-900/20 dark:hover:bg-rose-900/40 px-3.5 py-2 rounded-xl border border-rose-200 dark:border-rose-800/50 shadow-sm transition-colors flex items-center gap-1.5 active:scale-95">
                      🗑️ Restaurar / Limpar Cache
                    </button>
                  </div>

                  {artigoRenderizado.dados.length === 0 ? (
                    <div className="bg-white dark:bg-slate-800 border-2 border-dashed border-cyan-300 rounded-2xl p-8 text-center shadow-sm w-full">
                      <h3 className="text-lg font-black mb-2 text-slate-800 dark:text-white">Importar Diretório Extra de Parceiras</h3>
                      <textarea value={textoImportacao} onChange={(e) => setTextoImportacao(e.target.value)} placeholder="Cole dados adicionais aqui..." className="w-full max-w-3xl min-h-[140px] bg-slate-50 border rounded-xl p-4 text-xs outline-none dark:bg-slate-900 dark:text-white mb-6 font-mono border-slate-300 dark:border-slate-700" />
                      <button onClick={processarColagemOEMP} className="bg-cyan-600 hover:bg-cyan-500 text-white font-black py-3 px-8 rounded-xl text-xs uppercase tracking-widest transition-all shadow-md active:scale-95">Injetar Contatos</button>
                    </div>
) : (
                    <div className="flex flex-col gap-6 w-full">
                      {artigoRenderizado.dados.map((parceira, pIdx) => {
// Extrator de e-mail para destacar no cabeçalho
                        const emailMatch = parceira.l.join(' ').match(/([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/i);
                        const emailPrincipal = emailMatch ? emailMatch[1] : "E-mail principal não detectado";
                        
                        // VARIÁVEL INTELIGENTE: Puxa o template exclusivo da parceira se existir, senão usa o padrão
                        const templateDisparo = parceira.t || `SOLICITAÇÃO DE SUPORTE / REPARO\nParceira: ${parceira.n}\n\nDesignação do Circuito: \nEndereço da Ponta: \nFalha Identificada: \nContato Local: `;

                        return (
                          <div key={pIdx} className="bg-slate-900 border border-slate-700/80 rounded-3xl p-6 shadow-xl relative overflow-hidden flex flex-col xl:flex-row gap-8 transition-all hover:border-cyan-500/30 group">
                            
                            {/* Fundo decorativo neon (Azul/Cyan para OEMP) */}
                            <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 blur-3xl rounded-full pointer-events-none"></div>

                            {/* Bloco da Esquerda: Template e Nome */}
                            <div className="flex-1 flex flex-col gap-4 relative z-10">
                              <div className="flex items-center gap-3 mb-1">
                                <span className="text-3xl drop-shadow-md">🏢</span>
                                <div>
                                  <h3 className="text-[16px] font-black text-white uppercase tracking-wider leading-tight">{parceira.n}</h3>
                                  <p className="text-[10px] font-bold text-cyan-400 font-mono tracking-widest mt-0.5 bg-cyan-950/50 px-2 py-0.5 rounded border border-cyan-800/50 inline-block truncate max-w-[300px]">
                                    TO: {emailPrincipal}
                                  </p>
                                </div>
                              </div>

                              <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 flex-1 shadow-inner relative group/caixa">
                                <span className="absolute top-2 right-3 text-[9px] font-black text-slate-600 uppercase tracking-widest">Template de Disparo</span>
                                <pre className="text-[11px] font-mono font-medium text-slate-300 whitespace-pre-wrap leading-loose mt-2">
                                  {templateDisparo}
                                </pre>
                              </div>
                              
<button 
                                onClick={() => {
                                  const templatePronto = `Para: ${emailPrincipal !== "E-mail principal não detectado" ? emailPrincipal : ""}\n\n${templateDisparo}`;
                                  navigator.clipboard.writeText(templatePronto);
                                  setRascunho(`DESIGNAÇÃO: \nGT NOME: \nPOSICIONAMENTO: FALHA/ //AÇÃO - ACIONADA PARCEIRA ${parceira.n} VIA E-MAIL E PREV. PASSADA AO CLIENTE//`);
                                  setForm(prev => ({ ...prev, status: "Em andamento" }));
                                  setViewAtiva("operacional");
                                  mostrarToast(`E-mail copiado! Tela preparada para registro da ${parceira.n}!`);
                                }}
                                className="w-full py-3.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-black text-[11px] uppercase tracking-widest transition-all active:scale-95 shadow-[0_0_15px_rgba(8,145,178,0.2)] flex items-center justify-center gap-2"
                              >
                                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                                Copiar Template de Acionamento
                              </button>
                                                          </div>

                            {/* Divisor Vertical */}
                            <div className="hidden xl:block w-px bg-slate-700/50"></div>

                            {/* Bloco da Direita: Escalonamento Ativo */}
                            <div className="flex-1 flex flex-col gap-4 relative z-10">
                              <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1 border-b border-slate-700/50 pb-2 flex items-center gap-2">
                                <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                                Linha de Escalonamento Ativo
                              </h4>
                              
                              <div className="flex flex-col gap-3.5 h-full overflow-y-auto max-h-[350px] pr-2 scrollbar-thin">
                                {parceira.l.map((linha, lIdx) => (
                                  <div key={lIdx} className="bg-slate-800/80 rounded-xl p-4 border-l-4 border-cyan-500 border-r border-y border-slate-700/50 hover:border-cyan-400 transition-all hover:translate-x-1 hover:bg-slate-800 shadow-sm flex flex-col">
                                    <div className="flex items-center gap-2 mb-2">
                                      <span className="bg-cyan-500/20 text-cyan-300 text-[10px] font-black px-1.5 py-0.5 rounded uppercase border border-cyan-500/30">Nível {lIdx + 1}</span>
                                    </div>
                                    <div className="flex flex-col gap-1.5 text-[10.5px] font-mono font-medium text-slate-300">
                                      {/* O extrator inteligente divide o texto pelo pipe | e injeta ícones */}
                                      {linha.split('|').map((parte, i) => {
                                        const p = parte.trim();
                                        if(!p) return null;
                                        
                                        let icone = "🔹";
                                        if(p.includes('@')) icone = "✉️";
                                        else if(/(\d{3,}|\d\d\s\d)/.test(p)) icone = "📞";
                                        else if(p.toLowerCase().includes('após') || p.toLowerCase().includes('nivel') || p.toLowerCase().includes('gerente') || p.toLowerCase().includes('diretor')) icone = "👤";

                                        return (
                                          <div key={i} className="flex items-start gap-2 group/linha hover:text-white transition-colors cursor-text">
                                            <span className="mt-0.5 text-[13px]">{icone}</span> 
                                            <span className="break-words flex-1 leading-relaxed">{p}</span>
                                            {/* Botão de cópia específico do fragmento */}
                                            <button onClick={() => { navigator.clipboard.writeText(p); mostrarToast("Dado copiado!"); }} className="opacity-0 group-hover/linha:opacity-100 text-cyan-500 hover:text-cyan-300 transition-opacity active:scale-95 ml-2" title="Copiar este dado">
                                              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                                            </button>
                                          </div>
                                        )
                                      })}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>

                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* RENDERIZADOR PREMIUM DE CONTATOS ÚTEIS (SMART ACTION CARDS) */}
              {artigoRenderizado.tipo === "cards_uteis" && (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-5 w-full">
                  {artigoRenderizado.dados.map((contato, idx) => (
                    <div key={idx} className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700/60 p-5 shadow-sm hover:shadow-md hover:border-slate-300 dark:hover:border-slate-500 transition-all flex flex-col gap-3 relative overflow-hidden group">
                      
                      {/* Borda lateral colorida dinâmica */}
                      <div className={`absolute top-0 left-0 w-1.5 h-full ${contato.cor}`}></div>
                      
                      <div className="flex justify-between items-start pl-2">
                        <div>
                          <h3 className="text-[14px] font-black text-slate-800 dark:text-white uppercase tracking-tight font-sans">
                            {contato.nome}
                          </h3>
                          {contato.funcao && (
                            <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mt-0.5 block">
                              {contato.funcao}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="pl-2 flex flex-col gap-2 mt-1">
                        {/* Box Interativo de Telefone */}
                        {contato.telefone && (
                          <div className="flex items-center justify-between bg-slate-50 dark:bg-slate-900/50 p-2.5 rounded-xl border border-slate-100 dark:border-slate-700/50 group/btn hover:border-cyan-200 dark:hover:border-cyan-900/50 transition-colors">
                            <div className="flex items-center gap-2.5 text-[11px] font-mono font-black text-cyan-800 dark:text-cyan-400">
                              <span className="text-[13px]">📞</span> {contato.telefone}
                              {contato.opcao && (
                                <span className="text-[9px] font-bold text-slate-400 bg-slate-200 dark:bg-slate-800 px-1.5 py-0.5 rounded font-sans tracking-wider ml-1">
                                  Opção: {contato.opcao}
                                </span>
                              )}
                            </div>
                            <button onClick={() => copiarContato(contato.telefone)} className="text-slate-300 hover:text-cyan-600 active:scale-95 transition-transform" title="Copiar Telefone">
                              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                            </button>
                          </div>
                        )}

                        {/* Box Interativo de E-mail */}
                        {contato.email && (
                          <div className="flex items-center justify-between bg-slate-50 dark:bg-slate-900/50 p-2.5 rounded-xl border border-slate-100 dark:border-slate-700/50 group/btn hover:border-amber-200 dark:hover:border-amber-900/50 transition-colors">
                            <div className="flex items-center gap-2.5 text-[11px] font-mono font-black text-amber-700 dark:text-amber-500 truncate">
                              <span className="text-[13px]">✉️</span> {contato.email}
                            </div>
                            <button onClick={() => copiarContato(contato.email)} className="text-slate-300 hover:text-amber-600 active:scale-95 transition-transform flex-shrink-0" title="Copiar E-mail">
                              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                            </button>
                          </div>
                        )}

                        {/* Alerta de Observação */}
                        {contato.obs && (
                          <div className="mt-1 bg-rose-50 dark:bg-rose-950/20 p-2.5 rounded-xl border border-rose-100 dark:border-rose-900/30 flex items-start gap-2">
                            <span className="text-[11px] mt-0.5">⚠️</span>
                            <p className="text-[10px] font-bold text-rose-700 dark:text-rose-400 leading-relaxed font-sans">
                              {contato.obs}
                            </p>
                          </div>
                        )}
                      </div>

                    </div>
                  ))}
                </div>
              )}

              {/* TEXTO SIMPLES (Senhas) */}
              {artigoRenderizado.tipo === "texto" && (
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl p-8 shadow-sm max-w-4xl">
                  <pre className="font-mono text-sm font-semibold text-slate-800 dark:text-slate-200 whitespace-pre-wrap leading-relaxed">
                    {artigoRenderizado.conteudo}
                  </pre>
                </div>
              )}

              {/* RENDERIZADOR PREMIUM DE SENHAS (COFRE CRIPTOGRAFADO) */}
              {artigoRenderizado.tipo === "cards_senhas" && (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-5 w-full">
                  {artigoRenderizado.dados.map((cred) => (
                    <div key={cred.id} className="bg-slate-900 rounded-2xl border border-slate-700/80 p-5 shadow-lg relative overflow-hidden group hover:border-cyan-500/50 transition-all select-none">
                      
                      {/* Borda lateral colorida Neon */}
                      <div className={`absolute top-0 left-0 w-1.5 h-full ${cred.cor} shadow-[0_0_15px_${cred.cor}]`}></div>
                      
                      <div className="flex justify-between items-start pl-2 mb-4">
                        <div>
                          <h3 className="text-sm font-black text-white uppercase tracking-tight flex items-center gap-2">
                            <span className="text-lg">{cred.icone}</span> {cred.sistema}
                          </h3>
                          {cred.obs && (
                            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1 block">
                              {cred.obs}
                            </span>
                          )}
                        </div>
                        <div className="bg-slate-800/80 p-1.5 rounded-lg border border-slate-700">
                          <svg className="w-4 h-4 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                        </div>
                      </div>

                      <div className="pl-2 space-y-3">
                        {/* Box Usuário */}
                        <div className="flex items-center justify-between bg-slate-800 p-2.5 rounded-xl border border-slate-700/50">
                          <div className="flex flex-col">
                            <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-0.5">Usuário / Login</span>
                            <span className="text-[12px] font-mono font-black text-emerald-400 tracking-wider">
                              {cred.usuario}
                            </span>
                          </div>
                          <button onClick={() => copiarContato(cred.usuario)} className="text-slate-400 hover:text-emerald-400 bg-slate-700/50 hover:bg-slate-700 p-1.5 rounded-lg transition-all active:scale-95" title="Copiar Usuário">
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                          </button>
                        </div>

                        {/* Box Senha Oculta */}
                        <div className="flex items-center justify-between bg-slate-800 p-2.5 rounded-xl border border-slate-700/50">
                          <div className="flex flex-col">
                            <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-0.5">Senha</span>
                            <span className="text-[12px] font-mono font-black text-amber-400 tracking-wider">
                              {senhasVisiveis[cred.id] ? cred.senha : "••••••••••••"}
                            </span>
                          </div>
                          <div className="flex gap-1.5">
                            <button onClick={() => toggleSenha(cred.id)} className="text-slate-400 hover:text-amber-400 bg-slate-700/50 hover:bg-slate-700 p-1.5 rounded-lg transition-all active:scale-95" title={senhasVisiveis[cred.id] ? "Ocultar Senha" : "Revelar Senha"}>
                              {senhasVisiveis[cred.id] ? (
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
                              ) : (
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                              )}
                            </button>
                            <button onClick={() => { copiarContato(cred.senha); mostrarToast("Senha copiada para a área de transferência!", "sucesso"); }} className="text-slate-400 hover:text-amber-400 bg-slate-700/50 hover:bg-slate-700 p-1.5 rounded-lg transition-all active:scale-95" title="Copiar Senha">
                              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                            </button>
                          </div>
                        </div>

                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* RENDERIZADOR MATRIZ TÁTICA DE POSTOS STC */}
              {artigoRenderizado.tipo === "tabela_postos" && (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-5 w-full animate-fade-in">
                  {artigoRenderizado.dados.map((p, idx) => (
                    <div key={idx} className="bg-slate-900 border border-slate-700/80 rounded-2xl p-5 shadow-lg relative overflow-hidden group hover:border-cyan-500/50 transition-all flex flex-col justify-between min-h-[140px]">
                      
                      {/* Borda Glow Lateral Dinâmica */}
                      <div className={`absolute top-0 left-0 w-1.5 h-full ${p.cor} shadow-[0_0_15px_${p.cor}]`}></div>

                      <div>
                        <div className="flex justify-between items-start pl-2 mb-2">
                          <h3 className="text-xl font-black text-white font-mono tracking-widest">{p.posto}</h3>
                          <button 
                            onClick={() => { 
                              navigator.clipboard.writeText(p.posto); 
                              mostrarToast(`Posto ${p.posto} copiado!`); 
                            }} 
                            className="bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white p-1.5 rounded-lg border border-slate-700 active:scale-95 transition-all"
                            title="Copiar Código do Posto"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                          </button>
                        </div>
                        <p className="pl-2 text-[11px] font-bold text-slate-400 leading-relaxed uppercase tracking-wider">
                          {p.desc}
                        </p>
                      </div>

                    </div>
                  ))}
                </div>
              )}

              {/* RENDERIZADOR PREMIUM: GUIA STC MASTER */}
              {artigoRenderizado.tipo === "guia_stc_premium" && (
                <div className="flex flex-col gap-8 w-full animate-fade-in">
                  
                  <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                    {/* COLUNA 1: POSTOS */}
                    <div className="flex flex-col gap-6">
                      {/* Região 1 */}
                      <div className="bg-slate-900 border border-slate-700/80 rounded-3xl p-6 shadow-xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-48 h-48 bg-cyan-500/10 blur-3xl rounded-full pointer-events-none"></div>
                        <h3 className="text-sm font-black text-cyan-400 uppercase tracking-widest mb-4 flex items-center gap-2 border-b border-slate-700/50 pb-3">
                          <span className="text-xl">📍</span> Postos - Região 1
                        </h3>
                        <div className="grid grid-cols-2 gap-3 max-h-[350px] overflow-y-auto pr-2 scrollbar-thin">
                          {artigoRenderizado.regiao1.map((p, i) => (
                            <div key={i} onClick={() => { navigator.clipboard.writeText(p.posto); mostrarToast(`Posto ${p.posto} copiado!`); }} className="bg-slate-800/80 border border-slate-700 hover:border-cyan-500/50 p-3 rounded-xl cursor-pointer transition-all hover:scale-[1.02] active:scale-95 group/item">
                              <div className="text-cyan-300 font-black font-mono text-sm mb-1 group-hover/item:text-cyan-200">{p.posto}</div>
                              <div className="text-[9.5px] font-bold text-slate-400 leading-tight uppercase">{p.desc}</div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Região 2 */}
                      <div className="bg-slate-900 border border-slate-700/80 rounded-3xl p-6 shadow-xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-500/10 blur-3xl rounded-full pointer-events-none"></div>
                        <h3 className="text-sm font-black text-indigo-400 uppercase tracking-widest mb-4 flex items-center gap-2 border-b border-slate-700/50 pb-3">
                          <span className="text-xl">📍</span> Postos - Região 2
                        </h3>
                        <div className="grid grid-cols-2 gap-3 max-h-[250px] overflow-y-auto pr-2 scrollbar-thin">
                          {artigoRenderizado.regiao2.map((p, i) => (
                            <div key={i} onClick={() => { navigator.clipboard.writeText(p.posto); mostrarToast(`Posto ${p.posto} copiado!`); }} className="bg-slate-800/80 border border-slate-700 hover:border-indigo-500/50 p-3 rounded-xl cursor-pointer transition-all hover:scale-[1.02] active:scale-95 group/item">
                              <div className="text-indigo-300 font-black font-mono text-sm mb-1 group-hover/item:text-indigo-200">{p.posto}</div>
                              <div className="text-[9.5px] font-bold text-slate-400 leading-tight uppercase">{p.desc}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* COLUNA 2: COMANDOS E PENDÊNCIAS */}
                    <div className="flex flex-col gap-6">
                      {/* Comandos STC */}
                      <div className="bg-[#0D1117] border border-emerald-900/50 rounded-3xl p-6 shadow-xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/5 blur-3xl rounded-full pointer-events-none"></div>
                        <h3 className="text-sm font-black text-emerald-500 uppercase tracking-widest mb-4 flex items-center gap-2 border-b border-emerald-900/30 pb-3">
                          <span className="text-xl">⌨️</span> Comandos Terminal STC
                        </h3>
                        <div className="flex flex-col gap-2">
                          {artigoRenderizado.comandos.map((c, i) => (
                            <div key={i} onClick={() => { navigator.clipboard.writeText(c.cmd); mostrarToast(`Comando ${c.cmd} copiado!`); }} className="flex items-center gap-4 bg-slate-900/80 border border-emerald-900/30 hover:border-emerald-500/50 p-2.5 rounded-xl cursor-pointer transition-all active:scale-95 group/item">
                              <div className="bg-emerald-950 text-emerald-400 font-black font-mono text-sm w-10 h-10 flex items-center justify-center rounded-lg border border-emerald-800/50 shadow-inner group-hover/item:bg-emerald-900 transition-colors">
                                {c.cmd}
                              </div>
                              <div className="text-[11px] font-medium text-slate-300 uppercase tracking-wide">{c.desc}</div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Pendências */}
                      <div className="bg-slate-900 border border-slate-700/80 rounded-3xl p-6 shadow-xl relative overflow-hidden group flex-1 flex flex-col">
                        <div className="absolute bottom-0 right-0 w-48 h-48 bg-amber-500/10 blur-3xl rounded-full pointer-events-none"></div>
                        <h3 className="text-sm font-black text-amber-500 uppercase tracking-widest mb-4 flex items-center gap-2 border-b border-slate-700/50 pb-3">
                          <span className="text-xl">⏳</span> Códigos de Pendência STC
                        </h3>
                        <div className="flex flex-col gap-2 overflow-y-auto max-h-[300px] pr-2 scrollbar-thin">
                          {artigoRenderizado.pendencias.map((pend, i) => (
                            <div key={i} onClick={() => { navigator.clipboard.writeText(pend.cod); mostrarToast(`Código ${pend.cod} copiado!`); }} className="flex items-center gap-3 bg-slate-800/50 border border-slate-700 hover:border-amber-500/40 p-2.5 rounded-xl cursor-pointer transition-all active:scale-95 group/item">
                              <div className="bg-slate-950 text-amber-400 font-black font-mono text-[11px] px-2.5 py-1.5 rounded-lg border border-amber-900/30">
                                {pend.cod}
                              </div>
                              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wide leading-tight group-hover/item:text-slate-300">
                                {pend.desc}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                    </div>
                  </div>

                </div>
              )}

              {/* RENDERIZADOR MASTER FIX (ALTA DENSIDADE COMPACTA) */}
              {artigoRenderizado.tipo === "tabela_fix" && (
                <div className="flex flex-col gap-4">
                  {artigoRenderizado.dados.length === 0 ? (
                    <div className="bg-white dark:bg-slate-800 border-2 border-dashed border-cyan-300 rounded-2xl p-8 text-center shadow-sm">
                      <h3 className="text-lg font-black mb-2 text-slate-800 dark:text-white">Importar Aba FIX (Cole os dados separados por Tabulação)</h3>
                      <textarea value={textoImportacao} onChange={(e) => setTextoImportacao(e.target.value)} placeholder="Cole aqui as colunas do Excel..." className="w-full max-w-3xl min-h-[140px] bg-slate-50 border rounded-xl p-4 text-xs outline-none dark:bg-slate-900 dark:text-white mb-6" />
                      <button onClick={processarColagemFix} className="bg-cyan-600 hover:bg-cyan-500 text-white font-black py-3 px-8 rounded-xl text-xs uppercase tracking-widest transition-all">Processar Dados</button>
                    </div>
                  ) : (
                    <div className="rounded-2xl border border-slate-200 dark:border-slate-700 overflow-x-auto shadow-sm bg-white dark:bg-slate-900 max-h-[500px]">
                      <table className="w-full text-left border-collapse whitespace-nowrap table-fixed">
                        <thead className="bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 sticky top-0 z-10">
                          <tr>
                            <th className="px-4 py-3 text-[10px] font-black uppercase tracking-widest w-[15%] border-b">Código</th>
                            <th className="px-4 py-3 text-[10px] font-black uppercase tracking-widest w-[60%] border-b">Árvore de Encerramento (Hierarquia)</th>
                            <th className="px-4 py-3 text-[10px] font-black uppercase tracking-widest w-[25%] border-b">Descrição Completa</th>
                          </tr>
                        </thead>
                        <tbody className="text-xs font-bold divide-y dark:divide-slate-700">
                          {artigoRenderizado.dados.slice(1, 150).map((row, index) => (
                            <tr key={index} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                              <td className="px-4 py-2.5 font-mono text-cyan-800 dark:text-cyan-400">{row[0]}</td>
                              <td className="px-4 py-2.5 text-slate-500 dark:text-slate-400 text-[11px] truncate">
                                {row[6]} ➔ {row[7]} ➔ {row[8]} ➔ {row[9]}
                              </td>
                              <td className="px-4 py-2.5 text-slate-800 dark:text-slate-200 truncate">{row[11]}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

              {/* RENDERIZADOR PREMIUM POP INTERATIVO (DASHBOARD) */}
              {artigoRenderizado.tipo === "pop_interativo" && (
                <div className="flex flex-col gap-6 w-full">
                  <div className="bg-slate-900 rounded-3xl p-6 md:p-8 border border-slate-700 shadow-xl relative overflow-hidden">
                    
                    {/* Efeitos de Luz no Fundo */}
                    <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/10 blur-3xl rounded-full pointer-events-none"></div>
                    <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-500/10 blur-3xl rounded-full pointer-events-none"></div>
                    
                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 relative z-10">
                      {artigoRenderizado.secoes.map((secao, sIdx) => (
                        <div key={sIdx} className={`bg-slate-800/80 backdrop-blur-sm rounded-2xl border-l-4 ${secao.cor} p-6 flex flex-col gap-4 shadow-sm hover:bg-slate-800 transition-all`}>
                          <h3 className="text-[15px] font-black text-white flex items-center gap-2.5 uppercase tracking-widest">
                            <span className="text-xl">{secao.icone}</span> {secao.titulo}
                          </h3>
                          
                          {/* Renderiza Comandos (Estilo Terminal) */}
                          {secao.itens && (
                            <div className="grid grid-cols-2 gap-2 mt-2">
                              {secao.itens.map((cmd, cIdx) => (
                                <div key={cIdx} className="bg-slate-900 p-2.5 rounded-xl border border-slate-700/50 flex items-center gap-3 hover:border-slate-500 transition-colors">
                                  <span className={`px-2 py-1 rounded bg-slate-800 text-[11px] font-black font-mono shadow-sm ${secao.textoCor}`}>
                                    {cmd.label}
                                  </span>
                                  <span className="text-[10px] font-bold text-slate-300 leading-tight">
                                    {cmd.desc}
                                  </span>
                                </div>
                              ))}
                            </div>
                          )}
                          
                          {/* Renderiza Destaque de Alerta */}
                          {secao.destaque && (
                            <div className={`mt-2 ${secao.bgCor} border ${secao.cor.replace('border-', 'border-').replace('500', '500/30')} rounded-xl p-3.5 flex gap-2.5`}>
                              <span className="text-[14px]">⚠️</span>
                              <p className={`text-[11px] font-bold ${secao.textoCor} leading-relaxed`}>
                                {secao.destaque}
                              </p>
                            </div>
                          )}

                          {/* Renderiza Textos e Fluxos */}
                          {secao.texto && (
                            <ul className="space-y-3 mt-1">
                              {secao.texto.map((txt, tIdx) => {
                                const partes = txt.split('::');
                                const negrito = partes.length > 1 ? partes[0] : null;
                                const resto = partes.length > 1 ? partes[1] : partes[0];
                                return (
                                  <li key={tIdx} className="text-[11.5px] font-medium text-slate-300 flex items-start gap-2.5 leading-relaxed bg-slate-900/40 p-2.5 rounded-lg border border-slate-700/30">
                                    <span className={`mt-0.5 text-[10px] ${secao.textoCor}`}>▶</span>
                                    <span>
                                      {negrito && <strong className="text-white font-black tracking-wide mr-1">{negrito}:</strong>}
                                      {resto}
                                    </span>
                                  </li>
                                );
                              })}
                            </ul>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* MÓDULO DE BIBLIOTECA CENTRAL DE ARQUIVOS */}
              {artigoRenderizado.tipo === "biblioteca_arquivos" && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {artigoRenderizado.documentos.map((doc) => (
                    <div key={doc.id} className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 shadow-sm hover:shadow-md hover:border-cyan-300 dark:hover:border-cyan-700 transition-all flex flex-col justify-between group">
                      <div>
                        {getIconeFormato(doc.formato)}
                        <h3 className="font-black text-lg text-slate-800 dark:text-white leading-tight mb-2 healthiest">{doc.nome}</h3>
                        <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-4">{doc.descricao}</p>
                      </div>
                      <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-700 flex items-center justify-between">
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">At: {doc.atualizado}</span>
                        <a href={doc.link} target="_blank" rel="noopener noreferrer" className="text-xs font-bold text-white bg-cyan-600 hover:bg-cyan-500 px-4 py-2 rounded-lg transition-colors flex items-center gap-2 active:scale-95 shadow-sm">
                          Abrir Arquivo <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              )}

            </div>
          ) : null}
        </div>
      </div>
    );
  }
}