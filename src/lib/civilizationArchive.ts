import JSZip from 'jszip';

export interface ArchiveRecord {
  id: string;
  era: string;
  year: string;
  title: string;
  domain: string;
  summary: string;
  keyInnovations: string[];
  primarySources: string[];
}

export const CIVILIZATION_DATA: ArchiveRecord[] = [
  // ERA 1: Ancient & Classical Antiquity (3500 BCE - 500 CE)
  {
    id: 'anc-001',
    era: 'Era I: Ancient & Classical Antiquity (3500 BCE - 500 CE)',
    year: 'c. 3000 BCE',
    title: 'Sumerian Cuneiform Pharmacology & Sexagesimal Mathematics',
    domain: 'Mathematics & Pharmacopoeia',
    summary: 'Earliest systematic prescription tablets from Mesopotamia recording botanical extracts (myrtle, thyme, willow bark precursor to salicylic acid) and base-60 positional numerical system for celestial tracking.',
    keyInnovations: ['Base-60 sexagesimal division', 'Botanical extraction recipes', 'Cuneiform medical clay tablets'],
    primarySources: ['Nippur Medical Tablet (3rd Millennium BCE)', 'Plimpton 322 Tablet'],
  },
  {
    id: 'anc-002',
    era: 'Era I: Ancient & Classical Antiquity (3500 BCE - 500 CE)',
    year: 'c. 1600 BCE',
    title: 'Ancient Egyptian Edwin Smith & Ebers Surgical Papyri',
    domain: 'Medicine & Anatomical Surgery',
    summary: 'Earliest known treatise on trauma surgery and neuroanatomy, establishing objective physical diagnosis, cranial suture observation, pulse cardiovascular correlation, and antimicrobial honey dressings.',
    keyInnovations: ['Objective diagnostic protocol', 'Earliest description of brain & meninges', 'Wound antiseptic dressings'],
    primarySources: ['Edwin Smith Papyrus', 'Ebers Papyrus'],
  },
  {
    id: 'anc-003',
    era: 'Era I: Ancient & Classical Antiquity (3500 BCE - 500 CE)',
    year: 'c. 600 BCE - 250 BCE',
    title: 'Greco-Roman Empiricism, Euclidean Geometry & Archimedean Mechanics',
    domain: 'Mathematics, Physics & Natural Philosophy',
    summary: 'Axiomatic Euclidean deductive proof, Archimedean buoyancy hydrostatics and lever equilibrium, Aristotelian taxonomy of 500 animal species, and Hippocratic observation of pathology.',
    keyInnovations: ['Axiomatic deductive geometry', 'Buoyancy hydrostatics', 'Lever mechanics', 'Hippocratic clinical observation'],
    primarySources: ['Euclid Elements', 'Archimedes On Floating Bodies', 'Aristotle Historia Animalium'],
  },
  {
    id: 'anc-004',
    era: 'Era I: Ancient & Classical Antiquity (3500 BCE - 500 CE)',
    year: 'c. 600 BCE',
    title: 'Sushruta Samhita: Ancient Indian Surgery & Plastic Reconstruction',
    domain: 'Surgical Reconstruction & Herbal Therapeutics',
    summary: 'Comprehensive Ayurvedic surgical encyclopedia describing over 120 surgical instruments, rhinoplasty pedicle flap techniques, anatomical dissection, and classification of 1,120 illnesses.',
    keyInnovations: ['Forehead pedicle flap rhinoplasty', 'Sterile surgical instruments', 'Herbal anesthesia precursors'],
    primarySources: ['Sushruta Samhita Sanskrit Corpus'],
  },
  {
    id: 'anc-005',
    era: 'Era I: Ancient & Classical Antiquity (3500 BCE - 500 CE)',
    year: 'c. 150 CE',
    title: 'Han Dynasty Chemical Technology, Seismology & Papermaking',
    domain: 'Materials Science & Geophysics',
    summary: 'Invention of rag-fiber papermaking by Cai Lun, Zhang Heng directional pendulum seismometer, magnetic lodestone compass precursors, and Blast furnace cast iron production.',
    keyInnovations: ['Cellulose papermaking', 'Inertia seismometer', 'Blast furnace cast iron metallurgy'],
    primarySources: ['Hou Hanshu (Book of the Later Han)', 'Jiuzhang Suanshu (Nine Chapters on Mathematical Art)'],
  },

  // ERA 2: Medieval & Islamic Golden Age (500 CE - 1500 CE)
  {
    id: 'med-001',
    era: 'Era II: Golden Age & Medieval Scholarship (500 - 1500 CE)',
    year: 'c. 820 CE',
    title: 'Al-Khwarizmi: Foundation of Algebra & Decimal Algorithmic Calculus',
    domain: 'Mathematics & Computer Science Roots',
    summary: 'Publication of The Compendious Book on Calculation by Completion and Balancing, introducing systematic reduction of quadratic equations and the decimal positional numeral system.',
    keyInnovations: ['Algebraic equation reduction', 'Algorithm concept (Algorismus)', 'Zero as operational digit'],
    primarySources: ['Al-Kitab al-mukhtasar fi hisab al-jabr wal-muqabala'],
  },
  {
    id: 'med-002',
    era: 'Era II: Golden Age & Medieval Scholarship (500 - 1500 CE)',
    year: 'c. 1021 CE',
    title: 'Ibn al-Haytham (Alhazen): Book of Optics & The Experimental Method',
    domain: 'Optics & Scientific Method',
    summary: 'Refutation of emission theory of vision via experimental camera obscura, mathematical proof that light travels in straight lines and reflects into the eye; pioneer of modern hypothesis testing.',
    keyInnovations: ['Intromission theory of sight', 'Pinhole camera obscura optics', 'Controlled physical experiments'],
    primarySources: ['Kitab al-Manazir (Book of Optics)'],
  },
  {
    id: 'med-003',
    era: 'Era II: Golden Age & Medieval Scholarship (500 - 1500 CE)',
    year: 'c. 1025 CE',
    title: 'Avicenna (Ibn Sina): The Canon of Medicine & Pharmacological Trials',
    domain: 'Biomedicine & Pharmacology',
    summary: 'Standard medical reference for five centuries in Europe and Asia; introduced systematic clinical drug testing guidelines, quarantine for contagious pathogens, and disease etiology.',
    keyInnovations: ['7 rules for clinical drug trials', 'Quarantine isolation protocols', 'Classification of pulse rhythms'],
    primarySources: ['Al-Qanun fi al-Tibb (The Canon of Medicine)'],
  },
  {
    id: 'med-004',
    era: 'Era II: Golden Age & Medieval Scholarship (500 - 1500 CE)',
    year: 'c. 1242 CE',
    title: 'Ibn al-Nafis: Discovery of Pulmonary Blood Circulation',
    domain: 'Cardiovascular Physiology',
    summary: 'First correct anatomical description that blood from the right cardiac ventricle must pass through the lungs before reaching the left ventricle, correcting Galenic pores theory.',
    keyInnovations: ['Pulmonary transit of blood', 'Coronary circulation description', 'Alveolar gas exchange precursor'],
    primarySources: ['Commentary on Anatomy in Avicenna\'s Canon'],
  },

  // ERA 3: Scientific Revolution & Enlightenment (1500 - 1800 CE)
  {
    id: 'rev-001',
    era: 'Era III: Scientific Revolution & Enlightenment (1500 - 1800 CE)',
    year: '1543 CE',
    title: 'Copernican Heliocentrism & Vesalian Empirical Human Anatomy',
    domain: 'Astronomy & Gross Anatomy',
    summary: 'Twin watershed publications: Nicolaus Copernicus established heliocentric planetary kinematics; Andreas Vesalius overturned 1,300 years of Galenic dogma with systematic cadaveric dissections.',
    keyInnovations: ['Heliocentric solar system model', 'Direct anatomical empirical dissection', 'Architectural bone & muscle plates'],
    primarySources: ['De revolutionibus orbium coelestium', 'De humani corporis fabrica'],
  },
  {
    id: 'rev-002',
    era: 'Era III: Scientific Revolution & Enlightenment (1500 - 1800 CE)',
    year: '1665 - 1687 CE',
    title: 'Hooke Micrographia, Leeuwenhoek Microorganisms & Newton Principia',
    domain: 'Cell Biology, Classical Mechanics & Calculus',
    summary: 'Robert Hooke coins "cell" in cork; Antonie van Leeuwenhoek observes living bacteria/protozoa ("animalcules"); Isaac Newton formalizes Three Laws of Motion, Universal Gravitation, and Infinitesimal Calculus.',
    keyInnovations: ['First visualization of biological cells', 'Discovery of microscopic bacteria', 'Universal gravitation & 3 laws of motion', 'Infinitesimal calculus'],
    primarySources: ['Micrographia (1665)', 'Philosophiae Naturalis Principia Mathematica (1687)'],
  },
  {
    id: 'rev-003',
    era: 'Era III: Scientific Revolution & Enlightenment (1500 - 1800 CE)',
    year: '1789 CE',
    title: 'Antoine Lavoisier: Chemical Revolution & Conservation of Mass',
    domain: 'Quantitative Chemistry & Stoichiometry',
    summary: 'Dismantling of the phlogiston theory; discovery of oxygen and hydrogen role in combustion and respiration; establishment of the Law of Conservation of Mass and systematic chemical nomenclature.',
    keyInnovations: ['Conservation of mass in chemical reactions', 'Combustion as oxidation', 'Systematic chemical nomenclature'],
    primarySources: ['Traité Élémentaire de Chimie (Elementary Treatise on Chemistry)'],
  },
  {
    id: 'rev-004',
    era: 'Era III: Scientific Revolution & Enlightenment (1500 - 1800 CE)',
    year: '1796 CE',
    title: 'Edward Jenner: Smallpox Inoculation & The Birth of Immunology',
    domain: 'Immunology & Infectious Disease Control',
    summary: 'First scientific vaccine developed using cowpox blister fluid to confer cross-protective humoral immunity against deadly smallpox variola virus, laying foundations for global eradication.',
    keyInnovations: ['Cross-protective vaccination', 'Humoral immunity concept', 'First eradicated human pathogen foundation'],
    primarySources: ['An Inquiry into the Causes and Effects of the Variolae Vaccinae'],
  },

  // ERA 4: Industrial Era, Thermodynamics & Early Atomic Theory (1800 - 1950 CE)
  {
    id: 'ind-001',
    era: 'Era IV: Industrial Era & Modern Science (1800 - 1950 CE)',
    year: '1859 - 1865 CE',
    title: 'Darwinian Evolutionary Natural Selection & Mendelian Heredity',
    domain: 'Evolutionary Biology & Genetics',
    summary: 'Charles Darwin establishes universal descent with modification via natural selection; Gregor Mendel quantifies statistical particulate inheritance rules in Pisum sativum (allelic dominance, segregation).',
    keyInnovations: ['Evolution by natural selection', 'Mendelian laws of segregation & independent assortment', 'Particulate genetic factors'],
    primarySources: ['On the Origin of Species (1859)', 'Versuche über Pflanzen-Hybriden (1866)'],
  },
  {
    id: 'ind-002',
    era: 'Era IV: Industrial Era & Modern Science (1800 - 1950 CE)',
    year: '1869 CE',
    title: 'Dmitri Mendeleev: Periodic Law & Structural Chemical Prediction',
    domain: 'Inorganic Chemistry & Atomic Properties',
    summary: 'Organization of elements by increasing atomic weight and valence periodicity, accurately predicting discovery and physical properties of undiscovered elements (Gallium, Germanium, Scandium).',
    keyInnovations: ['Periodic Table of Elements', 'Periodic law of chemical valence', 'Predictive element property modeling'],
    primarySources: ['Principles of Chemistry (1869)'],
  },
  {
    id: 'ind-003',
    era: 'Era IV: Industrial Era & Modern Science (1800 - 1950 CE)',
    year: '1860 - 1885 CE',
    title: 'Pasteur & Koch: Germ Theory, Microbial Fermentation & Sterilization',
    domain: 'Microbiology & Medical Antisepsis',
    summary: 'Louis Pasteur disproves spontaneous generation, invents pasteurization and rabies vaccine; Robert Koch formulates Koch\'s Postulates connecting specific pathogens to anthrax, tuberculosis, and cholera.',
    keyInnovations: ['Disproof of spontaneous generation', 'Koch\'s Postulates', 'Steam autoclave sterilization', 'Bacterial attenuation vaccination'],
    primarySources: ['Memoire sur la fermentation appelée lactique (Pasteur)', 'Die Aetiologie der Tuberkulose (Koch)'],
  },
  {
    id: 'ind-004',
    era: 'Era IV: Industrial Era & Modern Science (1800 - 1950 CE)',
    year: '1900 - 1928 CE',
    title: 'Quantum Mechanics, Relativity & Fleming\'s Discovery of Penicillin',
    domain: 'Theoretical Physics & Modern Therapeutics',
    summary: 'Max Planck and Albert Einstein formulate quantum energy quanta and general relativity; Alexander Fleming observes Penicillium notatum fungal inhibition of Staphylococcus aureus, initiating the antibiotic era.',
    keyInnovations: ['Energy quantization E=hf', 'Spacetime curvature gravitation', 'Beta-lactam antibiotic discovery'],
    primarySources: ['Zur Elektrodynamik bewegter Körper (1905)', 'On the Antibacterial Action of Cultures of a Penicillium (1929)'],
  },

  // ERA 5: Information Age & Molecular Biology (1950 - 2026 CE)
  {
    id: 'mod-001',
    era: 'Era V: Information Age & Molecular Biology (1950 - 2026 CE)',
    year: '1953 CE',
    title: 'Watson, Crick & Franklin: DNA Double Helix Molecular Architecture',
    domain: 'Molecular Genetics & Structural Biology',
    summary: 'Rosalind Franklin Photo 51 X-ray diffraction confirms antiparallel double helical deoxyribonucleic acid with complementary hydrogen-bonded purine/pyrimidine base pairing (A-T, G-C).',
    keyInnovations: ['Antiparallel double helix', 'Complementary base pairing mechanism', 'Semi-conservative genetic replication template'],
    primarySources: ['Molecular Structure of Nucleic Acids: A Structure for Deoxyribose Nucleic Acid (Nature 1953)'],
  },
  {
    id: 'mod-002',
    era: 'Era V: Information Age & Molecular Biology (1950 - 2026 CE)',
    year: '1977 - 1983 CE',
    title: 'Sanger Dideoxy DNA Sequencing & Mullis PCR Amplification',
    domain: 'Genomics & Molecular Biotechnology',
    summary: 'Frederick Sanger invents chain-termination sequencing; Kary Mullis designs Polymerase Chain Reaction (PCR) utilizing thermophilic Taq polymerase, enabling billion-fold DNA amplification.',
    keyInnovations: ['Dideoxy nucleotide sequencing', 'Exponential thermal PCR amplification', 'Automated fluorophore gene readouts'],
    primarySources: ['DNA sequencing with chain-terminating inhibitors (PNAS 1977)', 'Specific Enzymatic Amplification of DNA In Vitro (Science 1985)'],
  },
  {
    id: 'mod-003',
    era: 'Era V: Information Age & Molecular Biology (1950 - 2026 CE)',
    year: '2012 - 2020 CE',
    title: 'CRISPR-Cas9 Programmable Genome Editing & Single-Cell Transcriptomics',
    domain: 'Gene Editing & Cellular Genomics',
    summary: 'Doudna & Charpentier harness bacterial adaptive immunity endonuclease Cas9 with synthetic guide RNAs for programmable, targeted genomic double-strand breaks in eukaryotic cells.',
    keyInnovations: ['sgRNA-directed site-specific DNA cleavage', 'Non-homologous end joining / HDR repair', 'High-throughput perturb-seq'],
    primarySources: ['A Programmable Dual-RNA-Guided DNA Endonuclease in Adaptive Bacterial Immunity (Science 2012)'],
  },
  {
    id: 'mod-004',
    era: 'Era V: Information Age & Molecular Biology (1950 - 2026 CE)',
    year: '2020 - 2026 CE',
    title: 'DeepMind AlphaFold: AI Protein Structure Prediction & Quantum Biology',
    domain: 'Computational Structural Biology & Deep Learning',
    summary: 'AlphaFold and generative AI systems achieve atomic-accuracy prediction of over 200 million protein structures from amino acid sequence alone, solving the 50-year-old protein folding grand challenge.',
    keyInnovations: ['Attention-based Evoformer neural architecture', 'Per-residue pLDDT confidence scoring', 'Predicted Aligned Error (PAE) matrices', 'De novo therapeutic ligand docking'],
    primarySources: ['Highly accurate protein structure prediction with AlphaFold (Nature 2021)', 'AlphaFold Protein Structure Database'],
  },
];

// Pack entire human civilization dataset into a real compressed ZIP file in-memory
export async function generateCivilizationZip(): Promise<{ blob: Blob; totalBytes: number; fileCount: number }> {
  const zip = new JSZip();

  // Root manifest
  const manifest = {
    archiveTitle: 'Omniscience Civilization Archive (3500 BCE - 2026 CE)',
    compressionType: 'DEFLATE (Maximum Ratio)',
    generatedAt: new Date().toISOString(),
    recordCount: CIVILIZATION_DATA.length,
    eras: [
      'Era I: Ancient & Classical Antiquity (3500 BCE - 500 CE)',
      'Era II: Golden Age & Medieval Scholarship (500 - 1500 CE)',
      'Era III: Scientific Revolution & Enlightenment (1500 - 1800 CE)',
      'Era IV: Industrial Era & Modern Science (1800 - 1950 CE)',
      'Era V: Information Age & Molecular Biology (1950 - 2026 CE)',
    ],
  };

  zip.file('MANIFEST.json', JSON.stringify(manifest, null, 2));

  // Create era subfolders inside zip
  CIVILIZATION_DATA.forEach((rec) => {
    const eraSlug = rec.era.split(':')[0].toLowerCase().replace(/\s+/g, '_');
    const folder = zip.folder(eraSlug) || zip;
    const content = `# ${rec.title} (${rec.year})
Era: ${rec.era}
Domain: ${rec.domain}

## Abstract
${rec.summary}

## Key Innovations
${rec.keyInnovations.map((k) => `- ${k}`).join('\n')}

## Authoritative Primary Sources
${rec.primarySources.map((s) => `- ${s}`).join('\n')}
`;
    folder.file(`${rec.id}_${rec.title.replace(/[^a-zA-Z0-9]/g, '_').slice(0, 30)}.md`, content);
  });

  const blob = await zip.generateAsync({
    type: 'blob',
    compression: 'DEFLATE',
    compressionOptions: { level: 9 },
  });

  return {
    blob,
    totalBytes: blob.size,
    fileCount: CIVILIZATION_DATA.length + 1,
  };
}

// Instant memory query with decompression simulation
export function searchCivilizationArchive(query: string, eraFilter?: string): ArchiveRecord[] {
  const lower = query.toLowerCase().trim();
  return CIVILIZATION_DATA.filter((rec) => {
    if (eraFilter && eraFilter !== 'all' && !rec.era.includes(eraFilter)) {
      return false;
    }
    if (!lower) return true;
    return (
      rec.title.toLowerCase().includes(lower) ||
      rec.summary.toLowerCase().includes(lower) ||
      rec.domain.toLowerCase().includes(lower) ||
      rec.keyInnovations.some((k) => k.toLowerCase().includes(lower)) ||
      rec.primarySources.some((s) => s.toLowerCase().includes(lower))
    );
  });
}
