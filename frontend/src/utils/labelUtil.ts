export function getDomainLabel(domain: string) {
    switch (domain) {
      case "Annonce___information_patient":
        return "Annonce & information patient";
      case "Iconographie":
        return "Iconographie";
      case "Proc_dure___geste_technique":
        return "Procédure / geste technique";
      case "Communication_interprofessionnelle":
        return "Communication interprofessionnelle";
      case "ducation___pr_vention":
        return "Éducation & prévention";
      case "Entretien___interrogatoire":
        return "Entretien & interrogatoire";
      case "Urgence_vitale":
        return "Urgence vitale";
      case "Strat_gie_diagnostique":
        return "Stratégie diagnostique";
      case "Strat_gie_de_prise_en_charge":
        return "Stratégie de prise en charge";
      case "Raisonnement__thique___m_dico_l_gal":
        return "Raisonnement éthique & médico-légal";
      case "Examen_clinique_cibl_":
        return "Examen clinique ciblé";
      default:
        return domain;
    }
  }