export interface MedewerkerIdentificatie {
  identificatie: string;
  achternaam: string;
  voorletters: string;
  voorvoegselAchternaam: string;
}

export interface Contactmoment {
  vorigContactmoment: string | undefined;
  bronorganisatie: string;
  registratiedatum: string;
  kanaal: string;
  voorkeurskanaal: string;
  voorkeurstaal: string;
  tekst: string;
  onderwerpLinks: string[];
  initiatiefnemer: string;
  medewerker: string;
  resultaat: string;
  medewerkerIdentificatie: MedewerkerIdentificatie | undefined;
  startdatum: string;
  einddatum: string;
  gespreksId?: string;
  primaireVraag?: string;
  primaireVraagWeergave?: string;
  afwijkendOnderwerp?: string;
  afdeling?: string;
}

export interface Gespreksresultaat {
  id: string;
  definitie: string;
}

export interface ContactmomentObject {
  contactmoment: string;
  object: string;
  objectType: string;
}

export interface ContactverzoekDetail {
  id: string;
  datum: string;
  status: string;
  behandelaar: string;
  afgerond: string;
  starttijd: string;
  aanmaker: string;
  notitie: string;
  primaireVraagWeergave?: string;
  afwijkendOnderwerp?: string;
}
