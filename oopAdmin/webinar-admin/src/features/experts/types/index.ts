export interface Expert {
  id: string;
  name: string;
  photo: string;
  organization: string;
  position: string;
  specialization: string;
  short_info: string;
  webinar_ids: string;
}

export interface ExpertFormData {
  name: string;
  photo: string;
  organization: string;
  position: string;
  specialization: string;
  short_info: string;
  webinar_ids: string;
}
