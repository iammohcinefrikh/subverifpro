import type { MockCandidate } from '../config/mockCandidates';
import type { ProgramRequirement } from '../config/programs';

/**
 * Dessine un en-tête officiel marocain soigné
 */
function drawHeader(
  ctx: CanvasRenderingContext2D,
  title: string,
  subTitle: string,
  width: number = 900
) {
  // Bandeau supérieur décoratif vert émeraude / or
  ctx.fillStyle = '#065f46';
  ctx.fillRect(0, 0, width, 8);

  ctx.fillStyle = '#047857';
  ctx.fillRect(0, 8, width, 3);

  // En-tête texte
  ctx.fillStyle = '#0f172a';
  ctx.font = 'bold 20px "Segoe UI", Arial, sans-serif';
  ctx.fillText('ROYAUME DU MAROC', 50, 48);

  ctx.font = 'bold 15px "Segoe UI", Arial, sans-serif';
  ctx.fillStyle = '#047857';
  ctx.fillText(title.toUpperCase(), 50, 75);

  ctx.font = '13px "Segoe UI", Arial, sans-serif';
  ctx.fillStyle = '#64748b';
  ctx.fillText(subTitle, 50, 96);

  // Ligne de séparation
  ctx.strokeStyle = '#e2e8f0';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(50, 110);
  ctx.lineTo(width - 50, 110);
  ctx.stroke();
}

/**
 * Dessine un pied de page officiel avec tampon et date
 */
function drawFooter(
  ctx: CanvasRenderingContext2D,
  city: string,
  authority: string,
  width: number = 900,
  height: number = 600
) {
  ctx.strokeStyle = '#e2e8f0';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(50, height - 85);
  ctx.lineTo(width - 50, height - 85);
  ctx.stroke();

  ctx.font = '12px "Segoe UI", Arial, sans-serif';
  ctx.fillStyle = '#64748b';
  ctx.fillText(`Fait et délivré à ${city}, le 15/01/2026. Document certifié conforme à l'original.`, 50, height - 60);
  ctx.fillText(`Organisme certificateur : ${authority}`, 50, height - 40);

  // Sceau / Tampon indicatif circulaire
  ctx.save();
  ctx.translate(width - 150, height - 55);
  ctx.strokeStyle = '#047857';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(0, 0, 32, 0, Math.PI * 2);
  ctx.stroke();

  ctx.font = 'bold 8px "Segoe UI", Arial, sans-serif';
  ctx.fillStyle = '#047857';
  ctx.textAlign = 'center';
  ctx.fillText('CERTIFIÉ CONFORME', 0, -6);
  ctx.fillText('ROYAUME DU MAROC', 0, 6);
  ctx.fillText('★ 2026 ★', 0, 18);
  ctx.restore();
}

/**
 * Générateur principal de documents synthétiques réalistes pour chaque type exigé par les programmes
 */
export async function generateSyntheticDocument(
  docType: string,
  cand: MockCandidate
): Promise<File> {
  const canvas = document.createElement('canvas');
  canvas.width = 920;
  canvas.height = 620;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Impossible de créer le contexte canvas');

  // Fond blanc propre
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  let filename = `${docType}_${cand.demandeur.nom_representant.toLowerCase()}.png`;

  switch (docType) {
    case 'piece_identite': {
      filename = `cnie_piece_identite_${cand.demandeur.cin_representant.toLowerCase()}.png`;
      drawHeader(ctx, "Carte Nationale d'Identité Électronique (CNIE)", "Direction Générale de la Sûreté Nationale - DGSN Maroc");

      // Cadre carte d'identité
      ctx.fillStyle = '#f8fafc';
      ctx.strokeStyle = '#cbd5e1';
      ctx.lineWidth = 1.5;
      ctx.fillRect(50, 130, 820, 370);
      ctx.strokeRect(50, 130, 820, 370);

      // Photo placeholder stylée
      ctx.fillStyle = '#e2e8f0';
      ctx.fillRect(75, 160, 130, 160);
      ctx.strokeStyle = '#94a3b8';
      ctx.strokeRect(75, 160, 130, 160);
      ctx.font = 'bold 12px "Segoe UI", Arial, sans-serif';
      ctx.fillStyle = '#64748b';
      ctx.fillText('PHOTO CNIE', 105, 245);

      // Données de la CIN
      ctx.fillStyle = '#1e293b';
      ctx.font = 'bold 16px "Segoe UI", Arial, sans-serif';
      ctx.fillText(`Nom : ${cand.demandeur.nom_representant}`, 230, 180);
      ctx.fillText(`Prénom : ${cand.demandeur.prenom_representant}`, 230, 215);

      ctx.font = '14px "Segoe UI", Arial, sans-serif';
      ctx.fillText(`Date de naissance : ${cand.demandeur.date_naissance_representant}`, 230, 250);
      ctx.fillText(`Lieu de naissance : ${cand.demandeur.ville} (Maroc)`, 230, 280);
      ctx.fillText(`Adresse : ${cand.demandeur.adresse}, ${cand.demandeur.ville}`, 230, 310);
      ctx.fillText(`Raison sociale rattachée : ${cand.demandeur.nom_ou_raison_sociale}`, 230, 340);

      ctx.font = 'bold 20px "Segoe UI", Arial, sans-serif';
      ctx.fillStyle = '#065f46';
      ctx.fillText(`N° CNIE : ${cand.demandeur.cin_representant}`, 230, 385);

      // Bande MRZ officielle
      ctx.fillStyle = '#0f172a';
      ctx.font = 'bold 16px "Courier New", Courier, monospace';
      ctx.fillText(`IDMAR${cand.demandeur.cin_representant}<<<${cand.demandeur.date_naissance_representant.replace(/-/g, '')}7M3205108MAR<<<<<<<<<<<6`, 75, 450);
      ctx.fillText(`${cand.demandeur.nom_representant}<<${cand.demandeur.prenom_representant}<<<<<<<<<<<<<<<<<<<<<<<<<<`, 75, 480);
      break;
    }

    case 'rc': {
      filename = `rc_registre_commerce_${cand.demandeur.siret.slice(0, 8)}.png`;
      drawHeader(ctx, "Extrait du Registre du Commerce (Modèle J)", `Tribunal de Première Instance / Tribunal de Commerce de ${cand.demandeur.ville}`);

      ctx.fillStyle = '#1e293b';
      ctx.font = 'bold 16px "Segoe UI", Arial, sans-serif';
      ctx.fillText(`Dénomination : ${cand.demandeur.nom_ou_raison_sociale}`, 50, 150);

      ctx.font = '14px "Segoe UI", Arial, sans-serif';
      ctx.fillText(`Numéro RC : RC-${cand.demandeur.ville.toUpperCase().slice(0, 3)}-489201   |   Tribunal de commerce de ${cand.demandeur.ville}`, 50, 185);
      ctx.fillText(`Identifiant Commun de l'Entreprise (ICE) : ${cand.demandeur.siret}`, 50, 215);
      ctx.fillText(`Forme juridique : Société à Responsabilité Limitée (SARL)`, 50, 245);
      ctx.fillText(`Siège social : ${cand.demandeur.adresse}, ${cand.demandeur.ville} (${cand.demandeur.code_postal})`, 50, 275);
      ctx.fillText(`Activité / Objet social : ${cand.demandeur.secteur_activite}`, 50, 305);
      ctx.fillText(`Capital social : 100 000,00 DH entièrement souscrit et libéré`, 50, 335);
      ctx.fillText(`Gérant statutaire : M./Mme ${cand.demandeur.prenom_representant} ${cand.demandeur.nom_representant} (CIN: ${cand.demandeur.cin_representant})`, 50, 365);
      ctx.fillText(`Date d'immatriculation : 10/01/2020 - Statut : Actif en situation régulière`, 50, 395);

      drawFooter(ctx, cand.demandeur.ville, "Greffe du Tribunal de Commerce");
      break;
    }

    case 'statuts': {
      filename = `statuts_entreprise_${cand.demandeur.nom_representant.toLowerCase()}.png`;
      drawHeader(ctx, "Statuts Constitutifs de Société (Extrait Officiel)", "Enregistrement et Dépôt Légal - Direction Générale des Impôts");

      ctx.fillStyle = '#1e293b';
      ctx.font = 'bold 16px "Segoe UI", Arial, sans-serif';
      ctx.fillText(`Société : ${cand.demandeur.nom_ou_raison_sociale}`, 50, 150);

      ctx.font = '14px "Segoe UI", Arial, sans-serif';
      ctx.fillText(`Article 1 - Forme : Société commerciale régie par la législation marocaine en vigueur`, 50, 185);
      ctx.fillText(`Article 2 - Objet social : ${cand.demandeur.secteur_activite}`, 50, 215);
      ctx.fillText(`Article 3 - Siège social : ${cand.demandeur.adresse}, ${cand.demandeur.ville}`, 50, 245);
      ctx.fillText(`Article 4 - Capital social : 100 000 DH divisé en 1 000 parts sociales de 100 DH`, 50, 275);
      ctx.fillText(`Article 5 - Gérance : ${cand.demandeur.prenom_representant} ${cand.demandeur.nom_representant} nommé gérant unique avec pleins pouvoirs`, 50, 305);
      ctx.fillText(`Article 6 - Identifiant légal : ICE ${cand.demandeur.siret}`, 50, 335);
      ctx.fillText(`Enregistrement fiscal : DGI ${cand.demandeur.ville} sous bordereau n° 2026/894-A`, 50, 365);
      ctx.fillText(`Mention : Statuts constitutifs paraphés et signés par tous les associés fondateurs.`, 50, 395);

      drawFooter(ctx, cand.demandeur.ville, "Service de l'Enregistrement et du Timbre");
      break;
    }

    case 'rib': {
      filename = `rib_releve_identite_bancaire_${cand.demandeur.nom_representant.toLowerCase()}.png`;
      drawHeader(ctx, "Relevé d'Identité Bancaire (RIB / Attestation de Compte)", cand.syntheticDocs.rib.banque);

      ctx.fillStyle = '#1e293b';
      ctx.font = 'bold 16px "Segoe UI", Arial, sans-serif';
      ctx.fillText(`Titulaire du compte : ${cand.syntheticDocs.rib.titulaire}`, 50, 150);

      ctx.font = '14px "Segoe UI", Arial, sans-serif';
      ctx.fillText(`Établissement bancaire : ${cand.syntheticDocs.rib.banque}`, 50, 185);
      ctx.fillText(`Identifiant ICE : ${cand.syntheticDocs.rib.ice}   |   Ville : ${cand.syntheticDocs.rib.ville}`, 50, 215);
      ctx.fillText(`Code Banque : 007   Code Guichet : 780   N° Compte : 00012345678901   Clé : 42`, 50, 250);

      // Boîte IBAN stylée
      ctx.fillStyle = '#f0fdf4';
      ctx.strokeStyle = '#86efac';
      ctx.lineWidth = 1.5;
      ctx.fillRect(50, 280, 820, 80);
      ctx.strokeRect(50, 280, 820, 80);

      ctx.font = 'bold 18px "Courier New", Courier, monospace';
      ctx.fillStyle = '#065f46';
      ctx.fillText(`IBAN : ${cand.syntheticDocs.rib.iban}`, 75, 315);
      ctx.fillText(`BIC  : ${cand.syntheticDocs.rib.bic}`, 75, 345);

      ctx.font = '13px "Segoe UI", Arial, sans-serif';
      ctx.fillStyle = '#475569';
      ctx.fillText(`Représentant légal habilité : ${cand.demandeur.prenom_representant} ${cand.demandeur.nom_representant} (CIN: ${cand.demandeur.cin_representant})`, 50, 395);

      drawFooter(ctx, cand.demandeur.ville, "Bank Al-Maghrib & Établissement Bancaire");
      break;
    }

    case 'devis': {
      filename = `devis_proforma_${cand.syntheticDocs.devis.iceFournisseur.slice(0, 6)}.png`;
      drawHeader(ctx, "Devis Commercial / Facture Proforma N° DEV-MA-2026-084", cand.syntheticDocs.devis.fournisseur);

      ctx.fillStyle = '#1e293b';
      ctx.font = 'bold 15px "Segoe UI", Arial, sans-serif';
      ctx.fillText(`Fournisseur : ${cand.syntheticDocs.devis.fournisseur}`, 50, 145);

      ctx.font = '13px "Segoe UI", Arial, sans-serif';
      ctx.fillText(`ICE Fournisseur : ${cand.syntheticDocs.devis.iceFournisseur}   |   Validité de l'offre : 60 jours`, 50, 172);
      ctx.fillText(`Client : ${cand.demandeur.nom_ou_raison_sociale} (ICE: ${cand.demandeur.siret})`, 50, 200);
      ctx.fillText(`Objet / Désignation : ${cand.syntheticDocs.devis.designation}`, 50, 230);
      ctx.fillText(`Garantie & maintenance pièces et main d'œuvre certifiées sur site à ${cand.demandeur.ville}`, 50, 260);

      // Tableau des totaux
      ctx.fillStyle = '#fffbeb';
      ctx.strokeStyle = '#fde68a';
      ctx.lineWidth = 1.5;
      ctx.fillRect(50, 290, 820, 110);
      ctx.strokeRect(50, 290, 820, 110);

      ctx.font = 'bold 16px "Segoe UI", Arial, sans-serif';
      ctx.fillStyle = '#78350f';
      ctx.fillText(`TOTAL HT  : ${cand.syntheticDocs.devis.totalHT.toLocaleString('fr-FR')} DH`, 80, 325);
      ctx.fillText(`TVA (20%) : ${cand.syntheticDocs.devis.tva.toLocaleString('fr-FR')} DH`, 80, 355);
      ctx.font = 'bold 18px "Segoe UI", Arial, sans-serif';
      ctx.fillStyle = '#b45309';
      ctx.fillText(`TOTAL TTC : ${cand.syntheticDocs.devis.totalTTC.toLocaleString('fr-FR')} DH`, 80, 388);

      drawFooter(ctx, cand.demandeur.ville, "Direction Commerciale Fournisseur Agréé");
      break;
    }

    case 'liasses_fiscales': {
      filename = `liasse_fiscale_dgi_${cand.demandeur.siret.slice(0, 8)}.png`;
      drawHeader(ctx, "Déclaration Fiscale & Liasse Simplifiée Exercice 2025", "Direction Générale des Impôts - Télédéclaration SIMPL-IS");

      ctx.fillStyle = '#1e293b';
      ctx.font = 'bold 15px "Segoe UI", Arial, sans-serif';
      ctx.fillText(`Raison sociale : ${cand.demandeur.nom_ou_raison_sociale}`, 50, 145);

      ctx.font = '13px "Segoe UI", Arial, sans-serif';
      ctx.fillText(`Identifiant Fiscal (IF) : 3892014   |   ICE : ${cand.demandeur.siret}   |   Taxe Pro : 24901842`, 50, 175);
      ctx.fillText(`Chiffre d'Affaires Net HT déclaré : 2 450 000,00 DH`, 50, 205);
      ctx.fillText(`Compte de Produits et Charges (CPC) - Produits d'exploitation : 2 450 000 DH`, 50, 235);
      ctx.fillText(`Charges d'exploitation : 1 890 000 DH   |   Résultat Net Comptable : +340 000 DH`, 50, 265);
      ctx.fillText(`Cotisation Minimale / Impôt sur les Sociétés (IS) acquitté : 78 500,00 DH`, 50, 295);
      ctx.fillText(`Statut télédéclaration : Validée par télé-règlement bancaire avec accusé DGI conforme`, 50, 325);
      ctx.fillText(`Représentant déclarant : ${cand.demandeur.prenom_representant} ${cand.demandeur.nom_representant}`, 50, 355);

      drawFooter(ctx, cand.demandeur.ville, "Direction Générale des Impôts (DGI)");
      break;
    }

    case 'etats_financiers': {
      filename = `etats_financiers_bilan_${cand.demandeur.nom_representant.toLowerCase()}.png`;
      drawHeader(ctx, "États Financiers de Synthèse & Bilan Comptable Certifié", "Ordre des Experts-Comptables du Maroc - Exercice Clos");

      ctx.fillStyle = '#1e293b';
      ctx.font = 'bold 15px "Segoe UI", Arial, sans-serif';
      ctx.fillText(`Entreprise auditée : ${cand.demandeur.nom_ou_raison_sociale}`, 50, 145);

      ctx.font = '13px "Segoe UI", Arial, sans-serif';
      ctx.fillText(`Total Actif Immobilisé : 1 450 000,00 DH   |   Actif Circulant : 820 000,00 DH`, 50, 175);
      ctx.fillText(`Capitaux Propres & Réserves : 980 000,00 DH   |   Dettes Financières : 310 000,00 DH`, 50, 205);
      ctx.fillText(`Trésorerie Actif : 240 000,00 DH   |   Fonds de Roulement Net Global : +670 000 DH`, 50, 235);
      ctx.fillText(`Attestation de conformité : Les comptes annuels présentent une image fidèle du patrimoine,`, 50, 270);
      ctx.fillText(`de la situation financière et du résultat de la société selon les normes comptables marocaines.`, 50, 295);
      ctx.fillText(`Cabinet d'expertise comptable : AUDIT & CONSEIL MAGHREB SARL (Fès - Casablanca)`, 50, 335);

      drawFooter(ctx, cand.demandeur.ville, "Commissaire aux Comptes / Expert-Comptable DPLE");
      break;
    }

    case 'plan_investissement': {
      filename = `plan_investissement_${cand.projet.programme_id}.png`;
      drawHeader(ctx, "Plan d'Investissement Matériel & Immatériel", `Programme d'Appui à l'Investissement Productif - ${cand.projet.objet_projet}`);

      ctx.fillStyle = '#1e293b';
      ctx.font = 'bold 15px "Segoe UI", Arial, sans-serif';
      ctx.fillText(`Structure porteuse : ${cand.demandeur.nom_ou_raison_sociale}`, 50, 145);

      ctx.font = '13px "Segoe UI", Arial, sans-serif';
      ctx.fillText(`Investissement Matériel : Acquisition équipements industriels selon devis : ${cand.syntheticDocs.devis.totalTTC.toLocaleString('fr-FR')} DH`, 50, 175);
      ctx.fillText(`Investissement Immatériel : Formation technique, licences logicielles et certification : 80 000,00 DH`, 50, 205);
      ctx.fillText(`Travaux d'aménagement et mise aux normes : 120 000,00 DH`, 50, 235);
      ctx.fillText(`Coût global prévisionnel des investissements : ${cand.budget.montant_total.toLocaleString('fr-FR')} DH`, 50, 270);
      ctx.fillText(`Subvention sollicitée : ${cand.budget.montant_demande.toLocaleString('fr-FR')} DH   |   Apport propre acquis : ${(cand.budget.montant_total - cand.budget.montant_demande).toLocaleString('fr-FR')} DH`, 50, 300);
      ctx.fillText(`Calendrier d'exécution : Début ${cand.projet.date_debut} - Achèvement prévu ${cand.projet.date_fin}`, 50, 335);

      drawFooter(ctx, cand.demandeur.ville, "Direction Technique et Financière");
      break;
    }

    case 'business_plan': {
      filename = `business_plan_etude_${cand.demandeur.nom_representant.toLowerCase()}.png`;
      drawHeader(ctx, "Plan d'Affaires / Business Plan & Étude de Faisabilité", `Projet : ${cand.projet.objet_projet}`);

      ctx.fillStyle = '#1e293b';
      ctx.font = 'bold 15px "Segoe UI", Arial, sans-serif';
      ctx.fillText(`Intitulé du projet : ${cand.projet.objet_projet}`, 50, 145);

      ctx.font = '13px "Segoe UI", Arial, sans-serif';
      ctx.fillText(`Porteur : ${cand.demandeur.nom_ou_raison_sociale} (Représentant: ${cand.demandeur.prenom_representant} ${cand.demandeur.nom_representant})`, 50, 175);
      ctx.fillText(`Marché visé : Marché régional et national en forte croissance (Maroc 2026-2030)`, 50, 205);
      ctx.fillText(`Modèle économique : Vente directe B2B / B2C avec marge brute moyenne prévisionnelle de 38%`, 50, 235);
      ctx.fillText(`Chiffre d'affaires prévisionnel Année 1 : 1 200 000 DH   |   Année 2 : 2 100 000 DH   |   Année 3 : 3 400 000 DH`, 50, 265);
      ctx.fillText(`Emplois créés prévus : 6 emplois directs permanents dont 3 jeunes diplômés de la région`, 50, 295);
      ctx.fillText(`Rentabilité : Seuil de rentabilité estimé à partir du 9ème mois d'exploitation`, 50, 325);

      drawFooter(ctx, cand.demandeur.ville, "Cabinet Conseil & Ingénierie de Projet");
      break;
    }

    case 'etude_environnementale': {
      filename = `etude_environnementale_diagnostic_${cand.demandeur.ville.toLowerCase()}.png`;
      drawHeader(ctx, "Diagnostic Environnemental & Efficacité Énergétique", "Transition Écologique & Économie Circulaire au Maroc");

      ctx.fillStyle = '#1e293b';
      ctx.font = 'bold 15px "Segoe UI", Arial, sans-serif';
      ctx.fillText(`Site audité : ${cand.demandeur.nom_ou_raison_sociale} (${cand.demandeur.ville})`, 50, 145);

      ctx.font = '13px "Segoe UI", Arial, sans-serif';
      ctx.fillText(`Type d'évaluation : Diagnostic énergétique et impact environnemental préalable`, 50, 175);
      ctx.fillText(`Réduction prévue des émissions CO2 : 45 tonnes équivalent CO2 / an`, 50, 205);
      ctx.fillText(`Économies d'énergie attendues : 38% sur la facture électrique globale grâce aux technologies propres`, 50, 235);
      ctx.fillText(`Gestion des rejets et valorisation : Zéro effluent toxique, recyclage matière en boucle fermée`, 50, 265);
      ctx.fillText(`Conformité : Respect des normes environnementales nationales (Loi 12-03 & Loi 47-09)`, 50, 295);
      ctx.fillText(`Avis de l'expert : Projet éligible aux primes de croissance verte et efficacité énergétique`, 50, 325);

      drawFooter(ctx, cand.demandeur.ville, "Bureau d'Études Environnement & Énergie Agréé");
      break;
    }

    case 'attestation_cnss': {
      filename = `attestation_cnss_regularite_${cand.demandeur.nom_representant.toLowerCase()}.png`;
      drawHeader(ctx, "Attestation de Régularité Sociale (CNSS MAROC)", "Caisse Nationale de Sécurité Sociale - Agence Régionale");

      ctx.fillStyle = '#1e293b';
      ctx.font = 'bold 15px "Segoe UI", Arial, sans-serif';
      ctx.fillText(`Affilié : ${cand.demandeur.nom_ou_raison_sociale}`, 50, 145);

      ctx.font = '13px "Segoe UI", Arial, sans-serif';
      ctx.fillText(`N° Affiliation CNSS : ${cand.syntheticDocs.cnss.numAffiliation}   |   ICE : ${cand.demandeur.siret}`, 50, 175);
      ctx.fillText(`Gérant / Déclarant : ${cand.demandeur.prenom_representant} ${cand.demandeur.nom_representant} (CIN: ${cand.demandeur.cin_representant})`, 50, 205);
      ctx.fillText(`La CNSS atteste par la présente que l'affilié mentionné ci-dessus est régulièrement inscrit`, 50, 240);
      ctx.fillText(`et qu'il est à jour dans le versement de ses cotisations sociales pour l'ensemble du personnel`, 50, 265);
      ctx.fillText(`salarié déclaré au titre de la période close au 31/12/2025.`, 50, 290);
      ctx.fillText(`Total des cotisations sociales acquittées : ${cand.syntheticDocs.cnss.cotisations}`, 50, 320);

      drawFooter(ctx, cand.demandeur.ville, "Caisse Nationale de Sécurité Sociale (CNSS)");
      break;
    }

    case 'attestation_fiscale': {
      filename = `attestation_fiscale_dgi_${cand.demandeur.nom_representant.toLowerCase()}.png`;
      drawHeader(ctx, "Attestation de Régularité Fiscale (Quitus Fiscal DGI)", "Royaume du Maroc - Direction Générale des Impôts");

      ctx.fillStyle = '#1e293b';
      ctx.font = 'bold 15px "Segoe UI", Arial, sans-serif';
      ctx.fillText(`Redevable : ${cand.demandeur.nom_ou_raison_sociale}`, 50, 145);

      ctx.font = '13px "Segoe UI", Arial, sans-serif';
      ctx.fillText(`Identifiant Fiscal : 4920193   |   ICE : ${cand.demandeur.siret}   |   Taxe Pro : 2901842`, 50, 175);
      ctx.fillText(`Représentant : ${cand.demandeur.prenom_representant} ${cand.demandeur.nom_representant} (CIN: ${cand.demandeur.cin_representant})`, 50, 205);
      ctx.fillText(`L'administration fiscale certifie que le redevable est en règle au regard de l'assiette`, 50, 240);
      ctx.fillText(`et du recouvrement de ses impôts et taxes d'État (IS, IR, TVA) à la date de délivrance.`, 50, 265);
      ctx.fillText(`Validité : 3 mois à compter de la date d'émission pour constitution de dossiers de subvention.`, 50, 295);

      drawFooter(ctx, cand.demandeur.ville, "Direction Générale des Impôts - Recette des Finances");
      break;
    }

    case 'plan_action': {
      filename = `plan_action_transformation_${cand.projet.programme_id}.png`;
      drawHeader(ctx, "Plan d'Action & Feuille de Route de Transformation", `Programme MOWAKABA - Accompagnement & Expertise`);

      ctx.fillStyle = '#1e293b';
      ctx.font = 'bold 15px "Segoe UI", Arial, sans-serif';
      ctx.fillText(`Entreprise bénéficiaire : ${cand.demandeur.nom_ou_raison_sociale}`, 50, 145);

      ctx.font = '13px "Segoe UI", Arial, sans-serif';
      ctx.fillText(`Axe 1 : Audit opérationnel et digitalisation des flux de production (Mois 1 à 3)`, 50, 175);
      ctx.fillText(`Axe 2 : Déploiement logiciel, formation des équipes et transfert de compétences (Mois 4 à 8)`, 50, 205);
      ctx.fillText(`Axe 3 : Conquête commerciale et certification qualité ISO (Mois 9 à 12)`, 50, 235);
      ctx.fillText(`Livrables prévus : Diagnostic initial, cahier des charges IT, protocole d'optimisation Lean`, 50, 265);
      ctx.fillText(`Intervenants : Experts conseils labellisés Maroc PME et consultants seniors`, 50, 295);

      drawFooter(ctx, cand.demandeur.ville, "Pôle Accompagnement & Transformation Maroc PME");
      break;
    }

    case 'justificatif_domicile': {
      filename = `justificatif_domicile_bail_${cand.demandeur.ville.toLowerCase()}.png`;
      drawHeader(ctx, "Certificat de Domiciliation & Bail Commercial", "Attestation Administrative de Siège et Domicile");

      ctx.fillStyle = '#1e293b';
      ctx.font = 'bold 15px "Segoe UI", Arial, sans-serif';
      ctx.fillText(`Titulaire du local : ${cand.demandeur.nom_ou_raison_sociale}`, 50, 145);

      ctx.font = '13px "Segoe UI", Arial, sans-serif';
      ctx.fillText(`Représentant légal : ${cand.demandeur.prenom_representant} ${cand.demandeur.nom_representant} (CIN: ${cand.demandeur.cin_representant})`, 50, 175);
      ctx.fillText(`Adresse des locaux d'exploitation : ${cand.demandeur.adresse}, ${cand.demandeur.ville}`, 50, 205);
      ctx.fillText(`Nature du titre : Contrat de bail commercial enregistré ou titre de propriété foncière`, 50, 235);
      ctx.fillText(`Numéro de police d'abonnement eau et électricité : RADEEMA/LYDEC N° 8490218-42`, 50, 265);
      ctx.fillText(`Certifié régulier et conforme pour l'exercice légal de l'activité économique`, 50, 295);

      drawFooter(ctx, cand.demandeur.ville, "Autorité Locale / Commune Urbaine");
      break;
    }

    case 'attestation_credit': {
      filename = `attestation_credit_tamwilcom_${cand.demandeur.nom_representant.toLowerCase()}.png`;
      drawHeader(ctx, "Attestation d'Accord de Crédit d'Investissement Garanti", "Société Nationale de Garantie et du Financement de l'Entreprise - Tamwilcom");

      ctx.fillStyle = '#1e293b';
      ctx.font = 'bold 15px "Segoe UI", Arial, sans-serif';
      ctx.fillText(`Bénéficiaire : ${cand.demandeur.nom_ou_raison_sociale}`, 50, 145);

      ctx.font = '13px "Segoe UI", Arial, sans-serif';
      ctx.fillText(`Dispositif : Garantie publique Damane Intelak / Tamwilcom Maroc`, 50, 175);
      ctx.fillText(`Banque prêteuse : ${cand.syntheticDocs.rib.banque} (Dossier N° CR-2026-894)`, 50, 205);
      ctx.fillText(`Montant du crédit accordé : ${cand.budget.montant_demande.toLocaleString('fr-FR')} DH à taux préférentiel garanti`, 50, 235);
      ctx.fillText(`Quotité de garantie Tamwilcom : 80% du risque en capital pris en charge`, 50, 265);
      ctx.fillText(`Objet : Financement d'équipements productifs et du besoin en fonds de roulement d'amorçage`, 50, 295);

      drawFooter(ctx, cand.demandeur.ville, "Direction des Engagements Tamwilcom");
      break;
    }

    case 'justificatif_activite': {
      filename = `justificatif_activite_patente_${cand.demandeur.nom_representant.toLowerCase()}.png`;
      drawHeader(ctx, "Justificatif d'Activité & Taxe Professionnelle", "Direction Régionale des Impôts - Service de l'Assiette");

      ctx.fillStyle = '#1e293b';
      ctx.font = 'bold 15px "Segoe UI", Arial, sans-serif';
      ctx.fillText(`Exploitant : ${cand.demandeur.nom_ou_raison_sociale}`, 50, 145);

      ctx.font = '13px "Segoe UI", Arial, sans-serif';
      ctx.fillText(`N° Taxe Professionnelle (Patente) : 48920184   |   ICE : ${cand.demandeur.siret}`, 50, 175);
      ctx.fillText(`Activité répertoriée : ${cand.demandeur.secteur_activite}`, 50, 205);
      ctx.fillText(`Date de début effectif d'exploitation : 01/01/2022 - Ancienneté : ${cand.demandeur.anciennete_annees} ans`, 50, 235);
      ctx.fillText(`Établissement : Principal situé à ${cand.demandeur.adresse}, ${cand.demandeur.ville}`, 50, 265);
      ctx.fillText(`Attestation délivrée pour valoir justificatif d'activité économique en cours`, 50, 295);

      drawFooter(ctx, cand.demandeur.ville, "Division des Impôts Professionnels");
      break;
    }

    case 'projet_rd': {
      filename = `dossier_projet_rd_innovation_${cand.demandeur.nom_representant.toLowerCase()}.png`;
      drawHeader(ctx, "Dossier de Projet R&D & Innovation Industrielle", "Maroc PME - TATWIR R&D et Innovation");

      ctx.fillStyle = '#1e293b';
      ctx.font = 'bold 15px "Segoe UI", Arial, sans-serif';
      ctx.fillText(`Projet : ${cand.projet.objet_projet}`, 50, 145);

      ctx.font = '13px "Segoe UI", Arial, sans-serif';
      ctx.fillText(`Porteur : ${cand.demandeur.nom_ou_raison_sociale}   |   Secteur : Technologies & R&D Industrielle`, 50, 175);
      ctx.fillText(`Nature de l'innovation : Développement de prototype, banc d'essai et algorithmes embarqués`, 50, 205);
      ctx.fillText(`Partenariat scientifique : Coopération technique avec université et centre technique marocain`, 50, 235);
      ctx.fillText(`Protection industrielle : Brevet OMPIC en cours d'enregistrement (Dépôt MA-2026-489)`, 50, 265);
      ctx.fillText(`Jalons R&D : Conception CAO, validation prototype TRL 6, tests pilotes en conditions réelles`, 50, 295);

      drawFooter(ctx, cand.demandeur.ville, "Comité National d'Évaluation R&D Industrielle");
      break;
    }

    case 'plan_financement': {
      filename = `plan_financement_previsionnel_${cand.projet.programme_id}.png`;
      drawHeader(ctx, "Plan de Financement Prévisionnel Équilibré", `Projet d'Investissement : ${cand.projet.objet_projet}`);

      ctx.fillStyle = '#1e293b';
      ctx.font = 'bold 15px "Segoe UI", Arial, sans-serif';
      ctx.fillText(`Entreprise : ${cand.demandeur.nom_ou_raison_sociale}`, 50, 145);

      ctx.font = '13px "Segoe UI", Arial, sans-serif';
      ctx.fillText(`Total des besoins d'investissement (Emplois) : ${cand.budget.montant_total.toLocaleString('fr-FR')} DH`, 50, 175);
      ctx.fillText(`Ressource 1 - Subvention sollicitée : ${cand.budget.montant_demande.toLocaleString('fr-FR')} DH (Sollicitée)`, 50, 205);
      ctx.fillText(`Ressource 2 - Apport propre et fonds propres : ${(cand.budget.montant_total - cand.budget.montant_demande).toLocaleString('fr-FR')} DH (Acquis)`, 50, 235);
      ctx.fillText(`Équilibre financier : Total Ressources (100%) = Total Besoins (${cand.budget.montant_total.toLocaleString('fr-FR')} DH)`, 50, 265);
      ctx.fillText(`Taux d'intervention publique sollicité : ${Math.round((cand.budget.montant_demande / cand.budget.montant_total) * 100)}%`, 50, 295);

      drawFooter(ctx, cand.demandeur.ville, "Direction Financière et Comptable");
      break;
    }

    case 'justificatif_statut': {
      filename = `justificatif_statut_juridique_${cand.demandeur.siret.slice(0, 8)}.png`;
      drawHeader(ctx, "Justificatif de Statut Juridique & Récépissé Légal", "Secrétariat Général du Gouvernement - Ministère de l'Intérieur");

      ctx.fillStyle = '#1e293b';
      ctx.font = 'bold 15px "Segoe UI", Arial, sans-serif';
      ctx.fillText(`Organisme : ${cand.demandeur.nom_ou_raison_sociale}`, 50, 145);

      ctx.font = '13px "Segoe UI", Arial, sans-serif';
      ctx.fillText(`Type de structure : ${cand.demandeur.structure_type.toUpperCase()}   |   ICE : ${cand.demandeur.siret}`, 50, 175);
      ctx.fillText(`Récépissé de déclaration définitive délivré sous le n° 89402/P/2021`, 50, 205);
      ctx.fillText(`Parution au Bulletin Officiel (BO) du Royaume du Maroc - Annonce n° 2021/3421`, 50, 235);
      ctx.fillText(`Représentant habilité selon procès-verbal d'assemblée : ${cand.demandeur.prenom_representant} ${cand.demandeur.nom_representant}`, 50, 265);
      ctx.fillText(`Statut légal : En activité régulière, agrément ODCO / Ministère de tutelle conforme`, 50, 295);

      drawFooter(ctx, cand.demandeur.ville, "Secrétariat Général de la Wilaya");
      break;
    }

    case 'cv': {
      filename = `curriculum_vitae_cv_${cand.demandeur.nom_representant.toLowerCase()}.png`;

      // En-tête typique d'un CV
      ctx.fillStyle = '#1e3a8a';
      ctx.fillRect(0, 0, canvas.width, 100);

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 22px "Segoe UI", Arial, sans-serif';
      ctx.fillText(`CURRICULUM VITAE (CV) - ${cand.demandeur.prenom_representant} ${cand.demandeur.nom_representant}`, 50, 45);

      ctx.font = '14px "Segoe UI", Arial, sans-serif';
      ctx.fillStyle = '#93c5fd';
      ctx.fillText(`Profil Professionnel : Ingénieur / Responsable Opérationnel • ${cand.demandeur.email_representant} • Tél : ${cand.demandeur.telephone_representant}`, 50, 75);

      // Corps du CV avec sections typiques
      ctx.fillStyle = '#0f172a';
      ctx.font = 'bold 15px "Segoe UI", Arial, sans-serif';
      ctx.fillText("1. EXPÉRIENCES PROFESSIONNELLES (PARCOURS & POSTES OCCUPÉS)", 50, 140);

      ctx.font = '13px "Segoe UI", Arial, sans-serif';
      ctx.fillStyle = '#334155';
      ctx.fillText(`• 2022 - 2026 : Directeur des Opérations chez ${cand.demandeur.nom_ou_raison_sociale} (${cand.demandeur.ville})`, 65, 168);
      ctx.fillText("  Management d'équipe de 12 personnes, pilotage de la rentabilité et relation clients stratégiques.", 75, 190);
      ctx.fillText("• 2018 - 2022 : Chef de Projet Senior - Supervision de déploiements industriels et techniques.", 65, 218);
      ctx.fillText("• 2014 - 2018 : Consultant Opérationnel & Analyste de Processus.", 65, 246);

      ctx.fillStyle = '#0f172a';
      ctx.font = 'bold 15px "Segoe UI", Arial, sans-serif';
      ctx.fillText("2. COMPÉTENCES TECHNIQUES & EXPERTISE (SKILLS)", 50, 290);

      ctx.font = '13px "Segoe UI", Arial, sans-serif';
      ctx.fillStyle = '#334155';
      ctx.fillText("• Gestion de projet agile, Analyse financière, Conduite du changement, Négociation commerciale.", 65, 318);
      ctx.fillText("• Outils informatiques : Suite Bureautique, ERP, Outils d'analyse de données, Systèmes connectés.", 65, 342);

      ctx.fillStyle = '#0f172a';
      ctx.font = 'bold 15px "Segoe UI", Arial, sans-serif';
      ctx.fillText("3. FORMATION ACADÉMIQUE & DIPLÔMES", 50, 385);

      ctx.font = '13px "Segoe UI", Arial, sans-serif';
      ctx.fillStyle = '#334155';
      ctx.fillText("• Master Spécialisé / Diplôme d'Ingénieur d'État - Université & Grande École au Maroc.", 65, 412);
      ctx.fillText("• Licence Fondamentale en Sciences Appliquées & Économie d'Entreprise.", 65, 436);

      ctx.fillStyle = '#0f172a';
      ctx.font = 'bold 15px "Segoe UI", Arial, sans-serif';
      ctx.fillText("4. LANGUES & CENTRES D'INTÉRÊT", 50, 480);

      ctx.font = '13px "Segoe UI", Arial, sans-serif';
      ctx.fillStyle = '#334155';
      ctx.fillText("• Arabe (maternelle), Français (bilingue courant), Anglais (professionnel). Bénévolat associatif.", 65, 508);

      ctx.font = 'italic 11px "Segoe UI", Arial, sans-serif';
      ctx.fillStyle = '#94a3b8';
      ctx.fillText(`Document : Curriculum Vitae personnel de ${cand.demandeur.prenom_representant} ${cand.demandeur.nom_representant}. Mis à jour en 2026.`, 50, 560);
      break;
    }

    default: {
      filename = `justificatif_${docType}_${cand.demandeur.nom_representant.toLowerCase()}.png`;
      drawHeader(ctx, `Pièce Justificative Officielle - ${docType.toUpperCase()}`, cand.demandeur.nom_ou_raison_sociale);

      ctx.fillStyle = '#1e293b';
      ctx.font = 'bold 15px "Segoe UI", Arial, sans-serif';
      ctx.fillText(`Structure : ${cand.demandeur.nom_ou_raison_sociale}`, 50, 145);

      ctx.font = '13px "Segoe UI", Arial, sans-serif';
      ctx.fillText(`Identifiant ICE : ${cand.demandeur.siret}   |   Ville : ${cand.demandeur.ville}`, 50, 175);
      ctx.fillText(`Représentant légal : ${cand.demandeur.prenom_representant} ${cand.demandeur.nom_representant} (CIN: ${cand.demandeur.cin_representant})`, 50, 205);
      ctx.fillText(`Document justificatif versé au dossier de candidature pour le programme ${cand.projet.programme_id}`, 50, 240);
      ctx.fillText(`Date de certification : 15/01/2026 à ${cand.demandeur.ville}`, 50, 270);

      drawFooter(ctx, cand.demandeur.ville, "Administration et Direction Générale");
      break;
    }
  }

  return new Promise<File>((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        reject(new Error('Erreur lors de la génération du blob image'));
        return;
      }
      const file = new File([blob], filename, { type: 'image/png' });
      resolve(file);
    }, 'image/png');
  });
}

/**
 * Génère l'ensemble des fichiers exigés pour un programme donné
 */
export async function generateAllDocumentsForProgram(
  requirements: ProgramRequirement[],
  candidate: MockCandidate
): Promise<File[]> {
  const files: File[] = [];
  for (const req of requirements) {
    try {
      const file = await generateSyntheticDocument(req.document_type, candidate);
      files.push(file);
    } catch (e) {
      console.error(`Erreur génération pour ${req.document_type}:`, e);
    }
  }
  return files;
}
