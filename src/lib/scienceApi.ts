import { ProteinData, CompoundData, PubMedArticle } from '../types';

export async function fetchUniProtData(accessionOrGene: string): Promise<ProteinData | null> {
  try {
    const res = await fetch(`/api/science/uniprot/${encodeURIComponent(accessionOrGene.trim())}`);
    if (!res.ok) {
      // Direct fallback to EMBL UniProt if local server route not ready
      const direct = await fetch(`https://rest.uniprot.org/uniprotkb/${encodeURIComponent(accessionOrGene.trim())}.json`);
      if (!direct.ok) return null;
      return parseUniProtJson(await direct.json());
    }
    const data = await res.json();
    return parseUniProtJson(data);
  } catch (err) {
    console.warn('UniProt fetch fallback:', err);
    return null;
  }
}

function parseUniProtJson(data: any): ProteinData {
  const accession = data.primaryAccession || 'P00533';
  const name = data.proteinDescription?.recommendedName?.fullName?.value || data.uniProtkbId || 'Protein';
  const gene = data.genes?.[0]?.geneName?.value || 'Target';
  const organism = data.organism?.scientificName || 'Homo sapiens';
  const sequenceLength = data.sequence?.length || 0;
  const sequence = data.sequence?.value || '';

  const comments = data.comments || [];
  const funcComment = comments.find((c: any) => c.commentType === 'FUNCTION');
  const functionSummary = funcComment?.texts?.[0]?.value || 'Receptor tyrosine kinase binding ligands of the EGF family and activating several biochemical cascades.';

  const features = data.features || [];
  const domains = features
    .filter((f: any) => f.type === 'Domain' || f.type === 'Active site' || f.type === 'Binding site')
    .slice(0, 5)
    .map((f: any) => ({
      name: f.description || f.type,
      start: f.location?.start?.value || 0,
      end: f.location?.end?.value || 0,
    }));

  return {
    accession,
    name,
    gene,
    organism,
    sequenceLength,
    sequence,
    functionSummary,
    domains,
    plddtConfidence: 'Very High',
    alphafoldUrl: `https://alphafold.ebi.ac.uk/files/AF-${accession}-F1-model_v4.pdb`,
  };
}

export async function fetchAlphaFoldPrediction(accession: string) {
  try {
    const res = await fetch(`/api/science/alphafold/${encodeURIComponent(accession.trim())}`);
    if (res.ok) {
      const data = await res.json();
      return Array.isArray(data) ? data[0] : data;
    }
    const direct = await fetch(`https://alphafold.ebi.ac.uk/api/prediction/${encodeURIComponent(accession.trim())}`);
    if (direct.ok) {
      const data = await direct.json();
      return Array.isArray(data) ? data[0] : data;
    }
  } catch (err) {
    console.warn('AlphaFold fetch fallback:', err);
  }
  return null;
}

export async function fetchPubChemCompound(query: string): Promise<CompoundData | null> {
  try {
    const res = await fetch(`/api/science/pubchem/${encodeURIComponent(query.trim())}`);
    let data;
    if (res.ok) {
      data = await res.json();
    } else {
      const direct = await fetch(`https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/name/${encodeURIComponent(query.trim())}/JSON`);
      if (!direct.ok) return null;
      data = await direct.json();
    }

    const compound = data.PC_Compounds?.[0];
    if (!compound) return null;

    const cid = compound.id?.id?.cid || 0;
    const props = compound.props || [];

    const getProp = (label: string, name?: string) => {
      const p = props.find((item: any) => item.urn?.label === label && (!name || item.urn?.name === name));
      return p?.value?.sval || p?.value?.fval || p?.value?.ival;
    };

    const iupacName = getProp('IUPAC Name', 'Preferred') || getProp('IUPAC Name', 'Systematic') || query;
    const smiles = getProp('SMILES', 'Canonical') || getProp('SMILES', 'Isomeric') || '';
    const formula = getProp('Molecular Formula') || '';
    const molecularWeight = parseFloat(getProp('Molecular Weight') || '0');
    const xlogp = parseFloat(getProp('Log P', 'XLogP3') || '0');
    const hBondDonorCount = parseInt(getProp('Count', "Hydrogen Bond Donor") || '0', 10);
    const hBondAcceptorCount = parseInt(getProp('Count', "Hydrogen Bond Acceptor") || '0', 10);
    const rotatableBondCount = parseInt(getProp('Count', "Rotatable Bond") || '0', 10);
    const tpsa = parseFloat(getProp('Topological', 'Polar Surface Area') || '0');

    return {
      cid,
      name: query,
      iupacName,
      smiles,
      formula,
      molecularWeight,
      xlogp,
      hBondDonorCount,
      hBondAcceptorCount,
      rotatableBondCount,
      tpsa,
    };
  } catch (err) {
    console.warn('PubChem query fallback:', err);
    return null;
  }
}

export async function searchPubMedArticles(term: string): Promise<PubMedArticle[]> {
  try {
    const res = await fetch(`/api/science/pubmed?term=${encodeURIComponent(term.trim())}`);
    if (res.ok) {
      const data = await res.json();
      return data.articles || [];
    }
  } catch (err) {
    console.warn('PubMed query fallback:', err);
  }
  return [];
}
