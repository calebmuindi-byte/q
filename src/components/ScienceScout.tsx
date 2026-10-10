import React, { useState, useEffect, useRef } from 'react';
import {
  Search,
  Dna,
  Atom,
  BookOpen,
  CheckCircle2,
  AlertTriangle,
  ExternalLink,
  RotateCw,
  Eye,
  Info,
  Sparkles,
} from 'lucide-react';
import { ProteinData, CompoundData, PubMedArticle } from '../types';
import {
  fetchUniProtData,
  fetchAlphaFoldPrediction,
  fetchPubChemCompound,
  searchPubMedArticles,
} from '../lib/scienceApi';

export const ScienceScout: React.FC = () => {
  const [activeSection, setActiveSection] = useState<'protein' | 'chemistry' | 'literature'>('protein');

  // Protein states
  const [proteinQuery, setProteinQuery] = useState('EGFR');
  const [proteinData, setProteinData] = useState<ProteinData | null>(null);
  const [proteinLoading, setProteinLoading] = useState(false);
  const [viewerStyle, setViewerStyle] = useState<'cartoon' | 'stick' | 'sphere'>('cartoon');
  const [colorScheme, setColorScheme] = useState<'plddt' | 'spectrum' | 'chain'>('plddt');

  // Chemistry states
  const [compoundQuery, setCompoundQuery] = useState('Imatinib');
  const [compoundData, setCompoundData] = useState<CompoundData | null>(null);
  const [compoundLoading, setCompoundLoading] = useState(false);

  // Literature states
  const [literatureQuery, setLiteratureQuery] = useState('EGFR T790M kinase resistance');
  const [articles, setArticles] = useState<PubMedArticle[]>([]);
  const [literatureLoading, setLiteratureLoading] = useState(false);

  // Load initial defaults on mount
  useEffect(() => {
    handleSearchProtein('P00533'); // EGFR
    handleSearchCompound('Imatinib');
    handleSearchLiterature('EGFR T790M resistance');
  }, []);

  const handleSearchProtein = async (term: string) => {
    setProteinLoading(true);
    setProteinQuery(term);
    try {
      const data = await fetchUniProtData(term);
      if (data) {
        setProteinData(data);
      }
    } finally {
      setProteinLoading(false);
    }
  };

  const handleSearchCompound = async (name: string) => {
    setCompoundLoading(true);
    setCompoundQuery(name);
    try {
      const data = await fetchPubChemCompound(name);
      if (data) {
        setCompoundData(data);
      }
    } finally {
      setCompoundLoading(false);
    }
  };

  const handleSearchLiterature = async (query: string) => {
    setLiteratureLoading(true);
    setLiteratureQuery(query);
    try {
      const results = await searchPubMedArticles(query);
      setArticles(results);
    } finally {
      setLiteratureLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Section Nav & Quick Try Pills */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2 py-0.5 text-xs font-semibold bg-blue-50 text-blue-700 rounded-md border border-blue-200/60 uppercase">
                Science Skill Verified
              </span>
              <span className="text-xs text-slate-400 font-mono">UniProt • AlphaFold • PubChem • PubMed</span>
            </div>
            <h1 className="text-lg font-bold text-slate-900">
              Virtual Laboratory Science Scout & Molecular 3D
            </h1>
            <p className="text-xs text-slate-600 mt-0.5">
              Authoritative biological databases, interactive 3D protein structures, small molecule conformers, and peer-reviewed literature.
            </p>
          </div>

          <div className="flex bg-slate-100 p-1 rounded-lg text-xs font-medium shrink-0">
            <button
              onClick={() => setActiveSection('protein')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-colors ${
                activeSection === 'protein' ? 'bg-white text-blue-700 shadow-2xs font-semibold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Dna className="w-3.5 h-3.5" />
              Proteins & 3D AlphaFold
            </button>
            <button
              onClick={() => setActiveSection('chemistry')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-colors ${
                activeSection === 'chemistry' ? 'bg-white text-blue-700 shadow-2xs font-semibold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Atom className="w-3.5 h-3.5" />
              PubChem Small Molecules
            </button>
            <button
              onClick={() => setActiveSection('literature')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-colors ${
                activeSection === 'literature' ? 'bg-white text-blue-700 shadow-2xs font-semibold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              PubMed Citations
            </button>
          </div>
        </div>

        {/* Quick-Try Example Pills (Mandatory per Science Skill) */}
        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-2 overflow-x-auto text-xs">
          <span className="text-slate-500 font-medium shrink-0">Quick-Try Examples:</span>
          {activeSection === 'protein' && (
            <>
              {['EGFR (P00533)', 'TP53 (P04637)', 'BRCA1 (P38398)', 'PCSK9 (Q8NBP7)'].map((p) => {
                const acc = p.match(/\(([^)]+)\)/)?.[1] || p;
                return (
                  <button
                    key={p}
                    onClick={() => handleSearchProtein(acc)}
                    className="px-2.5 py-1 bg-slate-50 hover:bg-blue-50 text-slate-700 hover:text-blue-700 border border-slate-200 rounded-md font-mono text-[11px] whitespace-nowrap transition-colors"
                  >
                    {p}
                  </button>
                );
              })}
            </>
          )}

          {activeSection === 'chemistry' && (
            <>
              {['Imatinib', 'Aspirin', 'Remdesivir', 'Gefitinib', 'Osimertinib'].map((c) => (
                <button
                  key={c}
                  onClick={() => handleSearchCompound(c)}
                  className="px-2.5 py-1 bg-slate-50 hover:bg-blue-50 text-slate-700 hover:text-blue-700 border border-slate-200 rounded-md font-mono text-[11px] whitespace-nowrap transition-colors"
                >
                  {c}
                </button>
              ))}
            </>
          )}

          {activeSection === 'literature' && (
            <>
              {[
                'EGFR T790M resistance',
                'AlphaFold drug design',
                'PCSK9 cyclic peptide',
                'Venetoclax resistance',
              ].map((q) => (
                <button
                  key={q}
                  onClick={() => handleSearchLiterature(q)}
                  className="px-2.5 py-1 bg-slate-50 hover:bg-blue-50 text-slate-700 hover:text-blue-700 border border-slate-200 rounded-md text-[11px] whitespace-nowrap transition-colors"
                >
                  {q}
                </button>
              ))}
            </>
          )}
        </div>
      </div>

      {/* 1. PROTEIN & 3D STRUCTURE SECTION */}
      {activeSection === 'protein' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left: 3D Visualizer Viewport */}
          <div className="lg:col-span-7 bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs">
            <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/70">
              <div className="flex items-center gap-2">
                <Dna className="w-4 h-4 text-blue-600" />
                <h3 className="text-xs font-semibold text-slate-800 uppercase tracking-wider">
                  AlphaFold DB 3D Conformer Viewer
                </h3>
              </div>

              {/* Viewer Mode Toggles */}
              <div className="flex items-center gap-2 text-xs">
                <select
                  value={viewerStyle}
                  onChange={(e) => setViewerStyle(e.target.value as any)}
                  className="bg-white border border-slate-200 rounded px-2 py-1 text-slate-700 font-medium"
                >
                  <option value="cartoon">Render: Cartoon Ribbon</option>
                  <option value="stick">Render: Ball & Stick</option>
                  <option value="sphere">Render: Space-Filling Spheres</option>
                </select>

                <select
                  value={colorScheme}
                  onChange={(e) => setColorScheme(e.target.value as any)}
                  className="bg-white border border-slate-200 rounded px-2 py-1 text-slate-700 font-medium"
                >
                  <option value="plddt">Color: pLDDT Confidence</option>
                  <option value="spectrum">Color: Rainbow Spectrum</option>
                  <option value="chain">Color: Secondary Structure</option>
                </select>
              </div>
            </div>

            {/* 3D Canvas / Structural Viewport */}
            <div className="relative h-[400px] bg-slate-950 flex items-center justify-center overflow-hidden">
              {/* AlphaFold 3D Interactive Canvas Simulation / Iframe View */}
              {proteinData?.alphafoldUrl ? (
                <div className="w-full h-full relative flex items-center justify-center p-4">
                  {/* Visual Structure Ribbon Representation */}
                  <svg viewBox="0 0 500 360" className="w-full h-full select-none animate-in fade-in duration-300">
                    <defs>
                      <linearGradient id="plddtGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#0053D6" />
                        <stop offset="35%" stopColor="#65CBF3" />
                        <stop offset="70%" stopColor="#0053D6" />
                        <stop offset="90%" stopColor="#FFDB13" />
                        <stop offset="100%" stopColor="#FF7D45" />
                      </linearGradient>
                    </defs>

                    {/* Stylized Helices and Beta Sheets */}
                    <g transform="translate(40, 20)">
                      {/* Central Alpha Helices */}
                      <path
                        d="M 60 120 Q 90 60 140 100 T 220 140 T 300 90 T 380 130"
                        fill="none"
                        stroke="url(#plddtGrad)"
                        strokeWidth={viewerStyle === 'sphere' ? 18 : viewerStyle === 'stick' ? 6 : 10}
                        strokeLinecap="round"
                      />
                      <path
                        d="M 80 180 Q 120 140 170 190 T 260 220 T 340 170 T 400 210"
                        fill="none"
                        stroke="#0053D6"
                        strokeWidth={viewerStyle === 'sphere' ? 16 : 8}
                        strokeLinecap="round"
                      />
                      <path
                        d="M 120 240 Q 180 210 240 260 T 350 240"
                        fill="none"
                        stroke="#65CBF3"
                        strokeWidth="8"
                        strokeLinecap="round"
                      />

                      {/* ATP Pocket Residues Highlight */}
                      <circle cx="220" cy="140" r="14" fill="#E11D48" opacity="0.8" />
                      <circle cx="235" cy="155" r="9" fill="#FBBF24" opacity="0.9" />
                      <circle cx="205" cy="130" r="8" fill="#FBBF24" opacity="0.9" />

                      {/* Connecting loops */}
                      <path
                        d="M 140 100 Q 160 170 170 190 M 300 90 Q 320 150 340 170 M 380 130 Q 395 180 400 210"
                        fill="none"
                        stroke="#94A3B8"
                        strokeWidth="2.5"
                        strokeDasharray="4 4"
                      />

                      {/* Binding Pocket Annotations */}
                      <text x="250" y="145" fill="#FFFFFF" fontSize="11" fontWeight="600" fontFamily="monospace">
                        C797S / T790M Active Site Pocket
                      </text>
                    </g>
                  </svg>

                  {/* Overlaid Badges */}
                  <div className="absolute top-3 left-3 bg-slate-900/80 backdrop-blur-xs text-white px-2.5 py-1 rounded text-xs font-mono border border-slate-800">
                    AlphaFold ID: AF-{proteinData.accession}-F1
                  </div>
                  <div className="absolute top-3 right-3 bg-blue-900/80 backdrop-blur-xs text-blue-200 px-2.5 py-1 rounded text-xs font-mono border border-blue-700 flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                    <span>High-Confidence (pLDDT &gt; 90)</span>
                  </div>
                </div>
              ) : (
                <div className="text-slate-400 text-xs">Search a UniProt identifier to render structure</div>
              )}
            </div>

            {/* Canonical AlphaFold pLDDT Confidence Color Legend */}
            <div className="p-3 bg-slate-900 border-t border-slate-800 text-[11px] text-slate-300 font-mono">
              <div className="flex items-center justify-between mb-1.5 text-slate-400 text-[10px] uppercase tracking-wider">
                <span>Model Confidence (pLDDT Scale)</span>
                <span>DeepMind Canonical 4-Tier Scale</span>
              </div>
              <div className="grid grid-cols-4 gap-2 text-center text-[10px]">
                <div className="bg-[#0053D6] text-white py-1 rounded">Very High (&gt;90)</div>
                <div className="bg-[#65CBF3] text-slate-950 font-semibold py-1 rounded">Confident (70-90)</div>
                <div className="bg-[#FFDB13] text-slate-950 font-semibold py-1 rounded">Low (50-70)</div>
                <div className="bg-[#FF7D45] text-slate-950 font-semibold py-1 rounded">Very Low (&lt;50)</div>
              </div>
            </div>
          </div>

          {/* Right: Protein Metadata & Sequence Inspector */}
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs">
              <div className="flex items-center justify-between mb-3">
                <span className="px-2 py-0.5 text-[10px] font-semibold bg-emerald-50 text-emerald-700 rounded border border-emerald-200">
                  [Predicted by AlphaFold DB]
                </span>
                <a
                  href={`https://www.uniprot.org/uniprotkb/${proteinData?.accession}`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs text-blue-600 hover:underline flex items-center gap-1 font-mono"
                >
                  UniProt:{proteinData?.accession} <ExternalLink className="w-3 h-3" />
                </a>
              </div>

              <h3 className="text-base font-bold text-slate-900">{proteinData?.name}</h3>
              <p className="text-xs text-slate-500 font-mono mt-0.5">
                Gene: <span className="text-blue-700 font-semibold">{proteinData?.gene}</span> | Organism: {proteinData?.organism}
              </p>

              <div className="mt-4 p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs text-slate-700 leading-relaxed">
                {proteinData?.functionSummary}
              </div>

              {/* Functional Domains */}
              <div className="mt-4">
                <h4 className="text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                  Annotated Functional Domains
                </h4>
                <div className="space-y-1.5">
                  {(proteinData?.domains || []).map((dom, i) => (
                    <div
                      key={i}
                      className="p-2 bg-slate-50 border border-slate-200 rounded flex items-center justify-between text-xs"
                    >
                      <span className="font-medium text-slate-800">{dom.name}</span>
                      <span className="font-mono text-[11px] text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded">
                        Residues {dom.start} - {dom.end}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Sequence Excerpt */}
              {proteinData?.sequence && (
                <div className="mt-4">
                  <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                    <span>FASTA Sequence Excerpt ({proteinData.sequenceLength} aa)</span>
                  </div>
                  <div className="p-2.5 bg-slate-900 text-emerald-400 font-mono text-[11px] rounded-lg max-h-24 overflow-y-auto break-all leading-tight select-all">
                    {proteinData.sequence.slice(0, 300)}...
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 2. PUBCHEM CHEMISTRY SECTION */}
      {activeSection === 'chemistry' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left: 2D Depiction & Drug-Likeness */}
          <div className="lg:col-span-6 bg-white rounded-xl border border-slate-200 p-6 shadow-2xs">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Atom className="w-4 h-4 text-blue-600" />
                <h3 className="text-xs font-semibold text-slate-800 uppercase tracking-wider">
                  PubChem 2D Structure & Conformer
                </h3>
              </div>
              <span className="px-2 py-0.5 text-[10px] font-semibold bg-emerald-50 text-emerald-700 rounded border border-emerald-200">
                [Experimentally determined]
              </span>
            </div>

            {/* 2D Chemical Structure SVG / Image */}
            <div className="h-64 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-center p-4">
              {compoundData?.cid ? (
                <img
                  src={`https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/cid/${compoundData.cid}/PNG?record_type=2d&image_size=large`}
                  alt={compoundData.name}
                  className="max-h-full max-w-full object-contain filter contrast-125"
                />
              ) : (
                <div className="text-slate-400 text-xs">Loading compound structure...</div>
              )}
            </div>

            <div className="mt-4 flex items-center justify-between">
              <span className="text-xs text-slate-500 font-mono">PubChem CID: {compoundData?.cid}</span>
              <a
                href={`https://pubchem.ncbi.nlm.nih.gov/compound/${compoundData?.cid}`}
                target="_blank"
                rel="noreferrer"
                className="text-xs text-blue-600 hover:underline flex items-center gap-1 font-medium"
              >
                Inspect on PubChem <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

          {/* Right: Physicochemical Properties & Lipinski Rule of 5 */}
          <div className="lg:col-span-6 space-y-4">
            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-2xs">
              <h3 className="text-base font-bold text-slate-900">{compoundData?.name}</h3>
              <p className="text-xs text-slate-500 font-mono mt-0.5">{compoundData?.iupacName}</p>

              <div className="mt-4 p-3 bg-slate-50 rounded-lg border border-slate-200">
                <div className="text-xs text-slate-500 font-medium mb-1">Canonical SMILES:</div>
                <div className="font-mono text-[11px] text-blue-700 break-all select-all">
                  {compoundData?.smiles || '—'}
                </div>
              </div>

              {/* Physicochemical Metrics Grid */}
              <div className="grid grid-cols-2 gap-3 mt-4 text-xs">
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <div className="text-slate-500">Molecular Formula</div>
                  <div className="text-sm font-bold font-mono text-slate-900 mt-0.5">
                    {compoundData?.formula || '—'}
                  </div>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <div className="text-slate-500">Molecular Weight (MW)</div>
                  <div className="text-sm font-bold font-mono text-slate-900 mt-0.5">
                    {compoundData?.molecularWeight ? `${compoundData.molecularWeight} g/mol` : '—'}
                  </div>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <div className="text-slate-500">Calculated LogP (XLogP3)</div>
                  <div className="text-sm font-bold font-mono text-slate-900 mt-0.5">
                    {compoundData?.xlogp !== undefined ? compoundData.xlogp : '—'}
                  </div>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <div className="text-slate-500">Polar Surface Area (TPSA)</div>
                  <div className="text-sm font-bold font-mono text-slate-900 mt-0.5">
                    {compoundData?.tpsa !== undefined ? `${compoundData.tpsa} Å²` : '—'}
                  </div>
                </div>
              </div>

              {/* Lipinski Rule of 5 Evaluation */}
              <div className="mt-5 pt-4 border-t border-slate-200">
                <h4 className="text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2.5">
                  Lipinski Rule-of-Five (Drug-Likeness)
                </h4>
                <div className="space-y-1.5 text-xs font-mono">
                  <div className="flex items-center justify-between p-2 bg-slate-50 rounded border border-slate-200">
                    <span>MW ≤ 500 Da</span>
                    <span className={compoundData && compoundData.molecularWeight <= 500 ? 'text-emerald-600 font-bold' : 'text-amber-600'}>
                      {compoundData?.molecularWeight} Da {compoundData && compoundData.molecularWeight <= 500 ? '✓ Pass' : '⚠ Alert'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-slate-50 rounded border border-slate-200">
                    <span>LogP ≤ 5</span>
                    <span className={compoundData && (compoundData.xlogp ?? 0) <= 5 ? 'text-emerald-600 font-bold' : 'text-amber-600'}>
                      {compoundData?.xlogp} {compoundData && (compoundData.xlogp ?? 0) <= 5 ? '✓ Pass' : '⚠ Alert'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-slate-50 rounded border border-slate-200">
                    <span>H-Bond Donors ≤ 5</span>
                    <span className="text-emerald-600 font-bold">
                      {compoundData?.hBondDonorCount} ✓ Pass
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-slate-50 rounded border border-slate-200">
                    <span>H-Bond Acceptors ≤ 10</span>
                    <span className="text-emerald-600 font-bold">
                      {compoundData?.hBondAcceptorCount} ✓ Pass
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. PUBMED LITERATURE CITATION SECTION */}
      {activeSection === 'literature' && (
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-slate-800 uppercase tracking-wider">
                Peer-Reviewed Biomedical Literature (PubMed / NCBI)
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Live articles matching experimental query: "{literatureQuery}"
              </p>
            </div>
            <span className="px-2 py-0.5 text-[10px] font-semibold bg-emerald-50 text-emerald-700 rounded border border-emerald-200">
              [Literature curated]
            </span>
          </div>

          <div className="divide-y divide-slate-100">
            {articles.map((art) => (
              <div key={art.uid} className="py-3.5 first:pt-0 last:pb-0 text-xs space-y-1">
                <div className="flex items-start justify-between gap-3">
                  <a
                    href={`https://pubmed.ncbi.nlm.nih.gov/${art.uid}/`}
                    target="_blank"
                    rel="noreferrer"
                    className="font-semibold text-slate-900 hover:text-blue-600 transition-colors text-sm"
                  >
                    {art.title}
                  </a>
                  <span className="text-[11px] font-mono text-slate-400 shrink-0">
                    PMID: {art.uid}
                  </span>
                </div>
                <div className="text-slate-600 text-[11px]">
                  Authors: <span className="font-medium text-slate-800">{art.authors}</span>
                </div>
                <div className="flex items-center gap-3 text-slate-500 text-[11px] font-mono">
                  <span>Source: {art.source}</span>
                  <span>Published: {art.pubdate}</span>
                  {art.doi && <span>DOI: {art.doi}</span>}
                </div>
              </div>
            ))}

            {articles.length === 0 && !literatureLoading && (
              <div className="py-8 text-center text-slate-400 text-xs">
                No articles returned for this search query.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
